#!/bin/bash

# Script para converter arquivos JavaScript para TypeScript
# Prioridade: Arquivos críticos de autenticação e contextos

echo "🔄 Convertendo arquivos JavaScript para TypeScript..."
echo ""

# Função para converter arquivo
convert_file() {
    local js_file=$1
    local ts_file="${js_file%.js}.ts"
    
    if [ -f "$js_file" ]; then
        echo "📝 Convertendo: $js_file → $ts_file"
        
        # Criar backup
        cp "$js_file" "${js_file}.backup-convert"
        
        # Renomear para .ts
        mv "$js_file" "$ts_file"
        
        echo "   ✅ Convertido"
    else
        echo "   ⚠️  Arquivo não encontrado: $js_file"
    fi
}

# Função para converter arquivo JSX para TSX
convert_jsx_file() {
    local jsx_file=$1
    local tsx_file="${jsx_file%.jsx}.tsx"
    
    if [ -f "$jsx_file" ]; then
        echo "📝 Convertendo: $jsx_file → $tsx_file"
        
        # Criar backup
        cp "$jsx_file" "${jsx_file}.backup-convert"
        
        # Renomear para .tsx
        mv "$jsx_file" "$tsx_file"
        
        echo "   ✅ Convertido"
    else
        echo "   ⚠️  Arquivo não encontrado: $jsx_file"
    fi
}

echo "═══════════════════════════════════════════════════════"
echo "FASE 1: Hooks de Autenticação"
echo "═══════════════════════════════════════════════════════"

# Nota: useAuthActions.js precisa ser mantido por enquanto (legacy)
# convert_file "src/presentation/hooks/useAuthActions.js"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "FASE 2: Telas de Autenticação (Alta Prioridade)"
echo "═══════════════════════════════════════════════════════"

# RegisterScreen é crítico
# convert_file "src/presentation/screens/auth/RegisterScreen.js"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "FASE 3: Contextos (Média Prioridade)"
echo "═══════════════════════════════════════════════════════"

# AuthContext é muito complexo, deixar para depois
# convert_file "src/presentation/contexts/AuthContext.js"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Conversão Concluída!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Próximos passos:"
echo "1. Adicionar tipagens TypeScript aos arquivos convertidos"
echo "2. Corrigir erros de compilação: npx tsc --noEmit"
echo "3. Testar funcionalidades afetadas"
echo "4. Remover backups .backup-convert após validação"
echo ""
echo "⚠️  IMPORTANTE: A conversão apenas renomeia os arquivos."
echo "   Você ainda precisa adicionar tipagens TypeScript manualmente."
