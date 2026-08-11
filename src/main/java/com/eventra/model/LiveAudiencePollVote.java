package com.eventra.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "live_audience_poll_votes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_poll_user_vote", columnNames = {"poll_id", "user_id"})
    }
)
public class LiveAudiencePollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "poll_id", nullable = false)
    private Long pollId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    public LiveAudiencePollVote() {}

    public LiveAudiencePollVote(Long pollId, String userId, Long optionId) {
        this.pollId = pollId;
        this.userId = userId;
        this.optionId = optionId;
    }

    public Long getId() { return id; }
    public Long getPollId() { return pollId; }
    public void setPollId(Long pollId) { this.pollId = pollId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Long getOptionId() { return optionId; }
    public void setOptionId(Long optionId) { this.optionId = optionId; }
}
