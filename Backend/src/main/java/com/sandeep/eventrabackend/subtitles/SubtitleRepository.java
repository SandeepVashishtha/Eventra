package com.sandeep.eventrabackend.subtitles;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Subtitle entities
 * 
 * Provides database operations for real-time subtitles
 */
@Repository
public interface SubtitleRepository extends JpaRepository<Subtitle, Long>, JpaSpecificationExecutor<Subtitle> {
    
    /**
     * Find subtitles by event ID
     */
    List<Subtitle> findByEventId(Long eventId);
    
    /**
     * Find subtitles by event ID with pagination
     */
    Page<Subtitle> findByEventId(Long eventId, Pageable pageable);
    
    /**
     * Find subtitles by session ID
     */
    List<Subtitle> findBySessionId(String sessionId);
    
    /**
     * Find subtitles by user ID
     */
    List<Subtitle> findByUserId(Long userId);
    
    /**
     * Find subtitles by language
     */
    List<Subtitle> findByTargetLanguage(String targetLanguage);
    
    /**
     * Find subtitles by source language
     */
    List<Subtitle> findBySourceLanguage(String sourceLanguage);
    
    /**
     * Find subtitle by UUID
     */
    Optional<Subtitle> findByUuid(String uuid);
    
    /**
     * Find active subtitles for an event
     */
    @Query("SELECT s FROM Subtitle s WHERE s.eventId = :eventId AND " +
           "(s.startTime IS NULL OR s.startTime <= :currentTime) AND " +
           "(s.endTime IS NULL OR s.endTime >= :currentTime)")
    List<Subtitle> findActiveSubtitlesByEventId(Long eventId, Instant currentTime);
    
    /**
     * Find recent subtitles for an event
     */
    @Query("SELECT s FROM Subtitle s WHERE s.eventId = :eventId ORDER BY s.createdAt DESC")
    List<Subtitle> findRecentSubtitlesByEventId(Long eventId, Pageable pageable);
    
    /**
     * Find subtitles created after a specific time
     */
    List<Subtitle> findByCreatedAtAfter(Instant after);
    
    /**
     * Find subtitles created between two timestamps
     */
    List<Subtitle> findByCreatedAtBetween(Instant start, Instant end);
    
    /**
     * Count subtitles by event ID
     */
    Long countByEventId(Long eventId);
    
    /**
     * Count subtitles by user ID
     */
    Long countByUserId(Long userId);
    
    /**
     * Delete subtitles by session ID
     */
    void deleteBySessionId(String sessionId);
    
    /**
     * Delete subtitles by event ID
     */
    void deleteByEventId(Long eventId);
    
    /**
     * Find subtitles created before a specific time
     */
    List<Subtitle> findByCreatedAtBefore(Instant before);

    /**
     * Delete subtitles created before a specific time
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByCreatedAtBefore(Instant before);

    /**
     * Delete expired subtitles
     */
    @Query("DELETE FROM Subtitle s WHERE s.endTime IS NOT NULL AND s.endTime < :currentTime")
    void deleteExpiredSubtitles(Instant currentTime);
    
    /**
     * Find final subtitles for an event (non-real-time, approved subtitles)
     */
    List<Subtitle> findByEventIdAndIsFinalTrue(Long eventId);
    
    /**
     * Find subtitles that need approval
     */
    List<Subtitle> findByIsApprovedFalse();
    
    /**
     * Find subtitles by provider
     */
    List<Subtitle> findByProvider(String provider);
}
