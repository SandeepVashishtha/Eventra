package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmailOrUsername(String email, String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    // ── Admin panel queries ────────────────────────────────────────────────

    /** Returns all users with a specific role, paginated. */
    Page<User> findByRole(Role role, Pageable pageable);

    /** Count users created after the given timestamp — used for growth stats. */
    long countByCreatedAtAfter(LocalDateTime date);

    /** Count users by role — used for admin dashboard breakdown. */
    long countByRole(Role role);
}
