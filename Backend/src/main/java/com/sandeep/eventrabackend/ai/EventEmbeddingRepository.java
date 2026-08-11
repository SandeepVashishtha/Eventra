package com.sandeep.eventrabackend.ai;

import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Vector Embeddings Repository for Eventra AI Semantic Search (#14046).
 */
@Repository
public class EventEmbeddingRepository {

    public static class EventVector {
        private String eventId;
        private String title;
        private List<Double> embeddingVector;

        public EventVector() {}
        public EventVector(String eventId, String title, List<Double> embeddingVector) {
            this.eventId = eventId;
            this.title = title;
            this.embeddingVector = embeddingVector;
        }

        public String getEventId() { return eventId; }
        public String getTitle() { return title; }
        public List<Double> getEmbeddingVector() { return embeddingVector; }
    }

    private final Map<String, EventVector> vectorStore = new ConcurrentHashMap<>();

    public void save(EventVector eventVector) {
        if (eventVector != null && eventVector.getEventId() != null) {
            vectorStore.put(eventVector.getEventId(), eventVector);
        }
    }

    public List<EventVector> findAll() {
        return new ArrayList<>(vectorStore.values());
    }
}
