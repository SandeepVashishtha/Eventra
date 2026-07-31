package com.sandeep.eventrabackend.security;

import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByEmailOrUsername(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with username or email: " + usernameOrEmail));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())   // use email as principal
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority(user.getRole().name())))
                .build();
    }
}
