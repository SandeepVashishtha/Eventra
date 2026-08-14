package com.sandeep.eventrabackend.subtitles;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a new subtitle entity is created and ready for live SSE broadcast.
 */
@Getter
public class SubtitleCreatedEvent extends ApplicationEvent {

    private final Subtitle subtitle;

    public SubtitleCreatedEvent(Object source, Subtitle subtitle) {
        super(source);
        this.subtitle = subtitle;
    }

    public SubtitleCreatedEvent(Subtitle subtitle) {
        super(subtitle);
        this.subtitle = subtitle;
    }
}
