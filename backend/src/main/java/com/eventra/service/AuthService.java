package com.eventra.service;

import com.eventra.dto.AuthResponse;
import com.eventra.dto.LoginRequest;
import com.eventra.dto.MessageResponse;
import com.eventra.dto.SignupRequest;
import com.eventra.entity.User;
import com.eventra.entity.Role;
import com.eventra.repository.UserRepository;
import com.eventra.repository.RoleRepository;
import com.eventra.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public MessageResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setEnabled(true);
        
        // Assign role based on selection
        Role.RoleName selectedRole;
        try {
            selectedRole = Role.RoleName.valueOf(signupRequest.getRole().toUpperCase());
            // Only allow ADMIN and USER roles for signup
            if (selectedRole != Role.RoleName.ADMIN && selectedRole != Role.RoleName.USER) {
                throw new RuntimeException("Invalid role selection. Only ADMIN and USER are allowed.");
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role selection. Only ADMIN and USER are allowed.");
        }
        
        Role role = roleRepository.findByName(selectedRole)
            .orElseThrow(() -> new RuntimeException("Selected role not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        userRepository.save(user);
        return new MessageResponse("User registered successfully!");
    }
    
    public MessageResponse createAdminUser(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(true);
        
        // Assign ADMIN role
        Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
            .orElseThrow(() -> new RuntimeException("Admin role not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        user.setRoles(roles);

        userRepository.save(user);
        return new MessageResponse("Admin user created successfully!");
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Extract roles and permissions
        Set<String> roles = user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(java.util.stream.Collectors.toSet());
            
        Set<String> permissions = user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map(permission -> permission.getName().name())
            .collect(java.util.stream.Collectors.toSet());

        return new AuthResponse(jwt, user.getEmail(), user.getFirstName(), user.getLastName(), 
                               user.getId(), roles, permissions);
    }
}
