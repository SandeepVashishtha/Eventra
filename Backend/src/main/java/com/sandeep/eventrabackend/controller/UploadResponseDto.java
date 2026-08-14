package com.sandeep.eventrabackend.controller;

public class UploadResponseDto {
    private final boolean success;
    private final String message;
    private final String url;

    public UploadResponseDto(boolean success, String message, String url) {
        this.success = success;
        this.message = message;
        this.url = url;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getUrl() {
        return url;
    }
}
