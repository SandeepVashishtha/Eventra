package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.ProjectUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectUpvoteRepository extends JpaRepository<ProjectUpvote, Long> {
    boolean existsByProject_IdAndUser_Id(Long projectId, Long userId);

    void deleteByUser_Id(Long userId);
}
