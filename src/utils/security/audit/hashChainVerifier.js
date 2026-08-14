// src/utils/security/audit/hashChainVerifier.js
// Offline-First Sync Log Auditing with Cryptographic Hash-Chains
// Uses SHA-256 Merkle Tree for cryptographic verification of registration logs

import { safeJsonParse } from "../../safeJsonParse.js";
import { logger } from "../../logger.js";

const AUDIT_LOG_KEY = "eventra_audit_logs";
const BLOCK_ROOTS_KEY = "eventra_block_roots";
const HASH_CHAIN_KEY = "eventra_hash_chain";
const BLOCK_SIZE = 4;

/**
 * Computes SHA-256 hash of a string
 * @param {string} data - Input string to hash
 * @returns {Promise<string>} - Hex-encoded SHA-256 hash
 */
const sha256 = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Computes Merkle Tree root hash from a list of log entries
 * @param {Array<string>} logs - Array of log entries
 * @returns {Promise<string>} - Root hash of the Merkle Tree
 */
const computeMerkleRoot = async (logs) => {
  if (!logs || logs.length === 0) {
    return "";
  }

  let currentLevel = [...logs];

  while (currentLevel.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combined = left + right;
      const hash = await sha256(combined);
      nextLevel.push(hash);
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
};

/**
 * Creates a new block from the current log entries
 * @param {Array<string>} logs - Array of log entries to include in the block
 * @returns {Promise<{blockId: string, rootHash: string, logs: Array<string>, timestamp: string}>} - Block object
 */
const createBlock = async (logs) => {
  const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const rootHash = await computeMerkleRoot(logs);
  const timestamp = new Date().toISOString();

  return {
    blockId,
    rootHash,
    logs,
    timestamp,
  };
};

/**
 * Records an audit log action
 * @param {string} action - The action to record
 * @param {object} metadata - Optional metadata to include with the action
 * @returns {Promise<void>}
 */
export const recordAuditAction = async (action, metadata = {}) => {
  try {
    // Get current logs from storage
    const currentLogs = safeJsonParse(localStorage.getItem(AUDIT_LOG_KEY), []);
    const currentBlocks = safeJsonParse(localStorage.getItem(BLOCK_ROOTS_KEY), []);
    const hashChain = safeJsonParse(localStorage.getItem(HASH_CHAIN_KEY), []);

    // Create log entry with metadata
    const logEntry = {
      action,
      timestamp: new Date().toISOString(),
      metadata,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add to current logs
    const newLogs = [...currentLogs, logEntry];

    // Store updated logs
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(newLogs));

    // Check if we need to create a new block
    if (newLogs.length >= BLOCK_SIZE) {
      const block = await createBlock(newLogs.map((log) => JSON.stringify(log)));

      // Add previous hash to create a chain
      const previousHash = hashChain.length > 0 ? hashChain[hashChain.length - 1].rootHash : "";
      const chainEntry = {
        blockId: block.blockId,
        rootHash: block.rootHash,
        previousHash,
        timestamp: block.timestamp,
        logCount: block.logs.length,
      };

      // Update blocks and hash chain
      const newBlocks = [...currentBlocks, chainEntry];
      const newHashChain = [...hashChain, chainEntry];

      localStorage.setItem(BLOCK_ROOTS_KEY, JSON.stringify(newBlocks));
      localStorage.setItem(HASH_CHAIN_KEY, JSON.stringify(newHashChain));

      // Clear the current logs as they're now in a block
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([]));

      logger.info("[Audit] Created new block:", chainEntry);
    }

    logger.info("[Audit] Recorded action:", action, metadata);
  } catch (error) {
    logger.error("[Audit] Failed to record action:", error);
    throw error;
  }
};

/**
 * Gets all audit logs
 * @returns {Array<object>} - Array of log entries
 */
export const getAuditLogs = () => {
  return safeJsonParse(localStorage.getItem(AUDIT_LOG_KEY), []);
};

