package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.ZkpNullifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZkpNullifierRepository extends JpaRepository<ZkpNullifier, Long> {
}
