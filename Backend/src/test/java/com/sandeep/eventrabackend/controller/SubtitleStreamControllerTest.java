package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.EventRoleService;
import com.sandeep.eventrabackend.subtitles.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubtitleStreamControllerTest {

    @Mock
    private SubtitleService subtitleService;

    @Mock
    private EventRoleService eventRoleService;

    @InjectMocks
    private SubtitleStreamController subtitleStreamController;

    private Subtitle sampleSubtitle;

    @BeforeEach
    void setUp() {
        sampleSubtitle = Subtitle.builder()
                .id(100L)
                .uuid("sub-uuid-123")
                .eventId(10L)
                .sessionId("session-abc")
                .originalText("Hello world")
                .translatedText("Bonjour le monde")
                .sourceLanguage("en")
                .targetLanguage("fr")
                .sequenceNumber(1L)
                .createdAt(Instant.now())
                .isFinal(false)
                .isApproved(true)
                .build();
    }

    @Test
    void testOnSubtitleCreatedInvokesBroadcasters() {
        SubtitleCreatedEvent event = new SubtitleCreatedEvent(this, sampleSubtitle);

        SubtitleStreamController controllerSpy = spy(subtitleStreamController);

        doNothing().when(controllerSpy).notifyEventSubscribers(eq(10L), any(Subtitle.class));
        doNothing().when(controllerSpy).notifySessionSubscribers(eq("session-abc"), any(Subtitle.class));

        assertDoesNotThrow(() -> controllerSpy.onSubtitleCreated(event));

        verify(controllerSpy).notifyEventSubscribers(eq(10L), eq(sampleSubtitle));
        verify(controllerSpy).notifySessionSubscribers(eq("session-abc"), eq(sampleSubtitle));
    }

    @Test
    void testBroadcastToEventAndSessionNoEmittersDoesNotFail() {
        assertDoesNotThrow(() -> subtitleStreamController.broadcastToEvent(10L, sampleSubtitle));
        assertDoesNotThrow(() -> subtitleStreamController.broadcastToSession("session-abc", sampleSubtitle));
    }

    @Test
    void testSendSubtitleWithErrorHandling() {
        SseEmitter mockEmitter = mock(SseEmitter.class);
        assertDoesNotThrow(() -> subtitleStreamController.sendSubtitle(mockEmitter, sampleSubtitle, "subtitle"));
    }
}
