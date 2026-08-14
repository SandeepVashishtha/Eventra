package com.eventra.repository;

import com.eventra.model.TeamInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamInviteRepository extends JpaRepository<TeamInvite, Long> {
}
