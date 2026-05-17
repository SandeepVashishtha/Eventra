import re
import sys

def update_navbar():
    path = 'src/components/Layout/Navbar.js'
    with open(path, 'r') as f:
        content = f.read()
    
    new_content = content.replace(
        'className="hidden lg:flex absolute left-[48%] transform -translate-x-1/2 space-x-5 z-10"',
        'className="hidden lg:flex absolute left-[48%] transform -translate-x-1/2 gap-x-8 px-4 z-10"'
    )
    with open(path, 'w') as f:
        f.write(new_content)
    print("Updated Navbar.js")

def update_hero():
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
        
        # Replace the sequence
        if search_text + '\n' + buttons_text in content:
            new_content = content.replace(search_text + '\n' + buttons_text, buttons_text + '\n' + search_text)
            with open(path, 'w') as f:
                f.write(new_content)
            print("Updated Hero.js (Swapped Search and Buttons)")
        else:
            print("Hero.js: Could not find the exact sequence to swap.")
    else:
        print("Hero.js: Could not find Search Bar or Buttons block.")

def update_event_grids(path):
    with open(path, 'r') as f:
        content = f.read()
        
    # Replace skeleton grid
    content = content.replace(
        '<div className="grid gap-8 grid-cols-1 sm:grid-cols-1 lg:grid-cols-3">',
        '<div className="grid gap-6 grid-cols-1 md:grid-cols-3">'
    )
    
    # Replace actual grid
    content = content.replace(
        'className={`grid gap-8 ${',
        'className={`grid gap-6 ${'
    )
    content = content.replace(
        '? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-3"',
        '? "grid-cols-1 md:grid-cols-3"'
    )
    
    with open(path, 'w') as f:
        f.write(content)
    print(f"Updated grids in {path}")

update_navbar()
update_hero()
update_event_grids('src/Pages/Events/EventCardSection.js')
update_event_grids('src/Pages/Events/EventsPage.js')
