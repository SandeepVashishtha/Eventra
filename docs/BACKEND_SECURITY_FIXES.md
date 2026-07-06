# Backend Security Fixes Implementation Guide

This document provides detailed specifications for implementing critical backend security fixes for issues #10151, #10152, #10154, and #10155.

---

## Issue #10152: Draft Events Visibility to Unauthenticated Users

### Problem
The `GET /api/events` endpoint returns all events including unpublished drafts with sensitive information (internal notes, preliminary pricing, confidential speaker negotiations) to unauthenticated users.

### Root Cause
Event repository queries don't filter by status. All rows are returned regardless of publication state.

### Implementation Specification

#### Database/ORM Layer (Spring Data JPA / TypeORM / Prisma)

```java
// EventRepository.java
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Public listing: only PUBLISHED events
    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' " +
           "ORDER BY e.startDate ASC")
    Page<Event> findAllPublished(Pageable pageable);
    
    // Authenticated user: their own drafts + all published
    @Query("SELECT e FROM Event e WHERE " +
           "e.status = 'PUBLISHED' OR " +
           "(e.status = 'DRAFT' AND e.organiserId = :userId) " +
           "ORDER BY e.startDate ASC")
    Page<Event> findVisibleToUser(@Param("userId") Long userId, Pageable pageable);
    
    // Admin: all events
    Page<Event> findAll(Pageable pageable);
}
```

#### API Controller Implementation

```java
@GetMapping("/api/events")
public ResponseEntity<?> listEvents(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestHeader(required = false) String authorization) {
    
    Pageable pageable = PageRequest.of(page, size);
    Page<Event> events;
    
    // Check if user is authenticated
    Long userId = extractUserIdFromToken(authorization);
    
    if (userId != null) {
        // Return user's own drafts + all published events
        events = eventRepository.findVisibleToUser(userId, pageable);
    } else {
        // Unauthenticated: only published events
        events = eventRepository.findAllPublished(pageable);
    }
    
    return ResponseEntity.ok(events);
}

@GetMapping("/api/events/{id}")
public ResponseEntity<?> getEventDetail(@PathVariable Long id) {
    Event event = eventRepository.findById(id).orElseThrow();
    
    // Non-authenticated users can't view draft events
    if ("DRAFT".equals(event.getStatus()) && !isOwner(event)) {
        throw new ResourceNotFoundException("Event not found");
    }
    
    return ResponseEntity.ok(event);
}
```

