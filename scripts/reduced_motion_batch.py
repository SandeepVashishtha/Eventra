import os
from pathlib import Path
import re

root = Path('.')
files = [
    'src/Pages/Contact/ContactUs.js',
    'src/Pages/ApiDocs.js',
    'src/Pages/HelpCenter.js',
    'src/Pages/Feedback/FeedbackPage.js',
    'src/Pages/Home/components/ContributorsCarousel.js',
    'src/Pages/Home/components/Hero.js',
    'src/Pages/Home/components/WhatsHappening.js',
    'src/Pages/Projects/ProjectHero.js',
    'src/Pages/Projects/ProjectCard.js',
    'src/Pages/Projects/ProjectCTA.js',
    'src/Pages/Hackathons/HackathonHero.js',
    'src/Pages/Hackathons/HackathonCTA.js',
    'src/Pages/Hackathons/HackathonCard.js',
    'src/Pages/Hackathons/HackathonDetailsPage.js',
    'src/Pages/Hackathons/HackathonPage.js',
    'src/Pages/Hackathons/HostHackathon.js',
    'src/Pages/Events/EventHero.js',
    'src/Pages/Leaderboard/ContributorGuide.js',
    'src/Pages/Leaderboard/GSSoCContribution.js',
]

import_re = re.compile(r'from\s+["\']framer-motion["\']')
component_re = re.compile(r'^\s*(const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)?\s*=>\s*\{|function\s+\w+\s*\(|export\s+default\s+function\s+\w+\s*\()')

for rel in files:
    path = root / rel
    text = path.read_text(encoding='utf-8')
    if not import_re.search(text):
        continue
    if 'useReducedMotion' in text or 'prefersReducedMotion' in text:
        continue

    lines = text.splitlines()

    # Insert hook import before first non-import line.
    insert_at = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('import ') or stripped.startswith('export '):
            continue
        if stripped == '':
            continue
        insert_at = i
        break
    rel_import = Path(os.path.relpath(root / 'src/hooks/useReducedMotion.js', path.parent)).as_posix()
    lines.insert(insert_at, f'import useReducedMotion from "{rel_import}";')

    # Insert hook usage after the first component declaration.
    inserted = False
    for i, line in enumerate(lines):
        if component_re.match(line):
            lines.insert(i + 1, '  const prefersReducedMotion = useReducedMotion();')
            inserted = True
            break
    if not inserted:
        continue

    # Convert explicit duration values to reduced-motion-aware values.
    updated = '\n'.join(lines)
    updated = updated.replace('duration: ', 'duration: prefersReducedMotion ? 0 : ')

    path.write_text(updated + '\n', encoding='utf-8')
