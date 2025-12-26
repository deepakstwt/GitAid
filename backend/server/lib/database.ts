import { db } from '@/server/db';
import { getCommitHashes, type CommitData } from '@/server/lib/github';

const DEFAULT_COMMITS_LIMIT = 15;

export async function saveCommitsToDatabase(projectId: string, githubUrl: string, githubToken: string) {
  try {
    const commits = await getCommitHashes(githubUrl, githubToken);
    const savedCommits = [];
    
    for (const commit of commits) {
      const savedCommit = await db.comment.upsert({
        where: {
          projectId_commitHash: {
            projectId,
            commitHash: commit.commitHash,
          },
        },
        update: {
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
        },
        create: {
          projectId,
          commitHash: commit.commitHash,
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
        },
      });
      
      savedCommits.push(savedCommit);
    }
    
    return savedCommits;
    
  } catch (error) {
    console.error('Error saving commits to database:', error);
    throw error;
  }
}

export async function getCommitsFromDatabase(projectId: string) {
  return await db.comment.findMany({
    where: { projectId },
    orderBy: { commitDate: 'desc' },
    take: DEFAULT_COMMITS_LIMIT,
  });
}

export async function syncProjectCommits(projectId: string, githubUrl: string, githubToken: string) {
  try {
    const savedCommits = await saveCommitsToDatabase(projectId, githubUrl, githubToken);
    return savedCommits;
  } catch (error) {
    console.error(`Failed to sync commits for project ${projectId}:`, error);
    throw error;
  }
}

export async function testDatabaseIntegration() {
  try {
    const project = await db.project.findFirst({
      where: {
        githubUrl: { not: null },
      },
    });
    
    if (!project || !project.githubUrl) {
      return;
    }
    
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return;
    }
    
    await syncProjectCommits(project.id, project.githubUrl, githubToken);
    return getCommitsFromDatabase(project.id);
  } catch (error) {
    console.error('Database integration test failed:', error);
    throw error;
  }
}

export default {
  saveCommitsToDatabase,
  getCommitsFromDatabase,
  syncProjectCommits,
  testDatabaseIntegration,
};
