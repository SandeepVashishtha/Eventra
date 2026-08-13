package com.sandeep.eventrabackend.model;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class SessionQuestion {
    private String id;
    private String sessionId;
    private String authorName;
    private String questionText;
    private int upvotes;
    private boolean isPinned;
    private boolean isAnswered;
    private LocalDateTime createdAt;
    private final Set<String> voterKeys = ConcurrentHashMap.newKeySet();

    public SessionQuestion() {
        this.createdAt = LocalDateTime.now();
    }

    public SessionQuestion(String id, String sessionId, String authorName, String questionText) {
        this.id = id;
        this.sessionId = sessionId;
        this.authorName = authorName;
        this.questionText = questionText;
        this.upvotes = 1;
        this.isPinned = false;
        this.isAnswered = false;
        this.createdAt = LocalDateTime.now();
    }

    public boolean hasVoted(String voterKey) {
        return voterKeys.contains(voterKey);
    }

    public boolean addVoter(String voterKey) {
        return voterKeys.add(voterKey);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public boolean isAnswered() { return isAnswered; }
    public void setAnswered(boolean answered) { isAnswered = answered; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
