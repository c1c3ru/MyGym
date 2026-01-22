#!/usr/bin/env python3
"""
Script para identificar problemas de contraste de texto em componentes React Native
Analisa arquivos .tsx e .js procurando por padrões problemáticos
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple

# Padrões problemáticos a procurar
PROBLEMATIC_PATTERNS = [
    # Cores hardcoded que não adaptam ao tema
    (r'color:\s*["\']#[0-9A-Fa-f]{6}["\']', 'Cor hexadecimal hardcoded'),
    (r'color:\s*COLORS\.(white|black)', 'Cor COLORS.white/black hardcoded'),
    (r'color:\s*["\']white["\']', 'Cor "white" hardcoded'),
    (r'color:\s*["\']black["\']', 'Cor "black" hardcoded'),
    (r'backgroundColor:\s*COLORS\.white', 'Background branco hardcoded'),
    
    # Text sem estilo dinâmico
    (r'<Text\s+style={styles\.\w+}>', 'Text com estilo estático (verificar se adapta ao tema)'),
]

# Padrões corretos (para referência)
CORRECT_PATTERNS = [
    'theme.colors.text',
    'theme.colors.onSurface',
    'textColor',
    'secondaryTextColor',
    'profileTheme.text.primary',
    'profileTheme.text.secondary',
    'colors.onSurface',
]

def analyze_file(file_path: Path) -> List[Dict]:
    """Analisa um arquivo e retorna problemas encontrados"""
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
        for line_num, line in enumerate(lines, 1):
            for pattern, description in PROBLEMATIC_PATTERNS:
                if re.search(pattern, line):
                    # Verificar se não está em um comentário
                    if '//' not in line[:line.find(pattern)] and '/*' not in line:
                        issues.append({
                            'file': str(file_path),
                            'line': line_num,
                            'content': line.strip(),
                            'issue': description,
                            'pattern': pattern
                        })
    except Exception as e:
        print(f"Erro ao analisar {file_path}: {e}")
    
    return issues

def scan_directory(directory: Path, extensions: List[str] = ['.tsx', '.js']) -> Dict:
    """Escaneia um diretório recursivamente"""
    all_issues = {}
    
    for ext in extensions:
        for file_path in directory.rglob(f'*{ext}'):
            # Ignorar node_modules, .git, etc
            if any(part.startswith('.') or part == 'node_modules' for part in file_path.parts):
                continue
                
            issues = analyze_file(file_path)
            if issues:
                all_issues[str(file_path)] = issues
    
    return all_issues

def generate_report(issues: Dict, output_file: Path):
    """Gera relatório markdown dos problemas encontrados"""
    
    total_issues = sum(len(file_issues) for file_issues in issues.values())
    
    report = f"""# Relatório de Problemas de Contraste de Texto

**Total de arquivos com problemas:** {len(issues)}
**Total de problemas encontrados:** {total_issues}

## Padrões Corretos a Usar

```typescript
// ✅ Cores dinâmicas que adaptam ao tema
const textColor = theme.colors.text;
const secondaryTextColor = theme.colors.textSecondary;

// ✅ Para Admin/Instructor (com ProfileTheme)
const textColor = profileTheme.text.primary;
const secondaryTextColor = profileTheme.text.secondary;

// ✅ Aplicar no componente
<Text style={{{{ color: textColor }}}}>Texto</Text>
```

## Problemas por Arquivo

"""
    
    for file_path, file_issues in sorted(issues.items()):
        relative_path = file_path.replace('/home/deppi/MyGym/', '')
        report += f"\n### 📄 `{relative_path}`\n\n"
        report += f"**{len(file_issues)} problema(s) encontrado(s)**\n\n"
        
        for issue in file_issues:
            report += f"- **Linha {issue['line']}**: {issue['issue']}\n"
            report += f"  ```typescript\n  {issue['content']}\n  ```\n\n"
    
    report += """
## Ações Recomendadas

1. **Prioridade Alta**: Telas de Dashboard (Admin, Instructor, Student)
2. **Prioridade Média**: Telas de listagem e detalhes
3. **Prioridade Baixa**: Telas de configuração e onboarding

## Checklist de Correção

- [ ] Substituir cores hardcoded por variáveis dinâmicas
- [ ] Adicionar `const textColor = theme.colors.text`
- [ ] Aplicar `{{ color: textColor }}` em Text components
- [ ] Testar em light e dark mode
- [ ] Verificar contraste WCAG AA (4.5:1)
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n✅ Relatório gerado: {output_file}")
    print(f"📊 {len(issues)} arquivos com problemas")
    print(f"🔍 {total_issues} problemas encontrados")

def main():
    """Função principal"""
    project_root = Path('/home/deppi/MyGym')
    screens_dir = project_root / 'src' / 'presentation' / 'screens'
    output_file = project_root / '.agent' / 'reports' / 'text-contrast-issues.md'
    
    # Criar diretório de reports se não existir
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    print("🔍 Analisando arquivos de telas...")
    print(f"📁 Diretório: {screens_dir}")
    
    issues = scan_directory(screens_dir)
    
    if issues:
        generate_report(issues, output_file)
    else:
        print("\n✅ Nenhum problema encontrado!")

if __name__ == '__main__':
    main()
