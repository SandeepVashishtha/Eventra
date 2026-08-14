package com.sandeep.eventrabackend.event;

public record EventCancelledEvent(Long eventId, String reason) {
}
