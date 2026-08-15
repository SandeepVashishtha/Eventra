package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Event;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Specs for the public event listing endpoint ({@code GET /api/events}).
 */
public final class EventSpecifications {

    private EventSpecifications() {
    }

    public static Specification<Event> publicListing(String search, List<String> statuses) {
        return Specification
                .where(isPublic())
                .and(searchContains(search))
                .and(timingOrLifecycleStatus(statuses))
                .and(notCancelledUnlessRequested(statuses));
    }

    /**
     * Cancelled and archived events are hidden from the public listing unless
     * the caller explicitly filters for those lifecycle labels.
     */
    public static Specification<Event> notCancelledUnlessRequested(List<String> statuses) {
        java.util.Set<String> requested = statuses == null
                ? java.util.Set.of()
                : statuses.stream()
                        .filter(StringUtils::hasText)
                        .map(raw -> raw.trim().toUpperCase(Locale.ROOT))
                        .collect(java.util.stream.Collectors.toSet());
        boolean requestsCancelled = requested.contains("CANCELLED") || requested.contains("CANCELED");
        boolean requestsArchived = requested.contains("ARCHIVED");
        boolean requestsDraft = requested.contains("DRAFT");

        return (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (!requestsCancelled) {
                predicates.add(cb.notEqual(cb.upper(root.get("status")), "CANCELLED"));
            }
            if (!requestsArchived) {
                predicates.add(cb.notEqual(cb.upper(root.get("status")), "ARCHIVED"));
            }
            if (!requestsDraft) {
                predicates.add(cb.notEqual(cb.upper(root.get("status")), "DRAFT"));
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    public static Specification<Event> isPublic() {
        return (root, query, cb) -> cb.isTrue(root.get("isPublic"));
    }

    public static Specification<Event> notCancelled() {
        return (root, query, cb) -> cb.notEqual(cb.upper(root.get("status")), "CANCELLED");
    }

    public static Specification<Event> categoryEquals(String category) {
        if (!StringUtils.hasText(category)) {
            return null;
        }
        return (root, query, cb) -> cb.equal(
                cb.upper(root.get("category")),
                category.trim().toUpperCase(Locale.ROOT));
    }

    public static Specification<Event> eventDateAfter(String startDate) {
        if (!StringUtils.hasText(startDate)) {
            return null;
        }
        LocalDateTime startDateTime;
        try {
            startDateTime = LocalDateTime.parse(startDate.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid startDate parameter: " + startDate);
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("eventDate"), startDateTime);
    }

    public static Specification<Event> eventDateBefore(String endDate) {
        if (!StringUtils.hasText(endDate)) {
            return null;
        }
        LocalDateTime endDateTime;
        try {
            endDateTime = LocalDateTime.parse(endDate.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid endDate parameter: " + endDate);
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("eventDate"), endDateTime);
    }

    public static Specification<Event> searchContains(String search) {
        if (!StringUtils.hasText(search)) {
            return null;
        }
        String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern),
                cb.like(cb.lower(root.get("location")), pattern)
        );
    }

    /**
     * Frontend sends timing labels ({@code UPCOMING}/{@code LIVE}/{@code PAST})
     * and lifecycle labels ({@code CANCELLED}/{@code SCHEDULED}). Timing is
     * derived from {@code eventDate}; lifecycle matches {@code status}.
     */
    public static Specification<Event> timingOrLifecycleStatus(List<String> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            return null;
        }

        List<Specification<Event>> parts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (String raw : statuses) {
            if (!StringUtils.hasText(raw)) {
                continue;
            }
            String status = raw.trim().toUpperCase(Locale.ROOT);
            switch (status) {
                case "UPCOMING" -> parts.add((root, query, cb) ->
                        cb.greaterThan(root.get("eventDate"), now));
                case "LIVE" -> parts.add((root, query, cb) -> cb.and(
                        cb.lessThanOrEqualTo(root.get("eventDate"), now),
                        cb.or(
                                cb.greaterThanOrEqualTo(root.get("endDate"), now),
                                cb.and(cb.isNull(root.get("endDate")),
                                        cb.greaterThanOrEqualTo(root.get("eventDate"), now))
                        )
                ));
                case "PAST", "ENDED" -> parts.add((root, query, cb) -> cb.or(
                        cb.lessThan(root.get("endDate"), now),
                        cb.and(cb.isNull(root.get("endDate")),
                                cb.lessThan(root.get("eventDate"), now))
                ));
                case "CANCELLED", "CANCELED", "SCHEDULED" -> parts.add((root, query, cb) ->
                        cb.equal(cb.upper(root.get("status")),
                                status.startsWith("CANCEL") ? "CANCELLED" : status));
                default -> {
                    // Ignore unknown filter tokens rather than rejecting the request
                }
            }
        }

        if (parts.isEmpty()) {
            return null;
        }

        Specification<Event> combined = parts.get(0);
        for (int i = 1; i < parts.size(); i++) {
            combined = combined.or(parts.get(i));
        }
        return combined;
    }
}
