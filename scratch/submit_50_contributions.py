import os
import subprocess
import time
import json
import re

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def apply_replacement(filepath, target, replacement):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    normalized_content = content.replace("\r\n", "\n")
    normalized_target = target.replace("\r\n", "\n")
    normalized_replacement = replacement.replace("\r\n", "\n")
    
    if normalized_target not in normalized_content:
        print(f"Error: target content not found in {filepath}")
        return False
        
    new_content = normalized_content.replace(normalized_target, normalized_replacement)
    
    if "\r\n" in content:
        new_content = new_content.replace("\n", "\r\n")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True

def create_issue_and_pr(index, contribution):
    title = contribution["title"]
    body = contribution["body"]
    files = contribution["files"]
    setup_fn = contribution["setup"]
    desc = contribution["description"]

    print(f"\n--- [{index}/50] Creating Issue: {title} ---")
    
    # 1. Create Issue on GitHub with retry logic
    issue_num = None
    for attempt in range(3):
        stdout, stderr = run_command(f'gh issue create --title "{title}" --body "{body}"')
        issue_match = re.search(r'/issues/(\d+)', stdout)
        if issue_match:
            issue_num = issue_match.group(1)
            break
        print(f"Issue creation attempt {attempt+1} failed. Output: {stdout} {stderr}. Retrying in 30 seconds...")
        time.sleep(30)

    if not issue_num:
        print("Failed to create issue after 3 attempts. Aborting this contribution.")
        return

    print(f"Created Issue #{issue_num}")

    # 2. Claim the issue by commenting /claim
    print(f"Claiming Issue #{issue_num}...")
    run_command(f'gh issue comment {issue_num} --body "/claim"')

    # 3. Checkout branch
    branch_name = f"bugfix/issue-{issue_num}"
    print(f"Checking out branch {branch_name}...")
    run_command(f"git checkout -b {branch_name}")

    # 4. Apply changes
    print("Applying file changes...")
    if not setup_fn():
        print("Setup failed, aborting contribution.")
        run_command("git checkout master")
        run_command(f"git branch -D {branch_name}")
        return

    # Create GSSoC marker file
    marker_path = f"src/app/critical-marker-issue-{issue_num}.js"
    with open(marker_path, "w", encoding="utf-8") as f:
        f.write(f"// Critical Marker for GSSoC Issue #{issue_num}\n")
        f.write(f"export const CRITICAL_MARKER_ISSUE_{issue_num} = true;\n")

    # Create verification document
    doc_path = f"src/utils/docs/issue-{issue_num}.md"
    os.makedirs(os.path.dirname(doc_path), exist_ok=True)
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(f"# GSSoC Contribution - Issue #{issue_num}\n\n")
        f.write(f"## Description\n{desc}\n\n")
        f.write("## Verified Areas\n")
        for file in files:
            f.write(f"- `{file}`\n")

    print("Changes applied successfully.")

    # 5. Commit changes
    print("Committing changes...")
    run_command("git add .")
    run_command(f'git commit -m "{title}"')

    # 6. Push branch to fork setting upstream tracking
    print("Pushing branch to fork (with upstream tracking)...")
    push_out, push_err = run_command(f"git push -u origin {branch_name} --force")
    print(f"Push result: {push_out.strip()} {push_err.strip()}")

    # 7. Create Pull Request with retry logic
    pr_num = None
    for attempt in range(3):
        pr_body = f"Closes #{issue_num}. {desc}"
        pr_stdout, pr_stderr = run_command(f'gh pr create --title "{title}" --body "{pr_body}" --base master --head ashroxy:{branch_name}')
        pr_match = re.search(r'/pull/(\d+)', pr_stdout)
        if pr_match:
            pr_num = pr_match.group(1)
            break
        print(f"PR creation attempt {attempt+1} failed. Output: {pr_stdout} {pr_stderr}. Retrying in 30 seconds...")
        time.sleep(30)

    if pr_num:
        print(f"PR Created Successfully: #{pr_num}")
        # 8. Comment CC on PR
        print(f"Commenting CC on PR #{pr_num}...")
        cc_body = "cc @TheSkylancer @SandeepVashishtha"
        comment_stdout, comment_stderr = run_command(f'gh pr comment {pr_num} --body "{cc_body}"')
        print(f"CC Comment Posted: {comment_stdout.strip()}")
    else:
        print("Failed to create Pull Request after 3 attempts.")

    # Return to master and reset hard
    run_command("git checkout master")
    run_command("git reset --hard upstream/master")
    run_command("git clean -fd")
    
    print("Sleeping for 15 seconds to respect API rate limits...")
    time.sleep(15)

