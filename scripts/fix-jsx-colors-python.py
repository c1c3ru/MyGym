#!/usr/bin/env python3
import re
import glob
import os

def fix_jsx_colors(content):
    """Corrige atributos JSX com strings COLORS para usar chaves"""
    # Padrão para pegar atributos *color ou *Color com strings "COLORS.xxx"
    # Suporta quebras de linha
    pattern = r'([a-zA-Z]+[Cc]olor)="(COLORS\.[a-zA-Z0-9\[\].]+)"'
    replacement = r'\1={\2}'
    return re.sub(pattern, replacement, content)

def process_files():
    count = 0
    files_processed = []
    
    # Encontrar todos os arquivos .js
    for filepath in glob.glob('src/presentation/**/*.js', recursive=True):
        if '.backup' in filepath:
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar se tem o padrão
        if re.search(r'[a-zA-Z]+[Cc]olor="COLORS\.', content):
            new_content = fix_jsx_colors(content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                files_processed.append(filepath)
                count += 1
    
    return count, files_processed

if __name__ == '__main__':
    print("🔧 Corrigindo atributos JSX com Python...")
    count, files = process_files()
    
    print(f"\n✅ {count} arquivos corrigidos!")
    if files:
        print("\nArquivos processados:")
        for f in files[:10]:  # Mostrar apenas os primeiros 10
            print(f"  - {f}")
        if len(files) > 10:
            print(f"  ... e mais {len(files) - 10} arquivos")
