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
        
        // Assign default USER role - temporarily disabled
        // Role userRole = roleRepository.findByName(Role.RoleName.USER)
        //     .orElseThrow(() -> new RuntimeException("Default role not found"));
        // Set<Role> roles = new HashSet<>();
        // roles.add(userRole);
        // user.setRoles(roles);

        userRepository.save(user);
        return new MessageResponse("User registered successfully!");
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

        // Extract roles and permissions - temporarily return empty sets
        Set<String> roles = new HashSet<>(); // user.getRoles().stream()
            // .map(role -> role.getName().name())
            // .collect(java.util.stream.Collectors.toSet());
            
        Set<String> permissions = new HashSet<>(); // user.getRoles().stream()
            // .flatMap(role -> role.getPermissions().stream())
            // .map(permission -> permission.getName().name())
            // .collect(java.util.stream.Collectors.toSet());

        return new AuthResponse(jwt, user.getEmail(), user.getFirstName(), user.getLastName(), 
                               user.getId(), roles, permissions);
    }
}
