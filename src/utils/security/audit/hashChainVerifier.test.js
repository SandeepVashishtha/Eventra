// src/utils/security/audit/hashChainVerifier.test.js
import {
  sha256,
  computeMerkleRoot,
  createBlock,
  recordAuditAction,
  getAuditLogs,
  getBlockRoots,
  getHashChain,
  verifyBlockIntegrity,
  verifyHashChainIntegrity,
  detectLogTampering,
  clearAuditData,
  getAuditStatistics,
  AUDIT_LOG_KEY,
  BLOCK_ROOTS_KEY,
  HASH_CHAIN_KEY,
  BLOCK_SIZE,
} from "./hashChainVerifier.js";

describe("hashChainVerifier", () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    // Silence console warnings/errors during test execution
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearAuditData();
  });

  describe("sha256", () => {
    it("computes SHA-256 hash correctly", async () => {
      const input = "test";
      const expectedHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      const actualHash = await sha256(input);
      expect(actualHash).toBe(expectedHash);
    });

    it("computes different hashes for different inputs", async () => {
      const hash1 = await sha256("input1");
      const hash2 = await sha256("input2");
      expect(hash1).not.toBe(hash2);
    });

    it("returns empty string for empty input", async () => {
      const hash = await sha256("");
      // SHA-256 of empty string is well-known
      expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    });
  });

  describe("computeMerkleRoot", () => {
    it("returns empty string for empty log list", async () => {
      const rootHash = await computeMerkleRoot([]);
      expect(rootHash).toBe("");
    });

    it("returns empty string for null log list", async () => {
      const rootHash = await computeMerkleRoot(null);
      expect(rootHash).toBe("");
    });

    it("computes correct root hash for single log", async () => {
      const logs = ["log1"];
      const rootHash = await computeMerkleRoot(logs);
      const expectedHash = await sha256("log1");
      expect(rootHash).toBe(expectedHash);
    });

    it("computes correct root hash for two logs", async () => {
      const logs = ["log1", "log2"];
      const rootHash = await computeMerkleRoot(logs);
      const combinedHash = await sha256("log1log2");
      expect(rootHash).toBe(combinedHash);
    });

    it("computes correct root hash for three logs", async () => {
      const logs = ["log1", "log2", "log3"];
      const rootHash = await computeMerkleRoot(logs);
      
      // For 3 logs: 
      // Level 1: hash(log1+log2), hash(log3+log3)
      // Level 2: hash(hash1+hash2)
      const hash1 = await sha256("log1log2");
      const hash2 = await sha256("log3log3");
      const expectedRoot = await sha256(hash1 + hash2);
      
      expect(rootHash).toBe(expectedRoot);
    });

    it("computes correct root hash for four logs", async () => {
      const logs = ["log1", "log2", "log3", "log4"];
      const rootHash = await computeMerkleRoot(logs);
      
      // For 4 logs:
      // Level 1: hash(log1+log2), hash(log3+log4)
      // Level 2: hash(hash1+hash2)
      const hash1 = await sha256("log1log2");
      const hash2 = await sha256("log3log4");
      const expectedRoot = await sha256(hash1 + hash2);
      
      expect(rootHash).toBe(expectedRoot);
    });
  });

  describe("createBlock", () => {
    it("creates a block with correct properties", async () => {
      const logs = ["log1", "log2", "log3", "log4"];
      const block = await createBlock(logs);

      expect(block.blockId).toContain("block_");
      expect(block.rootHash).not.toBe("");
      expect(block.logs).toEqual(logs);
      expect(block.timestamp).toBeDefined();
    });

    it("generates unique block IDs", async () => {
      const logs = ["log1"];
      const block1 = await createBlock(logs);
      const block2 = await createBlock(logs);

      expect(block1.blockId).not.toBe(block2.blockId);
    });
  });

  describe("recordAuditAction", () => {
    it("records a single action", async () => {
      await recordAuditAction("test_action");
      
      const logs = getAuditLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe("test_action");
      expect(logs[0].id).toBeDefined();
      expect(logs[0].timestamp).toBeDefined();
    });

    it("records action with metadata", async () => {
      const metadata = { userId: "123", eventId: "456" };
      await recordAuditAction("user_login", metadata);

      const logs = getAuditLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe("user_login");
      expect(logs[0].metadata).toEqual(metadata);
    });

    it("creates a block when BLOCK_SIZE is reached", async () => {
      // Record exactly BLOCK_SIZE actions
      for (let i = 0; i < BLOCK_SIZE; i++) {
        await recordAuditAction(`action_${i}`);
      }

      const blocks = getBlockRoots();
      expect(blocks.length).toBe(1);
      
      const hashChain = getHashChain();
      expect(hashChain.length).toBe(1);
      
      // Logs should be cleared after block creation
      const logs = getAuditLogs();
      expect(logs.length).toBe(0);
    });

    it("creates multiple blocks when exceeding BLOCK_SIZE", async () => {
      // Record more than BLOCK_SIZE actions
      for (let i = 0; i < BLOCK_SIZE * 2 + 1; i++) {
        await recordAuditAction(`action_${i}`);
      }

      const blocks = getBlockRoots();
      expect(blocks.length).toBe(2);
      
      const hashChain = getHashChain();
      expect(hashChain.length).toBe(2);
      
      // Should have remaining logs not yet in a block
      const logs = getAuditLogs();
      expect(logs.length).toBe(1);
    });

    it("maintains hash chain with previousHash links", async () => {
      // Create first block
      for (let i = 0; i < BLOCK_SIZE; i++) {
        await recordAuditAction(`block1_action_${i}`);
      }

      // Create second block
      for (let i = 0; i < BLOCK_SIZE; i++) {
        await recordAuditAction(`block2_action_${i}`);
      }

      const hashChain = getHashChain();
      expect(hashChain.length).toBe(2);
      
      const blocks = getBlockRoots();
      // First block should have empty previousHash
      // Second block should have first block's rootHash as previousHash
      expect(blocks[0].previousHash).toBe("");
      expect(blocks[1].previousHash).toBe(blocks[0].rootHash);
    });
  });

  describe("verifyBlockIntegrity", () => {
    it("verifies a valid block", async () => {
      const logs = ["log1", "log2", "log3", "log4"];
      const block = await createBlock(logs);
      
      const result = await verifyBlockIntegrity(block, logs);
      
      expect(result.isValid).toBe(true);
      expect(result.expectedHash).toBe(block.rootHash);
      expect(result.actualHash).toBe(block.rootHash);
    });

    it("detects tampered block", async () => {
      const logs = ["log1", "log2", "log3", "log4"];
      const block = await createBlock(logs);
      
      // Tamper with the logs
      const tamperedLogs = ["log1", "log2", "log3", "tampered_log"];
      
      const result = await verifyBlockIntegrity(block, tamperedLogs);
      
      expect(result.isValid).toBe(false);
      expect(result.expectedHash).toBe(block.rootHash);
      expect(result.actualHash).not.toBe(block.rootHash);
    });
  });

  describe("verifyHashChainIntegrity", () => {
    it("returns true for empty chain", async () => {
      const result = await verifyHashChainIntegrity();
      expect(result.isValid).toBe(true);
      expect(result.chain).toEqual([]);
      expect(result.brokenLinks).toEqual([]);
    });

    it("verifies valid hash chain", async () => {
      // Create multiple blocks to form a chain
      for (let i = 0; i < BLOCK_SIZE * 3; i++) {
        await recordAuditAction(`action_${i}`);
      }

      const result = await verifyHashChainIntegrity();
      expect(result.isValid).toBe(true);
      expect(result.brokenLinks).toEqual([]);
    });
  });

  describe("detectLogTampering", () => {
    it("returns no tampering for valid blocks", async () => {
      for (let i = 0; i < BLOCK_SIZE; i++) {
        await recordAuditAction(`action_${i}`);
      }

      const result = await detectLogTampering();
      expect(result.isTampered).toBe(false);
      expect(result.tamperedBlocks).toEqual([]);
    });
  });

  describe("getAuditStatistics", () => {
    it("returns correct statistics", async () => {
      // Record some actions
      for (let i = 0; i < BLOCK_SIZE + 2; i++) {
        await recordAuditAction(`action_${i}`);
      }

      const stats = getAuditStatistics();
      
      expect(stats.totalLogs).toBe(BLOCK_SIZE + 2);
      expect(stats.pendingLogs).toBe(2);
      expect(stats.totalBlocks).toBe(1);
      expect(stats.chainLength).toBe(1);
      expect(stats.totalLogEntries).toBe(BLOCK_SIZE + 2);
    });
  });

  describe("clearAuditData", () => {
    it("clears all audit data", async () => {
      // Add some data
      for (let i = 0; i < BLOCK_SIZE; i++) {
        await recordAuditAction(`action_${i}`);
      }

      expect(getAuditLogs().length).toBeGreaterThan(0);
      expect(getBlockRoots().length).toBeGreaterThan(0);
      expect(getHashChain().length).toBeGreaterThan(0);

      // Clear data
      clearAuditData();

      expect(getAuditLogs().length).toBe(0);
      expect(getBlockRoots().length).toBe(0);
      expect(getHashChain().length).toBe(0);
    });

    it("removes data from localStorage", () => {
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([{ test: "data" }]));
      localStorage.setItem(BLOCK_ROOTS_KEY, JSON.stringify([{ root: "hash" }]));
      localStorage.setItem(HASH_CHAIN_KEY, JSON.stringify([{ hash: "chain" }]));

      clearAuditData();

      expect(localStorage.getItem(AUDIT_LOG_KEY)).toBeNull();
      expect(localStorage.getItem(BLOCK_ROOTS_KEY)).toBeNull();
      expect(localStorage.getItem(HASH_CHAIN_KEY)).toBeNull();
    });
  });

  describe("storage key constants", () => {
    it("has correct constant values", () => {
      expect(AUDIT_LOG_KEY).toBe("eventra_audit_logs");
      expect(BLOCK_ROOTS_KEY).toBe("eventra_block_roots");
      expect(HASH_CHAIN_KEY).toBe("eventra_hash_chain");
      expect(BLOCK_SIZE).toBe(4);
    });
  });
});
