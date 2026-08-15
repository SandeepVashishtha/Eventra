package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LostItem;
import com.sandeep.eventrabackend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {

    // Find all lost items for a specific event, ordered by most recent
    List<LostItem> findByEventOrderByCreatedAtDesc(Event event);

    // Find unclaimed lost items for a specific event
    List<LostItem> findByEventAndIsClaimedFalseOrderByCreatedAtDesc(Event event);

    // Find by category for a specific event
    List<LostItem> findByEventAndCategoryOrderByCreatedAtDesc(Event event, String category);

    // Search by title or description containing keywords for a specific event
    @Query("SELECT li FROM LostItem li WHERE li.event = :event AND " +
           "(LOWER(li.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(li.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(li.aiGeneratedTags) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<LostItem> searchByKeyword(@Param("event") Event event, @Param("keyword") String keyword);

    // Search by AI tags for a specific event
    @Query("SELECT li FROM LostItem li WHERE li.event = :event AND " +
           "LOWER(li.aiGeneratedTags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<LostItem> searchByTag(@Param("event") Event event, @Param("tag") String tag);

    // Find items that have specific AI-generated tags (exact match on comma-separated values)
    @Query("SELECT li FROM LostItem li WHERE li.event = :event AND " +
           "(:tag MEMBER OF li.tags OR LOWER(li.aiGeneratedTags) LIKE LOWER(CONCAT('%', :tag, '%')))")
    List<LostItem> findByEventAndAiTag(@Param("event") Event event, @Param("tag") String tag);

    // Count lost items by event
    long countByEvent(Event event);

    // Count unclaimed items by event
    long countByEventAndIsClaimedFalse(Event event);

    // Find recently added items (last N hours)
    List<LostItem> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);

    // Find items by status
    List<LostItem> findByEventAndStatusOrderByCreatedAtDesc(Event event, LostItem.LostItemStatus status);
}