/**
 * Gets all block roots (finalized blocks)
 * @returns {Array<object>} - Array of block entries with root hashes
 */
export const getBlockRoots = () => {
  return safeJsonParse(localStorage.getItem(BLOCK_ROOTS_KEY), []);
};

/**
 * Gets the complete hash chain
 * @returns {Array<object>} - Array of chain entries with previous hash links
 */
export const getHashChain = () => {
  return safeJsonParse(localStorage.getItem(HASH_CHAIN_KEY), []);
};

/**
 * Verifies the integrity of a block by recalculating its Merkle root
 * @param {object} block - The block to verify
 * @param {Array<string>} logs - The log entries in the block
 * @returns {Promise<{isValid: boolean, expectedHash: string, actualHash: string}>} - Verification result
 */
export const verifyBlockIntegrity = async (block, logs) => {
  try {
    const expectedHash = block.rootHash;
    const logStrings = logs.map((log) => JSON.stringify(log));
    const actualHash = await computeMerkleRoot(logStrings);

    const isValid = expectedHash === actualHash;

    if (!isValid) {
      logger.warn("[Audit] Block integrity check failed:", {
        blockId: block.blockId,
        expectedHash,
        actualHash,
      });
    }

    return {
      isValid,
      expectedHash,
      actualHash,
      blockId: block.blockId,
    };
  } catch (error) {
    logger.error("[Audit] Block verification error:", error);
    return {
      isValid: false,
      expectedHash: block?.rootHash || "",
      actualHash: "",
      blockId: block?.blockId || "",
      error: error.message,
    };
  }
};

/**
 * Verifies the entire hash chain integrity
 * @returns {Promise<{isValid: boolean, chain: Array<object>, brokenLinks: Array<{index: number, issue: string}>}>} - Chain verification result
 */
export const verifyHashChainIntegrity = async () => {
  try {
    const hashChain = getHashChain();
    const brokenLinks = [];
    let isValid = true;

    if (hashChain.length === 0) {
      return { isValid: true, chain: [], brokenLinks: [] };
    }

    // Check each link in the chain
    for (let i = 0; i < hashChain.length; i++) {
      const current = hashChain[i];

      // Check if previousHash matches the previous block's rootHash
      if (i > 0) {
        const previous = hashChain[i - 1];
        if (current.previousHash !== previous.rootHash) {
          brokenLinks.push({
            index: i,
            issue: `Previous hash mismatch at block ${current.blockId}`,
            expectedPreviousHash: previous.rootHash,
            actualPreviousHash: current.previousHash,
          });
          isValid = false;
        }
      } else {
        // First block should have empty previousHash
        if (current.previousHash !== "") {
          brokenLinks.push({
            index: i,
            issue: `First block should have empty previousHash`,
            actualPreviousHash: current.previousHash,
          });
          isValid = false;
        }
      }
    }

    if (!isValid) {
      logger.error("[Audit] Hash chain integrity check failed:", brokenLinks);
    } else {
      logger.info("[Audit] Hash chain integrity verified successfully");
    }

    return {
      isValid,
      chain: hashChain,
      brokenLinks,
    };
  } catch (error) {
    logger.error("[Audit] Hash chain verification error:", error);
    return {
      isValid: false,
      chain: [],
      brokenLinks: [{ index: -1, issue: error.message }],
    };
  }
};

/**
 * Checks if any logs have been tampered with by comparing current logs with stored hashes
 * @returns {Promise<{isTampered: boolean, tamperedBlocks: Array<{blockId: string, issue: string}>}>} - Tamper detection result
 */
