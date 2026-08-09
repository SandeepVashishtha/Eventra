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
        // Emails and usernames are always persisted in lowercase, so normalize the
        // lookup input the same way signup does to match mixed-case logins.
        String identifier = usernameOrEmail.toLowerCase();
        User user = userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with username or email: " + identifier));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())   // use email as principal
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority(user.getRole().name())))
                .build();
    }
}
