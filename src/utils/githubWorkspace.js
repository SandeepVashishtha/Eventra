/**
 * src/utils/githubWorkspace.js
 *
 * GitHub REST API utility for One-Click Team Workspace Bootstrap.
 * Uses a user-supplied Personal Access Token (in-memory only, never persisted)
 * to create a shared hackathon repository, scaffold a README, and invite teammates.
 *
 * Requires PAT scopes: `repo` (full repo access) + `read:user`
 */

const GITHUB_API = "https://api.github.com";

/** @param {string} token - GitHub PAT */
const headers = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
});

/**
 * Validate a GitHub PAT and return the authenticated user's login.
 * @param {string} token
 * @returns {Promise<{ login: string, avatar_url: string, html_url: string }>}
 */
export const validateGitHubToken = async (token) => {
  if (!token || token.trim().length < 10) {
    throw new Error("Invalid token format. Please enter a valid GitHub PAT.");
  }

  const res = await fetch(`${GITHUB_API}/user`, {
    headers: headers(token),
  });

  if (res.status === 401) {
    throw new Error("Token authentication failed. Check your PAT and try again.");
  }
  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}). Please try again.`);
  }

  const data = await res.json();
  return {
    login: data.login,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
  };
};

/**
 * Slugify a string into a valid GitHub repo name.
 * @param {string} str
 * @returns {string}
 */
export const slugifyRepoName = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);

/**
 * Extract a GitHub username from a github.com profile URL.
 * Returns null if the URL is not a valid GitHub profile link.
 * @param {string} url
 * @returns {string|null}
 */
export const extractGitHubUsername = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.toLowerCase().includes("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    // A profile URL has exactly one path segment (the username)
    if (parts.length === 1) return parts[0];
    return null;
  } catch {
    return null;
  }
};

/**
 * Create a new GitHub repository under the authenticated user's account.
 * @param {string} token
 * @param {{ name: string, description: string, isPrivate: boolean }} config
 * @returns {Promise<{ html_url: string, full_name: string, clone_url: string }>}
 */
export const createHackathonRepo = async (token, { name, description, isPrivate }) => {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: false, // We'll push the README ourselves
      has_issues: true,
      has_projects: true,
      has_wiki: false,
    }),
  });

  if (res.status === 422) {
    const err = await res.json();
    const msg = err?.errors?.[0]?.message || "Repository name already exists.";
    throw new Error(`Could not create repository: ${msg}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to create repository (HTTP ${res.status}).`);
  }

  const data = await res.json();
  return {
    html_url: data.html_url,
    full_name: data.full_name,
    clone_url: data.clone_url,
  };
};

/**
 * Push the initial hackathon README.md to the repository.
 * @param {string} token
 * @param {string} owner - Repo owner (the authenticated user's login)
 * @param {string} repo  - Repo name
 * @param {{ hackathonName: string, projectIdea: string, teamMembers: string[], repoUrl: string }} ctx
 * @returns {Promise<void>}
 */
export const bootstrapReadme = async (token, owner, repo, ctx) => {
  const { hackathonName, projectIdea, teamMembers, repoUrl } = ctx;

  const memberList = teamMembers
    .filter(Boolean)
    .map((m) => `- [@${m}](https://github.com/${m})`)
    .join("\n");

  const readmeContent = `# 🚀 ${hackathonName} — Team Workspace

> Bootstrapped with [Eventra](https://github.com/SandeepVashishtha/Eventra) One-Click Team Workspace

## 💡 Project Idea

${projectIdea || "*No description provided yet. Update this section with your project vision!*"}

## 👥 Team Members

${memberList || "*No members listed yet.*"}

## 📋 Getting Started

\`\`\`bash
# Clone this repository
git clone ${repoUrl}.git
cd ${repo}

# Install dependencies
npm install   # or pip install -r requirements.txt, etc.

# Start development
npm run dev
\`\`\`

## 🗂️ Project Structure

\`\`\`
${repo}/
├── src/          # Source code
├── docs/         # Documentation & design specs
├── tests/        # Test suite
└── README.md     # You are here
\`\`\`

## 🛠️ Tech Stack

> *Update with your chosen technologies*

- **Frontend**: 
- **Backend**: 
- **Database**: 
- **Deployment**: 

## 📅 Hackathon Timeline

| Phase | Goal |
|-------|------|
| Hour 1-2 | Project setup, architecture design |
| Hour 3-6 | Core feature development |
| Hour 7-10 | Integration, testing, polish |
| Final Hour | Demo prep, submission |

## 🏆 Submission

> *Add your submission link, demo video, and any judging notes here.*

---

*Built with ❤️ at ${hackathonName}*
`;

  const encoded = btoa(unescape(encodeURIComponent(readmeContent)));

  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/README.md`,
    {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify({
        message: "chore: bootstrap hackathon workspace via Eventra 🚀",
        content: encoded,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to create README (HTTP ${res.status}).`);
  }
};

