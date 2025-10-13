#!/bin/bash

echo "🔧 Corrigindo TODAS as strings hardcoded 'currentTheme.*' no projeto..."

# Função para corrigir um arquivo
fix_file() {
    local file="$1"
    if [ ! -f "$file" ]; then
        echo "⚠️  Arquivo não encontrado: $file"
        return
    fi
    
    echo "Corrigindo: $file"
    
    # Backup do arquivo
    cp "$file" "$file.backup.$(date +%s)"
    
    # Substituições completas
    sed -i "s/'currentTheme\.black + \"80\"'/COLORS.black + \"80\"/g" "$file"
    sed -i "s/'currentTheme\.black + \"4D\"'/COLORS.black + \"4D\"/g" "$file"
    sed -i "s/'currentTheme\.black'/COLORS.black/g" "$file"
    sed -i "s/'currentTheme\.white + \"E6\"'/COLORS.white + \"E6\"/g" "$file"
    sed -i "s/'currentTheme\.white + \"CC\"'/COLORS.white + \"CC\"/g" "$file"
    sed -i "s/'currentTheme\.white + \"1A\"'/COLORS.white + \"1A\"/g" "$file"
    sed -i "s/'currentTheme\.gray\[100\]'/COLORS.gray[100]/g" "$file"
    sed -i "s/'currentTheme\.gray\[300\]'/COLORS.gray[300]/g" "$file"
    sed -i "s/'currentTheme\.gray\[300\]CCC'/COLORS.gray[300]/g" "$file"
    sed -i "s/'currentTheme\.gray\[500\]'/COLORS.gray[500]/g" "$file"
    sed -i "s/'currentTheme\.gray\[600\]'/COLORS.gray[600]/g" "$file"
    sed -i "s/'currentTheme\.gray\[700\]'/COLORS.gray[700]/g" "$file"
    sed -i "s/'currentTheme\.success\[50\]'/COLORS.success[50]/g" "$file"
    sed -i "s/'currentTheme\.primary\[500\]'/COLORS.primary[500]/g" "$file"
    sed -i "s/'currentTheme\.error\[500\]'/COLORS.error[500]/g" "$file"
    sed -i "s/'currentTheme\.error\[800\]'/COLORS.error[800]/g" "$file"
    sed -i "s/'currentTheme\.warning\[500\]'/COLORS.warning[500]/g" "$file"
    sed -i "s/'currentTheme\.info\[500\]'/COLORS.info[500]/g" "$file"
    sed -i "s/'currentTheme\.info\[700\]'/COLORS.info[700]/g" "$file"
    sed -i "s/'currentTheme\.info\[800\]'/COLORS.info[800]/g" "$file"
    sed -i "s/'currentTheme\.background\.paper'/COLORS.background.paper/g" "$file"
    sed -i "s/'currentTheme\.background\.light'/COLORS.background.light/g" "$file"
    
    echo "✅ $file corrigido"
}

# Buscar todos os arquivos com 'currentTheme.' em strings
echo "🔍 Buscando arquivos com strings 'currentTheme.*'..."
files=$(grep -r -l "'currentTheme\." src/ | grep -v "\.backup" | grep -v "_old\.js")

if [ -z "$files" ]; then
    echo "✅ Nenhum arquivo com strings 'currentTheme.*' encontrado!"
    exit 0
fi

echo "📋 Arquivos encontrados:"
echo "$files"
echo ""

# Corrigir cada arquivo
count=0
for file in $files; do
    fix_file "$file"
    ((count++))
done

echo ""
echo "🎉 Correção concluída!"
echo "📊 Arquivos corrigidos: $count"
echo ""
echo "Para verificar as mudanças:"
echo "git diff --name-only"
echo ""
echo "Para remover backups após validação:"
echo "find src -name '*.backup.*' -delete"
