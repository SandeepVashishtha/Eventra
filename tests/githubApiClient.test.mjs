import assert from "node:assert/strict";
import { buildGitHubProxyUrl, getGitHubRepoDetails } from "../src/utils/githubApiClient.js";

const proxyUrl = buildGitHubProxyUrl("/repos/octocat/hello-world", { page: 1 });
assert.ok(proxyUrl.includes("page=1"));
assert.ok(proxyUrl.includes("path=%2Frepos%2Foctocat%2Fhello-world"));

const repoInfo = getGitHubRepoDetails("https://github.com/octocat/hello-world.git");
assert.equal(repoInfo.owner, "octocat");
assert.equal(repoInfo.repo, "hello-world");

console.log("githubApiClient tests passed ✓");
