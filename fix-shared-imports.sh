#!/bin/bash

# Script para corrigir imports @shared/utils/theme para @utils/theme

echo "🔧 Corrigindo imports @shared/utils/theme para @utils/theme..."

# Encontrar todos os arquivos com @shared/utils/theme e substituir
find src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -name "*.backup*" \
  -exec grep -l "@shared/utils/theme" {} \; | \
while read file; do
  echo "📝 Corrigindo: $file"
  sed -i "s/@shared\/utils\/theme/@utils\/theme/g" "$file"
done

echo "✅ Correção concluída!"
echo "📊 Verificando se ainda há ocorrências..."

# Verificar se ainda há ocorrências
remaining=$(find src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -name "*.backup*" \
  -exec grep -l "@shared/utils/theme" {} \; | wc -l)

if [ "$remaining" -eq 0 ]; then
  echo "🎉 Todos os imports foram corrigidos!"
else
  echo "⚠️  Ainda restam $remaining arquivos com @shared/utils/theme"
fi
