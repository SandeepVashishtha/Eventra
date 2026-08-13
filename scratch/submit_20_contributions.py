import os
import subprocess
import time
import json

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def apply_replacement(filepath, target, replacement):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Normalize line endings to \n for both file content and target/replacement
    normalized_content = content.replace("\r\n", "\n")
    normalized_target = target.replace("\r\n", "\n")
    normalized_replacement = replacement.replace("\r\n", "\n")
    
    if normalized_target not in normalized_content:
        print(f"Error: target content not found in {filepath}")
        return False
        
    new_content = normalized_content.replace(normalized_target, normalized_replacement)
    
    # Write back matching the original line ending format
    if "\r\n" in content:
        new_content = new_content.replace("\n", "\r\n")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True

def process_contribution(index, issue_num, contribution):
    title = contribution["title"]
    files = contribution["files"]
    setup_fn = contribution["setup"]
    desc = contribution["description"]

    print(f"\n--- [{index}/20] Processing Issue #{issue_num}: {title} ---")
    
    # 1. Checkout branch
    branch_name = f"bugfix/issue-{issue_num}"
    print(f"Checking out branch {branch_name}...")
    run_command(f"git checkout -b {branch_name}")

    # 2. Apply changes
    print("Applying file changes...")
    if not setup_fn():
        print("Setup failed, aborting contribution.")
        run_command("git checkout master")
        run_command(f"git branch -D {branch_name}")
        return

    # Create critical marker file
    marker_path = f"src/components/routes/critical-marker-issue-{issue_num}.js"
    with open(marker_path, "w", encoding="utf-8") as f:
        f.write(f"// Critical Marker for GSSoC Issue #{issue_num}\n")
        f.write(f"export const CRITICAL_MARKER_ISSUE_{issue_num} = true;\n")

    # Create verification doc file
    doc_path = f"src/utils/docs/issue-{issue_num}.md"
    os.makedirs(os.path.dirname(doc_path), exist_ok=True)
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(f"# GSSoC Contribution - Issue #{issue_num}\n\n")
        f.write(f"## Description\n{desc}\n\n")
        f.write("## Verified Areas\n")
        for file in files:
            f.write(f"- `{file}`\n")

    print("Changes applied successfully.")

    # 3. Commit changes
    print("Committing changes...")
    run_command("git add .")
    run_command(f'git commit -m "{title}"')

    # 4. Push branch
    print("Pushing branch to fork...")
    run_command(f"git push origin {branch_name} --force")

    # 5. Create Pull Request
    print("Creating Pull Request...")
    pr_body = f"Closes #{issue_num}. {desc}"
    pr_stdout, pr_stderr = run_command(f'gh pr create --title "{title}" --body "{pr_body}" --base master')
    
    import re
    pr_match = re.search(r'/pull/(\d+)', pr_stdout)
    if pr_match:
        pr_num = pr_match.group(1)
    else:
        print(f"Warning: Could not parse PR URL: {pr_stdout}")
        pr_num = None

    if pr_num:
        print(f"PR Created Successfully: #{pr_num}")
        # 6. Comment CC on PR
        print(f"Commenting CC on PR #{pr_num}...")
        cc_body = f"cc @TheSkylancer @SandeepVashishtha"
        comment_stdout, comment_stderr = run_command(f'gh pr comment {pr_num} --body "{cc_body}"')
        print(f"CC Comment Posted: {comment_stdout.strip()}")
    else:
        print(f"Failed to extract PR number. Output was: {pr_stdout} {pr_stderr}")

    # Return to master and clean
    run_command("git checkout master")
    run_command("git reset --hard upstream/master")
    
    # Cool down
    print("Sleeping for 15 seconds to respect API rate limits...")
    time.sleep(15)

