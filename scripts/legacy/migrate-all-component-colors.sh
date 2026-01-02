#!/bin/bash

echo "🎨 Migrando cores hardcoded em propriedades de componentes..."
echo ""

# Encontrar arquivos com cores hex
files=$(find src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "#[0-9A-Fa-f]\{6\}" | grep -v ".backup")

total=0
migrated=0

for file in $files; do
  total=$((total + 1))
  echo "[$total] $file"
  
  output=$(node scripts/migrate-component-colors.js "$file" 2>&1)
  
  if echo "$output" | grep -q "Migrado"; then
    echo "$output"
    migrated=$((migrated + 1))
  else
    echo "   ⏭️  Sem cores em componentes"
  fi
  echo ""
done

echo "═══════════════════════════════════════════"
echo "📊 RESUMO"
echo "═══════════════════════════════════════════"
echo "Total processados: $total"
echo "Migrados: $migrated"
echo "═══════════════════════════════════════════"
