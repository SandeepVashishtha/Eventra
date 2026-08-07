package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.ChangePasswordRequest;
import com.sandeep.eventrabackend.dto.request.UpdateUserProfileRequest;
import com.sandeep.eventrabackend.dto.response.UserProfileResponse;
import com.sandeep.eventrabackend.exception.PasswordMismatchException;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // Uses authenticated email extracted from Spring Security JWT context
    // to identify and update the currently logged-in user
    @Transactional
    public UserProfileResponse updateProfile(
            String authenticatedEmail,
            UpdateUserProfileRequest request
    ) {

        // Fetch currently authenticated user from database
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Authenticated user not found"));

        // Update editable profile fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User updatedUser = userRepository.save(user);

        // Return updated user profile response
        return mapToProfileResponse(updatedUser);
    }

    @Transactional
    public void changePassword(String authenticatedEmail, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authenticatedEmail));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserProfileResponse mapToProfileResponse(User user) {

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .preferences(user.getPreferences())
                .build();
    }
}