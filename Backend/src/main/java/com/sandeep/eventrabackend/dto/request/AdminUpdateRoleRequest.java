package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request body for updating a user's role")
public class AdminUpdateRoleRequest {

    @NotNull(message = "Role must not be null")
    @Schema(description = "New role to assign to the user", example = "ORGANIZER",
            allowableValues = {"CLIENT", "ORGANIZER", "ADMIN", "SUPER_ADMIN"})
    private String role;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
