import fs from 'fs';
import { execSync } from 'child_process';

function runCmd(cmd) {
    console.log(`Running: ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit', shell: 'powershell.exe' });
    } catch (e) {
        console.error(`Command failed: ${cmd}`);
        console.error(e.message);
    }
}

function checkoutBranch(branchName) {
    runCmd("git checkout master");
    runCmd("git reset --hard HEAD");
    runCmd(`git checkout -b ${branchName}`);
}

function commitAndPush(msg, branchName) {
    runCmd("git add .");
    runCmd(`git commit -m "${msg}"`);
    runCmd(`git push -u origin ${branchName}`);
}

function patchFile(filePath, oldStr, newStr) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes(oldStr)) {
        console.warn(`Warning: String not found in ${filePath}`);
        return false;
    }
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
}

function fix_10743() {
    const branch = "fix/eventmaterials-polling-leak-10743";
    checkoutBranch(branch);
    const filePath = "src/components/common/EventMaterials.jsx";
    const oldStr = `      const checkCompletion = setInterval(async () => {
        const completed = await isFileCached(fileId);
        if (completed) {
          clearInterval(checkCompletion);
          triggerLocalDownload(fileId, fileName);`;
    const newStr = `      let attempts = 0;
      const MAX_ATTEMPTS = 60; // 30 seconds
      const checkCompletion = setInterval(async () => {
        attempts++;
        const completed = await isFileCached(fileId);
        if (completed || attempts >= MAX_ATTEMPTS) {
          clearInterval(checkCompletion);
          if (completed) {
            triggerLocalDownload(fileId, fileName);`;
    if (patchFile(filePath, oldStr, newStr)) {
        commitAndPush("fix: prevent memory leak in EventMaterials P2P polling (#10743)", branch);
    }
}

function fix_10744() {
    const branch = "fix/eventsharebuttons-seo-cleanup-10744";
    checkoutBranch(branch);
    const filePath = "src/components/events/EventShareButtons.jsx";
    const oldStr = `  useEffect(() => {
    const updateOrCreateMeta = (property, content, isName = false) => {
      const selector = isName ? \`meta[name="\${property}"]\` : \`meta[property="\${property}"]\`;
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
  }, [event]);`;
    const newStr = `  useEffect(() => {
    const injectedTags = [];
    const updateOrCreateMeta = (property, content, isName = false) => {
      const selector = isName ? \`meta[name="\${property}"]\` : \`meta[property="\${property}"]\`;
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
  }, [event]);`;
    if (patchFile(filePath, oldStr, newStr)) {
        commitAndPush("fix: prevent SEO tags from being destroyed on unmount (#10744)", branch);
    }
}

function fix_10745() {
    const branch = "fix/waitlistutils-quotaexceeded-swallowed-10745";
    checkoutBranch(branch);
    const filePath = "src/utils/waitlistUtils.js";
    const oldStr = `export const saveGlobalWaitlist = (records) => {
  try {
    localStorage.setItem(GLOBAL_WAITLIST_KEY, JSON.stringify(records));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
};`;
    const newStr = `export const saveGlobalWaitlist = (records) => {
  try {
    localStorage.setItem(GLOBAL_WAITLIST_KEY, JSON.stringify(records));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw error;
    }
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
};`;
    if (patchFile(filePath, oldStr, newStr)) {
        commitAndPush("fix: throw QuotaExceededError when saving offline waitlist (#10745)", branch);
    }
}

function fix_10746() {
    const branch = "fix/notification-poller-stale-undo-10746";
    checkoutBranch(branch);
    const filePath = "src/hooks/useNotificationPoller.js";
    const oldStr = `      const restoreNotification = () => {
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
      };`;
    const newStr = `      const restoreNotification = () => {
        if (!isMounted.current) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === id)) return prev;
          const updated = [...prev, removedNotification].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          persist(updated, storageKeyRef.current);
          notificationsRef.current = updated;
          return updated;
        });
        if (removedWasUnread) setUnreadCount((p) => p + 1);
      };`;
    if (patchFile(filePath, oldStr, newStr)) {
        commitAndPush("fix: prevent stale state capture during notification undo (#10746)", branch);
    }
}

function fix_10747() {
    const branch = "fix/ssemultiplexer-malformed-heartbeat-loop-10747";
    checkoutBranch(branch);
    const filePath = "src/utils/sseMultiplexer.js";
    const oldStr = `      } catch (e) {
      // Invalid format, reclaim
      this.claimLocalStorageLeadership();
      return;
    }`;
    const newStr = `      } catch (e) {
      // Invalid format, reclaim with jitter to prevent loops
      setTimeout(() => this.claimLocalStorageLeadership(), Math.random() * 500);
      return;
    }`;
    if (patchFile(filePath, oldStr, newStr)) {
        commitAndPush("fix: add jitter when reclaiming leadership on corrupt heartbeat (#10747)", branch);
    }
}

function fix_10748() {
    const branch = "feat/apple-calendar-export-10748";
    checkoutBranch(branch);
    const filePath = "src/components/common/AddToCalendar.jsx";
    const oldStr = `            <Calendar className="w-4 h-4 text-gray-400" />
            Subscribe (Apple / ICS)
          </button>`;
    const newStr = `            <Calendar className="w-4 h-4 text-gray-400" />
            Export to Apple Calendar (.ics)
          </button>`;
    if (patchFile(filePath, oldStr, newStr)) {
        commitAndPush("feat: rename ICS subscription to Apple Calendar export (#10748)", branch);
    }
}

function fix_10749() {
    const branch = "feat/admin-archive-events-10749";
    checkoutBranch(branch);
    const filePath = "src/Pages/Events/EventDetails.js";
    const oldImport = `import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check } from "lucide-react";`;
    const newImport = `import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Archive } from "lucide-react";`;
    patchFile(filePath, oldImport, newImport);
    
    const oldBtn = `              {isOrganizer && event.status !== "cancelled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center rounded-full border border-red-500 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel Event
                </button>
              )}`;
    const newBtn = `              {isOrganizer && event.status !== "cancelled" && (
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
              )}`;
    if (patchFile(filePath, oldBtn, newBtn)) {
        commitAndPush("feat: allow organizers to archive past events (#10749)", branch);
    }
}

function fix_10750() {
    const branch = "feat/anonymous-feedback-submission-10750";
    checkoutBranch(branch);
    const filePath = "src/components/feedback/EventFeedbackForm.jsx";
    
    const oldState = `  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);`;
    const newState = `  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);`;
    patchFile(filePath, oldState, newState);
    
    const oldSubmit = `      await submitEventFeedback({
        eventId,
        rating,
        comment: comment.trim(),
        survey: surveyAnswers
      });`;
    const newSubmit = `      await submitEventFeedback({
        eventId,
        rating,
        comment: comment.trim(),
        survey: surveyAnswers,
        isAnonymous
      });`;
    patchFile(filePath, oldSubmit, newSubmit);
    
    const oldUI = `              {/* Comment Section */}
              <div className="space-y-2">`;
    const newUI = `              <div className="flex items-center space-x-2 mt-4 mb-2">
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
              <div className="space-y-2">`;
    if (patchFile(filePath, oldUI, newUI)) {
        commitAndPush("feat: support anonymous event feedback submission (#10750)", branch);
    }
}

function fix_10751() {
    const branch = "feat/copy-address-button-10751";
    checkoutBranch(branch);
    const filePath = "src/Pages/Events/EventDetails.js";
    
    let oldImport = `import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Archive } from "lucide-react";`;
    let newImport = `import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Archive, Copy } from "lucide-react";`;
    if (!patchFile(filePath, oldImport, newImport)) {
        oldImport = `import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check } from "lucide-react";`;
        newImport = `import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check, Copy } from "lucide-react";`;
        patchFile(filePath, oldImport, newImport);
    }
    
    const oldUI = `                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-semibold">{event.location || "Online"}</p>
                  </div>
                </div>`;
    const newUI = `                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
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
                </div>`;
    if (patchFile(filePath, oldUI, newUI)) {
        commitAndPush("feat: add quick copy button for event address (#10751)", branch);
    }
}

function fix_10752() {
    const branch = "feat/email-share-option-10752";
    checkoutBranch(branch);
    const filePath = "src/components/events/EventShareButtons.jsx";
    
    const oldUI = `        <button
          onClick={shareViaWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
        >
          WhatsApp
        </button>
      </div>`;
    const newUI = `        <button
          onClick={shareViaWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
        >
          WhatsApp
        </button>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => {
            const subject = encodeURIComponent(\`Invitation: \${event.title}\`);
            const body = encodeURIComponent(\`Check out this event:\\n\\n\${event.title}\\n\${eventURL}\`);
            window.location.href = \`mailto:?subject=\${subject}&body=\${body}\`;
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Email
        </button>
      </div>`;
    if (patchFile(filePath, oldUI, newUI)) {
        commitAndPush("feat: add email share option for events (#10752)", branch);
    }
}

function main() {
    fix_10743();
    fix_10744();
    fix_10745();
    fix_10746();
    fix_10747();
    fix_10748();
    fix_10749();
    fix_10750();
    fix_10751();
    fix_10752();
    runCmd("git checkout master");
    console.log("Done applying batch 12!");
}

main();
