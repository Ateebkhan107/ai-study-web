import os
import glob

files = glob.glob('src/utils/*.js')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Replace relative imports with alias imports
    content = content.replace('"./supabase"', '"@/lib/supabase"')
    content = content.replace('"./supabaseClient"', '"@/lib/supabaseClient"')
    content = content.replace('"./supabaseAdmin"', '"@/lib/supabaseAdmin"')
    content = content.replace("'./supabase'", "'@/lib/supabase'")
    content = content.replace("'./supabaseClient'", "'@/lib/supabaseClient'")
    content = content.replace("'./supabaseAdmin'", "'@/lib/supabaseAdmin'")

    # Also handle relative imports of moved files from within other moved files
    content = content.replace('"./badgeEngine"', '"@/utils/badgeEngine"')
    content = content.replace("'./badgeEngine'", "'@/utils/badgeEngine'")
    content = content.replace('"./levelEngine"', '"@/utils/levelEngine"')
    
    with open(f, 'w') as file:
        file.write(content)
