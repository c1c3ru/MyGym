#!/bin/bash

# Script para corrigir todas as strings hardcoded 'currentTheme.*' no projeto

echo "🔧 Corrigindo strings hardcoded 'currentTheme.*' em todo o projeto..."

# Função para corrigir um arquivo
fix_file() {
    local file="$1"
    echo "Corrigindo: $file"
    
    # Backup do arquivo
    cp "$file" "$file.backup"
    
    # Substituições usando sed
    sed -i "s/'currentTheme\.black + \"80\"'/COLORS.black + \"80\"/g" "$file"
    sed -i "s/'currentTheme\.gray\[300\]'/COLORS.gray[300]/g" "$file"
    sed -i "s/'currentTheme\.gray\[500\]'/COLORS.gray[500]/g" "$file"
    sed -i "s/'currentTheme\.success\[50\]'/COLORS.success[50]/g" "$file"
    sed -i "s/'currentTheme\.white + \"CC\"'/COLORS.white + \"CC\"/g" "$file"
    sed -i "s/'currentTheme\.white + \"1A\"'/COLORS.white + \"1A\"/g" "$file"
    sed -i "s/'currentTheme\.primary\[500\]'/COLORS.primary[500]/g" "$file"
    sed -i "s/'currentTheme\.error\[800\]'/COLORS.error[800]/g" "$file"
    sed -i "s/'currentTheme\.warning\[500\]'/COLORS.warning[500]/g" "$file"
    sed -i "s/'currentTheme\.info\[800\]'/COLORS.info[800]/g" "$file"
    
    echo "✅ $file corrigido"
}

# Lista de arquivos com problemas
files=(
    "src/presentation/screens/instructor/InstructorStudents.js"
    "src/presentation/screens/onboarding/AcademyOnboardingScreen.js"
    "src/presentation/screens/student/CheckInScreen.js"
    "src/presentation/screens/shared/InjuryHistoryScreen.js"
    "src/presentation/screens/shared/PrivacyPolicyScreen.js"
    "src/presentation/screens/shared/PrivacySettingsScreen.js"
    "src/presentation/screens/admin/GraduationManagementScreen.js"
)

# Corrigir cada arquivo
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "⚠️  Arquivo não encontrado: $file"
    fi
done

echo ""
echo "🎉 Correção concluída!"
echo "📊 Arquivos corrigidos: ${#files[@]}"
echo ""
echo "Para verificar as mudanças:"
echo "git diff --name-only"
echo ""
echo "Para remover backups após validação:"
echo "find src -name '*.backup' -delete"
