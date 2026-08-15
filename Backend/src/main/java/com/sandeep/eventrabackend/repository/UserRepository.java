package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmailOrUsername(String email, String username);

    // GDPR: users who have requested deletion but have not yet been anonymized.
    List<User> findByDeletionRequestedTrueAndAnonymizedFalse();

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsername(String username);

    boolean existsByUsernameIgnoreCase(String username);

    // ── Admin panel queries ────────────────────────────────────────────────

    /** Returns all users with a specific role, paginated. */
    Page<User> findByRole(Role role, Pageable pageable);

    @Query("""
            SELECT u FROM User u WHERE
            LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    @Query("""
            SELECT u FROM User u WHERE u.role = :role AND (
            LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            """)
    Page<User> searchUsersByRole(@Param("role") Role role, @Param("search") String search, Pageable pageable);

    /** Count users created after the given timestamp — used for growth stats. */
    long countByCreatedAtAfter(LocalDateTime date);

    /** Count users by role — used for admin dashboard breakdown. */
    long countByRole(Role role);

    /** Returns the number of newly created user accounts grouped by month. */
    @Query("""
        SELECT FUNCTION('FORMATDATETIME', u.createdAt, 'yyyy-MM') AS period,
               COUNT(u) AS userCount
        FROM User u
        WHERE u.createdAt >= :from
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findMonthlySignupTrend(@Param("from") LocalDateTime from);
}
