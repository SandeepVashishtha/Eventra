package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);


    /**
     * Find events by title or description containing the given search term
     * (case-insensitive).
     */
    List<Event> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String titleSearch, String descriptionSearch);

    /**
     * Find events by category.
     */
    List<Event> findByCategory(String category);
}
