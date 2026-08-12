import os
import re
import subprocess
import sys

def run_cmd(cmd):
    print(f"Running: {cmd}")
    # Using shell=True for windows commands
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Command failed: {cmd}\nOutput: {result.stdout}\nError: {result.stderr}")
        return False
    return True

def checkout_branch(branch_name):
    run_cmd("git checkout master")
    # Reset any changes
    run_cmd("git reset --hard HEAD")
    # Create or checkout branch
    run_cmd(f"git checkout -b {branch_name}")

def commit_and_push(msg, branch_name):
    run_cmd("git add .")
    run_cmd(f'git commit -m "{msg}"')
    run_cmd(f"git push -u origin {branch_name}")

def patch_file(file_path, old_str, new_str):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str not in content:
        print(f"Warning: String not found in {file_path}")
        return False
    content = content.replace(old_str, new_str)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def fix_10743():
    # Bug: Memory leak in P2P EventMaterials download polling
    branch = "fix/eventmaterials-polling-leak-10743"
    checkout_branch(branch)
    file_path = "src/components/common/EventMaterials.jsx"
    old_str = """      const checkCompletion = setInterval(async () => {
        const completed = await isFileCached(fileId);
        if (completed) {
          clearInterval(checkCompletion);
          triggerLocalDownload(fileId, fileName);"""
    new_str = """      let attempts = 0;
      const MAX_ATTEMPTS = 60; // 30 seconds
      const checkCompletion = setInterval(async () => {
        attempts++;
        const completed = await isFileCached(fileId);
        if (completed || attempts >= MAX_ATTEMPTS) {
          clearInterval(checkCompletion);
          if (completed) {
            triggerLocalDownload(fileId, fileName);"""
    if patch_file(file_path, old_str, new_str):
        commit_and_push("fix: prevent memory leak in EventMaterials P2P polling (#10743)", branch)

def fix_10744():
    # Bug: EventShareButtons cleanup destroys global SEO meta tags
    branch = "fix/eventsharebuttons-seo-cleanup-10744"
    checkout_branch(branch)
    file_path = "src/components/events/EventShareButtons.jsx"
    old_str = """  useEffect(() => {
    const updateOrCreateMeta = (property, content, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (isName) {
          element.setAttribute("name", property);
        } else {
          element.setAttribute("property", property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    updateOrCreateMeta("og:title", event.title);
    updateOrCreateMeta("og:description", event.description?.slice(0, 160) || "");
    updateOrCreateMeta("og:image", event.image || event.bannerPreview);
    updateOrCreateMeta("twitter:card", "summary_large_image", true);

    return () => {
      // Clean up metadata tags on unmount to keep DOM clean
      const tags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      tags.forEach(tag => tag.remove());
    };
  }, [event]);"""
    new_str = """  useEffect(() => {
    const injectedTags = [];
    const updateOrCreateMeta = (property, content, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (isName) {
          element.setAttribute("name", property);
        } else {
          element.setAttribute("property", property);
        }
        document.head.appendChild(element);
        injectedTags.push(element);
      }
      element.setAttribute("content", content);
    };

    updateOrCreateMeta("og:title", event.title);
    updateOrCreateMeta("og:description", event.description?.slice(0, 160) || "");
    updateOrCreateMeta("og:image", event.image || event.bannerPreview);
    updateOrCreateMeta("twitter:card", "summary_large_image", true);

    return () => {
      // Clean up only the injected tags to preserve baseline SEO
      injectedTags.forEach(tag => tag.remove());
    };
  }, [event]);"""
    if patch_file(file_path, old_str, new_str):
        commit_and_push("fix: prevent SEO tags from being destroyed on unmount (#10744)", branch)

def fix_10745():
    # Bug: QuotaExceededError in waitlistUtils silently drops offline joins
    branch = "fix/waitlistutils-quotaexceeded-swallowed-10745"
    checkout_branch(branch)
    file_path = "src/utils/waitlistUtils.js"
    old_str = """export const saveGlobalWaitlist = (records) => {
  try {
    localStorage.setItem(GLOBAL_WAITLIST_KEY, JSON.stringify(records));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
};"""
    new_str = """export const saveGlobalWaitlist = (records) => {
  try {
    localStorage.setItem(GLOBAL_WAITLIST_KEY, JSON.stringify(records));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw error;
    }
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
};"""
    if patch_file(file_path, old_str, new_str):
        commit_and_push("fix: throw QuotaExceededError when saving offline waitlist (#10745)", branch)

def fix_10746():
    # Bug: useNotificationPoller delete undo closure captures stale state
    branch = "fix/notification-poller-stale-undo-10746"
    checkout_branch(branch)
    file_path = "src/hooks/useNotificationPoller.js"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_str = """      const restoreNotification = () => {
        if (!isMounted.current) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === id)) return prev;
          const updated = [...prev];
          const insertAt = removedIndex >= 0 ? Math.min(removedIndex, updated.length) : 0;
          updated.splice(insertAt, 0, removedNotification);
          persist(updated, storageKeyRef.current);
          notificationsRef.current = updated;
          return updated;
        });
        if (removedWasUnread) setUnreadCount((p) => p + 1);
      };"""
      
    new_str = """      const restoreNotification = () => {
        if (!isMounted.current) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === id)) return prev;
          const updated = [...prev, removedNotification].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          persist(updated, storageKeyRef.current);
          notificationsRef.current = updated;
          return updated;
        });
        if (removedWasUnread) setUnreadCount((p) => p + 1);
      };"""
    if patch_file(file_path, old_str, new_str):
        commit_and_push("fix: prevent stale state capture during notification undo (#10746)", branch)

