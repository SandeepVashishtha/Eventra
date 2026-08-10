package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReauthRequest {
    @NotBlank
    private String password;
}
