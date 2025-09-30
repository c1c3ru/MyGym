#!/bin/bash

# Script para adicionar imports faltantes de COLORS

files=(
  "src/presentation/screens/shared/ImprovedCalendarScreen.js"
  "src/presentation/screens/theme/adminTheme.js"
  "src/presentation/navigation/StudentNavigator.js"
  "src/presentation/navigation/AdminNavigator.js"
  "src/presentation/navigation/SharedNavigator.js"
  "src/presentation/components/ResponsiveContainer.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Corrigindo: $file"
    
    # Verificar se já tem o import
    if ! grep -q "from '@presentation/theme/designTokens'" "$file"; then
      # Encontrar a última linha de import
      last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      
      if [ -n "$last_import" ]; then
        # Adicionar o import após a última linha de import
        sed -i "${last_import}a import { COLORS } from '@presentation/theme/designTokens';" "$file"
        echo "  ✅ Import adicionado"
      fi
    else
      echo "  ⏭️  Já tem import"
    fi
  fi
done

echo ""
echo "✅ Imports corrigidos!"
