import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const children = [
  spawn("node", ["sse-mock-server.js"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  }),
  spawn("npm", ["run", "dev"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  }),
];

const shutdown = (code = 0) => {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown(code);
    }
  });
}