def fix_10747():
    # Bug: Leader election toggle loop on malformed heartbeat in sseMultiplexer
    branch = "fix/ssemultiplexer-malformed-heartbeat-loop-10747"
    checkout_branch(branch)
    file_path = "src/utils/sseMultiplexer.js"
    old_str = """      } catch (e) {
      // Invalid format, reclaim
      this.claimLocalStorageLeadership();
      return;
    }"""
    new_str = """      } catch (e) {
      // Invalid format, reclaim with jitter to prevent loops
      setTimeout(() => this.claimLocalStorageLeadership(), Math.random() * 500);
      return;
    }"""
    if patch_file(file_path, old_str, new_str):
        commit_and_push("fix: add jitter when reclaiming leadership on corrupt heartbeat (#10747)", branch)

def fix_10748():
    # Feature: Add "Apple Calendar (.ics)" export option
    branch = "feat/apple-calendar-export-10748"
    checkout_branch(branch)
    file_path = "src/components/common/AddToCalendar.jsx"
    old_str = """            <Calendar className="w-4 h-4 text-gray-400" />
            Subscribe (Apple / ICS)
          </button>"""
    new_str = """            <Calendar className="w-4 h-4 text-gray-400" />
            Export to Apple Calendar (.ics)
          </button>"""
    if patch_file(file_path, old_str, new_str):
        commit_and_push("feat: rename ICS subscription to Apple Calendar export (#10748)", branch)

def fix_10749():
    # Feature: Allow Admins to Archive past events
    branch = "feat/admin-archive-events-10749"
    checkout_branch(branch)
    file_path = "src/Pages/Events/EventDetails.js"
    # First, import Archive icon
    old_import = """import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check } from "lucide-react";"""
    new_import = """import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Archive } from "lucide-react";"""
    patch_file(file_path, old_import, new_import)
    
    old_btn = """              {isOrganizer && event.status !== "cancelled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center rounded-full border border-red-500 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel Event
                </button>
              )}"""
    new_btn = """              {isOrganizer && event.status !== "cancelled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center rounded-full border border-red-500 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel Event
                </button>
              )}
              {isOrganizer && event.status !== "cancelled" && event.status !== "archived" && (
                <button
                  onClick={() => { setEvent({ ...event, status: "archived" }); toast.success("Event Archived!"); }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-500 px-6 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                >
                  <Archive size={16} /> Archive Event
                </button>
              )}"""
    if patch_file(file_path, old_btn, new_btn):
        commit_and_push("feat: allow organizers to archive past events (#10749)", branch)

def fix_10750():
    # Feature: Anonymous event feedback submission
    branch = "feat/anonymous-feedback-submission-10750"
    checkout_branch(branch)
    file_path = "src/components/feedback/EventFeedbackForm.jsx"
    
    old_state = """  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);"""
    new_state = """  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);"""
    patch_file(file_path, old_state, new_state)
    
    old_submit = """      await submitEventFeedback({
        eventId,
        rating,
        comment: comment.trim(),
        survey: surveyAnswers
      });"""
    new_submit = """      await submitEventFeedback({
        eventId,
        rating,
        comment: comment.trim(),
        survey: surveyAnswers,
        isAnonymous
      });"""
    patch_file(file_path, old_submit, new_submit)
    
    old_ui = """              {/* Comment Section */}
              <div className="space-y-2">"""
    new_ui = """              <div className="flex items-center space-x-2 mt-4 mb-2">
                <input
                  type="checkbox"
                  id="anonymous-checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="anonymous-checkbox" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Submit Anonymously
                </label>
              </div>

              {/* Comment Section */}
              <div className="space-y-2">"""
    if patch_file(file_path, old_ui, new_ui):
        commit_and_push("feat: support anonymous event feedback submission (#10750)", branch)

def fix_10751():
    # Feature: Quick "Copy Address" button on Event Details
    branch = "feat/copy-address-button-10751"
    checkout_branch(branch)
    file_path = "src/Pages/Events/EventDetails.js"
    
    old_import = """import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Archive } from "lucide-react";"""
    new_import = """import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Archive, Copy } from "lucide-react";"""
    if not patch_file(file_path, old_import, new_import):
        old_import = """import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check } from "lucide-react";"""
        new_import = """import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Copy } from "lucide-react";"""
        patch_file(file_path, old_import, new_import)
    
    old_ui = """                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-semibold">{event.location || "Online"}</p>
                  </div>
                </div>"""
    new_ui = """                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-semibold">{event.location || "Online"}</p>
                    </div>
                  </div>
                  {event.location && event.location !== "Online" && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(event.location);
                        toast.success("Address copied!");
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy Address"
                    >
                      <Copy size={18} />
                    </button>
                  )}
                </div>"""
    if patch_file(file_path, old_ui, new_ui):
        commit_and_push("feat: add quick copy button for event address (#10751)", branch)

def fix_10752():
    # Feature: Add Email share option in EventShareButtons
    branch = "feat/email-share-option-10752"
    checkout_branch(branch)
    file_path = "src/components/events/EventShareButtons.jsx"
    
    old_ui = """        <button
          onClick={shareViaWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
        >
          WhatsApp
        </button>
      </div>"""
    new_ui = """        <button
          onClick={shareViaWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
        >
          WhatsApp
        </button>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => {
            const subject = encodeURIComponent(`Invitation: ${event.title}`);
            const body = encodeURIComponent(`Check out this event:\\n\\n${event.title}\\n${eventURL}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Email
        </button>
      </div>"""
    if patch_file(file_path, old_ui, new_ui):
        commit_and_push("feat: add email share option for events (#10752)", branch)

if __name__ == "__main__":
    fix_10743()
    fix_10744()
    fix_10745()
    fix_10746()
    fix_10747()
    fix_10748()
    fix_10749()
    fix_10750()
    fix_10751()
    fix_10752()
    print("Done applying batch 12!")
