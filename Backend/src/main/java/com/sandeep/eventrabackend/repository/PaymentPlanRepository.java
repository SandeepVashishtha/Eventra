package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.PaymentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentPlanRepository extends JpaRepository<PaymentPlan, Long> {

    Optional<PaymentPlan> findByRegistration_Id(Long registrationId);

    List<PaymentPlan> findByRegistration_Event_Id(Long eventId);

    List<PaymentPlan> findByRegistration_User_Id(Long userId);

    List<PaymentPlan> findByStripeCustomerId(String stripeCustomerId);

    Optional<PaymentPlan> findByStripeSetupIntentId(String stripeSetupIntentId);

    @Query("SELECT pp FROM PaymentPlan pp WHERE pp.registration.event.id = :eventId AND pp.status = 'ACTIVE'")
    List<PaymentPlan> findActivePaymentPlansByEventId(@Param("eventId") Long eventId);

    @Query("SELECT pp FROM PaymentPlan pp WHERE pp.registration.event.id = :eventId AND pp.status = 'COMPLETED'")
    List<PaymentPlan> findCompletedPaymentPlansByEventId(@Param("eventId") Long eventId);

    @Query("SELECT pp FROM PaymentPlan pp WHERE pp.registration.id = :registrationId AND pp.status = 'ACTIVE'")
    Optional<PaymentPlan> findActivePaymentPlanByRegistrationId(@Param("registrationId") Long registrationId);

    @Query("SELECT COUNT(pp) FROM PaymentPlan pp WHERE pp.registration.event.id = :eventId AND pp.status = 'COMPLETED'")
    int countCompletedPaymentPlansByEventId(@Param("eventId") Long eventId);

    void deleteByRegistration_Id(Long registrationId);

    void deleteByRegistration_User_Id(Long userId);

    void deleteByRegistration_Event_Id(Long eventId);
}
