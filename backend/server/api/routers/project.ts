import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { withRetry } from "@/server/db";

export const projectRouter = createTRPCRouter({
  test: publicProcedure
    .query(() => {
      return { message: "tRPC is working!" };
    }),

  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string().optional(),
        githubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(ctx.userId);

      const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
      if (!userEmail) {
        throw new Error("User email not found");
      }

      await ctx.db.user.upsert({
        where: { emailAddress: userEmail },
        update: {
          imageUrl: clerkUser.imageUrl,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
        create: {
          id: ctx.userId,
          emailAddress: userEmail,
          imageUrl: clerkUser.imageUrl,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
      });

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          ...(input.githubUrl ? { githubUrl: input.githubUrl } : {}),
          ...(input.githubToken ? { githubToken: input.githubToken } : {}),
          UserToProjects: {
            create: {
              userId: ctx.userId,
            },
          },
        },
      });

      if (input.githubUrl) {
        // Fire-and-forget: do NOT await pollCommits.
        // pollCommits can take 40+ seconds (up to 10 commits × AI call + 4 s delay each).
        // Return the project immediately and let polling finish in the background.
        import("@/server/lib/github").then(({ pollCommits }) => {
          pollCommits(project.id, input.githubToken).catch((pollError: unknown) => {
            console.warn('Background commit poll failed for project', project.id, pollError);
          });
        }).catch(() => { /* ignore import error */ });
      }

      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projects = await withRetry(async () => {
        return await ctx.db.project.findMany({
          where: {
            UserToProjects: {
              some: {
                userId: ctx.userId,
              },
            },
            deletedAt: null,
          },
        });
      });
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  updateProject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        githubUrl: z.string().optional(),
        githubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl } : {}),
          ...(input.githubToken !== undefined ? { githubToken: input.githubToken } : {}),
        },
      });

      return updatedProject;
    }),

  fetchCommitsFromGithub: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      if (!project.githubUrl) {
        throw new Error("Project does not have a GitHub URL");
      }

      const { getCommitHashes } = await import("@/server/lib/github");
      const { env } = await import("@/server/config/env");

      try {
        const commits = await getCommitHashes(project.githubUrl, env.GITHUB_TOKEN);
        return commits.map(commit => ({
          sha: commit.commitHash,
          commit: {
            message: commit.commitMessage,
            author: {
              name: commit.commitAuthorName || 'Unknown',
              date: commit.commitDate?.toISOString() || new Date().toISOString()
            }
          },
          author: {
            login: commit.commitAuthorName || 'unknown',
            avatar_url: commit.commitAuthorAvatar || ''
          }
        }));
      } catch (error) {
        console.error("Failed to fetch commits from GitHub:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch commits: ${message}`);
      }
    }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const COMMITS_LIMIT = 15;
      return await ctx.db.comment.findMany({
        where: { projectId: input.projectId },
        orderBy: { commitDate: 'desc' },
        take: COMMITS_LIMIT,
      });
    }),

  pollCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      const { pollCommits } = await import("@/server/lib/github");

      try {
        const result = await pollCommits(project.id);
        return result;
      } catch (error) {
        console.error("Failed to poll commits:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to poll commits: ${message}`);
      }
    }),

  pollAllProjectCommits: protectedProcedure
    .mutation(async ({ ctx }) => {
      const projects = await ctx.db.project.findMany({
        where: {
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
          githubUrl: { not: null },
        },
        select: { id: true, name: true, githubUrl: true },
      });

      if (projects.length === 0) {
        return { results: [], totalProcessed: 0 };
      }

      const { pollCommitsForProjects } = await import("@/server/lib/github");

      try {
        const projectIds = projects.map(p => p.id);
        const result = await pollCommitsForProjects(projectIds);
        return result;
      } catch (error) {
        console.error("Failed to poll commits for all projects:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to poll commits: ${message}`);
      }
    }),

  /** Open Source dashboard: repo stats (stars, forks, language) for all user projects with a GitHub URL */
  getOpenSourceRepos: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProjects: { some: { userId: ctx.userId } },
        deletedAt: null,
        githubUrl: { not: null },
      },
      select: { id: true, name: true, githubUrl: true, githubToken: true },
    });

    const { getRepoStats } = await import("@/server/lib/github");
    const { env } = await import("@/server/config/env");
    const results: Array<{
      projectId: string;
      projectName: string;
      githubUrl: string;
      fullName: string;
      stars: number;
      forks: number;
      language: string | null;
      description: string | null;
      error?: string;
    }> = [];

    for (const p of projects) {
      const url = p.githubUrl!;
      const token = p.githubToken || env.GITHUB_TOKEN || "";
      try {
        const stats = await getRepoStats(url, token);
        results.push({
          projectId: p.id,
          projectName: p.name,
          githubUrl: url,
          fullName: stats.fullName,
          stars: stats.stars,
          forks: stats.forks,
          language: stats.language,
          description: stats.description,
        });
      } catch (err: any) {
        results.push({
          projectId: p.id,
          projectName: p.name,
          githubUrl: url,
          fullName: url.replace(/^https:\/\/github.com\//, "").replace(/\.git$/, ""),
          stars: 0,
          forks: 0,
          language: null,
          description: null,
          error: err?.message ?? "Could not load repo stats",
        });
      }
    }

    return results;
  }),

  loadRepositoryFiles: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        extensions: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      if (!project.githubUrl) {
        throw new Error("Project does not have a GitHub URL");
      }

      const { loadGitHubRepositoryByExtensions, getRepositoryStats } = await import("@/server/lib/github-loader");
      const { env } = await import("@/server/config/env");

      try {
        const extensions = input.extensions || ['.ts', '.tsx', '.js', '.jsx', '.py', '.md', '.json'];
        const documents = await loadGitHubRepositoryByExtensions(
          project.githubUrl,
          env.GITHUB_TOKEN,
          extensions
        );

        const stats = getRepositoryStats(documents);

        return {
          files: documents.map(doc => ({
            path: doc.metadata?.source || '',
            content: doc.pageContent || '',
            size: doc.pageContent?.length || 0,
            lines: doc.pageContent?.split('\n').length || 0,
          })),
          stats,
          repository: project.githubUrl,
        };
      } catch (error) {
        console.error("Failed to load repository files:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to load repository files: ${message}`);
      }
    }),

  getQuestions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Get all questions for this project with user information
      const questions = await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              emailAddress: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return questions;
    }),

  getTeamMembers: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Get all team members for this project
      const teamMembers = await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              emailAddress: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Transform the data to match the expected format
      return teamMembers.map(member => ({
        id: member.user.id,
        name: `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || 'Unknown User',
        email: member.user.emailAddress,
        avatar: member.user.imageUrl || '',
        initials: `${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}`.toUpperCase() || 'U',
        role: 'Team Member', // You can add a role field to UserToProject if needed
        joinedAt: member.createdAt,
      }));
    }),

  addTeamMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
        role: z.string().optional().default('Team Member'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Try to find existing user by email
      let user = await ctx.db.user.findUnique({
        where: {
          emailAddress: input.email,
        },
      });

      // If user doesn't exist, create a new user
      if (!user) {
        // Parse name if provided
        const nameParts = input.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        user = await ctx.db.user.create({
          data: {
            emailAddress: input.email,
            firstName: firstName,
            lastName: lastName,
            // Generate a temporary ID for the user
            id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        });
      }

      // Check if user is already a team member
      const existingMember = await ctx.db.userToProject.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: input.projectId,
          },
        },
      });

      if (existingMember) {
        throw new Error("User is already a team member of this project");
      }

      // Add user to project
      const newMember = await ctx.db.userToProject.create({
        data: {
          userId: user.id,
          projectId: input.projectId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              emailAddress: true,
              createdAt: true,
            },
          },
        },
      });

      return {
        id: newMember.user.id,
        name: `${newMember.user.firstName || ''} ${newMember.user.lastName || ''}`.trim() || 'New User',
        email: newMember.user.emailAddress,
        avatar: newMember.user.imageUrl || '',
        initials: `${newMember.user.firstName?.[0] || ''}${newMember.user.lastName?.[0] || ''}`.toUpperCase() || 'U',
        role: input.role,
        joinedAt: newMember.createdAt,
        isNewUser: !existingMember, // Flag to indicate if this is a new user
      };
    }),

  removeTeamMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Don't allow removing yourself
      if (input.userId === ctx.userId) {
        throw new Error("You cannot remove yourself from the project");
      }

      // Remove user from project
      await ctx.db.userToProject.delete({
        where: {
          userId_projectId: {
            userId: input.userId,
            projectId: input.projectId,
          },
        },
      });

      return { success: true };
    }),

  exportProjectData: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        format: z.string(),
        dateRange: z.string(),
        includeData: z.object({
          commits: z.boolean(),
          comments: z.boolean(),
          team: z.boolean(),
          analytics: z.boolean(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Get user email for notification
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { emailAddress: true, firstName: true, lastName: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      console.log(`📊 Export initiated for project: ${project.name}`);
      console.log(`📧 Export will be sent to: ${user.emailAddress}`);
      console.log(`📋 Export options:`, input);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: "Export started! You will receive an email when ready.",
        exportId: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        estimatedTime: "5-10 minutes",
      };
    }),

  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // First, delete UserToProject associations (no cascade on this relation)
      await ctx.db.userToProject.deleteMany({
        where: { projectId: input.projectId },
      });

      // Then delete the project itself (other relations like Comment will Cascade according to schema)
      await ctx.db.project.delete({
        where: { id: input.projectId },
      });

      return { success: true };
    }),

});