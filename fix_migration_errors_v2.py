import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Fix FONT_WEIGHT naming if I accidentally changed it to camelCase
    content = content.replace('FONT_WEIGHT.semiBold', 'FONT_WEIGHT.semibold')
    content = content.replace('FONT_WEIGHT.extraBold', 'FONT_WEIGHT.extrabold')
    content = content.replace('FONT_WEIGHT.extraLight', 'FONT_WEIGHT.light')
    
    # Fix BORDER_RADIUS aliases
    content = content.replace('BORDER_RADIUS.xs0', 'BORDER_RADIUS.xs')
    content = content.replace('BORDER_RADIUS.xs2', 'BORDER_RADIUS.sm')
    
    # Fix SPACING aliases
    # If I changed base to md, maybe I should revert it or check if it's better
    # But for now, let's fix the known missing ones
    content = content.replace('SPACING.sm0', '0')

    # Fix COLORS
    content = content.replace('COLORS.background.light', 'COLORS.white')
    content = content.replace('COLORS.background.default', 'COLORS.white')
    content = content.replace('COLORS.text.primary', 'COLORS.black')
    content = content.replace('COLORS.text.secondary', 'COLORS.gray[500]')
    content = content.replace('COLORS.text.disabled', 'COLORS.gray[300]')

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
                print(f"Fixed (Pass 2): {filepath}")
