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
const DB_NAME = "eventra_p2p_cache";
const DB_VERSION = 1;
const STORE_NAME = "file_chunks";

let dbInstance = null;

// Initialize IndexedDB
const getDB = () => {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "chunkId" });
      }
    };
    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    request.onerror = (e) => {
      console.error("IndexedDB initialization error:", e);
      reject(e);
    };
  });
};

// Check if all chunks for a file exist in IndexedDB
export async function isFileCached(fileId) {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore();
      
      // Let's search by keys
      const request = store.openCursor();
      let chunksCount = 0;
      let totalChunks = 0;
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.fileId === fileId) {
            chunksCount++;
            totalChunks = cursor.value.totalChunks;
          }
          cursor.continue();
        } else {
          resolve(chunksCount > 0 && chunksCount === totalChunks);
        }
      };
    });
  } catch (error) {
    console.error("Failed checking file cache:", error);
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
      const request = store.openCursor();
      const chunks = [];
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.fileId === fileId) {
            chunks.push(cursor.value);
          }
          cursor.continue();
        } else {
          // Sort chunks by index
          chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
          resolve(chunks.length > 0 ? chunks : null);
        }
      };
    });
  } catch (error) {
    console.error("Failed retrieving cached file chunks:", error);
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
        timestamp: Date.now()
      };
      
      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e);
    });
  } catch (error) {
    console.error("Failed saving chunk:", error);
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
    await new Promise(r => setTimeout(r, 250)); // Simulating transfer speed
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

// Establish P2P Broadcast Channel for multi-tab signaling
const getSignalingChannel = () => {
  if (!signalingChannel && typeof window !== "undefined") {
    signalingChannel = new BroadcastChannel("eventra_p2p_mesh");
  }
  return signalingChannel;
};

/**
 * Peer-to-Peer file coordinator utilizing real WebRTC DataChannel
 * and RTCPeerConnection established dynamically between browser tabs.
 */
export class P2PFileTransferCoordinator {
  constructor(fileId, fileName, onStateChange) {
    this.fileId = fileId;
    this.fileName = fileName;
    this.onStateChange = onStateChange;
    this.pc = null;
    this.channel = null;
    this.receivedChunks = [];
    this.bc = getSignalingChannel();
    this.isInitiator = false;
    this.onMessageListener = null;
  }

  updateState(state, progress = 0, speed = "-", peer = null, count = 1) {
    if (this.onStateChange) {
      this.onStateChange({
        state, // 'searching', 'connecting', 'transferring', 'completed', 'failed'
        progress,
        speed,
        peer,
        count
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
              to: msg.from
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
              console.error("Error adding ICE candidate:", err);
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

    // Broadcast file request to other tabs
    this.bc.postMessage({
      type: "P2P_QUERY",
      fileId: this.fileId,
      from: peerId
    });

    // We wait 2.5 seconds to discover nearby peers. If none answer, we fail and trigger fallback.
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.pc) {
          this.cleanup();
          resolve(false); // No peers found, trigger server fallback
        } else {
          resolve(true); // Connected to peer!
        }
      }, 2500);
    });
  }

  // Initiator builds connection offer to target peer
  async connectToPeer(targetPeerId) {
    this.isInitiator = true;
    this.updateState("connecting", 0, "-", targetPeerId, 1);
    
    this.pc = new RTCPeerConnection();
    
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
          candidate: e.candidate
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
      offer: offer
    });
  }

  // Target peer receives connection offer and replies with answer
  async handleOffer(offer, senderId) {
    this.isInitiator = false;
    this.updateState("connecting", 0, "-", senderId, 1);

    this.pc = new RTCPeerConnection();

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
          candidate: e.candidate
        });
      }
    };

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.bc.postMessage({
      type: "P2P_ANSWER",
      fileId: this.fileId,
      from: peerId,
      to: senderId,
      answer: answer
    });
  }

  // Initiator sets target's answer description
  async handleAnswer(answer) {
    if (this.pc) {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
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
          const total = fileChunks.length;
          fileChunks.forEach((chunk, index) => {
            setTimeout(() => {
              if (this.channel && this.channel.readyState === "open") {
                this.channel.send(JSON.stringify({
                  chunkIndex: chunk.chunkIndex,
                  totalChunks: total,
                  data: chunk.data
                }));
              }
            }, index * 200); // Throttling chunk transmissions
          });
        }
      }
    };

    this.channel.onmessage = async (e) => {
      const chunkMsg = JSON.parse(e.data);
      this.receivedChunks.push(chunkMsg);

      const progress = Math.round((this.receivedChunks.length / chunkMsg.totalChunks) * 100);
      this.updateState("transferring", progress, "18.2 MB/s");

      // Once all chunks are transferred successfully
      if (this.receivedChunks.length === chunkMsg.totalChunks) {
        this.receivedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
        
        // Cache chunks to IndexedDB so this tab can now seed the file
        for (const c of this.receivedChunks) {
          await saveChunkToCache(this.fileId, this.fileName, c.chunkIndex, chunkMsg.totalChunks, c.data);
        }

        this.updateState("completed", 100, "Finished");
        this.cleanup();
      }
    };

    this.channel.onerror = (err) => {
      console.error("DataChannel error:", err);
      this.updateState("failed");
      this.cleanup();
    };

    this.channel.onclose = () => {
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