#### API Response Status Codes
- `200 OK`: Successfully returned published events
- `401 Unauthorized`: Invalid or expired token (if auth header provided)
- `404 Not Found`: Draft event requested by non-owner (looks like it doesn't exist)

### Testing Strategy
1. **Unauthenticated GET /api/events**: Should return only PUBLISHED events
2. **Unauthenticated GET /api/events/{draft-id}**: Should return 404
3. **Authenticated GET /api/events**: Should return user's DRAFT events + all PUBLISHED
4. **Authenticated GET /api/events/{own-draft-id}**: Should return user's draft
5. **Authenticated GET /api/events/{other-draft-id}**: Should return 404

### Impact
- Confidential pricing strategies remain private until publication
- Speaker negotiations/details not prematurely exposed
- Organizers can prepare events without public visibility

---

## Issue #10151: Weak Hardcoded JWT Signing Key

### Problem
JWT signing key is a short static string in `application.properties`, allowing token forgery for any user.

### Root Cause
- Static, human-readable secret in source code
- Short length (easily brute-forced)
- Not rotated between deployments

### Implementation Specification

#### Configuration Management

```yaml
# application.yml
app:
  jwt:
    secret: ${JWT_SECRET}  # Must be ≥32 chars, random
    algorithm: HS256
    expiration-ms: ${JWT_EXPIRATION_MS:86400000}  # 24 hours default
    refresh-expiration-ms: ${JWT_REFRESH_EXPIRATION_MS:604800000}  # 7 days
```

```properties
# .env or deployment secrets manager
JWT_SECRET=<256-bit random base64 string>
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000
```

#### Generate Strong Secret
```bash
# On deployment/startup:
openssl rand -base64 64  # Produces ~86 base64 chars (512+ bits)
```

#### Validation on Startup

```java
@Component
public class JwtConfigValidator {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @PostConstruct
    public void validateJwtConfiguration() {
        // Validate secret length
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalStateException(
                "JWT_SECRET environment variable must be set");
        }
        
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 characters. Current: " + 
                jwtSecret.length() + " chars");
        }
        
        // Warn if looks like default/test value
        if (jwtSecret.equals("eventraSecret") || 
            jwtSecret.equals("secret") ||
            jwtSecret.length() < 44) {
            throw new IllegalStateException(
                "JWT_SECRET appears to be a default/weak value. " +
                "Generate with: openssl rand -base64 64");
        }
        
        logger.info("JWT configuration validated: secret length=" + 
                    jwtSecret.length());
    }
}
```

#### Update Token Generation
```java
@Service
public class JwtService {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;
    
    public String generateToken(User user) {
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("userId", user.getId())
            .claim("roles", user.getRoles())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS256, jwtSecret)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### Deployment Checklist
- [ ] Remove hardcoded secret from source code
- [ ] Generate new JWT_SECRET using `openssl rand -base64 64`
- [ ] Set JWT_SECRET in production secrets manager
- [ ] Configure JWT expiration times appropriately
- [ ] Invalidate all existing tokens (force re-login)
- [ ] Update deployment documentation with secret generation steps
- [ ] Test token generation and validation with new secret
- [ ] Monitor failed token validations in logs

### Impact
- Prevents JWT forgery attacks
- Credentials cannot be reversed-engineered from repository
- Supports key rotation for additional security

---

## Issue #10154: Event Cancellation Doesn't Notify Attendees

### Problem
When events are cancelled, registered attendees receive no notification and may attempt to attend or miss refund deadlines.

### Implementation Specification

#### Notification Service

```java
@Service
public class EventNotificationService {
    
    private final EmailService emailService;
    private final RegistrationRepository registrationRepository;
    private final NotificationPreferenceRepository prefRepository;
    
    /**
     * Send cancellation notice to all registered attendees
     */
    public void notifyEventCancellation(Event event) {
        List<Registration> registrations = registrationRepository
            .findActiveByEventId(event.getId());
        
        for (Registration registration : registrations) {
            User attendee = registration.getAttendee();
            
            // Check notification preferences
            if (shouldNotify(attendee, NotificationType.EVENT_CANCELLED)) {
                sendCancellationEmail(attendee, event, registration);
                createInAppNotification(attendee, event);
            }
        }
        
        logger.info("Cancellation notifications sent to {} attendees", 
                    registrations.size());
    }
    
    private void sendCancellationEmail(User attendee, Event event, 
                                       Registration registration) {
        String subject = "Event Cancelled: " + event.getTitle();
        String body = buildCancellationEmailBody(event, registration);
        emailService.sendEmail(attendee.getEmail(), subject, body);
    }
    
    private String buildCancellationEmailBody(Event event, 
                                              Registration registration) {
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(event.getAttendee().getName()).append(",\n\n");
        body.append("We regret to inform you that the following event has been cancelled:\n\n");
        body.append("Event: ").append(event.getTitle()).append("\n");
        body.append("Original Date: ").append(event.getStartDate()).append("\n");
        body.append("Organiser: ").append(event.getOrganiser().getName()).append("\n\n");
        
        if (registration.isPaid()) {
            body.append("You will receive a full refund to your original payment method.\n");
            body.append("Refund Timeline: 5-7 business days\n\n");
        }
        
        body.append("If you have questions, please contact the organiser directly.\n\n");
        body.append("Best regards,\nEventra Team");
        
        return body.toString();
    }
    
    private void createInAppNotification(User attendee, Event event) {
        Notification notification = new Notification();
        notification.setUser(attendee);
        notification.setType(NotificationType.EVENT_CANCELLED);
        notification.setTitle("Event Cancelled: " + event.getTitle());
        notification.setMessage("The event you registered for has been cancelled.");
        notification.setRelatedEventId(event.getId());
        notification.setCreatedAt(new Date());
        
        notificationRepository.save(notification);
    }
    
    private boolean shouldNotify(User user, NotificationType type) {
        NotificationPreference pref = prefRepository
            .findByUserAndType(user, type)
            .orElse(null);
        
        return pref == null || pref.isEnabled();
    }
}
```

#### Integration in Event Service

```java
@Service
@Transactional
public class EventService {
    
    private final EventRepository eventRepository;
    private final EventNotificationService notificationService;
    
    public void cancelEvent(Long eventId, Long organiserId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
        
        // Verify ownership
        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new UnauthorizedException("Not event organiser");
        }
        
        // Update event status
        event.setStatus(EventStatus.CANCELLED);
        event.setCancelledAt(new Date());
        event.setCancelledBy(organiserId);
        eventRepository.save(event);
        
        // Notify all registered attendees
        notificationService.notifyEventCancellation(event);
        
        logger.info("Event {} cancelled by organiser {}. {} attendees notified.",
                    eventId, organiserId, 
                    registrationRepository.countByEventId(eventId));
    }
}
```

### Database Schema Updates
```sql
ALTER TABLE events ADD COLUMN cancelled_at TIMESTAMP NULL;
ALTER TABLE events ADD COLUMN cancelled_by BIGINT NULL;
ALTER TABLE events ADD FOREIGN KEY (cancelled_by) REFERENCES users(id);

