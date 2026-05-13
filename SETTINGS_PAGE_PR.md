# Settings Page — PR Generation Guide

**Issue:** [#838 - Settings page does not exist](https://github.com/SandeepVashishtha/Eventra/issues/838)
**Branch:** `feat/add-settings-page`
**Scheduled PR Date:** May 15, 2026

---

## What Was Done

### Files Changed

| File | Change |
|------|--------|
| `src/Pages/Settings/SettingsPage.js` | **New** — Full settings page with 4 sections |
| `src/App.js` | Added import + route for `/settings` |

### Settings Page Sections

1. **Appearance** — Dark mode toggle + custom cursor toggle (persists to localStorage)
2. **Notifications** — Email notifications toggle
3. **Privacy** — Profile visibility dropdown (public / registered users / private)
4. **Account** — Edit Profile link + Sign Out button

### Components Created

- `SettingRow` — Reusable row component (icon, label, description, action slot)
- `ToggleSwitch` — Reusable toggle/switch component

All settings use localStorage for persistence. Dark mode syncs with the existing `ThemeContext` system.

---

## How to Generate the PR (on May 15)

### Step 1: Pull the latest branch
```bash
cd /home/neeraj/GSSOC/Eventra
git checkout feat/add-settings-page
git pull origin feat/add-settings-page
```

### Step 2: Ensure branch is up to date with upstream master
```bash
git remote add upstream https://github.com/SandeepVashishtha/Eventra.git 2>/dev/null
git fetch upstream master
git merge upstream/master
# Resolve conflicts if any
```

### Step 3: Create the Pull Request
```bash
gh pr create \
  --repo SandeepVashishtha/Eventra \
  --head Oggy441:feat/add-settings-page \
  --base master \
  --title "feat: add settings page with theme, cursor, notifications, and privacy options" \
  --body "## Problem Solved

Settings page was missing — users couldn't manage preferences. Route /settings returned 404. The UserDashboard already had a link to /settings but no page existed.

## Approach

Created src/Pages/Settings/SettingsPage.js with four sections:

- **Appearance**: Dark mode toggle + custom cursor toggle
- **Notifications**: Email notifications toggle
- **Privacy**: Profile visibility dropdown (public/registered/private)
- **Account**: Edit Profile link + Sign Out button

All settings persist to localStorage. Added route in App.js.

## Related Issues

Closes #838

## Testing

- Navigate to /settings
- Toggle dark mode — theme switches immediately
- Toggle cursor and notifications — values saved to localStorage
- Change profile visibility dropdown
- Edit profile link navigates to /edit-profile"
```

### Step 4: Verify the PR
After creation, visit:
https://github.com/SandeepVashishtha/Eventra/pulls

Check that it shows `Closes #838` and the description is correct.

---

## Notes
- The branch is already pushed to your fork
- No conflicts expected with upstream master (as of now)
- If new commits land on upstream master before May 15, run `git merge upstream/master` first
- The theme toggle works by directly manipulating `document.body.classList` and `localStorage`
