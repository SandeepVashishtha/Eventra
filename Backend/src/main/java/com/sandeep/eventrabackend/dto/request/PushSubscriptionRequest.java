package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class PushSubscriptionRequest {
    @NotBlank
    private String endpoint;
    private Map<String, String> keys;
}
