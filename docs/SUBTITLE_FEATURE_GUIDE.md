# Real-Time Multilingual AR Subtitles Feature

## Overview

The Real-Time Multilingual AR Subtitles feature enables international attendees to understand live vocals during events through augmented reality (AR) projections on smart-glasses or mobile phones. This feature provides:

- **Real-time audio transcription** from the performer's microphone
- **Low-latency translation** (<500ms delay) to multiple languages
- **AR display** on smart-glasses and mobile devices
- **Synchronization** with the performer's speech cadence

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Audio      │    │ Transcription│    │ Translation │        │
│  │  Capture   ├───► │  Service     ├───► │  Service    │        │
│  │  Service    │    │             │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│           │                  │                      │              │
│           ▼                  ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   RealTimeSubtitleContext                 │    │
│  │  - State Management                                      │    │
│  │  - Language Preferences                                  │    │
│  │  - Subtitle Buffering                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                          │
│                           ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      SubtitleDisplay                       │    │
│  │  - Standard Mode (Desktop)                               │    │
│  │  - AR Mode (Smart-Glasses/Mobile)                       │    │
│  │  - Compact Mode (Mobile Optimized)                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Subtitle   │    │  Subtitle    │    │  Subtitle    │        │
│  │  Controller │    │  Service     │    │  Repository  │        │
│  │             │    │             │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│           │                  │                      │              │
│           ▼                  ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Subtitle Stream Controller               │    │
│  │  - SSE Streaming                                         │    │
│  │  - WebSocket Support                                     │    │
│  │  - Event/Sessions Management                            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   External APIs  │
                    │  - Whisper      │
                    │  - Google       │
                    │  - Azure        │
                    │  - AWS          │
                    │  - DeepL        │
                    └─────────────────┘
```

## Feature Components

### Frontend Components

#### 1. Audio Capture Service (`src/services/audioCaptureService.js`)
- **Purpose**: Captures audio from the microphone for real-time processing
- **Features**:
  - Microphone access with user permission
  - Audio chunking (100ms chunks for low latency)
  - Format conversion (Float32 to Int16 PCM)
  - Audio level monitoring
  - Device selection support
  - Automatic retry on failure

#### 2. Transcription Service (`src/services/transcriptionService.js`)
- **Purpose**: Converts audio to text using speech-to-text APIs
- **Features**:
  - Multiple provider support (Whisper, Google, Azure, AWS, Local)
  - Audio buffering and chunking
  - WAV format encoding for API compatibility
  - Automatic language detection
  - Performance statistics tracking
  - Caching for repeated audio

#### 3. Translation Service (`src/services/translationService.js`)
- **Purpose**: Translates text to multiple languages using LLM APIs
- **Features**:
  - Multiple provider support (Google, Azure, AWS, DeepL, Local LLM)
  - 20+ supported languages
  - Context-aware translation
  - Translation caching
  - Language detection
  - Performance optimization for <200ms latency

#### 4. RealTimeSubtitleContext (`src/context/RealTimeSubtitleContext.jsx`)
- **Purpose**: Central state management for subtitles
- **Features**:
  - Subtitle session management
  - Language preference storage
  - Subtitle buffering and display timing
  - Latency monitoring
  - AR display settings
  - Integration with audio, transcription, and translation services

#### 5. SubtitleDisplay Components (`src/components/subtitles/`)
- **SubtitleDisplay**: Main component for displaying subtitles
- **SubtitleDisplayWithControls**: Display with built-in controls
- **SubtitleDisplayAR**: Optimized for AR devices
- **SubtitleDisplayMobile**: Optimized for mobile devices

### Backend Components

#### 1. Subtitle Entity (`Backend/src/main/java/com/sandeep/eventrabackend/subtitles/Subtitle.java`)
- **Purpose**: Database entity for storing subtitle data
- **Features**:
  - Event association
  - Language metadata
  - Display timing
  - Confidence scores
  - Moderation support
  - Session grouping

#### 2. Subtitle Repository (`Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleRepository.java`)
- **Purpose**: Database operations for subtitles
- **Features**:
  - CRUD operations
  - Query by event, session, user, language
  - Active subtitle queries
  - Pagination support

#### 3. Subtitle Service (`Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleService.java`)
- **Purpose**: Business logic for subtitle management
- **Features**:
  - Subtitle creation and updates
  - Session management
  - Caching for performance
  - Statistics tracking
  - Real-time subtitle processing

#### 4. Subtitle Controller (`Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleController.java`)
- **Purpose**: REST API endpoints for subtitles
- **Endpoints**:
  - `POST /api/v1/subtitles` - Create subtitle
  - `GET /api/v1/subtitles/event/{eventId}` - Get subtitles by event
  - `POST /api/v1/subtitles/realtime` - Create real-time subtitle
  - `POST /api/v1/subtitles/session/start` - Start session
  - `POST /api/v1/subtitles/session/{sessionId}/end` - End session
  - And many more...

#### 5. Subtitle Stream Controller (`Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleStreamController.java`)
- **Purpose**: SSE streaming for real-time subtitle delivery
- **Endpoints**:
  - `GET /api/v1/subtitles/stream/event/{eventId}` - Stream event subtitles
  - `GET /api/v1/subtitles/stream/session/{sessionId}` - Stream session subtitles
  - `GET /api/v1/subtitles/stream/event/{eventId}/language/{language}` - Stream by language

## Setup and Configuration

### Frontend Configuration

#### Environment Variables

Add these to your `.env` file:

```env
# Audio capture settings
VITE_AUDIO_CHUNK_DURATION_MS=100
VITE_TARGET_LATENCY_MS=500

