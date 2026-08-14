package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.subtitles.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubtitleServiceTest {

    @Mock
    private SubtitleRepository subtitleRepository;

    private SubtitleService subtitleService;

    @BeforeEach
    void setUp() {
        subtitleService = new SubtitleService(subtitleRepository);
    }

    @Test
    @DisplayName("Subtitle entity equals and hashCode match on ID or UUID across distinct instances")
    void testSubtitleEqualsAndHashCode() {
        Subtitle sub1 = Subtitle.builder()
                .id(100L)
                .uuid("uuid-123")
                .eventId(1L)
                .translatedText("Hello")
                .sourceLanguage("en")
                .targetLanguage("es")
                .build();

        Subtitle sub2 = Subtitle.builder()
                .id(100L)
                .uuid("uuid-456") // Different UUID but same ID
                .eventId(1L)
                .translatedText("Hola (Updated)")
                .sourceLanguage("en")
                .targetLanguage("es")
                .build();

        assertEquals(sub1, sub2, "Subtitles with identical IDs must be equal");
        assertEquals(sub1.hashCode(), sub2.hashCode(), "Subtitles with identical IDs must have matching hashCodes");

        Subtitle sub3 = Subtitle.builder()
                .uuid("uuid-999")
                .translatedText("Text")
                .sourceLanguage("en")
                .targetLanguage("es")
                .build();

        Subtitle sub4 = Subtitle.builder()
                .uuid("uuid-999")
                .translatedText("Text")
                .sourceLanguage("en")
                .targetLanguage("es")
                .build();

        assertEquals(sub3, sub4, "Unpersisted subtitles with identical UUIDs must be equal");
    }

    @Test
    @DisplayName("updateSubtitle updates cached entry when fetched as a separate managed DB instance (#17871)")
    void testUpdateSubtitlePropagatesToCache() {
        Long eventId = 1L;
        Long subtitleId = 42L;

        Subtitle initialEntity = Subtitle.builder()
                .id(subtitleId)
                .uuid("uuid-42")
                .eventId(eventId)
                .originalText("Initial text")
                .translatedText("Initial translation")
                .sourceLanguage("en")
                .targetLanguage("es")
                .confidence(0.9)
                .createdAt(Instant.now())
                .sequenceNumber(1L)
                .isFinal(false)
                .build();

        List<Subtitle> dbList = new ArrayList<>();
        dbList.add(initialEntity);

        when(subtitleRepository.findByEventId(eventId)).thenReturn(dbList);

        // Warm up cache
        List<Subtitle> cachedInitial = subtitleService.getSubtitlesByEventId(eventId);
        assertEquals(1, cachedInitial.size());
        assertEquals("Initial translation", cachedInitial.get(0).getTranslatedText());

        // Simulate fetching a fresh managed instance from DB on update
        Subtitle freshManagedInstance = Subtitle.builder()
                .id(subtitleId)
                .uuid("uuid-42")
                .eventId(eventId)
                .originalText("Updated text")
                .translatedText("Updated translation")
                .sourceLanguage("en")
                .targetLanguage("es")
                .confidence(0.95)
                .createdAt(initialEntity.getCreatedAt())
                .sequenceNumber(1L)
                .isFinal(true)
                .build();

        when(subtitleRepository.findById(subtitleId)).thenReturn(Optional.of(freshManagedInstance));
        when(subtitleRepository.save(any(Subtitle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubtitleDTO updateDTO = new SubtitleDTO();
        updateDTO.setTranslatedText("Updated translation");
        updateDTO.setIsFinal(true);

        Subtitle updatedResult = subtitleService.updateSubtitle(subtitleId, updateDTO);

        assertEquals("Updated translation", updatedResult.getTranslatedText());

        // Cache must reflect updated content without needing a DB refetch
        List<Subtitle> cachedAfterUpdate = subtitleService.getSubtitlesByEventId(eventId);
        assertEquals(1, cachedAfterUpdate.size());
        assertEquals("Updated translation", cachedAfterUpdate.get(0).getTranslatedText());

        SubtitleStatistics stats = subtitleService.getEventStatistics(eventId);
        assertNotNull(stats);
        assertEquals(1, stats.getTotalCount());
        assertNotNull(stats.getMostRecentSubtitle());
        assertEquals("Updated translation", stats.getMostRecentSubtitle().getTranslatedText());
    }

    @Test
    @DisplayName("finalizeSubtitle updates cache for distinct DB instance")
    void testFinalizeSubtitlePropagatesToCache() {
        Long eventId = 2L;
        Long subtitleId = 99L;

        Subtitle draftSubtitle = Subtitle.builder()
                .id(subtitleId)
                .uuid("uuid-99")
                .eventId(eventId)
                .translatedText("Draft caption")
                .sourceLanguage("en")
                .targetLanguage("fr")
                .sequenceNumber(1L)
                .isFinal(false)
                .build();

        when(subtitleRepository.findByEventId(eventId)).thenReturn(new ArrayList<>(List.of(draftSubtitle)));

        // Warm up cache
        List<Subtitle> cachedBefore = subtitleService.getSubtitlesByEventId(eventId);
        assertFalse(cachedBefore.get(0).getIsFinal());

        Subtitle freshManaged = Subtitle.builder()
                .id(subtitleId)
                .uuid("uuid-99")
                .eventId(eventId)
                .translatedText("Draft caption")
                .sourceLanguage("en")
                .targetLanguage("fr")
                .sequenceNumber(1L)
                .isFinal(false)
                .build();

        when(subtitleRepository.findById(subtitleId)).thenReturn(Optional.of(freshManaged));
        when(subtitleRepository.save(any(Subtitle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Subtitle finalized = subtitleService.finalizeSubtitle(subtitleId);
        assertTrue(finalized.getIsFinal());

        List<Subtitle> cachedAfter = subtitleService.getSubtitlesByEventId(eventId);
        assertTrue(cachedAfter.get(0).getIsFinal());
    }

    @Test
    @DisplayName("Concurrent creation and cache trimming does not throw ConcurrentModificationException (#17871)")
    void testConcurrentCacheAccessAndTrimming() throws InterruptedException {
        when(subtitleRepository.save(any(Subtitle.class))).thenAnswer(invocation -> {
            Subtitle sub = invocation.getArgument(0);
            if (sub.getId() == null) {
                sub.setId((long) (Math.random() * 100000) + 1);
            }
            return sub;
        });

        int threadCount = 10;
        int operationsPerThread = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final long eventId = (i % 3) + 1; // 3 events shared across threads
            executor.submit(() -> {
                try {
                    for (int j = 0; j < operationsPerThread; j++) {
                        SubtitleDTO dto = new SubtitleDTO();
                        dto.setEventId(eventId);
                        dto.setTranslatedText("Concurrent subtitle " + j);
                        dto.setSourceLanguage("en");
                        dto.setTargetLanguage("es");

                        Subtitle created = subtitleService.createSubtitle(dto);
                        assertNotNull(created);

                        subtitleService.getSubtitlesByEventId(eventId);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean completed = latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();
        assertTrue(completed, "Concurrent operations must complete within timeout");
    }
}
