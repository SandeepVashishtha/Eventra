package com.sandeep.eventrabackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

/**
 * Persisted ZKP nullifiers that guarantee a zero-knowledge proof can only be
 * used once for anonymous feedback.
 */
@Entity
@Table(name = "zkp_nullifier", uniqueConstraints = @UniqueConstraint(name = "uk_zkp_nullifier_hash", columnNames = "nullifier_hash"))
public class ZkpNullifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nullifier_hash", length = 128, nullable = false)
    private String nullifierHash;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public ZkpNullifier() {
    }

    public ZkpNullifier(String eventId, String nullifierHash) {
        this.eventId = eventId;
        this.nullifierHash = nullifierHash;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNullifierHash() {
        return nullifierHash;
    }

    public void setNullifierHash(String nullifierHash) {
        this.nullifierHash = nullifierHash;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
