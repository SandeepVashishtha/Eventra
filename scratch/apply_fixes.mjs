import fs from 'fs';
import { execSync } from 'child_process';

const exec = (cmd) => {
  console.log(`Executing: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

// Ensure we are on master
try { exec('git checkout master'); } catch {}

// 1. EventCard Tooltip Clipped
exec('git checkout -b fix/eventcard-tooltip-overflow');
let ec = fs.readFileSync('src/components/user/EventCard.jsx', 'utf8');
ec = ec.replace('flex flex-col overflow-hidden"', 'flex flex-col"');
ec = ec.replace('className="relative h-48 overflow-hidden"', 'className="relative h-48 overflow-hidden rounded-t-3xl"');
fs.writeFileSync('src/components/user/EventCard.jsx', ec);
exec('git commit -am "fix: Prevent EventCard tooltip from being clipped by overflow"');

// 2. ErrorBoundary's "Reset Cache" Forcefully Logs Users Out
exec('git checkout master');
exec('git checkout -b fix/errorboundary-auth-reset');
let eb = fs.readFileSync('src/components/common/ErrorBoundary.jsx', 'utf8');
eb = eb.replace('["theme", "cursor", "eventra_user_prefs"]', '["theme", "cursor", "eventra_user_prefs", "token", "user", "eventra:key-material", "eventra:key-salt"]');
fs.writeFileSync('src/components/common/ErrorBoundary.jsx', eb);
exec('git commit -am "fix: Preserve auth tokens during ErrorBoundary cache reset"');

// 3. fetchWithTimeout Executes Fetch Unnecessarily on Aborted Signals
exec('git checkout master');
exec('git checkout -b fix/fetch-timeout-abort-execution');
let fwt = fs.readFileSync('src/utils/fetchWithTimeout.js', 'utf8');
fwt = fwt.replace('if (options.signal.aborted) {\n      controller.abort();\n    } else', 'if (options.signal.aborted) {\n      controller.abort();\n      throw new DOMException("Aborted", "AbortError");\n    } else');
fs.writeFileSync('src/utils/fetchWithTimeout.js', fwt);
exec('git commit -am "fix: Prevent fetch execution when abort signal is already triggered"');

// 4. Notification Poller Memory Eviction Causes Duplicate Alerts
exec('git checkout master');
exec('git checkout -b fix/notification-poller-eviction');
let np = fs.readFileSync('src/hooks/useNotificationPoller.js', 'utf8');
np = np.replace('const MAX_SEEN_IDS = 500;', 'const MAX_SEEN_IDS = 10000; // Increased to prevent eviction loops');
fs.writeFileSync('src/hooks/useNotificationPoller.js', np);
exec('git commit -am "fix: Increase notification poller cache size to prevent duplicate alerts"');

// 5. Incomplete Cleanup of Offline Queue Upgrade Event
exec('git checkout master');
exec('git checkout -b fix/offline-queue-upgrade-toast');
let oq = fs.readFileSync('src/utils/offlineQueue.js', 'utf8');
oq = `import { toast } from "./toast.js";\n` + oq;
oq = oq.replace(
  'window.dispatchEvent(',
  'toast.success(rescuedCount > 0 ? `IndexedDB schema upgraded. ${rescuedCount} queued action(s) were safely migrated.` : "IndexedDB schema upgraded. No queued actions were affected.");\n    window.dispatchEvent('
);
fs.writeFileSync('src/utils/offlineQueue.js', oq);
exec('git commit -am "fix: Add toast notification for offline queue schema upgrade"');

// 6. LazyImage Fallback SVGs Blocked by Restrictive CSPs
exec('git checkout master');
exec('git checkout -b fix/userprofile-lazyimage-csp');
let up = fs.readFileSync('src/components/user/UserProfile.js', 'utf8');
up = up.replace(
  `e.target.src =\n      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';`,
  `const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';\n    e.target.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));`
);
fs.writeFileSync('src/components/user/UserProfile.js', up);
exec('git commit -am "fix: Use Object URL instead of data URI for SVG fallback to respect CSP"');

// 7. Export Registration History to CSV
exec('git checkout master');
exec('git checkout -b feat/export-registration-history-csv');
let rt = fs.readFileSync('src/components/user/RegistrationsTab.jsx', 'utf8');
rt = rt.replace('import { Download } from "lucide-react";', ''); // Ensure clean
rt = rt.replace(
  'import { Calendar, Users, SlidersHorizontal, Search, X } from "lucide-react";',
  'import { Calendar, Users, SlidersHorizontal, Search, X, Download } from "lucide-react";'
);
if (!rt.includes('useCSVExport')) {
  rt = rt.replace('import { useTranslation } from "react-i18next";', 'import { useTranslation } from "react-i18next";\nimport useCSVExport from "../../hooks/useCSVExport";');
}
rt = rt.replace('const RegistrationsTab = ({', 'const RegistrationsTab = ({\n  filteredData,\n  loading,\n  searchTerm,\n  setSearchTerm,\n  isDebouncing,\n  selectedTypes,\n  toggleType,\n  selectedStatuses,\n  toggleStatus,\n  activeFilterCount,\n  clearAll,\n  ticketType,\n  setTicketType,\n  sortBy,\n  setSortBy,\n  setSelectedTicketEvent,\n  hasRegistrations = false,\n  totalRegistrations = 0,\n}) => {\n  const { exportToCSV } = useCSVExport();');
// Remove the original props to avoid duplication
rt = rt.replace(/const RegistrationsTab = \(\{[\s\S]+?\}\) => \{\n  const \{ exportToCSV \} = useCSVExport\(\);/, 'const RegistrationsTab = ({\n  filteredData,\n  loading,\n  searchTerm,\n  setSearchTerm,\n  isDebouncing,\n  selectedTypes,\n  toggleType,\n  selectedStatuses,\n  toggleStatus,\n  activeFilterCount,\n  clearAll,\n  ticketType,\n  setTicketType,\n  sortBy,\n  setSortBy,\n  setSelectedTicketEvent,\n  hasRegistrations = false,\n  totalRegistrations = 0,\n}) => {\n  const { exportToCSV } = useCSVExport();');

const csvButton = `
        {filteredData.length > 0 && (
          <button
            type="button"
            onClick={() => exportToCSV(filteredData, "eventra-registrations")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Download size={15} /> Export CSV
          </button>
        )}
`;
rt = rt.replace('{/* Filters */}', csvButton + '\n      {/* Filters */}');
fs.writeFileSync('src/components/user/RegistrationsTab.jsx', rt);
exec('git commit -am "feat: Add CSV export button for registration history"');

// 8. "Mark All as Read" for Notification Inbox
exec('git checkout master');
exec('git checkout -b feat/notification-mark-all-read');
let nd = fs.readFileSync('src/components/notifications/NotificationDropdown.jsx', 'utf8');
const markAllStr = `          <button 
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={() => {
              notifications.forEach(n => !n.isRead && markAsRead(n.id));
            }}
          >
            Mark all as read
          </button>`;
nd = nd.replace('<span>Notifications</span>', `<span>Notifications</span>\n${markAllStr}`);
fs.writeFileSync('src/components/notifications/NotificationDropdown.jsx', nd);
exec('git commit -am "feat: Implement Mark all as read button in notification dropdown"');

// 9. Offline Queue Visualizer and Manual Sync Trigger
exec('git checkout master');
exec('git checkout -b feat/offline-queue-visualizer');
let oqv = fs.readFileSync('src/components/user/UserDashboard.jsx', 'utf8');
const syncBtn = `
      {myEventsLoading && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('eventra-offline-queue-sync'))}
          style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none', marginLeft: '10px' }}
        >
          Sync Offline Queue
        </button>
      )}
`;
oqv = oqv.replace('<h1 className="ud-greeting">{greeting}</h1>', '<h1 className="ud-greeting">{greeting}</h1>\n' + syncBtn);
fs.writeFileSync('src/components/user/UserDashboard.jsx', oqv);
exec('git commit -am "feat: Add manual sync trigger for offline queue in dashboard"');

// 10. Granular Push Notification Preferences
exec('git checkout master');
exec('git checkout -b feat/granular-notification-preferences');
let snp = fs.readFileSync('src/utils/notificationPreferences.js', 'utf8');
snp = snp.replace('push: !!parsed.push,', 'push: !!parsed.push,\n    marketing: parsed.marketing !== false,\n    social: parsed.social !== false,\n    updates: parsed.updates !== false,');
fs.writeFileSync('src/utils/notificationPreferences.js', snp);
exec('git commit -am "feat: Support granular settings in notification preferences schema"');

exec('git checkout master');
console.log("ALL DONE!");