CREATE TABLE notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_type (user_id, notification_type)
);
```

### Testing
- [ ] Verify email sent to all registered attendees on cancellation
- [ ] Confirm in-app notifications created for attendees
- [ ] Test notification preferences (users can disable certain notifications)
- [ ] Validate email contains event details and refund information
- [ ] Check that only the organiser can cancel events

### Impact
- Attendees informed of cancellations promptly
- Reduces confusion and wasted travel time
- Supports refund processing and customer service
- Improves platform reputation and trust

---

## Issue #10155: Event Attachments Lost on Server Restart

### Problem
File attachments stored on local filesystem are lost when container restarts, causing 404 errors for attendees trying to download agendas, flyers, etc.

### Implementation Specification

#### S3 Configuration

```yaml
# application.yml
cloud:
  aws:
    s3:
      bucket-name: ${AWS_S3_BUCKET:eventra-files}
      region: ${AWS_S3_REGION:us-east-1}
    credentials:
      access-key: ${AWS_ACCESS_KEY_ID}
      secret-key: ${AWS_SECRET_ACCESS_KEY}

app:
  file-upload:
    max-size-mb: 50
    allowed-types: pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif
```

#### File Storage Service

```java
@Service
public class S3FileStorageService implements FileStorageService {
    
    private final AmazonS3 s3Client;
    private final String bucketName;
    private final long maxFileSizeBytes;
    
    @Autowired
    public S3FileStorageService(AmazonS3 s3Client,
                                @Value("${cloud.aws.s3.bucket-name}") String bucketName,
                                @Value("${app.file-upload.max-size-mb}") int maxSizeMb) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.maxFileSizeBytes = maxSizeMb * 1024 * 1024L;
    }
    
    /**
     * Upload event attachment to S3
     */
    @Override
    public String uploadAttachment(MultipartFile file, Long eventId) 
            throws FileStorageException {
        
        // Validate file
        if (file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }
        
        if (file.getSize() > maxFileSizeBytes) {
            throw new FileStorageException("File exceeds maximum size");
        }
        
        String originalFilename = file.getOriginalFilename();
        String sanitizedFilename = sanitizeFilename(originalFilename);
        
        // Generate unique S3 key: events/{eventId}/{uuid}_{filename}
        String s3Key = String.format("events/%d/%s_%s",
            eventId,
            UUID.randomUUID().toString(),
            sanitizedFilename);
        
        try {
            // Upload to S3 with metadata
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            metadata.addUserMetadata("eventId", String.valueOf(eventId));
            metadata.addUserMetadata("uploadedAt", new Date().toString());
            
            s3Client.putObject(new PutObjectRequest(bucketName, s3Key, 
                file.getInputStream(), metadata));
            
            // Return S3 URL
            return generateDownloadUrl(s3Key);
            
        } catch (IOException | AmazonServiceException e) {
            throw new FileStorageException("Failed to upload file to S3", e);
        }
    }
    
    /**
     * Generate presigned download URL (10 minute expiration)
     */
    @Override
    public String generateDownloadUrl(String s3Key) {
        Date expiration = new Date();
        expiration.setTime(expiration.getTime() + 10 * 60 * 1000); // 10 minutes
        
        GeneratePresignedUrlRequest generatePresignedUrlRequest = 
            new GeneratePresignedUrlRequest(bucketName, s3Key)
                .withMethod(HttpMethod.GET)
                .withExpiration(expiration);
        
        URL url = s3Client.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }
    
    /**
     * Delete attachment when event is deleted
     */
    @Override
    public void deleteAttachment(String s3Key) throws FileStorageException {
        try {
            s3Client.deleteObject(bucketName, s3Key);
        } catch (AmazonServiceException e) {
            throw new FileStorageException("Failed to delete file from S3", e);
        }
    }
    
    private String sanitizeFilename(String filename) {
        // Remove path traversal attempts and special characters
        return filename
            .replaceAll("\\.\\.[\\\\/]", "")  // Remove ../
            .replaceAll("[^a-zA-Z0-9._-]", "_")  // Replace special chars
            .replaceAll("_{2,}", "_");  // Collapse multiple underscores
    }
}
```

#### Integration in Event Service

```java
@Service
public class EventService {
    
