import { Octokit } from '@octokit/rest';
import axios from 'axios';

const DEFAULT_COMMITS_PER_PAGE = 15;
const MAX_COMMITS_LIMIT = 100;

export interface CommitData {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string | null;
  commitAuthorAvatar: string | null;
  commitDate: Date | null;
}

function parseGitHubUrl(githubUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }

    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL format');
    }

    const owner = pathParts[0];
    let repo = pathParts[1];

    if (!owner || !repo) {
      throw new Error('Missing owner or repository name');
    }

    // Remove .git suffix if present
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    return { owner, repo };
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

export async function getCommitHashes(githubUrl: string, githubToken: string): Promise<CommitData[]> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }

  const { owner, repo } = parsed;
  console.log(`Fetching commits for ${owner}/${repo}...`);

  // Try fetching with the token if provided
  let response;
  try {
    const octokit = new Octokit(githubToken ? { auth: githubToken } : {});
    response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: DEFAULT_COMMITS_PER_PAGE,
    });
  } catch (error: any) {
    // If the token is invalid/expired (401 Bad credentials), fallback to no-auth for public repos
    if (error.status === 401 || error.message?.includes('Bad credentials')) {
      console.warn('GitHub token invalid or expired. Falling back to unauthenticated request for public repository...');
      const fallbackOctokit = new Octokit();
      response = await fallbackOctokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: DEFAULT_COMMITS_PER_PAGE,
      });
    } else {
      throw error;
    }
  }

  const commits: CommitData[] = response.data.map((commit) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message,
    commitAuthorName: commit.commit.author?.name ?? null,
    commitAuthorAvatar: commit.author?.avatar_url ?? null,
    commitDate: commit.commit.author?.date ? new Date(commit.commit.author.date) : null,
  }));

  commits.sort((a, b) => {
    if (!a.commitDate) return 1;
    if (!b.commitDate) return -1;
    return b.commitDate.getTime() - a.commitDate.getTime();
  });

  return commits;
}


/**
 * Helper function to fetch project and its GitHub URL from database
 * @param projectId - The project ID to fetch
 * @returns Object with project, githubUrl, and githubToken
 */
export async function fetchProjectGithubUrl(projectId: string): Promise<{ project: any; githubUrl: string; githubToken: string | null }> {
  const { db } = await import('@/server/db');

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        githubUrl: true,
        githubToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    if (!project.githubUrl) {
      throw new Error(`Project ${project.name} does not have a GitHub URL configured`);
    }

    return { project, githubUrl: project.githubUrl, githubToken: project.githubToken };
  } catch (error) {
    console.error('Error fetching project GitHub URL:', error);
    throw error;
  }
}

/**
 * Helper function to filter commits that haven't been processed yet
 * @param commits - Array of commit data from GitHub
 * @param projectId - The project ID to check against
 * @returns Array of commits that are not yet in the database
 */
export async function filterUnprocessedCommits(commits: CommitData[], projectId: string): Promise<CommitData[]> {
  const { db } = await import('@/server/db');

  try {
    // Get all existing commit hashes for this project
    const existingCommits = await db.comment.findMany({
      where: { projectId },
      select: { commitHash: true },
    });

    const existingHashes = new Set(existingCommits.map(commit => commit.commitHash));

    // Filter out commits that already exist
    const newCommits = commits.filter(commit => !existingHashes.has(commit.commitHash));

    console.log(`Found ${newCommits.length} new commits out of ${commits.length} total commits`);
    return newCommits;
  } catch (error) {
    console.error('Error filtering unprocessed commits:', error);
    throw error;
  }
}

/**
 * Fetch commit diff from GitHub
 * @param githubUrl - GitHub repository URL
 * @param commitHash - The commit hash to fetch diff for
 * @param githubToken - GitHub personal access token
 * @returns Promise<string> - The commit diff text
 */
