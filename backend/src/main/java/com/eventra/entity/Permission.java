package com.eventra.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private PermissionName name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum PermissionName {
        // Event Management Permissions
        CREATE_EVENT("Create new events"),
        EDIT_EVENT("Edit existing events"),
        DELETE_EVENT("Delete events"),
        VIEW_EVENT("View events"),
        MANAGE_EVENT_PARTICIPANTS("Manage event participants"),
        
        // User Management Permissions
        CREATE_USER("Create new users"),
        EDIT_USER("Edit user information"),
        DELETE_USER("Delete users"),
        VIEW_USER("View user information"),
        MANAGE_USER_ROLES("Manage user roles and permissions"),
        
        // Administrative Permissions
        ADMIN_DASHBOARD("Access admin dashboard"),
        SYSTEM_SETTINGS("Manage system settings"),
        VIEW_ANALYTICS("View system analytics"),
        EXPORT_DATA("Export system data"),
        
        // Content Management Permissions
        MANAGE_CONTENT("Manage website content"),
        MODERATE_CONTENT("Moderate user-generated content"),
        
        // General Permissions
        PARTICIPATE_EVENT("Participate in events"),
        CREATE_FEEDBACK("Create feedback and reviews");
        
        private final String description;
        
        PermissionName(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
