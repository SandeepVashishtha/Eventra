package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.HackathonRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HackathonRegistrationRepository extends JpaRepository<HackathonRegistration, Long> {

    boolean existsByHackathon_IdAndUser_Email(Long hackathonId, String userEmail);

    void deleteByHackathonId(Long hackathonId);
}
