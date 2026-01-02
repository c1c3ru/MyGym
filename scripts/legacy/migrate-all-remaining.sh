#!/bin/bash

# Script para migrar todos os arquivos restantes para Design Tokens
# Uso: bash scripts/migrate-all-remaining.sh

echo "🚀 Iniciando migração em massa de todos os arquivos restantes..."
echo ""

# Contador
total=0
success=0
skipped=0

# Encontrar todos os arquivos .js em src/presentation (exceto testes e backups)
files=$(find src/presentation -name "*.js" -type f ! -name "*.test.js" ! -name "*.spec.js" ! -name "*.backup" | sort)

for file in $files; do
  total=$((total + 1))
  echo "[$total] Processando: $file"
  
  # Executar migração
  output=$(node scripts/migrate-to-design-tokens.js "$file" 2>&1)
  
  if echo "$output" | grep -q "Nenhuma alteração necessária"; then
    echo "   ⏭️  Já migrado ou sem valores hardcoded"
    skipped=$((skipped + 1))
  elif echo "$output" | grep -q "Migrado com sucesso"; then
    substituicoes=$(echo "$output" | grep -oP '\d+(?= substituições)')
    echo "   ✅ Migrado! $substituicoes substituições"
    success=$((success + 1))
  else
    echo "   ⚠️  Erro ou aviso"
  fi
  
  echo ""
done

echo "═══════════════════════════════════════════"
echo "📊 RESUMO DA MIGRAÇÃO EM MASSA"
echo "═══════════════════════════════════════════"
echo "Total de arquivos processados: $total"
echo "Migrados com sucesso: $success"
echo "Já migrados/sem alterações: $skipped"
echo "═══════════════════════════════════════════"
echo ""
echo "🎉 Migração em massa concluída!"
echo ""
echo "📝 Próximos passos:"
echo "1. Verificar se o app compila: npm start"
echo "2. Testar funcionalidades principais"
echo "3. Remover backups após validação: find src -name '*.backup' -delete"
echo "4. Executar ESLint: npm run lint"
