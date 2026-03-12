import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const token = process.env.GITHUB_TOKEN;
  console.log("Token length:", token?.length);
  console.log("Token ends with space?", token?.endsWith(" "));
  console.log("Token:", `'${token}'`);
  try {
    const octokit = new Octokit({ auth: token });
    const response = await octokit.rest.repos.listCommits({
      owner: 'deepakstwt',
      repo: 'drone-survey-management-system',
      per_page: 2
    });
    console.log("SUCCESS!", response.data.length, "commits");
  } catch(e: any) {
    console.log("FAILED:", e.status, e.message);
  }
}
run();