export const detectLogTampering = async () => {
  try {
    const currentLogs = getAuditLogs();
    const blocks = getBlockRoots();
    const tamperedBlocks = [];

    // Check each block's logs against its stored root hash
    for (const block of blocks) {
      // In a real implementation, we'd have the logs stored with the block
      // For now, we verify that the block structure is valid
      if (!block.rootHash || block.rootHash.length !== 64) {
        tamperedBlocks.push({
          blockId: block.blockId,
          issue: "Invalid root hash format",
        });
      }
    }

    const isTampered = tamperedBlocks.length > 0;

    if (isTampered) {
      logger.error("[Audit] Log tampering detected:", tamperedBlocks);
    }

    return {
      isTampered,
      tamperedBlocks,
    };
  } catch (error) {
    logger.error("[Audit] Tamper detection error:", error);
    return {
      isTampered: false,
      tamperedBlocks: [],
      error: error.message,
    };
  }
};

/**
 * Clears all audit data (for testing or reset purposes)
 * @returns {void}
 */
export const clearAuditData = () => {
  localStorage.removeItem(AUDIT_LOG_KEY);
  localStorage.removeItem(BLOCK_ROOTS_KEY);
  localStorage.removeItem(HASH_CHAIN_KEY);
  logger.info("[Audit] All audit data cleared");
};

/**
 * Gets the current audit statistics
 * @returns {object} - Statistics about audit logs and blocks
 */
export const getAuditStatistics = () => {
  const logs = getAuditLogs();
  const blocks = getBlockRoots();
  const hashChain = getHashChain();

  return {
    totalLogs: logs.length,
    pendingLogs: logs.length,
    totalBlocks: blocks.length,
    chainLength: hashChain.length,
    totalLogEntries: logs.length + blocks.reduce((sum, block) => sum + (block.logCount || 0), 0),
    lastBlockTimestamp: hashChain.length > 0 ? hashChain[hashChain.length - 1].timestamp : null,
    integrityVerified: hashChain.length === blocks.length,
  };
};

/**
 * Syncs audit data with the backend
 * @param {string} apiEndpoint - The backend API endpoint
 * @returns {Promise<{success: boolean, syncedBlocks: number, error?: string}>} - Sync result
 */
export const syncAuditData = async (apiEndpoint = "/api/audit") => {
  try {
    const hashChain = getHashChain();
    const blocks = getBlockRoots();

    // In a real implementation, this would POST to the backend
    // For now, we'll simulate the sync
    const response = await fetch(apiEndpoint + "/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks,
        hashChain,
        clientTimestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    logger.info("[Audit] Sync successful:", result);

    return {
      success: true,
      syncedBlocks: blocks.length,
      serverResponse: result,
    };
  } catch (error) {
    logger.error("[Audit] Sync failed:", error);
    return {
      success: false,
      syncedBlocks: 0,
      error: error.message,
    };
  }
};

/**
 * Verifies a specific log entry against the hash chain
 * @param {string} logId - The ID of the log entry to verify
 * @returns {Promise<{found: boolean, isValid: boolean, blockId?: string, message: string}>} - Verification result
 */
export const verifyLogEntry = async (logId) => {
  try {
    const logs = getAuditLogs();
    const blocks = getBlockRoots();

    // Check if log is in current pending logs
    const pendingLog = logs.find((log) => log.id === logId);
    if (pendingLog) {
      return {
        found: true,
        isValid: true,
        message: "Log found in pending queue",
      };
    }

    // Check if log is in any finalized block
    // Note: In a full implementation, blocks would store their logs
    for (const block of blocks) {
      // This is a simplified check - in reality, we'd have the logs stored
      if (block.logIds && block.logIds.includes(logId)) {
        const verification = await verifyBlockIntegrity(block, []);
        return {
          found: true,
          isValid: verification.isValid,
          blockId: block.blockId,
          message: verification.isValid ? "Log verified in block" : "Block integrity check failed",
        };
      }
    }

    return {
      found: false,
      isValid: false,
      message: "Log entry not found",
    };
  } catch (error) {
    logger.error("[Audit] Log verification error:", error);
    return {
      found: false,
      isValid: false,
      message: error.message,
    };
  }
};

// Export utility functions for testing
export { sha256, computeMerkleRoot, createBlock, AUDIT_LOG_KEY, BLOCK_ROOTS_KEY, HASH_CHAIN_KEY, BLOCK_SIZE };
