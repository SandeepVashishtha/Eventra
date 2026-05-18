import re

path = 'src/Pages/Home/components/Hero.js'
with open(path, 'r') as f:
    content = f.read()

search_bar_pattern = re.compile(r'(          {/\* Global Search Bar \*/}\n          <div className="w-full max-w-2xl mx-auto mb-10 sm:mb-12">.*?          </div>\n)', re.DOTALL)
buttons_pattern = re.compile(r'(          {/\* Buttons \*/}\n          <motion\.div\n            variants={container}\n            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-16"\n          >.*?          </motion\.div>\n)', re.DOTALL)

search_match = search_bar_pattern.search(content)
buttons_match = buttons_pattern.search(content)

if search_match and buttons_match:
    search_text = search_match.group(1)
    buttons_text = buttons_match.group(1)
    
    idx_search = content.find(search_text)
    idx_buttons = content.find(buttons_text)
    
    if idx_search < idx_buttons:
        between = content[idx_search + len(search_text):idx_buttons]
        new_content = content[:idx_search] + buttons_text + between + search_text + content[idx_buttons + len(buttons_text):]
        with open(path, 'w') as f:
            f.write(new_content)
        print("Successfully swapped Search and Buttons")
    else:
        print("Search is already after Buttons or indices are wrong")
else:
    print("Could not find blocks")
