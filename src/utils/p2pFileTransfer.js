/**
 * src/utils/p2pFileTransfer.js
 *
 * A high-fidelity WebRTC Peer-to-Peer (P2P) mesh transfer coordinator.
 * Features:
 *  1. Dynamic chunk-based file caching inside browser IndexedDB.
 *  2. Real WebRTC DataChannel connection establishing over a BroadcastChannel signaling layer.
 *  3. Cross-tab real-time mesh transfer coordination with zero external signaling servers.
 *  4. High-fidelity server download simulation with chunk caching.
 */

// --- IndexedDB Cache Configuration ---
import { logger } from "./logger.js";
const DB_NAME = "eventra_p2p_cache";
const DB_VERSION = 2;
const STORE_NAME = "file_chunks";

let dbInstance = null;

// Initialize IndexedDB
const getDB = () => {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment"));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "chunkId" });
      } else {
        store = e.target.transaction.objectStore(STORE_NAME);
      }
      if (!store.indexNames.contains("fileId")) {
        store.createIndex("fileId", "fileId", { unique: false });
      }
    };
    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    request.onerror = (e) => {
      logger.error("IndexedDB initialization error:", e);
      reject(e);
    };
  });
};

// Helper to attach error/abort handlers to an IndexedDB transaction and request
const attachIdbReadHandlers = (transaction, request, resolve, fallbackValue, functionName) => {
  transaction.onerror = (err) => {
    logger.error(`${functionName} transaction error:`, err);
    resolve(fallbackValue);
  };
  transaction.onabort = (err) => {
    logger.error(`${functionName} transaction aborted:`, err);
    resolve(fallbackValue);
  };
  request.onerror = (err) => {
    logger.error(`${functionName} request error:`, err);
    resolve(fallbackValue);
  };
};

// Check if all chunks for a file exist in IndexedDB
export async function isFileCached(fileId) {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("fileId");

      const countRequest = index.count(IDBKeyRange.only(fileId));
      const getRequest = index.get(IDBKeyRange.only(fileId));

      let count = 0;
      let firstChunk = null;
      let completedCount = 0;

      const checkCompletion = () => {
        completedCount++;
        if (completedCount === 2) {
          if (firstChunk && count > 0 && count === firstChunk.totalChunks) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      };

      transaction.onerror = (err) => {
        logger.error("isFileCached transaction error:", err);
        resolve(false);
      };
      transaction.onabort = (err) => {
        logger.error("isFileCached transaction aborted:", err);
        resolve(false);
      };

      countRequest.onsuccess = (e) => {
        count = e.target.result;
        checkCompletion();
      };
      countRequest.onerror = (err) => {
        logger.error("isFileCached count request error:", err);
        resolve(false);
      };

      getRequest.onsuccess = (e) => {
        firstChunk = e.target.result;
        checkCompletion();
      };
      getRequest.onerror = (err) => {
        logger.error("isFileCached get request error:", err);
        resolve(false);
      };
    });
  } catch (error) {
    logger.error("Failed checking file cache:", error);
    return false;
  }
}

// Retrieve cached file chunks
export async function getCachedFile(fileId) {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("fileId");

      const request = index.getAll(IDBKeyRange.only(fileId));

      transaction.onerror = (err) => {
        logger.error("getCachedFile transaction error:", err);
        resolve(null);
      };
      transaction.onabort = (err) => {
        logger.error("getCachedFile transaction aborted:", err);
        resolve(null);
      };
      request.onerror = (err) => {
        logger.error("getCachedFile request error:", err);
        resolve(null);
      };

      request.onsuccess = (e) => {
        const chunks = e.target.result || [];
        if (chunks.length > 0) {
          // Sort chunks by index
          chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
          resolve(chunks);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    logger.error("Failed retrieving cached file chunks:", error);
    return null;
  }
}

// Save a chunk to IndexedDB
export async function saveChunkToCache(fileId, fileName, chunkIndex, totalChunks, dataStr) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const chunkId = `${fileId}_${chunkIndex}`;

      const record = {
        chunkId,
        fileId,
        fileName,
        chunkIndex,
        totalChunks,
        data: dataStr,
        timestamp: Date.now(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e);
    });
  } catch (error) {
    logger.error("Failed saving chunk:", error);
    return false;
  }
}

