package com.eventra.service;

import com.eventra.entity.Permission;
import com.eventra.entity.Role;
import com.eventra.entity.User;
import com.eventra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorizationService {
    
    private final UserRepository userRepository;
    
    public boolean hasPermission(String permissionName) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        try {
            Permission.PermissionName permission = Permission.PermissionName.valueOf(permissionName);
            return currentUser.hasPermission(permission);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    public boolean hasRole(String roleName) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        try {
            Role.RoleName role = Role.RoleName.valueOf(roleName);
            return currentUser.hasRole(role);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    public boolean hasAnyRole(String... roleNames) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        for (String roleName : roleNames) {
            try {
                Role.RoleName role = Role.RoleName.valueOf(roleName);
                if (currentUser.hasRole(role)) {
                    return true;
                }
            } catch (IllegalArgumentException e) {
                // Continue checking other roles
            }
        }
        return false;
    }
    
    public boolean isOwnerOrAdmin(Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }
        
        return currentUser.getId().equals(userId) || currentUser.hasRole(Role.RoleName.ADMIN);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}
