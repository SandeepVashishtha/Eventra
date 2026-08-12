package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

@Data
@Schema(description = "User preferences update request")
public class PreferencesUpdateRequest {

    @Schema(description = "Key/value preferences, e.g. { \"theme\": \"dark\" }")
    private Map<String, Object> preferences;
}
