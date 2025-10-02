#!/bin/bash

# Script de Validação - Cores BJJ Control
# Verifica se há cores hardcoded antigas que devem ser atualizadas

echo ""
echo "🔍 Validação de Cores BJJ Control"
echo "═══════════════════════════════════════════"
echo ""

# Contadores
total_issues=0

# Cores antigas que NÃO devem existir mais
echo "📋 Verificando cores antigas..."
echo ""

# Background antigo
old_bg_count=$(grep -r "#0D0D0D" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $old_bg_count -gt 0 ]; then
  echo "❌ Encontrado #0D0D0D (deve ser COLORS.background.default): $old_bg_count ocorrências"
  grep -rn "#0D0D0D" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
  total_issues=$((total_issues + old_bg_count))
else
  echo "✅ #0D0D0D: Nenhuma ocorrência (correto)"
fi

# Cards antigos
old_card_count=$(grep -r "#1A1A1A" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $old_card_count -gt 0 ]; then
  echo "❌ Encontrado #1A1A1A (deve ser COLORS.background.paper): $old_card_count ocorrências"
  grep -rn "#1A1A1A" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
  total_issues=$((total_issues + old_card_count))
else
  echo "✅ #1A1A1A: Nenhuma ocorrência (correto)"
fi

# Elevated antigo
old_elevated_count=$(grep -r "#212121" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $old_elevated_count -gt 0 ]; then
  echo "❌ Encontrado #212121 (deve ser COLORS.background.elevated): $old_elevated_count ocorrências"
  grep -rn "#212121" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
  total_issues=$((total_issues + old_elevated_count))
else
  echo "✅ #212121: Nenhuma ocorrência (correto)"
fi

# Texto secundário antigo
old_text_count=$(grep -r "#E0E0E0" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $old_text_count -gt 0 ]; then
  echo "❌ Encontrado #E0E0E0 (deve ser COLORS.text.secondary): $old_text_count ocorrências"
  grep -rn "#E0E0E0" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
  total_issues=$((total_issues + old_text_count))
else
  echo "✅ #E0E0E0: Nenhuma ocorrência (correto)"
fi

# Bordas antigas
old_border_count=$(grep -r "borderColor.*#424242" src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $old_border_count -gt 0 ]; then
  echo "⚠️  Encontrado borderColor: #424242: $old_border_count ocorrências"
  echo "   (Pode estar correto se usar COLORS.border.default)"
fi

echo ""
echo "═══════════════════════════════════════════"
echo ""

# Verificar uso correto de COLORS
echo "📋 Verificando uso de Design Tokens..."
echo ""

colors_usage=$(grep -r "COLORS\." src/presentation --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "✅ Uso de COLORS.*: $colors_usage ocorrências"

colors_background=$(grep -r "COLORS\.background\." src/presentation --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "✅ COLORS.background.*: $colors_background ocorrências"

colors_card=$(grep -r "COLORS\.card\." src/presentation --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "✅ COLORS.card.*: $colors_card ocorrências"

colors_text=$(grep -r "COLORS\.text\." src/presentation --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "✅ COLORS.text.*: $colors_text ocorrências"

colors_button=$(grep -r "COLORS\.button\." src/presentation --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "✅ COLORS.button.*: $colors_button ocorrências"

echo ""
echo "═══════════════════════════════════════════"
echo ""

# Verificar imports de designTokens
echo "📋 Verificando imports de Design Tokens..."
echo ""

import_count=$(grep -r "from.*designTokens" src/presentation --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "✅ Imports de designTokens: $import_count arquivos"

echo ""
echo "═══════════════════════════════════════════"
echo ""

# Resultado final
if [ $total_issues -eq 0 ]; then
  echo "🎉 VALIDAÇÃO APROVADA!"
  echo ""
  echo "✅ Nenhuma cor hardcoded antiga encontrada"
  echo "✅ Todos os arquivos usando Design Tokens"
  echo "✅ Migração para cores BJJ Control: COMPLETA"
  echo ""
  echo "📊 Estatísticas:"
  echo "   - Uso de COLORS.*: $colors_usage ocorrências"
  echo "   - Arquivos com imports: $import_count"
  echo ""
  echo "🚀 Próximo passo: Testes visuais"
  echo "   Execute: npx expo start --clear"
  echo ""
  exit 0
else
  echo "⚠️  VALIDAÇÃO COM RESSALVAS"
  echo ""
  echo "❌ Encontradas $total_issues cores hardcoded antigas"
  echo ""
  echo "🔧 Ação recomendada:"
  echo "   Execute: node scripts/migrate-to-bjj-colors.js src/presentation"
  echo ""
  exit 1
fi
