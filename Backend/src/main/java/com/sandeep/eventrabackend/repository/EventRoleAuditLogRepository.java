package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRoleAuditLog;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRoleAuditLogRepository extends JpaRepository<EventRoleAuditLog, Long> {
    List<EventRoleAuditLog> findByEventIdOrderByChangedAtDesc(Long eventId);

    Page<EventRoleAuditLog> findByEventIdOrderByChangedAtDesc(Long eventId, Pageable pageable);

    void deleteByEventId(Long eventId);
}
