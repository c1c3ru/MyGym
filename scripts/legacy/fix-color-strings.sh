#!/bin/bash

# Script para corrigir strings 'COLORS.xxx' para COLORS.xxx (sem aspas)

echo "🔧 Corrigindo strings COLORS em todos os arquivos..."

# Encontrar todos os arquivos .js
files=$(find src/presentation -name "*.js" -type f | grep -v ".backup")

count=0

for file in $files; do
  if grep -q "'COLORS\." "$file"; then
    echo "Corrigindo: $file"
    
    # Remover aspas de todas as variações de COLORS
    sed -i "s/'COLORS\.white'/COLORS.white/g" "$file"
    sed -i "s/'COLORS\.black'/COLORS.black/g" "$file"
    sed -i "s/'COLORS\.primary\[\([0-9]*\)\]'/COLORS.primary[\1]/g" "$file"
    sed -i "s/'COLORS\.secondary\[\([0-9]*\)\]'/COLORS.secondary[\1]/g" "$file"
    sed -i "s/'COLORS\.success\[\([0-9]*\)\]'/COLORS.success[\1]/g" "$file"
    sed -i "s/'COLORS\.error\[\([0-9]*\)\]'/COLORS.error[\1]/g" "$file"
    sed -i "s/'COLORS\.warning\[\([0-9]*\)\]'/COLORS.warning[\1]/g" "$file"
    sed -i "s/'COLORS\.info\[\([0-9]*\)\]'/COLORS.info[\1]/g" "$file"
    sed -i "s/'COLORS\.gray\[\([0-9]*\)\]'/COLORS.gray[\1]/g" "$file"
    sed -i "s/'COLORS\.background\.\([a-z]*\)'/COLORS.background.\1/g" "$file"
    sed -i "s/'COLORS\.text\.\([a-z]*\)'/COLORS.text.\1/g" "$file"
    sed -i "s/'COLORS\.border\.\([a-z]*\)'/COLORS.border.\1/g" "$file"
    
    count=$((count + 1))
  fi
done

echo ""
echo "✅ $count arquivos corrigidos!"
