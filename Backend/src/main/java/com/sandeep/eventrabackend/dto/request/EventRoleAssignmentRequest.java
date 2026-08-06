package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EventRoleAssignmentRequest {

    @NotBlank(message = "User email is required")
    @Email(message = "User email must be valid")
    private String userEmail;

    @NotBlank(message = "Role is required")
    private String role;

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
