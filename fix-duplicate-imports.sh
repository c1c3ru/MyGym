#!/bin/bash

# Script para corrigir imports duplicados de COLORS

echo "🔍 Procurando arquivos com imports duplicados de COLORS..."

# Função para corrigir imports duplicados em um arquivo
fix_duplicate_imports() {
    local file="$1"
    echo "📝 Corrigindo: $file"
    
    # Criar backup
    cp "$file" "$file.backup.$(date +%s)"
    
    # Remover imports duplicados de COLORS mantendo apenas o import completo
    # Primeiro, remove imports simples de COLORS se há um import completo
    if grep -q "import.*{.*COLORS.*}" "$file"; then
        # Remove linhas que importam apenas COLORS
        sed -i '/^import { COLORS } from/d' "$file"
        echo "  ✅ Removido import simples duplicado"
    fi
    
    # Remove imports duplicados dentro do mesmo bloco
    awk '
    /^import.*{/ {
        if (in_import) {
            # Se já estamos em um import, adiciona à linha atual
            current_import = current_import ", " $0
            gsub(/^import.*{/, "", current_import)
        } else {
            # Novo import
            current_import = $0
            in_import = 1
        }
        
        if (/}/) {
            # Fim do import
            # Remove duplicatas de COLORS
            gsub(/COLORS,.*COLORS/, "COLORS", current_import)
            gsub(/,\s*COLORS\s*,/, ", COLORS,", current_import)
            print current_import
            in_import = 0
            current_import = ""
        }
        next
    }
    
    !in_import { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

# Encontrar arquivos com imports duplicados
files_with_duplicates=$(grep -r "import.*COLORS" src --include="*.js" --include="*.ts" | grep -v "node_modules" | cut -d: -f1 | sort | uniq -c | grep -v "1 " | awk '{print $2}')

if [ -z "$files_with_duplicates" ]; then
    echo "✅ Nenhum arquivo com imports duplicados encontrado!"
else
    echo "$files_with_duplicates" | while read file; do
        fix_duplicate_imports "$file"
    done
fi

echo "✅ Correção concluída!"
