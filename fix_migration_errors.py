import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Fix getString imports
    if 'getString' in content and 'import { getString }' not in content and 'const { getString }' not in content:
        # Avoid adding to context files or theme.ts where it's defined
        if 'ThemeContext.tsx' not in filepath and 'utils/theme.ts' not in filepath and 'designTokens.ts' not in filepath:
            # Insert after the last import
            lines = content.split('\n')
            last_import_idx = -1
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import_idx = i
            
            if last_import_idx != -1:
                lines.insert(last_import_idx + 1, 'import { getString } from "@utils/theme";')
                content = '\n'.join(lines)
            else:
                content = 'import { getString } from "@utils/theme";\n' + content

    # Fix Token names
    # SPACING
    content = content.replace('SPACING.base', 'SPACING.md')
    content = content.replace('SPACING.sm0', '0')
    
    # COLORS
    content = content.replace('COLORS.background.light', 'COLORS.white')
    content = content.replace('COLORS.background.default', 'COLORS.white')
    content = content.replace('COLORS.text.primary', 'COLORS.black')
    content = content.replace('COLORS.text.secondary', 'COLORS.gray[500]')
    content = content.replace('COLORS.text.disabled', 'COLORS.gray[300]')
    
    # FONT_WEIGHT
    content = content.replace('FONT_WEIGHT.semibold', 'FONT_WEIGHT.semiBold')
    content = content.replace('FONT_WEIGHT.extrabold', 'FONT_WEIGHT.extraBold')
    content = content.replace('FONT_WEIGHT.extralight', 'FONT_WEIGHT.extraLight')

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

# Walk through src
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            filepath = os.path.join(root, file)
            if fix_file(filepath):
                print(f"Fixed: {filepath}")