export async function fetchCommitDiff(githubUrl: string, commitHash: string, githubToken: string): Promise<{ diffText: string; additions: number; deletions: number; filesChanged: number }> {
  try {
    // Parse the GitHub URL to get owner and repo
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }

    const { owner, repo } = parsed;

    // Initialize Octokit - try auth first, fallback to no-auth
    let response;
    try {
      const octokit = new Octokit(githubToken ? { auth: githubToken } : {});

      console.log(`Fetching commit diff for ${owner}/${repo}@${commitHash.substring(0, 7)}...`);

      // Fetch the commit details with diff
      response = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commitHash,
      });
    } catch (error: any) {
      if (error.status === 401 || error.message?.includes('Bad credentials')) {
        console.warn('GitHub token invalid or expired. Falling back to unauthenticated request for commit diff...');
        const fallbackOctokit = new Octokit();
        response = await fallbackOctokit.rest.repos.getCommit({
          owner,
          repo,
          ref: commitHash,
        });
      } else {
        throw error;
      }
    }

    // Extract the commit message and files changed
    const commit = response.data;
    const commitInfo = {
      message: commit.commit.message,
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || new Date().toISOString(),
      filesChanged: commit.files?.length || 0,
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      files: commit.files?.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch?.substring(0, 1000) || '' // Limit patch size
      })) || []
    };

    // Create a structured diff text for AI analysis
    const diffText = `
COMMIT: ${commitHash.substring(0, 7)}
MESSAGE: ${commitInfo.message}
AUTHOR: ${commitInfo.author}
DATE: ${commitInfo.date}
STATS: +${commitInfo.additions} -${commitInfo.deletions} (${commitInfo.filesChanged} files)

FILES CHANGED:
${commitInfo.files.map(file =>
      `- ${file.filename} (${file.status}) +${file.additions} -${file.deletions}`
    ).join('\n')}

SAMPLE CHANGES:
${commitInfo.files.slice(0, 3).map(file =>
      file.patch ? `\n--- ${file.filename} ---\n${file.patch}` : ''
    ).join('\n')}
    `.trim();

    console.log(`Successfully fetched diff for commit ${commitHash.substring(0, 7)} (${diffText.length} chars)`);
    return {
      diffText,
      additions: commitInfo.additions,
      deletions: commitInfo.deletions,
      filesChanged: commitInfo.filesChanged
    };

  } catch (error) {
    console.error(`Error fetching commit diff for ${commitHash}:`, error);
    throw error;
  }
}

/**
 * Get public repo stats (stars, forks, language) for the Open Source dashboard
 */
export async function getRepoStats(
  githubUrl: string,
  githubToken: string
): Promise<{ fullName: string; stars: number; forks: number; language: string | null; description: string | null }> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }
  const { owner, repo } = parsed;
  try {
    const octokit = new Octokit(githubToken ? { auth: githubToken } : {});
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      fullName: data.full_name ?? `${owner}/${repo}`,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language ?? null,
      description: data.description ?? null,
    };
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes('Bad credentials')) {
      const fallback = new Octokit();
      const { data } = await fallback.rest.repos.get({ owner, repo });
      return {
        fullName: data.full_name ?? `${owner}/${repo}`,
        stars: data.stargazers_count ?? 0,
        forks: data.forks_count ?? 0,
        language: data.language ?? null,
        description: data.description ?? null,
      };
    }
    throw error;
  }
}

/**
 * Get raw commit diff from GitHub API using Axios
 * @param githubUrl - GitHub repository URL  
 * @param commitHash - The commit hash to fetch diff for
 * @param githubToken - GitHub personal access token
 * @returns Promise<string> - The raw diff as a string
 */
export async function getCommitDiff(githubUrl: string, commitHash: string, githubToken: string): Promise<string> {
  try {
    // Parse the GitHub URL to get owner and repo
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }

    const { owner, repo } = parsed;

    console.log(`Fetching raw diff for ${owner}/${repo}@${commitHash.substring(0, 7)}...`);

    let response;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3.diff',
      'User-Agent': 'vrindahelp-commit-analyzer'
    };

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Use Axios to GET the diff with proper headers
    try {
      response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}.diff`,
        { headers }
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('GitHub token invalid or expired. Falling back to unauthenticated raw diff request...');
        const fallbackHeaders = {
          'Accept': 'application/vnd.github.v3.diff',
          'User-Agent': 'vrindahelp-commit-analyzer'
        };
        response = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}.diff`,
          { headers: fallbackHeaders }
        );
      } else {
        throw error;
      }
    }

    console.log(`Successfully fetched raw diff for commit ${commitHash.substring(0, 7)} (${response.data.length} chars)`);
    return response.data;

  } catch (error) {
    console.error(`Error fetching raw commit diff for ${commitHash}:`, error);
    throw error;
  }
}

