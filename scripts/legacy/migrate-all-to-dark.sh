#!/bin/bash

# Script para migrar todas as telas para Dark Theme
# Processa arquivos em lote de forma segura

echo "🌑 Migração Automática para Dark Theme"
echo "======================================"
echo ""

# Lista de arquivos prioritários para migrar
FILES=(
  # Telas de Seleção
  "src/presentation/screens/auth/AcademiaSelectionScreen.js"
  
  # Dashboards
  "src/presentation/screens/student/StudentDashboard.js"
  "src/presentation/screens/instructor/InstructorDashboard.js"
  "src/presentation/screens/admin/AdminDashboard.js"
  
  # Navegadores
  "src/presentation/navigation/StudentNavigator.js"
  "src/presentation/navigation/InstructorNavigator.js"
  "src/presentation/navigation/AdminNavigator.js"
  
  # Telas compartilhadas importantes
  "src/presentation/screens/shared/ProfileScreen.js"
  "src/presentation/screens/shared/SettingsScreen.js"
  
  # Componentes principais
  "src/presentation/components/UniversalHeader.js"
)

# Contador
TOTAL=0
SUCCESS=0
SKIPPED=0

# Processa cada arquivo
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📄 Processando: $file"
    node scripts/migrate-to-dark-theme.js "$file"
    
    if [ $? -eq 0 ]; then
      ((SUCCESS++))
    fi
    ((TOTAL++))
  else
    echo "⚠️  Arquivo não encontrado: $file"
    ((SKIPPED++))
  fi
  echo ""
done

echo ""
echo "======================================"
echo "📊 RESUMO FINAL"
echo "======================================"
echo "Total de arquivos: $TOTAL"
echo "Processados com sucesso: $SUCCESS"
echo "Não encontrados: $SKIPPED"
echo "======================================"
echo ""
echo "✅ Migração concluída!"
echo ""
echo "⚠️  PRÓXIMOS PASSOS:"
echo "1. Teste o app: npx expo start --clear"
echo "2. Verifique visualmente as telas"
echo "3. Se tudo OK, remova backups: find src -name '*.backup-dark' -delete"
echo ""
