package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface RegistrationAnalyticsRepository
        extends JpaRepository<EventRegistration, Long> {

    // ── Trends — note: field is registeredAt, NOT createdAt ──────────────────
    // Only Hibernate HQL built-ins (YEAR/MONTH/HOUR and CAST to date) are used
    // below so the same queries run on the default H2 database and on
    // MySQL/Postgres (#12612). All queries accept a nullable collection of event
    // IDs: null = global, non-null = restrict to those events (e.g. a caller's
    // accessible events).

    @Query("""
        SELECT YEAR(r.registeredAt) * 100 + MONTH(r.registeredAt) AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findMonthlyTrend(@Param("from") LocalDateTime from, @Param("eventIds") Collection<Long> eventIds);

    @Query("""
        SELECT CAST(r.registeredAt AS date) AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findDailyTrend(@Param("from") LocalDateTime from, @Param("eventIds") Collection<Long> eventIds);

    // ── Peak registration periods — day and hour extracted portably; the
    //    service derives the weekday (no portable SQL WEEKDAY exists) ─────────
    @Query("""
        SELECT CAST(r.registeredAt AS date) AS day,
               HOUR(r.registeredAt) AS hr,
               COUNT(r) AS cnt
        FROM EventRegistration r
        WHERE r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY day, hr
        ORDER BY cnt DESC
        """)
    List<Object[]> findPeakPeriods(@Param("eventIds") Collection<Long> eventIds);

    // Total confirmed registrations
    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.status = 'CONFIRMED' AND (:eventIds IS NULL OR r.event.id IN :eventIds)")
    long countConfirmedRegistrations(@Param("eventIds") Collection<Long> eventIds);

    // Earliest confirmed registration — used to derive "hours active"
    @Query("SELECT MIN(r.registeredAt) FROM EventRegistration r WHERE r.status = 'CONFIRMED' AND (:eventIds IS NULL OR r.event.id IN :eventIds)")
    LocalDateTime findEarliestRegistration(@Param("eventIds") Collection<Long> eventIds);
}
