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
                .and(timingOrLifecycleStatus(statuses));
    }

    public static Specification<Event> isPublic() {
        return (root, query, cb) -> cb.isTrue(root.get("isPublic"));
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
                        cb.greaterThanOrEqualTo(root.get("eventDate"), now.toLocalDate().atStartOfDay())
                ));
                case "PAST", "ENDED" -> parts.add((root, query, cb) ->
                        cb.lessThan(root.get("eventDate"), now.toLocalDate().atStartOfDay()));
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
