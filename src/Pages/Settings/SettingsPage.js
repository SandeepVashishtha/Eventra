import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  MousePointer2,
  Bell,
  Globe,
  Eye,
  User,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";

const SettingRow = ({ icon: Icon, label, description, action }) => (
  <div className="flex items-center justify-between py-4 px-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
    </div>
    {action}
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
      checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-400" />
        {title}
      </h2>
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
      {children}
    </div>
  </div>
);

const AppearanceSection = ({ darkMode, setDarkMode, cursorEnabled, setCursorEnabled }) => (
  <SectionCard icon={Eye} title="Appearance">
    <SettingRow
      icon={darkMode ? Moon : Sun}
      label="Dark Mode"
      description="Toggle between light and dark theme"
      action={
        <ToggleSwitch
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
      }
    />
    <SettingRow
      icon={MousePointer2}
      label="Custom Cursor"
      description="Enable the custom cursor effect"
      action={
        <ToggleSwitch
          checked={cursorEnabled}
          onChange={() => setCursorEnabled(!cursorEnabled)}
        />
      }
    />
  </SectionCard>
);

const NotificationsSection = ({ emailNotifications, setEmailNotifications }) => (
  <SectionCard icon={Bell} title="Notifications">
    <SettingRow
      icon={Bell}
      label="Email Notifications"
      description="Receive email updates about events and hackathons"
      action={
        <ToggleSwitch
          checked={emailNotifications}
          onChange={() => setEmailNotifications(!emailNotifications)}
        />
      }
    />
  </SectionCard>
);

const PrivacySection = ({ profileVisibility, setProfileVisibility, visibilityOptions }) => (
  <SectionCard icon={Shield} title="Privacy">
    <SettingRow
      icon={Globe}
      label="Profile Visibility"
      description="Who can see your profile"
      action={
        <select
          value={profileVisibility}
          onChange={(e) => setProfileVisibility(e.target.value)}
          className="text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        >
          {visibilityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      }
    />
  </SectionCard>
);

const AccountSection = () => (
  <SectionCard icon={User} title="Account">
    <Link to="/edit-profile">
      <SettingRow
        icon={User}
        label="Edit Profile"
        description="Update your personal information"
        action={<ChevronRight className="w-5 h-5 text-gray-400" />}
      />
    </Link>
    <button className="w-full text-left">
      <SettingRow
        icon={LogOut}
        label="Sign Out"
        description="Log out of your account"
        action={<ChevronRight className="w-5 h-5 text-gray-400" />}
      />
    </button>
  </SectionCard>
);

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off"
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("cursor", cursorEnabled ? "on" : "off");
  }, [cursorEnabled]);

  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "registered", label: "Registered Users" },
    { value: "private", label: "Private" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-gray-800 mb-4 shadow-sm">
            <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Manage your account and application preferences
          </p>
        </div>

        <div className="space-y-6">
          <AppearanceSection
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            cursorEnabled={cursorEnabled}
            setCursorEnabled={setCursorEnabled}
          />
          <NotificationsSection
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
          />
          <PrivacySection
            profileVisibility={profileVisibility}
            setProfileVisibility={setProfileVisibility}
            visibilityOptions={visibilityOptions}
          />
          <AccountSection />
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
          Settings are saved automatically
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