# Transcription provider (whisper, google, azure, aws, local)
VITE_TRANSCRIPTION_PROVIDER=whisper

# Translation provider (google, azure, aws, deepl, local_llm, mock)
VITE_TRANSLATION_PROVIDER=google

# API endpoints
VITE_TRANSCRIPTION_API_URL=https://api.transcription-service.com
VITE_TRANSLATION_API_URL=https://api.translation-service.com
```

#### Backend Configuration

Add these to your `application.properties` or `application.yml`:

```yaml
# Subtitle settings
subtitle:
  default-duration-ms: 5000
  max-history-size: 100
  buffer-size: 10
  cleanup:
    enabled: true
    schedule: "0 0 * * * *"  # Run every hour

# SSE settings
spring:
  mvc:
    async:
      request-timeout: 3600000  # 1 hour
```

### Database Setup

The feature requires a database table for storing subtitles. If using JPA with Hibernate, the table will be created automatically based on the `Subtitle` entity.

For manual setup:

```sql
CREATE TABLE subtitles (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(64) UNIQUE NOT NULL,
    event_id BIGINT NOT NULL,
    original_text TEXT,
    translated_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    confidence DOUBLE PRECISION,
    provider VARCHAR(50),
    user_id BIGINT,
    session_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_ms BIGINT,
    sequence_number BIGINT,
    is_final BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    metadata TEXT
);

CREATE INDEX idx_subtitles_event_id ON subtitles(event_id);
CREATE INDEX idx_subtitles_session_id ON subtitles(session_id);
CREATE INDEX idx_subtitles_user_id ON subtitles(user_id);
CREATE INDEX idx_subtitles_target_language ON subtitles(target_language);
CREATE INDEX idx_subtitles_created_at ON subtitles(created_at);
```

## Usage

### Frontend Integration

#### Basic Setup

1. Import and wrap your app with the provider:

```jsx
import { RealTimeSubtitleProvider } from './components/subtitles';

function App() {
  return (
    <RealTimeSubtitleProvider>
      <YourAppContent />
    </RealTimeSubtitleProvider>
  );
}
```

#### Display Subtitles

```jsx
import { SubtitleDisplay } from './components/subtitles';

