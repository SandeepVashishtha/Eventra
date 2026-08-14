package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;

@Service
public class AudioTranscoderBridge {

    public byte[] transcodeToAudioOnly(byte[] webrtcPayload) {
        // Strip out high definition video frames and compress remaining audio packets
        // Mock transcoding stream return
        if (webrtcPayload == null) return new byte[0];
        return ArraysCopy(webrtcPayload, webrtcPayload.length / 4);
    }

    private byte[] ArraysCopy(byte[] src, int newLength) {
        byte[] dest = new byte[newLength];
        System.arraycopy(src, 0, dest, 0, Math.min(src.length, newLength));
        return dest;
    }
}
