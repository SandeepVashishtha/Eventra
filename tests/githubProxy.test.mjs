import assert from "node:assert/strict";
import handler from "../api/github-proxy.js";

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  return response;
};

const blockedPaths = [
  "@evil.example.com/steal",
  "/repos/owner/repo/../secret",
  "/repos/owner/repo/issues",
  "https://evil.example.com/steal",
];

let fetchCalls = [];
globalThis.fetch = async (url, options) => {
  fetchCalls.push({ url, options });
  return {
    status: 200,
    json: async () => ({ ok: true }),
  };
};

process.env.GITHUB_TOKEN = "test-token";

for (const path of blockedPaths) {
  const response = createResponse();
  await handler({ query: { path } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(fetchCalls.length, 0);
}

const contributorsResponse = createResponse();
await handler(
  { query: { path: "/repos/Eventra/Eventra/contributors?per_page=100", page: "2" } },
  contributorsResponse
);

assert.equal(contributorsResponse.statusCode, 200);
assert.equal(fetchCalls.length, 1);
assert.equal(
  fetchCalls[0].url,
  "https://api.github.com/repos/Eventra/Eventra/contributors?per_page=100&page=2"
);
assert.equal(fetchCalls[0].options.headers.Authorization, "token test-token");

const usersResponse = createResponse();
await handler({ query: { path: "/users/octocat" } }, usersResponse);

assert.equal(usersResponse.statusCode, 200);
assert.equal(fetchCalls.length, 2);
assert.equal(fetchCalls[1].url, "https://api.github.com/users/octocat");
