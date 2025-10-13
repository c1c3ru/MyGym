#!/bin/bash

# Script para encontrar e corrigir arquivos que usam COLORS sem importar

echo "🔍 Procurando arquivos que usam COLORS sem importar..."

# Função para verificar se um arquivo usa COLORS mas não importa
check_and_fix_file() {
    local file="$1"
    
    # Verifica se o arquivo usa COLORS
    if grep -q "COLORS\." "$file"; then
        # Verifica se já importa COLORS
        if ! grep -q "import.*COLORS" "$file"; then
            echo "📝 Corrigindo: $file"
            
            # Encontra a linha de import do React ou primeira linha de import
            local import_line=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
            
            if [ -n "$import_line" ]; then
                # Adiciona o import após a primeira linha de import
                sed -i "${import_line}a import { COLORS } from '@presentation/theme/designTokens';" "$file"
                echo "  ✅ Import adicionado na linha $((import_line + 1))"
            else
                # Se não há imports, adiciona no início
                sed -i '1i import { COLORS } from '\''@presentation/theme/designTokens'\'';' "$file"
                echo "  ✅ Import adicionado no início do arquivo"
            fi
        fi
    fi
}

# Procurar em todos os arquivos JS/TS
find src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -name "*.backup*" \
  -not -name "designTokens.js" | \
while read file; do
    check_and_fix_file "$file"
done

echo "✅ Verificação concluída!"
echo "📊 Verificando arquivos corrigidos..."

# Verificar quantos arquivos ainda têm problema
problematic_files=$(find src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -name "*.backup*" \
  -not -name "designTokens.js" \
  -exec sh -c 'grep -q "COLORS\." "$1" && ! grep -q "import.*COLORS" "$1" && echo "$1"' _ {} \;)

if [ -z "$problematic_files" ]; then
  echo "🎉 Todos os arquivos foram corrigidos!"
else
  echo "⚠️  Ainda há arquivos com problemas:"
  echo "$problematic_files"
fi