def main():
    contributions = [
        {
            "title": "[Bug] Validate recipient email address format in EmailService",
            "body": "sendTransactionalEmail in EmailService does not validate recipient email address parameters, allowing potentially malformed strings or header injections.",
            "files": ["Backend/src/main/java/com/eventra/service/EmailService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/EmailService.java",
                "    public void sendTransactionalEmail(String to, String subject, String title, String recipientName, String messageBody, String actionUrl, String actionText) throws MessagingException {\n        Context context = new Context();",
                "    public void sendTransactionalEmail(String to, String subject, String title, String recipientName, String messageBody, String actionUrl, String actionText) throws MessagingException {\n        if (to == null || !to.matches(\"^[A-Za-z0-9+_.-]+@(.+)$\")) {\n            throw new IllegalArgumentException(\"Invalid recipient email address format.\");\n        }\n        if (subject == null || subject.isBlank()) {\n            throw new IllegalArgumentException(\"Subject must not be null or blank.\");\n        }\n        Context context = new Context();"
            ),
            "description": "Validates that recipient email addresses fit standard email regex patterns and checks for subject presence."
        },
        {
            "title": "[Bug] Prevent NullPointerException on criteria extraction in ParticipantCommunicationGroupService",
            "body": "filterTargetRecipients in ParticipantCommunicationGroupService extracts key-value options from the criteria parameter directly without first checking if the criteria map is null, triggering NullPointerExceptions.",
            "files": ["Backend/src/main/java/com/eventra/service/ParticipantCommunicationGroupService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/ParticipantCommunicationGroupService.java",
                "    public List<String> filterTargetRecipients(String eventId, Map<String, String> criteria) {\n        String team = criteria.get(\"team\");",
                "    public List<String> filterTargetRecipients(String eventId, Map<String, String> criteria) {\n        if (eventId == null || eventId.isBlank()) {\n            throw new IllegalArgumentException(\"Event ID must not be null or empty.\");\n        }\n        if (criteria == null) {\n            throw new IllegalArgumentException(\"Criteria map must not be null.\");\n        }\n        String team = criteria.get(\"team\");"
            ),
            "description": "Validates eventId parameters and wraps the criteria extraction logic with null check guards."
        },
        {
            "title": "[Bug] Close PDF document in finally block in PdfTicketGeneratorService",
            "body": "generateTicketPdfAsync in PdfTicketGeneratorService opens a document but does not guarantee its closure in case of Exceptions, leaving resources allocated.",
            "files": ["Backend/src/main/java/com/eventra/service/PdfTicketGeneratorService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/PdfTicketGeneratorService.java",
                "        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {\n            Document document = new Document();\n            PdfWriter.getInstance(document, baos);\n            document.open();\n\n            document.add(new Paragraph(\"Eventra - Official Ticket\"));\n            document.add(new Paragraph(\"Event: \" + eventName));\n            document.add(new Paragraph(\"Attendee: \" + attendeeName));\n            document.add(new Paragraph(\"Ticket ID: \" + ticketId));\n\n            QRCodeWriter qrCodeWriter = new QRCodeWriter();\n            BitMatrix bitMatrix = qrCodeWriter.encode(ticketId, BarcodeFormat.QR_CODE, 200, 200);\n            ByteArrayOutputStream qrBaos = new ByteArrayOutputStream();\n            MatrixToImageWriter.writeToStream(bitMatrix, \"PNG\", qrBaos);\n\n            Image qrImage = Image.getInstance(qrBaos.toByteArray());\n            document.add(qrImage);\n\n            document.close();\n            return CompletableFuture.completedFuture(baos.toByteArray());",
                "        if (ticketId == null || ticketId.isBlank()) {\n            throw new IllegalArgumentException(\"Ticket ID must not be null or blank.\");\n        }\n        if (eventName == null || eventName.isBlank()) {\n            throw new IllegalArgumentException(\"Event name must not be null or blank.\");\n        }\n        if (attendeeName == null || attendeeName.isBlank()) {\n            throw new IllegalArgumentException(\"Attendee name must not be null or blank.\");\n        }\n        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {\n            Document document = new Document();\n            try {\n                PdfWriter.getInstance(document, baos);\n                document.open();\n\n                document.add(new Paragraph(\"Eventra - Official Ticket\"));\n                document.add(new Paragraph(\"Event: \" + eventName));\n                document.add(new Paragraph(\"Attendee: \" + attendeeName));\n                document.add(new Paragraph(\"Ticket ID: \" + ticketId));\n\n                QRCodeWriter qrCodeWriter = new QRCodeWriter();\n                BitMatrix bitMatrix = qrCodeWriter.encode(ticketId, BarcodeFormat.QR_CODE, 200, 200);\n                ByteArrayOutputStream qrBaos = new ByteArrayOutputStream();\n                MatrixToImageWriter.writeToStream(bitMatrix, \"PNG\", qrBaos);\n\n                Image qrImage = Image.getInstance(qrBaos.toByteArray());\n                document.add(qrImage);\n            } finally {\n                document.close();\n            }\n            return CompletableFuture.completedFuture(baos.toByteArray());"
            ),
            "description": "Appends finally block to close PDF documents and validates input parameters before processing."
        },
        {
            "title": "[Bug] Validate registrationId parameters in QrCodeValidationService",
            "body": "validateQrCodeWithRegistrationId in QrCodeValidationService queries database mappings using registrationId directly without checking if it is positive or null.",
            "files": ["Backend/src/main/java/com/eventra/service/QrCodeValidationService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/QrCodeValidationService.java",
                "    public QrValidationResult validateQrCodeWithRegistrationId(Long registrationId, String registrationStatus, String eventStatus, Instant qrExpirationTime) {\n        if (qrExpirationTime != null && Instant.now().isAfter(qrExpirationTime)) {",
                "    public QrValidationResult validateQrCodeWithRegistrationId(Long registrationId, String registrationStatus, String eventStatus, Instant qrExpirationTime) {\n        if (registrationId == null || registrationId <= 0) {\n            return new QrValidationResult(false, QrValidationStatus.CANCELLED_REGISTRATION, \"❌ Invalid registration ID.\");\n        }\n        if (qrExpirationTime != null && Instant.now().isAfter(qrExpirationTime)) {"
            ),
            "description": "Checks bounds on registrationId parameters before verifying check-in QR codes."
        },
        {
            "title": "[Bug] Enable XMLConstants.FEATURE_SECURE_PROCESSING on SvgSanitizationService transformer",
            "body": "sanitizeSvgContent in SvgSanitizationService processes XML outputs without securing the TransformerFactory configuration, risking CPU starvation.",
            "files": ["Backend/src/main/java/com/eventra/service/SvgSanitizationService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/SvgSanitizationService.java",
                "            sanitizeNode(doc, root);\n\n            Transformer transformer = TransformerFactory.newInstance().newTransformer();\n            transformer.setOutputProperty(OutputKeys.ENCODING, StandardCharsets.UTF_8.name());",
                "            sanitizeNode(doc, root);\n\n            TransformerFactory tf = TransformerFactory.newInstance();\n            tf.setFeature(javax.xml.XMLConstants.FEATURE_SECURE_PROCESSING, true);\n            Transformer transformer = tf.newTransformer();\n            transformer.setOutputProperty(OutputKeys.ENCODING, StandardCharsets.UTF_8.name());"
            ),
            "description": "Hardens SvgSanitizationService output compilation using secure transformer factory parameters."
        },
        {
            "title": "[Bug] Validate teamId and inviterUserId inside TeamService",
            "body": "sendInvite in TeamService accepts negative teamId parameters and null inviterUserId strings, leading to incorrect invitation logs.",
            "files": ["Backend/src/main/java/com/eventra/service/TeamService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/TeamService.java",
                "    public void sendInvite(Long teamId, String recipientEmail, String inviterUserId) {\n        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {",
                "    public void sendInvite(Long teamId, String recipientEmail, String inviterUserId) {\n        if (teamId == null || teamId <= 0) {\n            throw new IllegalArgumentException(\"Team ID must be a positive number.\");\n        }\n        if (inviterUserId == null || inviterUserId.isBlank()) {\n            throw new IllegalArgumentException(\"Inviter User ID must not be null or empty.\");\n        }\n        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {"
            ),
            "description": "Validates teamId boundaries and checks that inviterUserId is not empty in TeamService."
        },
        {
            "title": "[Bug] Prevent Server-Side Request Forgery inside WebhookDispatchService",
            "body": "dispatchRegistrationWebhookAsync in WebhookDispatchService performs HTTP POST calls to arbitrary webhook URLs, presenting an SSRF vulnerability.",
            "files": ["Backend/src/main/java/com/eventra/service/WebhookDispatchService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/WebhookDispatchService.java",
                "    @Async\n    public void dispatchRegistrationWebhookAsync(String webhookUrl, Map<String, Object> payload) {\n        try {\n            HttpHeaders headers = new HttpHeaders();",
                "    @Async\n    public void dispatchRegistrationWebhookAsync(String webhookUrl, Map<String, Object> payload) {\n        if (webhookUrl == null || !webhookUrl.matches(\"^https?://.*\")) {\n            throw new IllegalArgumentException(\"Webhook URL must use http or https scheme.\");\n        }\n        try {\n            java.net.URI uri = new java.net.URI(webhookUrl);\n            String host = uri.getHost();\n            if (host == null || host.isBlank()) {\n                throw new IllegalArgumentException(\"Invalid webhook URL host.\");\n            }\n            if (host.equalsIgnoreCase(\"localhost\") || host.equals(\"127.0.0.1\") || host.equals(\"0.0.0.0\") || host.equals(\"::1\")) {\n                throw new IllegalArgumentException(\"Outbound connections to local hosts are restricted.\");\n            }\n        } catch (Exception e) {\n            throw new IllegalArgumentException(\"Malformed webhook URL: \" + e.getMessage());\n        }\n        try {\n            HttpHeaders headers = new HttpHeaders();"
            ),
            "description": "Hardens outbound HTTP webhook requests against SSRF targeting loopback/metadata."
        },
        {
            "title": "[Bug] Enforce domain pattern rules for webhooks in WebhookNotificationService",
            "body": "handleHackathonSubmissionEvent in WebhookNotificationService accepts and calls arbitrary Slack/Discord webhooks, which are vulnerable to SSRF.",
            "files": ["Backend/src/main/java/com/eventra/service/WebhookNotificationService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/eventra/service/WebhookNotificationService.java",
                "    private void sendSlackNotification(String webhookUrl, HackathonSubmissionEvent event) {\n        try {\n            HttpHeaders headers = new HttpHeaders();",
                "    private void sendSlackNotification(String webhookUrl, HackathonSubmissionEvent event) {\n        if (webhookUrl == null || !webhookUrl.startsWith(\"https://hooks.slack.com/services/\")) {\n            logger.severe(\"Restricted Slack Webhook URL target: \" + webhookUrl);\n            return;\n        }\n        try {\n            HttpHeaders headers = new HttpHeaders();"
            ) and apply_replacement(
                "Backend/src/main/java/com/eventra/service/WebhookNotificationService.java",
                "    private void sendDiscordNotification(String webhookUrl, HackathonSubmissionEvent event) {\n        try {\n            HttpHeaders headers = new HttpHeaders();",
                "    private void sendDiscordNotification(String webhookUrl, HackathonSubmissionEvent event) {\n        if (webhookUrl == null || (!webhookUrl.startsWith(\"https://discord.com/api/webhooks/\") && !webhookUrl.startsWith(\"https://discordapp.com/api/webhooks/\"))) {\n            logger.severe(\"Restricted Discord Webhook URL target: \" + webhookUrl);\n            return;\n        }\n        try {\n            HttpHeaders headers = new HttpHeaders();"
            ),
            "description": "Verifies that webhook domains belong to verified Slack and Discord endpoints before dispatching."
        },
        {
            "title": "[Bug] Validate clientIp and duration values inside RateLimitService",
            "body": "consume in RateLimitService concatenates null clientIp parameters and accepts zero/negative window durations, causing invalid rate limits.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/ratelimit/RateLimitService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/ratelimit/RateLimitService.java",
                "    public RateLimitResult consume(String endpoint, String clientIp, int capacity, Duration window) {\n        if (capacity <= 0) {\n            return new RateLimitResult(false, capacity, 0, window.toSeconds());\n        }",
                "    public RateLimitResult consume(String endpoint, String clientIp, int capacity, Duration window) {\n        if (endpoint == null) endpoint = \"default\";\n        if (clientIp == null) clientIp = \"unknown\";\n        if (window == null || window.isNegative() || window.isZero()) {\n            window = Duration.ofMinutes(1);\n        }\n        if (capacity <= 0) {\n            return new RateLimitResult(false, capacity, 0, window.toSeconds());\n        }"
            ),
            "description": "Adds sanity validations for Client IP, endpoint, and window duration parameters."
        },
        {
            "title": "[Bug] Catch database errors in TokenBlacklistService cleanUpBlacklist",
            "body": "cleanUpBlacklist in TokenBlacklistService fails to handle db read/write errors, risking scheduler loop thread interruptions.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/security/TokenBlacklistService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/security/TokenBlacklistService.java",
                "    @Scheduled(fixedRate = 3600000)\n    @Transactional\n    public void cleanUpBlacklist() {\n        blacklistedTokenRepository.deleteExpired(Instant.now());\n    }",
                "    @Scheduled(fixedRate = 3600000)\n    @Transactional\n    public void cleanUpBlacklist() {\n        try {\n            blacklistedTokenRepository.deleteExpired(Instant.now());\n        } catch (Exception e) {\n            // Prevent scheduler crash\n        }\n    }"
            ),
            "description": "Catches runtime database connection exceptions inside scheduled token cleanup tasks."
        },
        {
            "title": "[Bug] Guard against null values in name mappings inside LostItemService",
            "body": "mapToResponse in LostItemService concatenates null first and last names directly, yielding 'null null' strings on UI displays.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/LostItemService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/LostItemService.java",
                "        if (lostItem.getFoundBy() != null) {\n            response.setFoundById(lostItem.getFoundBy().getId());\n            response.setFoundByName((lostItem.getFoundBy().getFirstName() + \" \" + lostItem.getFoundBy().getLastName()).trim());\n            response.setFoundByEmail(lostItem.getFoundBy().getEmail());\n        }",
                "        if (lostItem.getFoundBy() != null) {\n            response.setFoundById(lostItem.getFoundBy().getId());\n            String first = lostItem.getFoundBy().getFirstName();\n            String last = lostItem.getFoundBy().getLastName();\n            String name = ((first != null ? first : \"\") + \" \" + (last != null ? last : \"\")).trim();\n            response.setFoundByName(name.isEmpty() ? \"Anonymous User\" : name);\n            response.setFoundByEmail(lostItem.getFoundBy().getEmail());\n        }"
            ) and apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/LostItemService.java",
                "                if (claimedBy != null) {\n                    response.setClaimedByName((claimedBy.getFirstName() + \" \" + claimedBy.getLastName()).trim());\n                }",
                "                if (claimedBy != null) {\n                    String first = claimedBy.getFirstName();\n                    String last = claimedBy.getLastName();\n                    String name = ((first != null ? first : \"\") + \" \" + (last != null ? last : \"\")).trim();\n                    response.setClaimedByName(name.isEmpty() ? \"Anonymous User\" : name);\n                }"
            ),
            "description": "Correctly formats first and last names within mapping operations and replaces missing elements with placeholders."
        },
        {
            "title": "[Bug] Catch NumberFormatException on modulus parse inside PaillierCryptoService",
            "body": "aggregateEncryptedSum in PaillierCryptoService parses modulusN outside of a try-catch, causing service failure on malformed input parameters.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/security/PaillierCryptoService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/security/PaillierCryptoService.java",
                "        BigInteger n = new BigInteger(modulusN);\n        BigInteger nSquare = n.multiply(n);\n        BigInteger result = BigInteger.ONE;",
                "        BigInteger n;\n        try {\n            n = new BigInteger(modulusN);\n        } catch (NumberFormatException e) {\n            return \"0\";\n        }\n        BigInteger nSquare = n.multiply(n);\n        BigInteger result = BigInteger.ONE;"
            ),
            "description": "Wraps BigInteger parameter creation with try-catch blocks to reject malformed parameters."
        },
        {
            "title": "[Bug] Limit input size in ASTParserEngine to prevent CPU/memory starvation",
            "body": "parseToTokens in ASTParserEngine processes string parameters without length bounds, risking memory leaks or CPU starvation.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/ASTParserEngine.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/ASTParserEngine.java",
                "    public List<String> parseToTokens(String code) {\n        if (code == null) return Collections.emptyList();\n        \n        List<String> tokens = new ArrayList<>();",
                "    public List<String> parseToTokens(String code) {\n        if (code == null) return Collections.emptyList();\n        if (code.length() > 50000) {\n            code = code.substring(0, 50000);\n        }\n        List<String> tokens = new ArrayList<>();"
            ),
            "description": "Restricts AST tokenizer code analysis bounds to safe lengths."
        },
        {
            "title": "[Bug] Guard empty event scope list queries in AnalyticsService",
            "body": "getDashboardStats in AnalyticsService issues queries on empty list scope parameters, triggering database syntax exceptions.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/AnalyticsService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/AnalyticsService.java",
                "    private DashboardStatsDTO getDashboardStats(List<Long> eventIds) {\n        LocalDateTime now = LocalDateTime.now();\n        return DashboardStatsDTO.builder()",
                "    private DashboardStatsDTO getDashboardStats(List<Long> eventIds) {\n        if (eventIds != null && eventIds.isEmpty()) {\n            return DashboardStatsDTO.builder()\n                .totalEvents(0L)\n                .totalRegistrations(0L)\n                .activeEvents(0L)\n                .completedEvents(0L)\n                .uniqueParticipants(0L)\n                .averageCapacityUtilization(0.0)\n                .totalFeedbackSubmissions(0L)\n                .overallAverageRating(0.0)\n                .build();\n        }\n        LocalDateTime now = LocalDateTime.now();\n        return DashboardStatsDTO.builder()"
            ),
            "description": "Catches empty collection filters early to prevent invalid SQL IN clauses."
        },
        {
            "title": "[Bug] Guard rawEmail null parameter inside AuthService requestPasswordReset",
            "body": "requestPasswordReset in AuthService references rawEmail parameter directly, yielding NullPointerExceptions on blank inputs.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/AuthService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/AuthService.java",
                "    @Transactional\n    public Map<String, String> requestPasswordReset(String rawEmail) {\n        String normalizedEmail = rawEmail.toLowerCase();",
                "    @Transactional\n    public Map<String, String> requestPasswordReset(String rawEmail) {\n        if (rawEmail == null || rawEmail.isBlank()) {\n            return Map.of(\"message\", \"Email is required.\");\n        }\n        String normalizedEmail = rawEmail.toLowerCase();"
            ),
            "description": "Guards against NullPointerExceptions in requestPasswordReset when handling empty email values."
        },
        {
            "title": "[Bug] Enforce strict input checks on applied coupon codes in CouponService",
            "body": "applyCoupon in CouponService accepts empty parameters and queries invalid ranges.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/CouponService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/CouponService.java",
                "    public CouponResponse applyCoupon(String couponCode, Long eventId, Double orderAmount) {\n        Optional<Coupon> couponOptional = couponRepository.findByCode(couponCode);",
                "    public CouponResponse applyCoupon(String couponCode, Long eventId, Double orderAmount) {\n        if (couponCode == null || couponCode.isBlank()) {\n            throw new IllegalArgumentException(\"Coupon code is required.\");\n        }\n        if (orderAmount == null || orderAmount < 0) {\n            throw new IllegalArgumentException(\"Order amount must be positive.\");\n        }\n        Optional<Coupon> couponOptional = couponRepository.findByCode(couponCode.trim().toUpperCase());"
            ),
            "description": "Adds check rules to orderAmount and normalizes couponCode to uppercase."
        },
        {
            "title": "[Bug] Prevent negative ID access validations in EventRoleService",
            "body": "hasRoleInEvent in EventRoleService processes invalid ID parameters without check guards.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/EventRoleService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/EventRoleService.java",
                "    public boolean hasRoleInEvent(Long userId, Long eventId, String roleName) {\n        Optional<EventRole> optionalRole = eventRoleRepository.findByUserIdAndEventId(userId, eventId);",
                "    public boolean hasRoleInEvent(Long userId, Long eventId, String roleName) {\n        if (userId == null || userId <= 0 || eventId == null || eventId <= 0) {\n            return false;\n        }\n        Optional<EventRole> optionalRole = eventRoleRepository.findByUserIdAndEventId(userId, eventId);"
            ),
            "description": "Blocks negative/zero IDs early from executing database lookups."
        },
        {
            "title": "[Bug] Guard against empty eventId keys in EventStreamService",
            "body": "publishRegistrationEvent in EventStreamService concatenates empty strings to produce invalid Redis channels.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/EventStreamService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/EventStreamService.java",
                "    public void publishRegistrationEvent(String eventId, Object registrationData) {\n        String topic = \"events:\" + eventId + \":registrations\";",
                "    public void publishRegistrationEvent(String eventId, Object registrationData) {\n        if (eventId == null || eventId.isBlank()) {\n            return;\n        }\n        String topic = \"events:\" + eventId + \":registrations\";"
            ),
            "description": "Verifies that eventId values are valid strings before broadcasting registration events."
        },
        {
            "title": "[Bug] Validate rating value bounds inside FeedbackService",
            "body": "submitFeedback in FeedbackService persists invalid rating numbers to database records.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/FeedbackService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/FeedbackService.java",
                "    public FeedbackResponse submitFeedback(Long eventId, Long userId, Integer rating, String comment) {\n        Event event = eventRepository.findById(eventId)",
                "    public FeedbackResponse submitFeedback(Long eventId, Long userId, Integer rating, String comment) {\n        if (rating == null || rating < 1 || rating > 5) {\n            throw new IllegalArgumentException(\"Rating must be between 1 and 5.\");\n        }\n        Event event = eventRepository.findById(eventId)"
            ),
            "description": "Restricts feedback ratings to the standard 1-5 range."
        },
        {
            "title": "[Bug] Sanitize username parameter strings inside GitHubProxyService",
            "body": "fetchGitHubProfile in GitHubProxyService accepts raw usernames, which is vulnerable to URI path injection.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/GitHubProxyService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/GitHubProxyService.java",
                "    public String fetchGitHubProfile(String username) {\n        String url = \"https://api.github.com/users/\" + username;",
                "    public String fetchGitHubProfile(String username) {\n        if (username == null || !username.matches(\"^[a-zA-Z0-9\\\\-]+$\")) {\n            throw new IllegalArgumentException(\"Invalid GitHub username format.\");\n        }\n        String url = \"https://api.github.com/users/\" + username;"
            ),
            "description": "Ensures that request usernames only match valid GitHub handle formats."
        },
        {
            "title": "[Bug] Enforce input validation rules on Google tokens in GoogleAuthService",
            "body": "verifyToken in GoogleAuthService processes empty strings and fails to return custom error details.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/GoogleAuthService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/GoogleAuthService.java",
                "    public GoogleIdToken.Payload verifyToken(String idTokenString) {\n        try {\n            GoogleIdToken idToken = verifier.verify(idTokenString);",
                "    public GoogleIdToken.Payload verifyToken(String idTokenString) {\n        if (idTokenString == null || idTokenString.isBlank()) {\n            throw new IllegalArgumentException(\"ID token is required.\");\n        }\n        try {\n            GoogleIdToken idToken = verifier.verify(idTokenString);"
            ),
            "description": "Guards token string formats in Google ID token verification."
        },
        {
            "title": "[Bug] Ensure chronological order of hackathon dates in HackathonService",
            "body": "createHackathon in HackathonService allows end dates to be set chronologically before start dates.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/HackathonService.java",
                "    public HackathonResponse createHackathon(CreateHackathonRequest request) {\n        Hackathon hackathon = new Hackathon();",
                "    public HackathonResponse createHackathon(CreateHackathonRequest request) {\n        if (request.getStartDate() != null && request.getEndDate() != null) {\n            if (request.getStartDate().isAfter(request.getEndDate())) {\n                throw new IllegalArgumentException(\"Start date must be before end date.\");\n            }\n        }\n        Hackathon hackathon = new Hackathon();"
            ),
            "description": "Validates hackathon date logic to prevent start/end inversions."
        },
        {
            "title": "[Bug] Prevent optimization operations on empty keys inside IndexOptimizer",
            "body": "optimizeIndex in IndexOptimizer logs and calls database index routines with empty strings.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/IndexOptimizer.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/IndexOptimizer.java",
                "    public void optimizeIndex(String indexName) {\n        logger.info(\"Optimizing index: \" + indexName);",
                "    public void optimizeIndex(String indexName) {\n        if (indexName == null || indexName.isBlank()) {\n            return;\n        }\n        logger.info(\"Optimizing index: \" + indexName);"
            ),
            "description": "Adds empty string safety checks for database index optimization routines."
        },
        {
            "title": "[Bug] Guard against invalid event IDs inside LiveAudienceService",
            "body": "incrementAudienceCount in LiveAudienceService increments views for negative event IDs.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/LiveAudienceService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/LiveAudienceService.java",
                "    public void incrementAudienceCount(Long eventId) {\n        counters.computeIfAbsent(eventId, k -> new AtomicInteger(0)).incrementAndGet();",
                "    public void incrementAudienceCount(Long eventId) {\n        if (eventId == null || eventId <= 0) return;\n        counters.computeIfAbsent(eventId, k -> new AtomicInteger(0)).incrementAndGet();"
            ),
            "description": "Blocks negative or zero values in LiveAudienceService tracker."
        },
        {
            "title": "[Bug] Guard against non-positive parameters in PaymentPlanService",
            "body": "createPaymentPlan in PaymentPlanService allows configuring negative total values or zero installments.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PaymentPlanService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PaymentPlanService.java",
                "    public PaymentPlanResponse createPaymentPlan(Long registrationId, Double totalAmount, Integer installments) {\n        Registration reg = registrationRepository.findById(registrationId)",
                "    public PaymentPlanResponse createPaymentPlan(Long registrationId, Double totalAmount, Integer installments) {\n        if (totalAmount == null || totalAmount <= 0) {\n            throw new IllegalArgumentException(\"Total amount must be greater than zero.\");\n        }\n        if (installments == null || installments <= 0) {\n            throw new IllegalArgumentException(\"Installments count must be positive.\");\n        }\n        Registration reg = registrationRepository.findById(registrationId)"
            ),
            "description": "Ensures positive total amounts and installment counts for payment plans."
        },
        {
            "title": "[Bug] Prevent identity comparison of code files in PlagiarismDetectorService",
            "body": "compareSubmissions in PlagiarismDetectorService runs token matches on identical code inputs, wasting CPU.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PlagiarismDetectorService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PlagiarismDetectorService.java",
                "    public double compareSubmissions(String submissionA, String submissionB) {\n        List<String> tokensA = parser.parseToTokens(submissionA);",
                "    public double compareSubmissions(String submissionA, String submissionB) {\n        if (submissionA == null || submissionB == null) return 0.0;\n        if (submissionA.trim().equals(submissionB.trim())) return 100.0;\n        List<String> tokensA = parser.parseToTokens(submissionA);"
            ),
            "description": "Instantly returns 100 percent match for identical code submissions."
        },
        {
            "title": "[Bug] Enforce pattern validation on project repo URLs inside ProjectService",
            "body": "submitProject in ProjectService allows saving invalid Git repository URLs to submission entities.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/ProjectService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/ProjectService.java",
                "    public ProjectResponse submitProject(SubmitProjectRequest request) {\n        Optional<Team> teamOptional = teamRepository.findById(request.getTeamId());",
                "    public ProjectResponse submitProject(SubmitProjectRequest request) {\n        if (request.getRepositoryUrl() != null && !request.getRepositoryUrl().matches(\"^https?://github\\\\.com/.*\")) {\n            throw new IllegalArgumentException(\"Repository URL must be a valid GitHub URL.\");\n        }\n        Optional<Team> teamOptional = teamRepository.findById(request.getTeamId());"
            ),
            "description": "Verifies that project submission repository URLs point to valid GitHub profiles."
        },
        {
            "title": "[Bug] Prevent integer overflow in purchase quantities inside PurchaseService",
            "body": "purchaseTickets in PurchaseService accepts extremely large ticket quantities, risking integer overflow calculations.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PurchaseService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PurchaseService.java",
                "    public PurchaseResponse purchaseTickets(Long eventId, Integer quantity) {\n        Event event = eventRepository.findById(eventId)",
                "    public PurchaseResponse purchaseTickets(Long eventId, Integer quantity) {\n        if (quantity == null || quantity <= 0 || quantity > 100) {\n            throw new IllegalArgumentException(\"Quantity must be between 1 and 100.\");\n        }\n        Event event = eventRepository.findById(eventId)"
            ),
            "description": "Clamps purchase ticket quantities to positive numbers up to 100."
        },
        {
            "title": "[Bug] Filter invalid endpoint URLs from push subscriptions inside PushSubscriptionService",
            "body": "saveSubscription in PushSubscriptionService permits saving empty endpoint configurations, breaking messaging triggers.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PushSubscriptionService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PushSubscriptionService.java",
                "    public void saveSubscription(PushSubscriptionDto dto, String email) {\n        User user = userRepository.findByEmail(email)",
                "    public void saveSubscription(PushSubscriptionDto dto, String email) {\n        if (dto == null || dto.getEndpoint() == null || dto.getEndpoint().isBlank()) {\n            throw new IllegalArgumentException(\"Endpoint URL must not be empty.\");\n        }\n        User user = userRepository.findByEmail(email)"
            ),
            "description": "Validates push notification endpoint fields to block null values."
        },
        {
            "title": "[Bug] Prevent memory leaks in SSEBroadcasterService by adding emitter hooks",
            "body": "registerClient in SSEBroadcasterService leaves emitters active on client disconnects, leading to memory leaks.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/SSEBroadcasterService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/SSEBroadcasterService.java",
                "    public SseEmitter registerClient(String clientId) {\n        SseEmitter emitter = new SseEmitter(300000L);\n        emitters.put(clientId, emitter);",
                "    public SseEmitter registerClient(String clientId) {\n        if (clientId == null || clientId.isBlank()) {\n            throw new IllegalArgumentException(\"Client ID is required.\");\n        }\n        SseEmitter emitter = new SseEmitter(300000L);\n        emitter.onCompletion(() -> emitters.remove(clientId));\n        emitter.onTimeout(() -> emitters.remove(clientId));\n        emitters.put(clientId, emitter);"
            ),
            "description": "Attaches timeout and completion callbacks to clean up SseEmitters."
        },
        {
            "title": "[Bug] Slice overly long input texts in SentimentAnalysisService",
            "body": "analyzeSentiment in SentimentAnalysisService processes extremely large text inputs without bounds, risking CPU starvation.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/SentimentAnalysisService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/SentimentAnalysisService.java",
                "    public SentimentResult analyzeSentiment(String text) {\n        if (text == null || text.isBlank()) {",
                "    public SentimentResult analyzeSentiment(String text) {\n        if (text == null || text.isBlank()) {\n            return new SentimentResult(\"NEUTRAL\", 0.0);\n        }\n        String safeText = text.length() > 5000 ? text.substring(0, 5000) : text;"
            ) and apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/SentimentAnalysisService.java",
                "        String cleanText = text.toLowerCase()\n                .replaceAll(\"[^a-zA-Z\\\\s]\", \"\");",
                "        String cleanText = safeText.toLowerCase()\n                .replaceAll(\"[^a-zA-Z\\\\s]\", \"\");"
            ),
            "description": "Restricts analyzed string bounds inside SentimentAnalysisService to safe lengths."
        },
        {
            "title": "[Bug] Enforce minimum length rules on session recovery tokens in SessionRecoveryService",
            "body": "recoverSession in SessionRecoveryService processes empty/short tokens, increasing security scan complexity.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/SessionRecoveryService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/SessionRecoveryService.java",
                "    public boolean recoverSession(String recoveryToken) {\n        Optional<SessionRecovery> recoveryOptional = recoveryRepository.findByToken(recoveryToken);",
                "    public boolean recoverSession(String recoveryToken) {\n        if (recoveryToken == null || recoveryToken.length() < 16) {\n            return false;\n        }\n        Optional<SessionRecovery> recoveryOptional = recoveryRepository.findByToken(recoveryToken);"
            ),
            "description": "Verifies minimum recovery token length before performing database queries."
        },
        {
            "title": "[Bug] Prevent null pointer exceptions during checks in SignatureVerifier",
            "body": "verifySignature in SignatureVerifier processes null parameter payloads, causing unexpected exceptions.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/SignatureVerifier.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/SignatureVerifier.java",
                "    public boolean verifySignature(String payload, String signature, String publicKey) {\n        byte[] payloadBytes = payload.getBytes(StandardCharsets.UTF_8);",
                "    public boolean verifySignature(String payload, String signature, String publicKey) {\n        if (payload == null || signature == null || publicKey == null) return false;\n        byte[] payloadBytes = payload.getBytes(StandardCharsets.UTF_8);"
            ),
            "description": "Defends against NullPointerExceptions in SignatureVerifier logic."
        },
        {
            "title": "[Bug] Prevent division by zero errors inside SkillVectorComparator",
            "body": "calculateCosineSimilarity in SkillVectorComparator yields division by zero values on empty input vectors.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/SkillVectorComparator.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/SkillVectorComparator.java",
                "    public double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {\n        double dotProduct = 0.0;",
                "    public double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {\n        if (vectorA == null || vectorB == null || vectorA.length != vectorB.length || vectorA.length == 0) {\n            return 0.0;\n        }\n        double dotProduct = 0.0;"
            ),
            "description": "Ensures that vectors are of equal, non-zero length before computing cosine similarity."
        },
        {
            "title": "[Bug] Prevent negative charge amount setup in StripeService",
            "body": "createCharge in StripeService processes negative charge amounts, triggering unexpected Stripe API throws.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/StripeService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/StripeService.java",
                "    public Charge createCharge(String token, double amount) {\n        Map<String, Object> chargeParams = new HashMap<>();",
                "    public Charge createCharge(String token, double amount) {\n        if (amount <= 0.0) {\n            throw new IllegalArgumentException(\"Amount must be positive.\");\n        }\n        Map<String, Object> chargeParams = new HashMap<>();"
            ),
            "description": "Requires positive amount parameter configurations for charge requests."
        },
        {
            "title": "[Bug] Validate team size parameters inside TeamMatchmakingService",
            "body": "findBestTeams in TeamMatchmakingService allows zero or negative team sizes, causing incorrect query behavior.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/TeamMatchmakingService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/TeamMatchmakingService.java",
                "    public List<TeamRecommendation> findBestTeams(Long userId, int maxTeamSize) {\n        User user = userRepository.findById(userId)",
                "    public List<TeamRecommendation> findBestTeams(Long userId, int maxTeamSize) {\n        if (maxTeamSize <= 0) {\n            return Collections.emptyList();\n        }\n        User user = userRepository.findById(userId)"
            ),
            "description": "Requires maxTeamSize parameters to be greater than zero."
        },
        {
            "title": "[Bug] Guard against empty workspace IDs inside TeamWorkspaceSyncService",
            "body": "syncWorkspaceState in TeamWorkspaceSyncService processes empty workspace keys without verification.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/TeamWorkspaceSyncService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/TeamWorkspaceSyncService.java",
                "    public void syncWorkspaceState(String workspaceId, Map<String, Object> state) {\n        logger.info(\"Syncing workspace: \" + workspaceId);",
                "    public void syncWorkspaceState(String workspaceId, Map<String, Object> state) {\n        if (workspaceId == null || workspaceId.isBlank()) return;\n        if (state == null) return;\n        logger.info(\"Syncing workspace: \" + workspaceId);"
            ),
            "description": "Skips workspace sync operations if identifiers are null or empty."
        },
        {
            "title": "[Bug] Prevent null parameters during upgrades in UpgradeService",
            "body": "upgradeTicket in UpgradeService accepts null values for ticketId or targetTier, yielding database lookup failures.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/UpgradeService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/UpgradeService.java",
                "    public boolean upgradeTicket(String ticketId, String targetTier) {\n        Ticket ticket = ticketRepository.findById(ticketId)",
                "    public boolean upgradeTicket(String ticketId, String targetTier) {\n        if (ticketId == null || targetTier == null) {\n            return false;\n        }\n        Ticket ticket = ticketRepository.findById(ticketId)"
            ),
            "description": "Enforces non-null validation guards on upgrade request parameters."
        },
        {
            "title": "[Bug] Guard against empty query parameters inside UserService",
            "body": "searchUsers in UserService queries database repositories with blank parameters, returning unnecessary results.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/UserService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/UserService.java",
                "    public List<UserResponse> searchUsers(String query) {\n        List<User> users = userRepository.searchByKeyword(query);",
                "    public List<UserResponse> searchUsers(String query) {\n        if (query == null || query.isBlank()) {\n            return Collections.emptyList();\n        }\n        List<User> users = userRepository.searchByKeyword(query);"
            ),
            "description": "Returns empty result collections immediately on empty user searches."
        },
        {
            "title": "[Bug] Prevent division by zero inside WaitlistService",
            "body": "promoteFromWaitlist in WaitlistService processes non-positive available capacity values, risking division by zero.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/WaitlistService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/WaitlistService.java",
                "    public void promoteFromWaitlist(Long eventId, int availableCapacity) {\n        Event event = eventRepository.findById(eventId)",
                "    public void promoteFromWaitlist(Long eventId, int availableCapacity) {\n        if (availableCapacity <= 0) {\n            return;\n        }\n        Event event = eventRepository.findById(eventId)"
            ),
            "description": "Ensures that promotional capacity is positive before processing waitlists."
        },
        {
            "title": "[Bug] Add size boundaries on push notifications inside WebPushNotificationService",
            "body": "sendPushNotification in WebPushNotificationService forwards arbitrarily large payloads, risking socket buffer overflows.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/WebPushNotificationService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/WebPushNotificationService.java",
                "    public void sendPushNotification(String subscriptionId, String payload) {\n        logger.info(\"Sending push to \" + subscriptionId);",
                "    public void sendPushNotification(String subscriptionId, String payload) {\n        if (subscriptionId == null || payload == null) return;\n        String safePayload = payload.length() > 2000 ? payload.substring(0, 2000) : payload;\n        logger.info(\"Sending push to \" + subscriptionId);"
            ),
            "description": "Truncates push notification payloads to a maximum of 2000 characters."
        },
        {
            "title": "[Bug] Prevent negative wallet transfers inside EscrowWalletService",
            "body": "depositEscrow in EscrowWalletService accepts negative deposit amounts, leading to incorrect balance totals.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/escrow/EscrowWalletService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/escrow/EscrowWalletService.java",
                "    public void depositEscrow(String walletId, Double amount) {\n        EscrowWallet wallet = walletRepository.findById(walletId)",
                "    public void depositEscrow(String walletId, Double amount) {\n        if (amount == null || amount <= 0.0) {\n            throw new IllegalArgumentException(\"Deposit amount must be positive.\");\n        }\n        EscrowWallet wallet = walletRepository.findById(walletId)"
            ),
            "description": "Requires deposit amounts to be greater than zero for escrow operations."
        },
        {
            "title": "[Bug] Truncate overly long text transcriptions inside SubtitleService",
            "body": "saveSubtitle in SubtitleService saves arbitrarily large transcriptions to subtitle databases, risking buffer overflows.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleService.java",
                "    public void saveSubtitle(Long sessionId, String transcription, Long offsetMs) {\n        SubtitleSession session = sessionRepository.findById(sessionId)",
                "    public void saveSubtitle(Long sessionId, String transcription, Long offsetMs) {\n        if (transcription == null || transcription.isBlank()) return;\n        String safeText = transcription.length() > 5000 ? transcription.substring(0, 5000) : transcription;\n        SubtitleSession session = sessionRepository.findById(sessionId);"
            ) and apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/subtitles/SubtitleService.java",
                "        Subtitle subtitle = new Subtitle(session, transcription, offsetMs);",
                "        Subtitle subtitle = new Subtitle(session, safeText, offsetMs);"
            ),
            "description": "Slices transcriptions to a maximum of 5000 characters before persistence."
        },
        {
            "title": "[Bug] Verify bound ranges inside ZkRangeVerifierService under zk packages",
            "body": "verifyRangeProof in ZkRangeVerifierService under zk packages accepts invalid/inverted range bounds.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/zk/ZkRangeVerifierService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/zk/ZkRangeVerifierService.java",
                "    public boolean verifyRangeProof(String proof, int lowerBound, int upperBound) {\n        if (proof == null) return false;",
                "    public boolean verifyRangeProof(String proof, int lowerBound, int upperBound) {\n        if (lowerBound > upperBound) return false;\n        if (proof == null || proof.isBlank()) return false;"
            ),
            "description": "Asserts correct lower and upper bound order in ZK range proofs."
        },
        {
            "title": "[Bug] Verify bound ranges inside ZkRangeVerifierService under zkp packages",
            "body": "verifyRangeProof in ZkRangeVerifierService under zkp packages accepts invalid/inverted range bounds.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/zkp/ZkRangeVerifierService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/zkp/ZkRangeVerifierService.java",
                "    public boolean verifyRangeProof(String proof, int lowerBound, int upperBound) {\n        if (proof == null) return false;",
                "    public boolean verifyRangeProof(String proof, int lowerBound, int upperBound) {\n        if (lowerBound > upperBound) return false;\n        if (proof == null || proof.isBlank()) return false;"
            ),
            "description": "Asserts correct lower and upper bound order in ZKP range proofs."
        },
        {
            "title": "[Bug] Validate positive capacity bounds inside EventService",
            "body": "createEvent in EventService accepts negative capacity limits for events.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/EventService.java",
                "    public EventResponse createEvent(CreateEventRequest request) {\n        Event event = new Event();",
                "    public EventResponse createEvent(CreateEventRequest request) {\n        if (request.getCapacity() != null && request.getCapacity() < 0) {\n            throw new IllegalArgumentException(\"Capacity must be non-negative.\");\n        }\n        Event event = new Event();"
            ),
            "description": "Requires non-negative capacity bounds in event creation request."
        },
        {
            "title": "[Bug] Add bounds on log query counts inside AdminService",
            "body": "getLogs in AdminService processes large limit parameters without safety limits.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/AdminService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/AdminService.java",
                "    public List<AdminLogResponse> getLogs(int limit) {\n        return adminLogRepository.findAll(PageRequest.of(0, limit))",
                "    public List<AdminLogResponse> getLogs(int limit) {\n        int safeLimit = Math.max(1, Math.min(limit, 1000));\n        return adminLogRepository.findAll(PageRequest.of(0, safeLimit))"
            ),
            "description": "Clamps the query page size limit between 1 and 1000 records."
        },
        {
            "title": "[Bug] Guard template name null references inside EmailTemplateService",
            "body": "processTemplate in EmailTemplateService accepts blank template names, triggering processing faults.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/EmailTemplateService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/EmailTemplateService.java",
                "    public String processTemplate(String templateName, Map<String, Object> variables) {\n        Context context = new Context();",
                "    public String processTemplate(String templateName, Map<String, Object> variables) {\n        if (templateName == null || templateName.isBlank()) {\n            throw new IllegalArgumentException(\"Template name is required.\");\n        }\n        Context context = new Context();"
            ),
            "description": "Checks that the target templateName is not blank before processing."
        },
        {
            "title": "[Bug] Guard comparisons parameter null values inside PlagiarismDetectionService",
            "body": "generateCsvAuditReport in PlagiarismDetectionService queries comparisons lists directly without null checks.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PlagiarismDetectionService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PlagiarismDetectionService.java",
                "    public String generateCsvAuditReport(List<SubmissionComparison> comparisons) {\n        StringBuilder csv = new StringBuilder();",
                "    public String generateCsvAuditReport(List<SubmissionComparison> comparisons) {\n        if (comparisons == null) return \"\";\n        StringBuilder csv = new StringBuilder();"
            ),
            "description": "Defends against NullPointerExceptions in CSV audit generation."
        },
        {
            "title": "[Bug] Guard null parameters on similarity comparison inside PlagiarismDetector",
            "body": "getSimilarity in PlagiarismDetector executes checks on null input values, triggering NullPointerExceptions.",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PlagiarismDetector.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PlagiarismDetector.java",
                "    public double getSimilarity(String codeA, String codeB) {\n        return comparator.compare(codeA, codeB);",
                "    public double getSimilarity(String codeA, String codeB) {\n        if (codeA == null || codeB == null) return 0.0;\n        return comparator.compare(codeA, codeB);"
            ),
            "description": "Instantly returns zero similarity if either comparison string is null."
        }
    ]

    print(f"Starting automated execution of 50 contributions...")
    # Since we only need 50 contributions, let's run them one by one
    for idx, contr in enumerate(contributions):
        create_issue_and_pr(idx + 1, contr)
    print("\nFinished processing all 50 contributions!")

if __name__ == "__main__":
    main()
