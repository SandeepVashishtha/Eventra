package com.sandeep.eventrabackend.controller;

public class SubtitleChannel {
    private final String channelId;
    private final int viewerCount;

    public SubtitleChannel(String channelId, int viewerCount) {
        this.channelId = channelId;
        this.viewerCount = viewerCount;
    }

    public String getChannelId() {
        return channelId;
    }

    public int getViewerCount() {
        return viewerCount;
    }
}