    private final FileStorageService fileStorageService;
    private final EventRepository eventRepository;
    
    /**
     * Upload event attachment and store reference
     */
    public EventAttachment uploadAttachment(Long eventId, MultipartFile file, 
                                           String type) throws FileStorageException {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
        
        // Upload file to S3
        String s3Url = fileStorageService.uploadAttachment(file, eventId);
        
        // Create attachment record
        EventAttachment attachment = new EventAttachment();
        attachment.setEvent(event);
        attachment.setType(AttachmentType.valueOf(type.toUpperCase()));
        attachment.setOriginalFilename(file.getOriginalFilename());
        attachment.setS3Url(s3Url);
        attachment.setMimeType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setUploadedAt(new Date());
        
        return attachmentRepository.save(attachment);
    }
    
    /**
     * Delete event and all S3 attachments
     */
    @Transactional
    public void deleteEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
        
        // Delete all S3 attachments
        List<EventAttachment> attachments = attachmentRepository
            .findByEventId(eventId);
        
        for (EventAttachment attachment : attachments) {
            try {
                fileStorageService.deleteAttachment(attachment.getS3Key());
            } catch (FileStorageException e) {
                logger.warn("Failed to delete S3 file: {}", 
                           attachment.getS3Key(), e);
                // Continue with other deletions
            }
        }
        
        eventRepository.delete(event);
    }
}
```

### Database Schema
```sql
CREATE TABLE event_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,  -- AGENDA, FLYER, SPEAKER_BIO, etc.
    original_filename VARCHAR(255) NOT NULL,
    s3_url TEXT NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
);
```

### Deployment Checklist
- [ ] Create AWS S3 bucket with appropriate permissions
- [ ] Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in environment
- [ ] Configure bucket lifecycle policies (backup to Glacier after 90 days)
- [ ] Enable versioning on S3 bucket for disaster recovery
- [ ] Set up CloudFront CDN for faster downloads
- [ ] Migrate existing local files to S3
- [ ] Update file download endpoints to serve from S3
- [ ] Test presigned URL expiration (10 minutes)
- [ ] Monitor S3 costs and set up billing alerts

### Impact
- Attachments persist across deployments and restarts
- Highly available with AWS S3 (99.99% uptime SLA)
- Automatic redundancy and backup
- Scalable to millions of files
- Reduced server storage and bandwidth costs

---

## Implementation Priority

1. **#10152 (Draft visibility)** - High security risk, high impact
2. **#10151 (JWT secret)** - Critical: enables complete account takeover  
3. **#10154 (Cancellation notification)** - High impact on user experience
4. **#10155 (File storage)** - High impact on service reliability
5. **#10153** - Already implemented in PR #10331 (Frontend component + validation)

## Testing Strategy

All implementations should include:
- Unit tests for service logic
- Integration tests with mock S3/email services
- E2E tests for critical user flows
- Security tests (authorization, validation)
- Performance tests (file upload, concurrent requests)

## Deployment Order

1. Deploy #10152 (visibility filter)
2. Deploy #10151 (JWT secret management)
3. Deploy #10154 (notifications)
4. Migrate files to S3 and deploy #10155
5. No changes needed for #10153 (frontend-only)
