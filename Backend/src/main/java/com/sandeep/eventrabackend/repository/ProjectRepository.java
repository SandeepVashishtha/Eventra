package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Modifying
    @Query("UPDATE Project p SET p.upvotes = p.upvotes + 1 WHERE p.id = :id")
    int incrementUpvotes(@Param("id") Long id);
}
