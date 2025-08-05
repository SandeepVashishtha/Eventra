package com.eventra;

import com.eventra.entity.Role;
import com.eventra.entity.Permission;
import com.eventra.repository.RoleRepository;
import com.eventra.repository.PermissionRepository;
import com.eventra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StatusController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public String status() {
        return "hey i am up";
    }

    @GetMapping("/api/status/database")
    public Map<String, Object> getDatabaseStatus() {
        Map<String, Object> status = new HashMap<>();
        
        List<Role> roles = roleRepository.findAll();
        List<Permission> permissions = permissionRepository.findAll();
        long userCount = userRepository.count();
        
        status.put("roles", roles.stream().map(r -> r.getName().name()).toList());
        status.put("roleCount", roles.size());
        status.put("permissions", permissions.stream().map(p -> p.getName().name()).toList());
        status.put("permissionCount", permissions.size());
        status.put("userCount", userCount);
        status.put("status", "Database initialized");
        
        return status;
    }

    @GetMapping("/api/status/health")
    public Map<String, String> getHealth() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("message", "Application is running");
        return health;
    }
}

