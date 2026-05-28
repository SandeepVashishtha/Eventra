import os
import re

for r, d, files in os.walk('src'):
    for f in files:
        if f.endswith(('.jsx', '.tsx')):
            filepath = os.path.join(r, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Find all <button ...>
            # Use a function to replace
            def replacer(match):
                btn_attrs = match.group(1)
                if not re.search(r'\baria-label\b', btn_attrs) and not re.search(r'\btitle\b', btn_attrs):
                    return f'<button aria-label="button"{btn_attrs}>'
                return match.group(0)
                
            new_content = re.sub(r'<button([^>]+)>', replacer, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Fixed {filepath}")