function EventPage() {
  return (
    <div>
      <EventContent />
      <SubtitleDisplay 
        mode="standard" 
        position="bottom"
        showLanguage={true}
        showConfidence={false}
      />
    </div>
  );
}
```

#### With Controls

```jsx
import { SubtitleDisplayWithControls } from './components/subtitles';

function EventPage() {
  return (
    <div>
      <EventContent />
      <SubtitleDisplayWithControls 
        position="bottom"
        showControls={true}
      />
    </div>
  );
}
```

#### Programmatic Control

```jsx
import { useSubtitleControls, useSubtitleSettings } from './components/subtitles';

function EventPage() {
  const { toggleSubtitles, changeLanguage } = useSubtitleControls();
  const { currentLanguage, updateDisplaySettings } = useSubtitleSettings();

  return (
    <div>
      <button onClick={() => toggleSubtitles(true)}>Enable Subtitles</button>
      <button onClick={() => changeLanguage('es')}>Spanish</button>
      <button onClick={() => changeLanguage('fr')}>French</button>
      <select 
        value={currentLanguage} 
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
      </select>
    </div>
  );
}
```

#### AR Mode

```jsx
import { SubtitleDisplayAR } from './components/subtitles';

function ARView() {
  return (
    <div>
      <SubtitleDisplayAR 
        distance={2}        // 2 meters
        anchor="center"     // Position anchor
        opacity={0.9}       // Background opacity
        fontSize={24}       // Font size
      />
    </div>
  );
}
```

### Backend Integration

#### Starting a Subtitle Session

```java
// Start a new session for an event
String sessionId = UUID.randomUUID().toString();
SubtitleSession session = subtitleService.startSession(sessionId, eventId, userId);
```

#### Creating a Real-Time Subtitle

```java
RealTimeSubtitleRequest request = RealTimeSubtitleRequest.builder()
    .eventId(eventId)
    .originalText("Hello everyone")
    .translatedText("Hola a todos")
    .sourceLanguage("en")
    .targetLanguage("es")
    .confidence(0.95)
    .provider("whisper")
    .userId(userId)
    .sessionId(sessionId)
    .durationMs(5000L)
    .build();

Subtitle subtitle = subtitleService.createRealTimeSubtitle(request);
```

#### Streaming Subtitles via SSE

Clients can connect to the SSE endpoint to receive real-time updates:

```javascript
const eventSource = new EventSource('/api/v1/subtitles/stream/event/123');

eventSource.onopen = () => {
  console.log('Connection opened');
};

eventSource.onmessage = (event) => {
  const subtitle = JSON.parse(event.data);
  console.log('New subtitle:', subtitle);
};