/**
 * Summarize a commit using AI analysis of its diff
 * @param githubUrl - GitHub repository URL
 * @param commitHash - The commit hash to summarize
 * @param commitMessage - The commit message
 * @param githubToken - GitHub personal access token
 * @returns Promise<string> - AI-generated summary
 */
export async function summarizeCommit(githubUrl: string, commitHash: string, commitMessage: string, githubToken: string): Promise<{ summary: string; additions: number; deletions: number; filesChanged: number }> {
  let additions = 0;
  let deletions = 0;
  let filesChanged = 0;
  let textForSummary = `COMMIT: ${commitHash.substring(0, 7)}\nMESSAGE: ${commitMessage}\n`;

  try {
    console.log(`Generating AI summary for commit ${commitHash.substring(0, 7)}`);

    const { summarizeText } = await import('@/server/lib/ai');

    try {
      const diffResult = await fetchCommitDiff(githubUrl, commitHash, githubToken);
      additions = diffResult.additions;
      deletions = diffResult.deletions;
      filesChanged = diffResult.filesChanged;
      // Use full diff for AI when available; otherwise we already have message in textForSummary
      if (diffResult.diffText && diffResult.diffText.trim().length > 50) {
        textForSummary = diffResult.diffText;
      } else {
        textForSummary += `\n(No diff or minimal diff - e.g. merge or empty commit.)`;
      }
    } catch (diffError: any) {
      console.warn(`Could not fetch diff for ${commitHash.substring(0, 7)}, using message-only summary:`, diffError?.message || diffError);
      // textForSummary already has commit + message; AI can still summarize
    }

    const aiSummary = await summarizeText(textForSummary);
    return {
      summary: aiSummary,
      additions,
      deletions,
      filesChanged
    };
  } catch (error: any) {
    console.error(`Failed to generate AI summary for commit ${commitHash}:`, error?.message || error);

    return {
      summary: generateBasicCommitSummary(commitMessage),
      additions,
      deletions,
      filesChanged
    };
  }
}

/**
 * Generate basic pattern-based summary when AI fails
 * @param commitMessage - The commit message to analyze
 * @returns string - Basic summary
 */
function generateBasicCommitSummary(commitMessage: string): string {
  const message = commitMessage.toLowerCase();

  let summary = "📝 Code changes detected. ";

  // Simple pattern matching for fallback
  if (message.includes('fix') || message.includes('bug')) {
    summary += "🐛 This appears to be a bug fix or error correction.";
  } else if (message.includes('feat') || message.includes('add') || message.includes('new')) {
    summary += "✨ New feature or functionality has been added.";
  } else if (message.includes('update') || message.includes('modify') || message.includes('change')) {
    summary += "🔄 Existing code has been updated or modified.";
  } else if (message.includes('remove') || message.includes('delete')) {
    summary += "🗑️ Code or features have been removed.";
  } else if (message.includes('refactor')) {
    summary += "♻️ Code has been refactored for better structure.";
  } else if (message.includes('doc') || message.includes('readme')) {
    summary += "📚 Documentation has been updated.";
  } else if (message.includes('test')) {
    summary += "🧪 Tests have been added or updated.";
  } else if (message.includes('merge')) {
    summary += "🔀 Branch merge containing multiple changes.";
  } else {
    summary += "⚡ General improvements and updates.";
  }

  return summary + " (AI analysis failed - using pattern detection)";
}

/**
 * Enhanced generate commit summary function with AI integration
 * @param commit - The commit data to summarize
 * @param projectId - The project ID for context
 * @param githubUrl - GitHub repository URL for fetching diffs
 * @returns Promise<string> - AI-generated summary
 */
export async function generateCommitSummary(commit: CommitData, projectId: string, githubUrl?: string): Promise<string> {
  try {
    // If we have a GitHub URL, use AI-powered analysis
    if (githubUrl) {
      const { env } = await import('@/server/config/env');
      const result = await summarizeCommit(githubUrl, commit.commitHash, commit.commitMessage, env.GITHUB_TOKEN);
      return result.summary;
    }

    // Fallback to pattern-based analysis
    return generateBasicCommitSummary(commit.commitMessage);

  } catch (error) {
    console.error('Error generating commit summary:', error);
    return generateBasicCommitSummary(commit.commitMessage);
  }
}

/**
 * Poll commits for a specific project and process new ones
 * @param projectId - The project ID to poll commits for
 * @param githubTokenOverride - Optional token to use instead of the one in DB/Env
 * @returns Promise<{ processed: number; total: number; commits: any[] }>
 */
