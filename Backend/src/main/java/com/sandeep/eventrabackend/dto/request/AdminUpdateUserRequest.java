package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    @Size(min = 2, max = 50)
    private String firstName;

    @Size(min = 2, max = 50)
    private String lastName;

    @Size(min = 3, max = 50)
    private String username;

    @Email
    @Size(max = 100)
    private String email;

    private String role;
}
