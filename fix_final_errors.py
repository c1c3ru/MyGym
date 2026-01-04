import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # 1. Fix designTokens imports
    tokens_to_check = ['SPACING', 'FONT_SIZE', 'FONT_WEIGHT', 'BORDER_RADIUS', 'BORDER_WIDTH', 'ELEVATION']
    used_tokens = [t for t in tokens_to_check if t in content]
    
    if used_tokens:
        import_match = "@presentation/theme/designTokens"
        if import_match in content:
            # Update existing import
            import_line_start = content.find("import {")
            import_line_end = content.find("} from '" + import_match + "'")
            if import_line_end == -1:
                 import_line_end = content.find('} from "' + import_match + '"')
            
            if import_line_start != -1 and import_line_end != -1 and import_line_start < import_line_end:
                 current_imports = content[import_line_start+8:import_line_end].strip()
                 imports_list = [i.strip() for i in current_imports.split(',')]
                 for t in used_tokens:
                     if t not in imports_list:
                         imports_list.append(t)
                 new_imports = ", ".join(sorted(list(set(imports_list))))
                 content = content[:import_line_start+8] + " " + new_imports + " " + content[import_line_end:]
        else:
            # Add new import if COLORS is not there either (or add to COLORS if it is there)
            if 'COLORS' in content and 'import { COLORS }' in content:
                 # It probably has import { COLORS } from ...
                 content = content.replace('import { COLORS }', 'import { COLORS, ' + ', '.join(used_tokens))
            elif any(t in content for t in used_tokens):
                 # Add to top after imports
                 lines = content.split('\n')
                 last_import_idx = -1
                 for i, line in enumerate(lines):
                     if line.startswith('import '):
                         last_import_idx = i
                 if last_import_idx != -1:
                     lines.insert(last_import_idx + 1, f"import {{ {', '.join(used_tokens)} }} from '@presentation/theme/designTokens';")
                     content = '\n'.join(lines)

    # 2. Fix specific missing tokens
    content = content.replace('BORDER_RADIUS.xs4', 'BORDER_RADIUS.sm')
    
    # 3. Fix platform.ts indexing
    if 'platform.ts' in filepath:
        content = content.replace('const supported = [\'web\', \'ios\', \'android\'];', 'const supported = [\'web\', \'ios\', \'android\'] as const;')

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

# Files to target specifically
targets = [
    'src/presentation/components/ConsistentLoadingStates.tsx',
    'src/presentation/components/ErrorBoundary.tsx',
    'src/presentation/screens/LoginScreen.tsx',
    'src/presentation/screens/student/CheckInScreen.tsx',
    'src/shared/utils/platform.ts'
]

for filepath in targets:
    if os.path.exists(filepath):
        if fix_file(filepath):
            print(f"Fixed (Final): {filepath}")
