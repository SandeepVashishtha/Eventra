import os
import re

files_to_fix = [
    r"src/Pages/Leaderboard/components/PodiumCard.jsx",
    r"src/Pages/Leaderboard/components/LeaderboardTable.jsx",
    r"src/Pages/Hackathons/components/TeamMatchmaking.jsx",
    r"src/Pages/Calendar/MyCalendar.jsx",
    r"src/components/hackathons/WorkspaceBootstrapModal.jsx",
    r"src/components/events/VirtualBoothModal.jsx",
    r"src/components/AddToCalendarDropdown.jsx"
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace target="_blank" with target="_blank" rel="noopener noreferrer"
        def replacer(m):
            tag = m.group(0)
            if 'rel="noopener noreferrer"' not in tag and "rel=" not in tag:
                return tag.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
            return tag
            
        new_content = re.sub(r'<a[^>]*target="_blank"[^>]*>', replacer, content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