// Mock large file generation and split into chunks to populate cache initially
export async function simulateServerDownload(fileId, fileName, onProgress) {
  // Simulate server latency
  const steps = 10;
  const totalChunks = 5;
  const dummyChunkData = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 250)); // Simulating transfer speed
    if (onProgress) onProgress(Math.round((i / steps) * 100));
  }

  // Once fully downloaded from "server", split and write to IndexedDB cache
  for (let c = 0; c < totalChunks; c++) {
    const chunkStr = Array(1000).fill(dummyChunkData).join("") + `[CHUNK_${c}]`;
    await saveChunkToCache(fileId, fileName, c, totalChunks, chunkStr);
  }

  return true;
}

// Generate unique identifier for signaling peers
const peerId = `peer_${Math.random().toString(36).substring(2, 7)}`;
let signalingChannel = null;

const isBrowser = typeof window !== "undefined";
const webrtcAvailable =
  isBrowser &&
  typeof RTCPeerConnection !== "undefined" &&
  typeof RTCSessionDescription !== "undefined" &&
  typeof RTCIceCandidate !== "undefined";

// Establish P2P Broadcast Channel for multi-tab signaling
const getSignalingChannel = () => {
  if (!signalingChannel && isBrowser) {
    signalingChannel = new BroadcastChannel("eventra_p2p_mesh");
  }
  return signalingChannel;
};

/**
 * Peer-to-Peer file coordinator utilizing real WebRTC DataChannel
 * and RTCPeerConnection established dynamically between browser tabs.
 */
export class P2PFileTransferCoordinator {
  constructor(fileId, fileName, onStateChange, expectedTotalChunks = null) {
    this.fileId = fileId;
    this.fileName = fileName;
    this.onStateChange = onStateChange;
    this.expectedTotalChunks = expectedTotalChunks;
    this.pc = null;
    this.channel = null;
    this.receivedChunks = [];
    this.bc = getSignalingChannel();
    this.isInitiator = false;
    this.onMessageListener = null;
    this.currentState = null;
    this.queuedRemoteCandidates = [];
  }

  updateState(state, progress = 0, speed = "-", peer = null, count = 1) {
    this.currentState = state;
    if (this.onStateChange) {
      this.onStateChange({
        state, // 'searching', 'connecting', 'transferring', 'completed', 'failed'
        progress,
        speed,
        peer,
        count,
      });
    }
  }

  // Set up listeners for the Signaling Channel (BroadcastChannel)
  setupSignaling() {
    this.onMessageListener = async (e) => {
      const msg = e.data;
      if (msg.fileId !== this.fileId) return;

      // Avoid listening to own broadcasts
      if (msg.from === peerId) return;

      switch (msg.type) {
        case "P2P_QUERY":
          // Another peer is looking for a file. Do we have it cached?
          const cached = await isFileCached(this.fileId);
          if (cached) {
            this.bc.postMessage({
              type: "P2P_AVAILABLE",
              fileId: this.fileId,
              from: peerId,
              to: msg.from,
            });
          }
          break;

        case "P2P_AVAILABLE":
          // Found a peer who has the file! Connect.
          if (msg.to === peerId && !this.pc) {
            this.connectToPeer(msg.from);
          }
          break;

        case "P2P_OFFER":
          // Received connection offer from initiator peer
          if (msg.to === peerId) {
            await this.handleOffer(msg.offer, msg.from);
          }
          break;

        case "P2P_ANSWER":
          // Received connection answer
          if (msg.to === peerId) {
            await this.handleAnswer(msg.answer);
          }
          break;

        case "P2P_ICE":
          // Received ICE candidate
          if (msg.to === peerId && this.pc) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (err) {
              logger.error("Error adding ICE candidate:", err);
            }
          }
          break;

        default:
          break;
      }
    };

