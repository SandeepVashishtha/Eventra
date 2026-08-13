package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Thread-safe multi-file chunk upload sequence assembler service (#16617).
 */
@Service
public class ChunkUploadService {

    private final Map<String, List<byte[]>> chunkBuffers = new ConcurrentHashMap<>();
    private final Map<String, ReentrantLock> fileLocks = new ConcurrentHashMap<>();

    public boolean uploadChunk(String fileId, int chunkIndex, int totalChunks, byte[] chunkData) {
        ReentrantLock lock = fileLocks.computeIfAbsent(fileId, k -> new ReentrantLock());
        lock.lock();
        
        try {
            chunkBuffers.putIfAbsent(fileId, new ArrayList<>(Collections.nCopies(totalChunks, null)));
            List<byte[]> list = chunkBuffers.get(fileId);

            if (chunkIndex >= 0 && chunkIndex < totalChunks) {
                list.set(chunkIndex, chunkData);
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }

    public boolean isComplete(String fileId) {
        List<byte[]> list = chunkBuffers.get(fileId);
        if (list == null) return false;
        return !list.contains(null);
    }

    public void clearFile(String fileId) {
        chunkBuffers.remove(fileId);
        fileLocks.remove(fileId);
    }
}
