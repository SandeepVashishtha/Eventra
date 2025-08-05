package com.eventra.repository;

import com.eventra.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByName(Permission.PermissionName name);
    boolean existsByName(Permission.PermissionName name);
}