    if (this.bc) {
      this.bc.addEventListener("message", this.onMessageListener);
    }
  }

  // Initiate search for peers holding the file
  async startP2PSearch() {
    this.setupSignaling();
    this.updateState("searching", 0, "-", null, 0);

    if (!webrtcAvailable) {
      this.updateState("failed");
      return false;
    }

    // Broadcast file request to other tabs
    this.bc.postMessage({
      type: "P2P_QUERY",
      fileId: this.fileId,
      from: peerId,
    });

    // We wait 2.5 seconds to discover nearby peers. If none answer, we fail and trigger fallback.
    return new Promise((resolve) => {
      const searchTimeout = setTimeout(() => {
        if (!this.pc || this.currentState === "searching") {
          this.cleanup();
          resolve(false); // No peers found, trigger server fallback
        }
      }, 2500);

      let checkInterval;

      // Add a secondary connection safety timer of 5 seconds total
      const connectionSafetyTimeout = setTimeout(() => {
        if (this.currentState === "connecting" || this.currentState === "searching") {
          this.cleanup();
          clearInterval(checkInterval);
          resolve(false); // WebRTC connection handshakes timed out, fallback to server
        } else if (this.currentState === "completed" || this.currentState === "transferring") {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 5000);

      // Attach state listener check to resolve immediately if completed
      checkInterval = setInterval(() => {
        if (this.currentState === "completed") {
          clearTimeout(searchTimeout);
          clearTimeout(connectionSafetyTimeout);
          clearInterval(checkInterval);
          resolve(true);
        } else if (this.currentState === "failed") {
          clearTimeout(searchTimeout);
          clearTimeout(connectionSafetyTimeout);
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 200);
    });
  }

  // Initiator builds connection offer to target peer
  async connectToPeer(targetPeerId) {
    if (!webrtcAvailable) {
      this.updateState("failed");
      return;
    }
    this.isInitiator = true;
    this.updateState("connecting", 0, "-", targetPeerId, 1);

    this.pc = new RTCPeerConnection();
    this.queuedRemoteCandidates = [];

    // Create data channel
    this.channel = this.pc.createDataChannel("file-transfer");
    this.setupDataChannel();

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.bc.postMessage({
          type: "P2P_ICE",
          fileId: this.fileId,
          from: peerId,
          to: targetPeerId,
          candidate: e.candidate,
        });
      }
    };

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.bc.postMessage({
      type: "P2P_OFFER",
      fileId: this.fileId,
      from: peerId,
      to: targetPeerId,
      offer: offer,
    });
  }

  // Target peer receives connection offer and replies with answer
  async handleOffer(offer, senderId) {
    if (!webrtcAvailable) {
      this.updateState("failed");
      return;
    }
    this.isInitiator = false;
    this.updateState("connecting", 0, "-", senderId, 1);

    this.pc = new RTCPeerConnection();
    this.queuedRemoteCandidates = [];

    this.pc.ondatachannel = (e) => {
      this.channel = e.channel;
      this.setupDataChannel();
    };

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.bc.postMessage({
          type: "P2P_ICE",
          fileId: this.fileId,
          from: peerId,
          to: senderId,
          candidate: e.candidate,
        });
      }
    };

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    await this.processQueuedCandidates();
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.bc.postMessage({
      type: "P2P_ANSWER",
      fileId: this.fileId,
      from: peerId,
      to: senderId,
      answer: answer,
    });
  }

  // Initiator sets target's answer description
  async handleAnswer(answer) {
    if (this.pc) {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this.processQueuedCandidates();
    }
  }

  // Process any ICE candidates that were queued before the remote description was applied
  async processQueuedCandidates() {
    if (!this.pc || !this.pc.remoteDescription) return;
    while (this.queuedRemoteCandidates.length > 0) {
      const candidate = this.queuedRemoteCandidates.shift();
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    }
  }

  async sendChunks(fileChunks) {
    const total = fileChunks.length;
    const channel = this.channel;
    if (!channel) return;

    // Monitor bufferedAmount and pause sending when the buffer is congested
    channel.bufferedAmountLowThreshold = 65536; // 64 KB

    for (let index = 0; index < total; index++) {
      if (channel.readyState !== "open") {
        break;
      }

      // Check if browser DataChannel buffer is congested
      if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
        // Await the drain event asynchronously without blocking the main thread or creating runaway timers
        await new Promise((resolve) => {
          channel.onbufferedamountlow = () => {
            channel.onbufferedamountlow = null;
            resolve();
          };
        });
      }

      if (channel.readyState !== "open") {
        break;
      }

      const chunk = fileChunks[index];
      channel.send(
        JSON.stringify({
          chunkIndex: chunk.chunkIndex,
          totalChunks: total,
          data: chunk.data,
        })
      );
    }
  }

  // Setup WebRTC DataChannel handlers for transferring chunks
  setupDataChannel() {
    if (!this.channel) return;

    this.channel.onopen = async () => {
      this.updateState("transferring", 0, "15.4 MB/s");

      // If we already have the file cached, we act as the sender!
      if (!this.isInitiator) {
        const fileChunks = await getCachedFile(this.fileId);
        if (fileChunks) {
          this.sendChunks(fileChunks);
        }
      }
    };
    this.channel.onmessage = async (e) => {
      let chunkMsg;
      try {
        chunkMsg = JSON.parse(e.data);
      } catch (err) {
        logger.error("Failed to parse incoming P2P message:", err);
        return;
      }

      // ── SECURITY FIX: Validate totalChunks against trusted server value ──
      // If expectedTotalChunks was set from a trusted source, reject any
      // peer message that claims a different totalChunks value.
      if (this.expectedTotalChunks !== null) {
        if (
          typeof chunkMsg.totalChunks !== "number" ||
          chunkMsg.totalChunks !== this.expectedTotalChunks
        ) {
          logger.error(
            `[P2P Security] Chunk count mismatch! Expected ${this.expectedTotalChunks}, ` +
              `peer claims ${chunkMsg.totalChunks}. Dropping chunk and aborting transfer.`
          );
          this.updateState("failed");
          this.cleanup();
          return;
        }
      }

      // Validate chunkIndex is within expected bounds
      const maxChunks = this.expectedTotalChunks ?? chunkMsg.totalChunks;
      if (
        typeof chunkMsg.chunkIndex !== "number" ||
        chunkMsg.chunkIndex < 0 ||
        chunkMsg.chunkIndex >= maxChunks
      ) {
        logger.error(
          `[P2P Security] Invalid chunkIndex ${chunkMsg.chunkIndex} for totalChunks ${maxChunks}. Dropping.`
        );
        return;
      }

      // Reject duplicate chunk indices
      const alreadyReceived = this.receivedChunks.some((c) => c.chunkIndex === chunkMsg.chunkIndex);
      if (alreadyReceived) {
        logger.warn(`[P2P Security] Duplicate chunk ${chunkMsg.chunkIndex} received. Dropping.`);
        return;
      }

      this.receivedChunks.push(chunkMsg);

      const progress = Math.round((this.receivedChunks.length / maxChunks) * 100);
      this.updateState("transferring", progress, "18.2 MB/s");

      // Once all chunks are transferred successfully
      if (this.receivedChunks.length === maxChunks) {
        this.receivedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

        // Cache chunks to IndexedDB so this tab can now seed the file
        for (const c of this.receivedChunks) {
          await saveChunkToCache(this.fileId, this.fileName, c.chunkIndex, maxChunks, c.data);
        }

        this.updateState("completed", 100, "Finished");
        this.cleanup();
      }
    };

    this.channel.onerror = (err) => {
      logger.error("DataChannel error:", err);
      this.updateState("failed");
      this.cleanup();
    };

    this.channel.onclose = () => {
      if (this.currentState !== "completed") {
        this.updateState("failed");
      }
      this.cleanup();
    };
  }

  // Cleanup connections and event listeners
  cleanup() {
    if (this.bc && this.onMessageListener) {
      this.bc.removeEventListener("message", this.onMessageListener);
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}
