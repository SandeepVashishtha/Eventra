package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.EventTeamMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventTeamMemberRepository extends JpaRepository<EventTeamMember, Long> {
    Optional<EventTeamMember> findByEvent_IdAndUser_Id(Long eventId, Long userId);

    Optional<EventTeamMember> findByEvent_IdAndRole(Long eventId, EventRole role);

    List<EventTeamMember> findByEvent_IdOrderByRoleDescAssignedAtDesc(Long eventId);

    void deleteByEvent_Id(Long eventId);

    void deleteByUser_Id(Long userId);

    @Modifying
    @Query("UPDATE EventTeamMember etm SET etm.assignedBy = NULL WHERE etm.assignedBy.id = :userId")
    void clearAssignedByUserId(@Param("userId") Long userId);
}
