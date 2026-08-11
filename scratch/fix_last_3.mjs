import fs from 'fs';
import { execSync } from 'child_process';

const exec = (cmd) => {
  console.log(`Executing: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

try { exec('git checkout master'); } catch {}

// 8. "Clear All" for Notification Inbox (Replaces Mark all as read since it was already there)
exec('git checkout master');
exec('git checkout -b feat/notification-clear-all');
let nd = fs.readFileSync('src/components/notifications/NotificationDropdown.jsx', 'utf8');
const clearAllStr = `          <button 
            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
            onClick={() => {
              notifications.forEach(n => deleteNotification(n.id));
            }}
          >
            Clear All
          </button>`;
nd = nd.replace('<span>Notifications</span>', `<span>Notifications</span>\n${clearAllStr}`);
fs.writeFileSync('src/components/notifications/NotificationDropdown.jsx', nd);
exec('git commit -am "feat: Implement Clear All button in notification dropdown"');

// 9. Offline Queue Visualizer and Manual Sync Trigger
exec('git checkout master');
exec('git checkout -b feat/offline-queue-visualizer');
let oqv = fs.readFileSync('src/components/user/UserDashboard.jsx', 'utf8');
const syncBtn = `
      {myEventsLoading && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('eventra-offline-queue-sync'))}
          className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