export async function pollCommits(projectId: string, githubTokenOverride?: string): Promise<{ processed: number; total: number; commits: any[] }> {
  const { env } = await import('@/server/config/env');
  const { db } = await import('@/server/db');

  try {
    console.log(`Polling commits for project: ${projectId}`);

    // Step 1: Fetch project and GitHub URL from DB
    const { project, githubUrl, githubToken: dbToken } = await fetchProjectGithubUrl(projectId);
    
    // Choose the best token: Override > DB > Env
    const activeToken = githubTokenOverride || dbToken || env.GITHUB_TOKEN;
    
    const allCommits = await getCommitHashes(githubUrl, activeToken);
    const latestCommits = allCommits.slice(0, 10);

    // Step 3: Filter out already-processed commits
    const newCommits = await filterUnprocessedCommits(latestCommits, projectId);

    if (newCommits.length === 0) {
      console.log(`No new commits to process for project ${project.name}`);
      return { processed: 0, total: latestCommits.length, commits: [] };
    }

    console.log(`Processing ${newCommits.length} new commits with AI summarization`);

    const processedCommits = [];
    for (const commit of newCommits) {
      try {
        console.log(`Summarizing commit: ${commit.commitHash.substring(0, 7)}`);
        const result = await summarizeCommit(githubUrl, commit.commitHash, commit.commitMessage, activeToken);
        
        processedCommits.push({
          ...commit,
          summary: result.summary,
          linesAdded: result.additions,
          linesDeleted: result.deletions,
          filesChanged: result.filesChanged,
          success: true
        });

        // Add a 4000ms delay between AI calls to strictly respect Gemini Free Tier 15 RPM limit
        await new Promise(resolve => setTimeout(resolve, 4000));
      } catch (error) {
        console.error(`Failed to process commit ${commit.commitHash.substring(0, 7)}:`, error);
        processedCommits.push({
          ...commit,
          summary: generateBasicCommitSummary(commit.commitMessage),
          linesAdded: 0,
          linesDeleted: 0,
          filesChanged: 0,
          success: false
        });
      }
    }

    // Step 5: Save results to DB with db.comment.createMany
    // Ensure type safety with non-null assertions where data is guaranteed
    const commitsToSave = processedCommits.map(commit => ({
      projectId,
      commitHash: commit.commitHash!,
      commitMessage: commit.commitMessage!,
      commitAuthorName: commit.commitAuthorName,
      commitAuthorAvatar: commit.commitAuthorAvatar,
      commitDate: commit.commitDate!,
      summary: commit.summary,
      linesAdded: commit.linesAdded || 0,
      linesDeleted: commit.linesDeleted || 0,
      filesChanged: commit.filesChanged || 0,
    }));

    // Save all commits to database in one batch operation
    const savedCommits = await db.comment.createMany({
      data: commitsToSave,
    });

    const successfulSummaries = processedCommits.filter(c => c.success).length;

    console.log(`Successfully processed ${processedCommits.length} commits with ${successfulSummaries} AI summaries`);
    console.log(`Saved ${savedCommits.count} commits to database`);

    return {
      processed: savedCommits.count,
      total: latestCommits.length,
      commits: commitsToSave,
    };

  } catch (error) {
    console.error(`Error polling commits for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Poll commits for multiple projects
 * @param projectIds - Array of project IDs to poll
 * @returns Promise<{ results: any[]; totalProcessed: number }>
 */
export async function pollCommitsForProjects(projectIds: string[]): Promise<{ results: any[]; totalProcessed: number }> {
  try {
    console.log(`Polling commits for ${projectIds.length} projects`);

    const results = [];
    let totalProcessed = 0;

    for (const projectId of projectIds) {
      try {
        const result = await pollCommits(projectId);
        results.push({ projectId, ...result });
        totalProcessed += result.processed;
      } catch (error) {
        console.error(`Failed to poll commits for project ${projectId}:`, error);
        results.push({
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
          processed: 0,
          total: 0,
          commits: []
        });
      }
    }

    console.log(`Completed polling. Total commits processed: ${totalProcessed}`);

    return { results, totalProcessed };
  } catch (error) {
    console.error('Error polling commits for multiple projects:', error);
    throw error;
  }
}

// Export default
export default { getCommitHashes };
