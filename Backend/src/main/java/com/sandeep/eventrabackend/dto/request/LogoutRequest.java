package com.sandeep.eventrabackend.dto.request;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
