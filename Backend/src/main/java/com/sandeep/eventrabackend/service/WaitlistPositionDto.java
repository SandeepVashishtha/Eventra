package com.sandeep.eventrabackend.service;

public class WaitlistPositionDto {
    private final String userId;
    private final int position;
    private final String status;

    public WaitlistPositionDto(String userId, int position, String status) {
        this.userId = userId;
        this.position = position;
        this.status = status;
    }

    public String getUserId() {
        return userId;
    }

    public int getPosition() {
        return position;
    }

    public String getStatus() {
        return status;
    }
}
