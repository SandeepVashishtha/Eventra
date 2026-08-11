package com.eventra.model;

import jakarta.persistence.*;

@Entity
@Table(name = "live_audience_questions")
public class LiveAudienceQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "question_text", nullable = false, length = 1000)
    private String questionText;

    @Column(name = "upvotes", nullable = false)
    private Integer upvotes = 0;

    public LiveAudienceQuestion() {}

    public LiveAudienceQuestion(Long eventId, String questionText) {
        this.eventId = eventId;
        this.questionText = questionText;
        this.upvotes = 0;
    }

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = Math.max(0, upvotes); }
}
