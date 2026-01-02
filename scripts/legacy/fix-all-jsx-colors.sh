#!/bin/bash

echo "🔧 Corrigindo TODAS as strings COLORS em atributos JSX..."

# Encontrar todos os arquivos .js
files=$(find src/presentation -name "*.js" -type f | grep -v ".backup")

count=0

for file in $files; do
  # Verificar se tem strings COLORS em atributos
  if grep -qE '(color|Color)="COLORS\.' "$file"; then
    echo "Corrigindo: $file"
    
    # Corrigir todos os atributos *color e *Color com strings "COLORS.xxx"
    sed -i -E 's/([a-zA-Z]+[Cc]olor)="(COLORS\.[a-zA-Z0-9\[\].]+)"/\1={\2}/g' "$file"
    
    count=$((count + 1))
  fi
done

echo ""
echo "✅ $count arquivos corrigidos!"
