package com.sandeep.eventrabackend.controller;

import org.springframework.stereotype.Component;

/**
 * Async Storage File Manager mapping uploads to static links (#16508).
 */
@Component
public class AsyncUploadManager {

    public String writeToStorage(String filename, byte[] bytes) {
        // Simulates saving attachments asynchronously to static cloud storage
        return "https://eventra-assets.io/files/" + filename;
    }
}
