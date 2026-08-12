package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.ZkpFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZkpFeedbackRepository extends JpaRepository<ZkpFeedback, Long> {
}