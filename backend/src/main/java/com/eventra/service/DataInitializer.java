package com.eventra.service;

import com.eventra.entity.Permission;
import com.eventra.entity.Role;
import com.eventra.entity.User;
import com.eventra.repository.PermissionRepository;
import com.eventra.repository.RoleRepository;
import com.eventra.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class DataInitializer {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostConstruct
    public void initializeData() {
        try {
            System.out.println("Starting data initialization...");
            initializePermissions();
            System.out.println("Permissions initialized.");
            initializeRoles();
            System.out.println("Roles initialized.");
            initializeDefaultAdmin();
            System.out.println("Default admin initialized.");
        } catch (Exception e) {
            System.err.println("Error initializing data: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void initializePermissions() {
        Arrays.stream(Permission.PermissionName.values()).forEach(permissionName -> {
            if (!permissionRepository.existsByName(permissionName)) {
                Permission permission = new Permission();
                permission.setName(permissionName);
                permission.setDescription(permissionName.getDescription());
                permissionRepository.save(permission);
            }
        });
    }
    
    private void initializeRoles() {
        System.out.println("Initializing roles...");
        // First create all roles without permissions
        Arrays.stream(Role.RoleName.values()).forEach(roleName -> {
            System.out.println("Checking role: " + roleName);
            if (!roleRepository.existsByName(roleName)) {
                System.out.println("Creating role: " + roleName);
                Role role = new Role();
                role.setName(roleName);
                role.setDescription(roleName.getDescription());
                roleRepository.save(role);
                System.out.println("Role " + roleName + " saved successfully");
            } else {
                System.out.println("Role " + roleName + " already exists");
            }
        });
        
        // Then assign permissions to roles
        System.out.println("Assigning permissions to roles...");
        Arrays.stream(Role.RoleName.values()).forEach(roleName -> {
            Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            if (role.getPermissions().isEmpty()) {
                Set<Permission> permissions = getPermissionsForRole(roleName);
                System.out.println("Assigning " + permissions.size() + " permissions to role " + roleName);
                role.setPermissions(permissions);
                roleRepository.save(role);
                System.out.println("Permissions assigned to role " + roleName);
            }
        });
    }
    
    private Set<Permission> getPermissionsForRole(Role.RoleName roleName) {
        Set<Permission> permissions = new HashSet<>();
        switch (roleName) {
            case ADMIN:
                // Admin can create, manage, and add events
                addPermissions(permissions, 
                    Permission.PermissionName.CREATE_EVENT, 
                    Permission.PermissionName.EDIT_EVENT, 
                    Permission.PermissionName.DELETE_EVENT, 
                    Permission.PermissionName.VIEW_EVENT,
                    Permission.PermissionName.MANAGE_EVENT_PARTICIPANTS,
                    Permission.PermissionName.CREATE_USER,
                    Permission.PermissionName.EDIT_USER,
                    Permission.PermissionName.DELETE_USER,
                    Permission.PermissionName.VIEW_USER,
                    Permission.PermissionName.MANAGE_USER_ROLES,
                    Permission.PermissionName.ADMIN_DASHBOARD,
                    Permission.PermissionName.SYSTEM_SETTINGS,
                    Permission.PermissionName.VIEW_ANALYTICS,
                    Permission.PermissionName.EXPORT_DATA,
                    Permission.PermissionName.MANAGE_CONTENT,
                    Permission.PermissionName.MODERATE_CONTENT
                );
                break;
            case EVENT_MANAGER:
                // Keep EVENT_MANAGER for backward compatibility but don't assign during signup
                addPermissions(permissions, 
                    Permission.PermissionName.CREATE_EVENT, 
                    Permission.PermissionName.EDIT_EVENT, 
                    Permission.PermissionName.DELETE_EVENT, 
                    Permission.PermissionName.VIEW_EVENT,
                    Permission.PermissionName.MANAGE_EVENT_PARTICIPANTS
                );
                break;
            case USER:
                // User can only register to events
                addPermissions(permissions, 
                    Permission.PermissionName.VIEW_EVENT,
                    Permission.PermissionName.PARTICIPATE_EVENT, 
                    Permission.PermissionName.CREATE_FEEDBACK
                );
                break;
        }
        return permissions;
    }
    
    private void addPermissions(Set<Permission> permissions, Permission.PermissionName... permissionNames) {
        Arrays.stream(permissionNames).forEach(permissionName -> 
            permissions.add(permissionRepository.findByName(permissionName)
                .orElseThrow(() -> new RuntimeException("Permission not found: " + permissionName)))
        );
    }
    
    private void initializeDefaultAdmin() {
        // Create default admin user if none exists
        String adminEmail = "admin@eventra.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEnabled(true);
            
            Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);
            
            userRepository.save(admin);
            System.out.println("Default admin user created: " + adminEmail + " / admin123");
        }
    }
}
