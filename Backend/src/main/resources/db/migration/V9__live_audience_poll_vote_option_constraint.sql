ALTER TABLE live_audience_poll_votes
    DROP CONSTRAINT IF EXISTS uk_lapv_poll_user;

ALTER TABLE live_audience_poll_votes
    ADD CONSTRAINT uk_lapv_poll_user_option UNIQUE (poll_id, user_id, option_text);
