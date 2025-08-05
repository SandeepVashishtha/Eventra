package com.eventra.service;

import com.eventra.entity.Permission;
import com.eventra.entity.Role;
import com.eventra.repository.PermissionRepository;
import com.eventra.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import jakarta.transaction.Transactional;

//@Service // Temporarily disabled
@RequiredArgsConstructor
public class DataInitializer {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    @PostConstruct
    @Transactional
    public void initializeData() {
        initializePermissions();
        initializeRoles();
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
        Arrays.stream(Role.RoleName.values()).forEach(roleName -> {
            if (!roleRepository.existsByName(roleName)) {
                Role role = new Role();
                role.setName(roleName);
                role.setDescription(roleName.getDescription());
                role.setPermissions(getPermissionsForRole(roleName));
                roleRepository.save(role);
            }
        });
    }
    
    private Set<Permission> getPermissionsForRole(Role.RoleName roleName) {
        Set<Permission> permissions = new HashSet<>();
        switch (roleName) {
            case ADMIN:
                Arrays.stream(Permission.PermissionName.values()).forEach(permissionName -> 
                    permissions.add(permissionRepository.findByName(permissionName)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + permissionName)))
                );
                break;
            case EVENT_MANAGER:
                addPermissions(permissions, 
                    Permission.PermissionName.CREATE_EVENT, 
                    Permission.PermissionName.EDIT_EVENT, 
                    Permission.PermissionName.DELETE_EVENT, 
                    Permission.PermissionName.VIEW_EVENT,
                    Permission.PermissionName.MANAGE_EVENT_PARTICIPANTS
                );
                break;
            case USER:
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
}
