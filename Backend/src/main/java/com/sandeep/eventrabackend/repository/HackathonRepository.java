package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Hackathon;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HackathonRepository extends JpaRepository<Hackathon, Long> {

    Optional<Hackathon> findByIdAndIsDeletedFalse(Long id);

    Page<Hackathon> findByIsDeletedFalse(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Hackathon h WHERE h.id = :id AND h.isDeleted = false")
    Optional<Hackathon> findByIdWithLock(@Param("id") Long id);

    @EntityGraph(attributePaths = {"tracks", "teams", "teams.members"})
    @Query("SELECT h FROM Hackathon h WHERE h.id = :id")
    Optional<Object> findByIdWithTracksAndTeams(Long id);

    @EntityGraph(attributePaths = {"tracks", "teams"})
    @Query("SELECT DISTINCT h FROM Hackathon h")
    List<Object> findAllWithTracksAndTeams();
}
