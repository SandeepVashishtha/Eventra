package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByRegistration_IdOrderByInstallmentNumberAsc(Long registrationId);

    List<Payment> findByRegistration_IdAndStatusOrderByInstallmentNumberAsc(Long registrationId, String status);

    Optional<Payment> findByRegistration_IdAndInstallmentNumber(Long registrationId, Integer installmentNumber);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByStripeCustomerIdOrderByCreatedAtDesc(String stripeCustomerId);

    List<Payment> findByRegistration_Event_Id(Long eventId);

    List<Payment> findByRegistration_User_Id(Long userId);

    @Query("SELECT p FROM Payment p WHERE p.registration.id = :registrationId AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByRegistrationId(@Param("registrationId") Long registrationId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.registration.id = :registrationId AND p.status = 'COMPLETED'")
    int countCompletedPaymentsByRegistrationId(@Param("registrationId") Long registrationId);

    @Query("SELECT p FROM Payment p WHERE p.registration.id = :registrationId AND p.dueDate IS NOT NULL AND p.status != 'COMPLETED' AND p.dueDate <= CURRENT_TIMESTAMP ORDER BY p.dueDate ASC")
    List<Payment> findOverduePaymentsByRegistrationId(@Param("registrationId") Long registrationId);

    @Query("SELECT p FROM Payment p WHERE p.registration.event.id = :eventId AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByEventId(@Param("eventId") Long eventId);

    void deleteByRegistration_Id(Long registrationId);

    void deleteByRegistration_User_Id(Long userId);

    void deleteByRegistration_Event_Id(Long eventId);
}