eventSource.onerror = () => {
  console.log('Connection closed');
};
```

## API Endpoints

### REST API

#### Subtitles
- `POST /api/v1/subtitles` - Create a new subtitle
- `GET /api/v1/subtitles/{id}` - Get subtitle by ID
- `GET /api/v1/subtitles/uuid/{uuid}` - Get subtitle by UUID
- `GET /api/v1/subtitles/event/{eventId}` - Get all subtitles for an event
- `GET /api/v1/subtitles/event/{eventId}/active` - Get active subtitles for an event
- `GET /api/v1/subtitles/event/{eventId}/recent` - Get recent subtitles (paginated)
- `GET /api/v1/subtitles/session/{sessionId}` - Get subtitles by session
- `GET /api/v1/subtitles/user/{userId}` - Get subtitles by user
- `PUT /api/v1/subtitles/{id}` - Update a subtitle
- `POST /api/v1/subtitles/{id}/finalize` - Mark a subtitle as final
- `DELETE /api/v1/subtitles/{id}` - Delete a subtitle
- `DELETE /api/v1/subtitles/session/{sessionId}` - Delete subtitles by session
- `DELETE /api/v1/subtitles/event/{eventId}` - Delete subtitles by event

#### Sessions
- `POST /api/v1/subtitles/session/start?eventId={eventId}&userId={userId}` - Start a new session
- `POST /api/v1/subtitles/session/{sessionId}/start` - Start session with custom ID
- `POST /api/v1/subtitles/session/{sessionId}/end` - End a session
- `GET /api/v1/subtitles/session/{sessionId}` - Get session details
- `GET /api/v1/subtitles/event/{eventId}/sessions` - Get active sessions for an event

#### Statistics
- `GET /api/v1/subtitles/event/{eventId}/count` - Get subtitle count for an event
- `GET /api/v1/subtitles/event/{eventId}/statistics` - Get detailed statistics for an event

#### Real-Time
- `POST /api/v1/subtitles/realtime` - Create a real-time subtitle

#### Cleanup
- `POST /api/v1/subtitles/cleanup/expired` - Delete expired subtitles

### SSE Streaming

#### Event Subtitles
- `GET /api/v1/subtitles/stream/event/{eventId}` - Stream all subtitles for an event
- `GET /api/v1/subtitles/stream/event/{eventId}/language/{language}` - Stream subtitles in a specific language

#### Session Subtitles
- `GET /api/v1/subtitles/stream/session/{sessionId}` - Stream subtitles for a specific session

#### Management
- `GET /api/v1/subtitles/stream/stats` - Get connection statistics
- `POST /api/v1/subtitles/stream/event/{eventId}/disconnect` - Disconnect all clients from an event stream
- `POST /api/v1/subtitles/stream/session/{sessionId}/disconnect` - Disconnect all clients from a session stream

## Performance Optimization

### Frontend Optimizations

1. **Audio Chunking**: Audio is processed in 100ms chunks to maintain low latency
2. **Buffer Management**: Subtitles are buffered to handle network jitter
3. **Caching**: Translation results are cached to avoid redundant API calls
4. **Debouncing**: Audio data processing is debounced to prevent overload
5. **Web Workers**: Consider using Web Workers for heavy audio processing

### Backend Optimizations

1. **In-Memory Caching**: Recent subtitles are cached for fast access
2. **SSE Multiplexing**: Multiple clients can share the same connection
3. **Batch Processing**: Subtitles are processed in batches where possible
4. **Connection Pooling**: Database connections are pooled for efficiency
5. **Async Processing**: Long-running operations are handled asynchronously

### Latency Reduction

To achieve the <500ms target latency:

1. **Frontend**:
   - Use Web Audio API for efficient audio processing
   - Process audio in small chunks (100ms)
   - Use WebSockets for bidirectional communication
   - Implement client-side caching

2. **Backend**:
   - Use fast transcription APIs (Whisper, DeepL)
   - Implement efficient caching
   - Use non-blocking I/O
   - Optimize database queries

3. **Network**:
   - Use efficient data formats (binary, compression)
   - Implement protocol buffering
   - Use CDN for static assets

## Supported Languages

The feature supports the following languages:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Bengali (bn)
- Punjabi (pa)
- Turkish (tr)
- Dutch (nl)
- Swedish (sv)
- Finnish (fi)
- Danish (da)
- Norwegian (no)

Additional languages can be added by extending the configuration.

## Security Considerations

1. **Authentication**: All API endpoints should be protected with appropriate authentication
2. **Authorization**: Ensure users can only access subtitles for events they have permission to view
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: Validate all inputs to prevent injection attacks
5. **HTTPS**: Use HTTPS for all connections, especially for microphone access
6. **CORS**: Configure CORS appropriately for your deployment

## Monitoring and Analytics

### Metrics

The feature tracks the following metrics:

- **Frontend**:
  - Audio capture latency
  - Transcription latency
  - Translation latency
  - End-to-end latency
  - Error rates
  - Active connections

- **Backend**:
  - Subtitle creation rate
  - API response times
  - SSE connection count
  - Cache hit rates
  - Error rates

### Statistics API

```javascript
// Get event statistics
GET /api/v1/subtitles/event/{eventId}/statistics

