/**
 * Security tests for SSE mock server JWT secret validation
 * 
 * These tests verify that sse-mock-server.js enforces fail-closed security:
 * - Missing JWT_SECRET causes server to exit with error
 * - Empty JWT_SECRET causes server to exit with error
 * - Whitespace-only JWT_SECRET causes server to exit with error
 * - Valid JWT_SECRET allows server to start
 * - No hardcoded fallback secret is accepted
 */

import { strict as assert } from "node:assert";
import { describe, it, before, after } from "node:test";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SSE_MOCK_SERVER_PATH = path.resolve(__dirname, "../sse-mock-server.js");

describe("SSE Mock Server JWT Secret Validation - Fail-Closed Security", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  after(() => {
    // Restore original JWT_SECRET after all tests
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  describe("Server rejects invalid configurations", () => {
    it("exits with error when JWT_SECRET is missing", async () => {
      const testEnv = { ...process.env };
      delete testEnv.JWT_SECRET;

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stderrOutput = "";

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        serverProcess.on("exit", (code) => {
          resolve(code);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          serverProcess.kill();
          resolve(null);
        }, 5000);
      });

      assert.ok(
        exitCode !== 0,
        "Expected server to exit with non-zero code when JWT_SECRET is missing"
      );

      assert.ok(
        stderrOutput.includes("FATAL: JWT_SECRET environment variable is required"),
        "Expected error message to mention JWT_SECRET requirement"
      );

      assert.ok(
        stderrOutput.includes("openssl rand -base64 32"),
        "Expected error message to include openssl generation command"
      );
    });

    it("exits with error when JWT_SECRET is empty string", async () => {
      const testEnv = { ...process.env };
      testEnv.JWT_SECRET = "";

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stderrOutput = "";

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        serverProcess.on("exit", (code) => {
          resolve(code);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          serverProcess.kill();
          resolve(null);
        }, 5000);
      });

      assert.ok(
        exitCode !== 0,
        "Expected server to exit with non-zero code when JWT_SECRET is empty"
      );

      assert.ok(
        stderrOutput.includes("FATAL: JWT_SECRET environment variable is required"),
        "Expected error message to mention JWT_SECRET requirement"
      );
    });

    it("exits with error when JWT_SECRET is whitespace-only", async () => {
      const testEnv = { ...process.env };
      testEnv.JWT_SECRET = "   ";

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stderrOutput = "";

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        serverProcess.on("exit", (code) => {
          resolve(code);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          serverProcess.kill();
          resolve(null);
        }, 5000);
      });

      assert.ok(
        exitCode !== 0,
        "Expected server to exit with non-zero code when JWT_SECRET is whitespace-only"
      );

      assert.ok(
        stderrOutput.includes("FATAL: JWT_SECRET environment variable is required"),
        "Expected error message to mention JWT_SECRET requirement"
      );
    });

    it("exits with error when JWT_SECRET is tabs-only", async () => {
      const testEnv = { ...process.env };
      testEnv.JWT_SECRET = "\t\t";

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stderrOutput = "";

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        serverProcess.on("exit", (code) => {
          resolve(code);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          serverProcess.kill();
          resolve(null);
        }, 5000);
      });

      assert.ok(
        exitCode !== 0,
        "Expected server to exit with non-zero code when JWT_SECRET is tabs-only"
      );

      assert.ok(
        stderrOutput.includes("FATAL: JWT_SECRET environment variable is required"),
        "Expected error message to mention JWT_SECRET requirement"
      );
    });
  });

  describe("Server accepts valid configurations", () => {
    it("starts successfully when JWT_SECRET is valid", async () => {
      const testEnv = { ...process.env };
      testEnv.JWT_SECRET = "test-secret-key-for-sse-mock-server-testing";
      testEnv.SSE_MOCK_PORT = "8081"; // Use different port to avoid conflicts

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stdoutOutput = "";
      let stderrOutput = "";

      serverProcess.stdout.on("data", (data) => {
        stdoutOutput += data.toString();
      });

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      // Wait for server to start or fail
      await new Promise((resolve) => {
        serverProcess.stdout.on("data", () => {
          if (stdoutOutput.includes("SSE mock server running")) {
            resolve();
          }
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          resolve();
        }, 5000);
      });

      // Kill the server
      serverProcess.kill();

      assert.ok(
        stdoutOutput.includes("SSE mock server running"),
        "Expected server to start successfully when JWT_SECRET is valid"
      );

      assert.ok(
        !stderrOutput.includes("FATAL: JWT_SECRET"),
        "Expected no JWT_SECRET error when valid secret is provided"
      );
    });

    it("does NOT accept hardcoded fallback secret", async () => {
      const testEnv = { ...process.env };
      // Try to use the old hardcoded fallback
      testEnv.JWT_SECRET = "eventra-dev-jwt-secret";
      delete testEnv.JWT_SECRET; // Remove it to test that fallback doesn't exist

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stderrOutput = "";

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        serverProcess.on("exit", (code) => {
          resolve(code);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          serverProcess.kill();
          resolve(null);
        }, 5000);
      });

      assert.ok(
        exitCode !== 0,
        "Expected server to exit with non-zero code when JWT_SECRET is missing (no fallback accepted)"
      );

      assert.ok(
        stderrOutput.includes("FATAL: JWT_SECRET environment variable is required"),
        "Expected error message to mention JWT_SECRET requirement"
      );
    });
  });

  describe("Error message includes guidance", () => {
    it("error message includes openssl command for generating secrets", async () => {
      const testEnv = { ...process.env };
      delete testEnv.JWT_SECRET;

      const serverProcess = spawn("node", [SSE_MOCK_SERVER_PATH], {
        env: testEnv,
        stdio: "pipe"
      });

      let stderrOutput = "";

      serverProcess.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      const exitCode = await new Promise((resolve) => {
        serverProcess.on("exit", (code) => {
          resolve(code);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          serverProcess.kill();
          resolve(null);
        }, 5000);
      });

      assert.ok(
        exitCode !== 0,
        "Expected server to exit when JWT_SECRET is missing"
      );

      assert.ok(
        stderrOutput.includes("openssl rand -base64 32"),
        "Expected error message to include openssl generation command"
      );
    });
  });
});
