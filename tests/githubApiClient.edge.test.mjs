import assert from "node:assert/strict";
import { buildGitHubProxyUrl, getGitHubRepoDetails } from "../src/utils/githubApiClient.js";

const proxyUrl = buildGitHubProxyUrl("repos/foo/bar", { page: 1 });
assert.ok(proxyUrl.includes("path=%2Frepos%2Ffoo%2Fbar"));
assert.ok(proxyUrl.includes("page=1"));

const repo = getGitHubRepoDetails("https://github.com/SandeepVashishtha/Eventra");
assert.equal(repo.owner, "SandeepVashishtha");
assert.equal(repo.repo, "Eventra");

console.log("githubApiClient edge tests passed ✓");