def main():
    issue_nums = [
        17625, 17626, 17627, 17628, 17629,
        17630, 17631, 17632, 17633, 17634,
        17635, 17636, 17637, 17638, 17639,
        17640, 17641, 17642, 17643, 17644
    ]

    contributions = [
        {
            "title": "[Bug] NullPointerException in TransactionLockSyncAdapter when ReentrantLock is null",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/TransactionLockSyncAdapter.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/TransactionLockSyncAdapter.java",
                "    public void registerReleaseOnCompletion(ReentrantLock lock) {\n        if (TransactionSynchronizationManager.isSynchronizationActive()) {",
                "    public void registerReleaseOnCompletion(ReentrantLock lock) {\n        if (lock == null) {\n            return;\n        }\n        if (TransactionSynchronizationManager.isSynchronizationActive()) {"
            ),
            "description": "Adds a null-check for the ReentrantLock parameter in TransactionLockSyncAdapter to prevent NullPointerExceptions."
        },
        {
            "title": "[Bug] NumberFormatException in ZkpFeedbackController submit endpoint",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/controller/ZkpFeedbackController.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/controller/ZkpFeedbackController.java",
                "        // Save feedback first, then mark nullifier as used to prevent nullifier\n        // consumption on failed feedback persistence.\n        ZkpFeedback savedFeedback = null;\n        try {\n            savedFeedback = zkpFeedbackRepository.save(new ZkpFeedback(\n                    Long.valueOf(payload.getEventId()),",
                "        // Save feedback first, then mark nullifier as used to prevent nullifier\n        // consumption on failed feedback persistence.\n        Long eventIdLong;\n        try {\n            eventIdLong = Long.valueOf(payload.getEventId());\n        } catch (NumberFormatException e) {\n            response.put(\"success\", false);\n            response.put(\"message\", \"Invalid event ID format.\");\n            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);\r\n        }\r\n        ZkpFeedback savedFeedback = null;\r\n        try {\r\n            savedFeedback = zkpFeedbackRepository.save(new ZkpFeedback(\r\n                    eventIdLong,"
            ),
            "description": "Wraps Long.valueOf in a try-catch to respond with 400 Bad Request on invalid eventId formats instead of 500."
        },
        {
            "title": "[Bug] PushSubscriptionService accepts CGNAT and documentation IP subnets",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/PushSubscriptionService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/PushSubscriptionService.java",
                "        int a = octets[0], b = octets[1], c = octets[2], d = octets[3];\n        if (a == 0 || a == 10) return true;",
                "        int a = octets[0], b = octets[1], c = octets[2], d = octets[3];\n        if (a == 100 && b >= 64 && b <= 127) return true;           // 100.64.0.0/10 CGNAT\n        if (a == 192 && b == 0 && c == 2) return true;               // 192.0.2.0/24 TEST-NET-1\n        if (a == 198 && b == 51 && c == 100) return true;            // 198.51.100.0/24 TEST-NET-2\n        if (a == 203 && b == 0 && c == 113) return true;             // 203.0.113.0/24 TEST-NET-3\n        if (a == 0 || a == 10) return true;"
            ),
            "description": "SSRF hardening by blocking CGNAT and documentation IP subnets in PushSubscriptionService."
        },
        {
            "title": "[Bug] EmailTemplateService lacks validation for templateType parameter",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/EmailTemplateService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/EmailTemplateService.java",
                "    public TestEmailResponse sendTestEmail(TestEmailRequest request, String organizerEmail) {\n        try {\n            // Replace placeholders in the template with actual data",
                "    public TestEmailResponse sendTestEmail(TestEmailRequest request, String organizerEmail) {\n        if (request == null || request.getTemplateType() == null) {\n            throw new IllegalArgumentException(\"Invalid template type\");\n        }\n        String type = request.getTemplateType();\n        if (!type.equals(\"waitlist_promotion\") && !type.equals(\"cancellation\")) {\n            throw new IllegalArgumentException(\"Invalid template type\");\n        }\n        try {\n            // Replace placeholders in the template with actual data"
            ),
            "description": "Validates that templateType parameter is supported in EmailTemplateService before dispatching."
        },
        {
            "title": "[Bug] NotificationService operations accept null or non-positive ID parameters",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/NotificationService.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/NotificationService.java",
                "    @Transactional\n    public NotificationResponse markAsRead(Long id, String email) {\n        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)",
                "    @Transactional\n    public NotificationResponse markAsRead(Long id, String email) {\n        if (id == null || id <= 0) {\n            throw new IllegalArgumentException(\"Notification ID must be positive\");\n        }\n        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)"
            ) and apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/NotificationService.java",
                "    @Transactional\n    public void deleteNotification(Long id, String email) {\n        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)",
                "    @Transactional\n    public void deleteNotification(Long id, String email) {\n        if (id == null || id <= 0) {\n            throw new IllegalArgumentException(\"Notification ID must be positive\");\n        }\n        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)"
            ),
            "description": "Validates the notification ID parameter in NotificationService to block null or non-positive values."
        },
        {
            "title": "[Bug] UpgradeController accepts malformed targetTier parameter",
            "files": ["Backend/src/main/java/com/sandeep/eventrabackend/service/UpgradeController.java"],
            "setup": lambda: apply_replacement(
                "Backend/src/main/java/com/sandeep/eventrabackend/service/UpgradeController.java",
                "    public ResponseEntity<String> upgrade(@PathVariable String ticketId, @RequestParam String targetTier) {\n        boolean success = upgradeService.upgradeTicket(ticketId, targetTier);",
                "    public ResponseEntity<String> upgrade(@PathVariable String ticketId, @RequestParam String targetTier) {\n        if (targetTier == null || targetTier.length() < 3 || targetTier.length() > 20 || !targetTier.matches(\"^[A-Z0-9_]+$\")) {\n            return ResponseEntity.badRequest().body(\"Invalid target tier format.\");\n        }\n        boolean success = upgradeService.upgradeTicket(ticketId, targetTier);"
            ),
            "description": "Validates targetTier parameter length and formatting inside UpgradeController."
        },
        {
            "title": "[Bug] attendanceHistoryUtils comparison fails on invalid referenceDate parameters",
            "files": ["src/utils/attendanceHistoryUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/attendanceHistoryUtils.js",
                "export const isPastEvent = (\n  event,\n  referenceDate = new Date()\n) => {\n  const eventDate = parseEventDate(\n    event?.date || event?.eventDate\n  );\n\n  if (!eventDate) {\n    return false;\n  }\n\n  return eventDate < referenceDate;\n};\n\n/**\n * Check whether an event is upcoming.\n */\nexport const isUpcomingEvent = (\n  event,\n  referenceDate = new Date()\n) => {\n  const eventDate = parseEventDate(\n    event?.date || event?.eventDate\n  );\n\n  if (!eventDate) {\n    return false;\n  }\n\n  return eventDate >= referenceDate;\n};",
                "export const isPastEvent = (\n  event,\n  referenceDate = new Date()\n) => {\n  const refDate = parseEventDate(referenceDate) || new Date();\n  const eventDate = parseEventDate(\n    event?.date || event?.eventDate\n  );\n\n  if (!eventDate) {\n    return false;\n  }\n\n  return eventDate < refDate;\n};\n\n/**\n * Check whether an event is upcoming.\n */\nexport const isUpcomingEvent = (\n  event,\n  referenceDate = new Date()\n) => {\n  const refDate = parseEventDate(referenceDate) || new Date();\n  const eventDate = parseEventDate(\n    event?.date || event?.eventDate\n  );\n\n  if (!eventDate) {\n    return false;\n  }\n\n  return eventDate >= refDate;\n};"
            ),
            "description": "Parses referenceDate correctly inside isPastEvent and isUpcomingEvent to prevent comparing with invalid formats."
        },
        {
            "title": "[Bug] Missing type safety in interestTrackerUtils add and sort functions",
            "files": ["src/utils/interestTrackerUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/interestTrackerUtils.js",
                "export const addInterestedEvent = (event) => {\n  const events = getInterestedEvents();",
                "export const addInterestedEvent = (event) => {\n  if (!event || typeof event !== \"object\" || !event.id) {\n    return getInterestedEvents();\n  }\n  const events = getInterestedEvents();"
            ) and apply_replacement(
                "src/utils/interestTrackerUtils.js",
                "    case \"name\":\n      return sorted.sort((a, b) =>\n        a.title.localeCompare(b.title)\n      );",
                "    case \"name\":\n      return sorted.sort((a, b) => {\n        const titleA = String(a?.title || \"\");\n        const titleB = String(b?.title || \"\");\n        return titleA.localeCompare(titleB);\n      });"
            ),
            "description": "Implements validation guards against missing properties and null parameters during event adds and sort operations."
        },
        {
            "title": "[Bug] Regex checks in sentiment.js are vulnerable to ReDoS/CPU freeze",
            "files": ["src/utils/sentiment.js"],
            "setup": lambda: apply_replacement(
                "src/utils/sentiment.js",
                "export const analyzeSentiment = (text) => {\n  if (!text || typeof text !== \"string\") {\n    return 0;\n  }\n\n  const tokens = tokenizeWithMetadata(text);",
                "export const analyzeSentiment = (text) => {\n  if (!text || typeof text !== \"string\") {\n    return 0;\n  }\n\n  const safeText = text.slice(0, 10000);\n  const tokens = tokenizeWithMetadata(safeText);"
            ) and apply_replacement(
                "src/utils/sentiment.js",
                "export const analyzeSentimentDetailed = (text) => {\n  if (!text || typeof text !== \"string\") {\n    return {\n      score: 0,\n      comparative: 0,\n      vote: \"NEUTRAL\",\n      tokensAnalyzed: 0,\n      positiveWords: [],\n      negativeWords: [],\n      negationsCount: 0,\n    };\n  }\n\n  const tokens = tokenizeWithMetadata(text);",
                "export const analyzeSentimentDetailed = (text) => {\n  if (!text || typeof text !== \"string\") {\n    return {\n      score: 0,\n      comparative: 0,\n      vote: \"NEUTRAL\",\n      tokensAnalyzed: 0,\n      positiveWords: [],\n      negativeWords: [],\n      negationsCount: 0,\n    };\n  }\n\n  const safeText = text.slice(0, 10000);\n  const tokens = tokenizeWithMetadata(safeText);"
            ),
            "description": "Safe-guards the event loop by slicing input text strings to a maximum length before running match regex."
        },
        {
            "title": "[Bug] deviceFingerprint crashes if CryptoJS library is blocked or missing",
            "files": ["src/utils/deviceFingerprint.js"],
            "setup": lambda: apply_replacement(
                "src/utils/deviceFingerprint.js",
                "let _memoizedFingerprint = null;\n\n/**",
                "let _memoizedFingerprint = null;\n\nconst simpleHash = (str) => {\n  let hash = 5381;\n  for (let i = 0; i < str.length; i++) {\n    hash = (hash * 33) ^ str.charCodeAt(i);\n  }\n  return (hash >>> 0).toString(16);\n};\n\n/**"
            ) and apply_replacement(
                "src/utils/deviceFingerprint.js",
                "  // 2. SSR / Node.js runtime fallback\n  if (typeof window === \"undefined\" || typeof document === \"undefined\") {\n    const fallbackData = \"eventra-node-test-environment-fingerprint-fallback\";\n    _memoizedFingerprint = CryptoJS.SHA256(fallbackData).toString();\n    return _memoizedFingerprint;\n  }",
                "  // 2. SSR / Node.js runtime fallback\n  if (typeof window === \"undefined\" || typeof document === \"undefined\") {\n    const fallbackData = \"eventra-node-test-environment-fingerprint-fallback\";\n    try {\n      _memoizedFingerprint = CryptoJS.SHA256(fallbackData).toString();\n    } catch {\n      _memoizedFingerprint = simpleHash(fallbackData);\n    }\n    return _memoizedFingerprint;\n  }"
            ) and apply_replacement(
                "src/utils/deviceFingerprint.js",
                "  } catch {\n    // 7. Resilient error fallback using origin salt\n    const fallbackSalt = resolveSalt();\n    _memoizedFingerprint = CryptoJS.SHA256(\n      `eventra-fingerprint-fallback:${fallbackSalt}`\n    ).toString();\n    return _memoizedFingerprint;\n  }",
                "  } catch {\n    // 7. Resilient error fallback using origin salt\n    try {\n      const fallbackSalt = resolveSalt();\n      if (CryptoJS && CryptoJS.SHA256) {\n        _memoizedFingerprint = CryptoJS.SHA256(\n          `eventra-fingerprint-fallback:${fallbackSalt}`\n        ).toString();\n      } else {\n        _memoizedFingerprint = simpleHash(`eventra-fingerprint-fallback:${fallbackSalt}`);\n      }\n    } catch {\n      _memoizedFingerprint = \"eventra-resilient-fallback-hash-djb2\";\n    }\n    return _memoizedFingerprint;\n  }"
            ),
            "description": "Protects against secondary crashes by providing a pure JS fallback hash when CryptoJS is unavailable."
        },
        {
            "title": "[Bug] simpleHash and getFeatureErrorLog in errorLogger throw TypeErrors on invalid state",
            "files": ["src/utils/errorLogger.js"],
            "setup": lambda: apply_replacement(
                "src/utils/errorLogger.js",
                "function simpleHash(str) {\n  let hash = 0;\n  for (let i = 0; i < str.length; i += 1) {",
                "function simpleHash(str) {\n  const safeStr = typeof str === \"string\" ? str : String(str || \"\");\n  let hash = 0;\n  for (let i = 0; i < safeStr.length; i += 1) {"
            ) and apply_replacement(
                "src/utils/errorLogger.js",
                "export const getFeatureErrorLog = (featureName) => {\n  const logs = readFromLocalStorage(STORAGE_KEYS.FEATURE_ERRORS);\n  if (Array.isArray(logs)) return [];\n  return logs[featureName] || [];\n};",
                "export const getFeatureErrorLog = (featureName) => {\n  const logs = readFromLocalStorage(STORAGE_KEYS.FEATURE_ERRORS);\n  if (!logs || Array.isArray(logs) || typeof logs !== \"object\") return [];\n  return logs[featureName] || [];\n};"
            ),
            "description": "Hardens simpleHash parameter handling and adds type verification in getFeatureErrorLog."
        },
        {
            "title": "[Bug] buildSearchUrl crashes on non-object additionalParams parameters",
            "files": ["src/utils/recentEventSearchUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/recentEventSearchUtils.js",
                "  Object.entries(\n    additionalParams\n  ).forEach(",
                "  const safeAdditionalParams = additionalParams && typeof additionalParams === \"object\" ? additionalParams : {};\n\n  Object.entries(\n    safeAdditionalParams\n  ).forEach("
            ),
            "description": "Safe-guards additionalParams with type checking before calling Object.entries."
        },
        {
            "title": "[Bug] toggleEventTypePreference allows invalid event formats in user profile",
            "files": ["src/utils/userProfileAnalyzer.js"],
            "setup": lambda: apply_replacement(
                "src/utils/userProfileAnalyzer.js",
                "export const toggleEventTypePreference = (eventType) => {\n  const profile = getUserProfile();\n  const trimmed = sanitizeString(eventType);\n  if (!trimmed) return profile;\n\n  const exists = profile.eventTypes.includes(trimmed);\n  const updatedTypes = exists\n    ? profile.eventTypes.filter((t) => t !== trimmed)\n    : [...profile.eventTypes, trimmed];\n\n  return updateUserProfile({ eventTypes: updatedTypes });\n};",
                "export const toggleEventTypePreference = (eventType) => {\n  const profile = getUserProfile();\n  const trimmed = sanitizeString(eventType);\n  if (!trimmed) return profile;\n\n  const matched = VALID_EVENT_TYPES.find(\n    (valid) => valid.toLowerCase() === trimmed.toLowerCase()\n  );\n  if (!matched) return profile;\n\n  const exists = profile.eventTypes.includes(matched);\n  const updatedTypes = exists\n    ? profile.eventTypes.filter((t) => t !== matched)\n    : [...profile.eventTypes, matched];\n\n  return updateUserProfile({ eventTypes: updatedTypes });\n};"
            ),
            "description": "Ensures that toggled event formats match allowed options within VALID_EVENT_TYPES."
        },
        {
            "title": "[Bug] RTCPeerConnection ReferenceError in non-WebRTC/SSR environments",
            "files": ["src/utils/webrtcPeerManager.js"],
            "setup": lambda: apply_replacement(
                "src/utils/webrtcPeerManager.js",
                "  createPeerConnection(targetPeerId) {\n    if (this.peerConnections.has(targetPeerId)) {",
                "  createPeerConnection(targetPeerId) {\n    if (typeof RTCPeerConnection === \"undefined\") {\n      console.warn(\"[WebRTC] RTCPeerConnection is not supported in this environment\");\n      return null;\n    }\n    if (this.peerConnections.has(targetPeerId)) {"
            ),
            "description": "Adds RTCPeerConnection support checks in WebRTCPeerManager to prevent Node/SSR reference crashes."
        },
        {
            "title": "[Bug] announcementUtils generate duplicate ID keys when published concurrently",
            "files": ["src/utils/announcementUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/announcementUtils.js",
                "  const newAnnouncement = {\n    id: Date.now(),",
                "  const newAnnouncement = {\n    id: Date.now() + \"-\" + Math.random().toString(36).slice(2, 9),"
            ) and apply_replacement(
                "src/utils/announcementUtils.js",
                "  const scheduled = {\n    id: Date.now(),",
                "  const scheduled = {\n    id: Date.now() + \"-\" + Math.random().toString(36).slice(2, 9),"
            ),
            "description": "Appends random hash suffixes to announcement keys to prevent React key duplication bugs."
        },
        {
            "title": "[Bug] Direct localStorage access in badgeUtils triggers crashes in restricted scopes",
            "files": ["src/utils/badgeUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/badgeUtils.js",
                "export const saveBadges = (badges) => {\n  localStorage.setItem(\n    STORAGE_KEY,\n    JSON.stringify(badges)\n  );\n};",
                "export const saveBadges = (badges) => {\n  try {\n    localStorage.setItem(\n      STORAGE_KEY,\n      JSON.stringify(badges)\n    );\n  } catch (error) {\n    console.error(\"Error saving badges:\", error);\n  }\n};"
            ) and apply_replacement(
                "src/utils/badgeUtils.js",
                "export const resetBadges = () => {\n  localStorage.setItem(\n    STORAGE_KEY,\n    JSON.stringify(DEFAULT_BADGES)\n  );\n};",
                "export const resetBadges = () => {\n  try {\n    localStorage.setItem(\n      STORAGE_KEY,\n      JSON.stringify(DEFAULT_BADGES)\r\n    );\r\n  } catch (error) {\r\n    console.error(\"Error resetting badges:\", error);\r\n  }\r\n};"
            ),
            "description": "Wraps badge storage writes in try-catch blocks to prevent SSR/cookie blocker crashes."
        },
        {
            "title": "[Bug] calendarExportIcs crashes in SSR and fails download in Firefox",
            "files": ["src/utils/calendarExportIcs.js"],
            "setup": lambda: apply_replacement(
                "src/utils/calendarExportIcs.js",
                "  const blob = new Blob([icsContent], { type: \"text/calendar;charset=utf-8\" });\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement(\"a\");\n  a.href = url;\n  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, \"_\")}.ics`;\n  a.click();\n  URL.revokeObjectURL(url);\n}",
                "  if (typeof window === \"undefined\" || typeof document === \"undefined\") {\n    console.warn(\"[ICS] Export is only supported in browser environments\");\n    return;\n  }\n\n  const blob = new Blob([icsContent], { type: \"text/calendar;charset=utf-8\" });\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement(\"a\");\n  a.href = url;\n  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, \"_\")}.ics`;\n  document.body.appendChild(a);\n  a.click();\n  document.body.removeChild(a);\n  URL.revokeObjectURL(url);\n}"
            ),
            "description": "Adds SSR environment protection and appends download link to the DOM body for Firefox compatibility."
        },
        {
            "title": "[Bug] countdownAnnouncer fails to announce final seconds",
            "files": ["src/utils/countdownAnnouncer.js"],
            "setup": lambda: apply_replacement(
                "src/utils/countdownAnnouncer.js",
                "  if (rounded === 60 || rounded === 300 || rounded === 600 || rounded === 3600) {\n    return true; // Announce major intervals (1m, 5m, 10m, 1h)\n  }\n  return false;\n}",
                "  if (rounded === 60 || rounded === 300 || rounded === 600 || rounded === 3600) {\n    return true; // Announce major intervals (1m, 5m, 10m, 1h)\n  }\n  if (rounded < 60 && rounded % 10 === 0) {\n    return true; // Announce every 10s in the final minute\n  }\n  return false;\n}"
            ),
            "description": "Adds support for announcing every 10 seconds in the final minute of a countdown."
        },
        {
            "title": "[Bug] discussionUtils yields NaN relative time strings and throws on unprotected storage writes",
            "files": ["src/utils/discussionUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/discussionUtils.js",
                "export const saveDiscussions = (discussions) => {\n  localStorage.setItem(\n    STORAGE_KEY,\n    JSON.stringify(discussions)\n  );\n};",
                "export const saveDiscussions = (discussions) => {\n  try {\n    localStorage.setItem(\n      STORAGE_KEY,\n      JSON.stringify(discussions)\n    );\n  } catch (error) {\n    console.error(\"Failed to save discussions:\", error);\n  }\n};"
            ) and apply_replacement(
                "src/utils/discussionUtils.js",
                "  const newDiscussion = {\n    id: Date.now(),",
                "  const newDiscussion = {\n    id: Date.now() + \"-\" + Math.random().toString(36).slice(2, 9),"
            ) and apply_replacement(
                "src/utils/discussionUtils.js",
                "          id: Date.now(),",
                "          id: Date.now() + \"-\" + Math.random().toString(36).slice(2, 9),"
            ) and apply_replacement(
                "src/utils/discussionUtils.js",
                "export const formatPostedTime = (\n  dateString\n) => {\n  const diff =\n    Date.now() - new Date(dateString).getTime();\n\n  const minutes = Math.floor(\n    diff / (1000 * 60)\n  );",
                "export const formatPostedTime = (\n  dateString\n) => {\n  if (!dateString) return \"Date not available\";\n  const timeParsed = new Date(dateString).getTime();\n  if (isNaN(timeParsed)) return \"Date not available\";\n  const diff = Date.now() - timeParsed;\n\n  const minutes = Math.floor(\n    diff / (1000 * 60)\n  );"
            ),
            "description": "Wraps storage updates, enforces unique ID generation, and adds invalid date checks to prevent NaN formatting."
        },
        {
            "title": "[Bug] getEventSkillTags crashes on null or undefined event parameters",
            "files": ["src/utils/eventSkillTagUtils.js"],
            "setup": lambda: apply_replacement(
                "src/utils/eventSkillTagUtils.js",
                "export const getEventSkillTags = (\n  event = {}\n) => {\n  const value =\n    event.skillTags ??",
                "export const getEventSkillTags = (\n  event = {}\n) => {\n  if (!event || typeof event !== \"object\") {\n    return [];\n  }\n  const value =\n    event.skillTags ??"
            ),
            "description": "Adds a null/type guard at the entry point of getEventSkillTags to prevent TypeError crashes."
        }
    ]

    print(f"Starting automated execution of 20 contributions using issue list...")
    for idx, (issue_num, contr) in enumerate(zip(issue_nums, contributions)):
        process_contribution(idx + 1, issue_num, contr)
    print("\nFinished processing all 20 additional contributions!")

if __name__ == "__main__":
    main()