/**
 * Invite a GitHub user as a collaborator with write access.
 * Silently skips if the username is the same as the repo owner.
 * @param {string} token
 * @param {string} owner
 * @param {string} repo
 * @param {string} username
 * @returns {Promise<{ username: string, status: 'invited'|'skipped'|'error', message?: string }>}
 */
export const addCollaborator = async (token, owner, repo, username) => {
  if (!username || username.trim() === "") {
    return { username, status: "skipped", message: "Empty username" };
  }
  if (username.toLowerCase() === owner.toLowerCase()) {
    return { username, status: "skipped", message: "Cannot invite yourself" };
  }

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/collaborators/${encodeURIComponent(username)}`,
      {
        method: "PUT",
        headers: headers(token),
        body: JSON.stringify({ permission: "push" }),
      }
    );

    if (res.status === 201 || res.status === 204) {
      return { username, status: "invited" };
    }
    if (res.status === 404) {
      return { username, status: "error", message: `User @${username} not found on GitHub` };
    }
    return { username, status: "error", message: `HTTP ${res.status}` };
  } catch (err) {
    return { username, status: "error", message: err.message };
  }
};

/**
 * Main orchestrator — runs the full bootstrap sequence.
 * Reports incremental progress via an optional onProgress callback.
 *
 * @param {string} token
 * @param {{
 *   repoName: string,
 *   description: string,
 *   isPrivate: boolean,
 *   hackathonName: string,
 *   projectIdea: string,
 *   teammates: string[],
 * }} config
 * @param {(step: string) => void} [onProgress]
 * @returns {Promise<{
 *   repoUrl: string,
 *   fullName: string,
 *   cloneUrl: string,
 *   collaboratorResults: Array<{ username: string, status: string, message?: string }>,
 *   ownerLogin: string,
 * }>}
 */
export const bootstrapWorkspace = async (token, config, onProgress = () => {}) => {
  const { repoName, description, isPrivate, hackathonName, projectIdea, teammates } = config;

  // Step 1: Validate token & get owner login
  onProgress("validating");
  const { login: ownerLogin } = await validateGitHubToken(token);

  // Step 2: Create repository
  onProgress("creating_repo");
  const {
    html_url: repoUrl,
    full_name: fullName,
    clone_url: cloneUrl,
  } = await createHackathonRepo(token, {
    name: repoName,
    description,
    isPrivate,
  });

  // Step 3: Push README
  onProgress("pushing_readme");
  await bootstrapReadme(token, ownerLogin, repoName, {
    hackathonName,
    projectIdea,
    teamMembers: [ownerLogin, ...teammates],
    repoUrl,
  });

  // Step 4: Invite collaborators
  onProgress("inviting");
  const collaboratorResults = await Promise.all(
    teammates
      .map((t) => t.trim())
      .filter(Boolean)
      .map((username) => addCollaborator(token, ownerLogin, repoName, username))
  );

  onProgress("done");
  return { repoUrl, fullName, cloneUrl, collaboratorResults, ownerLogin };
};