// Response:
{
  "eventId": 123,
  "totalCount": 45,
  "displayedCount": 40,
  "averageConfidence": 0.92,
  "averageLatency": 350,
  "lastLatency": 320,
  "languageDistribution": {
    "en": 10,
    "es": 15,
    "fr": 20
  },
  "providerDistribution": {
    "whisper": 30,
    "google": 15
  },
  "uniqueLanguageCount": 3,
  "uniqueProviderCount": 2,
  "totalDurationMs": 225000,
  "averageDurationMs": 5000
}
```

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**: Ensure the site has permission to access the microphone and is served over HTTPS
2. **No Audio Data**: Check if the microphone is working and the correct device is selected
3. **High Latency**: Check network conditions and API response times; consider using a faster provider
4. **Translation Errors**: Verify the translation provider is properly configured and the API is accessible
5. **SSE Connection Issues**: Check if the server supports SSE and there are no network restrictions

### Debugging

Enable debug logging:

```javascript
// Frontend
import { audioCaptureService, transcriptionService, translationService } from './components/subtitles';

audioCaptureService.setOnError(err => console.error('Audio error:', err));
transcriptionService.setOnError(err => console.error('Transcription error:', err));
translationService.setOnError(err => console.error('Translation error:', err));

// Check stats
console.log(audioCaptureService.getStats());
console.log(transcriptionService.getStats());
console.log(translationService.getStats());
```

## Testing

### Unit Tests

Frontend tests can be written using Jest/Vitest:

```javascript
import { transcriptionService } from './services/transcriptionService';

describe('TranscriptionService', () => {
  it('should process audio data correctly', () => {
    // Test implementation
  });
  
  it('should handle multiple chunks', () => {
    // Test implementation
  });
});
```

Backend tests using Spring Boot Test:

```java
@SpringBootTest
class SubtitleServiceTest {
    
    @Autowired
    private SubtitleService subtitleService;
    
    @Test
    void testCreateSubtitle() {
        // Test implementation
    }
    
    @Test
    void testGetSubtitlesByEvent() {
        // Test implementation
    }
}
```

### Integration Tests

Test the complete flow:

1. Start audio capture
2. Process audio through transcription
3. Translate the text
4. Display subtitles
5. Verify latency is <500ms

### E2E Tests

Use Playwright or similar tools to test the user experience:

1. Navigate to an event page
2. Enable subtitles
3. Verify subtitles appear
4. Change language
5. Verify translation

## Future Enhancements

1. **Offline Support**: Add offline transcription/translation using WebAssembly models
2. **Multi-Speaker Detection**: Identify and separate different speakers
3. **Speaker Diarization**: Attribute subtitles to specific speakers
4. **Custom Vocabulary**: Allow organizers to provide custom vocabulary for better transcription
5. **Subtitle Styling**: Add more styling options (fonts, colors, animations)
6. **Positioning**: Support for custom positioning in AR mode
7. **Accessibility**: Add closed captions (CC) support
8. **Recording**: Allow recording and replaying subtitles
9. **Moderation**: Add real-time moderation for inappropriate content
10. **Analytics**: Enhanced analytics and insights for organizers

## Contributing

1. Follow the existing code style and conventions
2. Add appropriate tests for new functionality
3. Update documentation as needed
4. Ensure the feature works across different browsers and devices
5. Optimize for performance and low latency

## License

This feature is part of Eventra and is licensed under the Apache License 2.0.

## Support

For issues or questions:
- Open a GitHub issue
- Check the documentation
- Join the community discussions

## Changelog

### v1.0.0 (Initial Release)
- Basic audio capture and processing
- Transcription service integration
- Translation service integration
- Subtitle display components
- SSE streaming backend
- Session management
- Statistics tracking

---

This comprehensive guide provides everything needed to understand, set up, and use the Real-Time Multilingual AR Subtitles feature in Eventra.
