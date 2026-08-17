package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.subtitles.*;
import com.sandeep.eventrabackend.websocket.RedisPubSubRelay;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;


import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubtitleServiceTest {

    @Mock
    private SubtitleRepository subtitleRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private RedisPubSubRelay redisPubSubRelay;

    @InjectMocks
    private SubtitleService subtitleService;

    private Subtitle sampleSubtitle;

    @BeforeEach
    void setUp() {
        sampleSubtitle = Subtitle.builder()
                .id(1L)
                .uuid("uuid-123")
                .eventId(100L)
                .sessionId("session-xyz")
                .originalText("Test text")
                .translatedText("Translated text")
                .sourceLanguage("en")
                .targetLanguage("es")
                .createdAt(Instant.now())
                .sequenceNumber(1000L)
                .isFinal(false)
                .isApproved(true)
                .build();
    }

    @Test
    void testCreateSubtitlePublishesSubtitleCreatedEvent() {
        when(subtitleRepository.save(any(Subtitle.class))).thenReturn(sampleSubtitle);

        SubtitleDTO dto = SubtitleDTO.fromEntity(sampleSubtitle);
        Subtitle result = subtitleService.createSubtitle(dto);

        assertNotNull(result);
        assertEquals(1L, result.getId());

        ArgumentCaptor<ApplicationEvent> eventCaptor = ArgumentCaptor.forClass(ApplicationEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());

        assertTrue(eventCaptor.getValue() instanceof SubtitleCreatedEvent);
        SubtitleCreatedEvent createdEvent = (SubtitleCreatedEvent) eventCaptor.getValue();
        assertEquals(100L, createdEvent.getSubtitle().getEventId());

        verify(redisPubSubRelay, times(1)).publishMessage(eq("subtitles:event:100"), contains("1"));
    }

    @Test
    void testCreateRealTimeSubtitlePublishesSubtitleCreatedEvent() {
        when(subtitleRepository.save(any(Subtitle.class))).thenReturn(sampleSubtitle);

        RealTimeSubtitleRequest request = RealTimeSubtitleRequest.builder()
                .eventId(100L)
                .sessionId("session-xyz")
                .originalText("Live audio stream")
                .translatedText("Transmisión de audio en vivo")
                .sourceLanguage("en")
                .targetLanguage("es")
                .build();

        Subtitle result = subtitleService.createRealTimeSubtitle(request);

        assertNotNull(result);
        verify(eventPublisher, times(1)).publishEvent(any(SubtitleCreatedEvent.class));
        verify(redisPubSubRelay, times(1)).publishMessage(eq("subtitles:event:100"), contains("1"));
    }
}
