package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistrationAnalyticsRepository
        extends JpaRepository<EventRegistration, Long> {

    // ── Trends — note: field is registeredAt, NOT createdAt ──────────────────

    @Query("""
        SELECT FUNCTION('DATE_FORMAT', r.registeredAt, '%Y-%m') AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findMonthlyTrend(@Param("from") LocalDateTime from);

    @Query("""
        SELECT FUNCTION('YEARWEEK', r.registeredAt, 1) AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findWeeklyTrend(@Param("from") LocalDateTime from);

    @Query("""
        SELECT CAST(r.registeredAt AS date) AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findDailyTrend(@Param("from") LocalDateTime from);

    // ── Peak registration periods ─────────────────────────────────────────────
    @Query("""
        SELECT FUNCTION('DAYOFWEEK', r.registeredAt) AS dow,
               FUNCTION('HOUR', r.registeredAt)      AS hr,
               COUNT(r)                              AS cnt
        FROM EventRegistration r
        WHERE r.status = 'CONFIRMED'
        GROUP BY dow, hr
        ORDER BY cnt DESC
        """)
    List<Object[]> findPeakPeriods();

    // Total confirmed registrations
    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.status = 'CONFIRMED'")
    long countConfirmedRegistrations();
}
