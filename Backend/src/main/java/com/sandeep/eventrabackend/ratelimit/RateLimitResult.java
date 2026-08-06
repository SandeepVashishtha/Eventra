package com.sandeep.eventrabackend.ratelimit;

public record RateLimitResult(boolean allowed, int limit, int remaining, long retryAfterSeconds) {
}
