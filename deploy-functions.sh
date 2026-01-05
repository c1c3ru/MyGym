#!/bin/bash

# Script de Deploy das Cloud Functions do MyGym
# Este script facilita o deploy das functions para o Firebase

set -e

echo "🚀 MyGym - Deploy de Cloud Functions"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI não está instalado!${NC}"
    echo "Instale com: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI encontrado${NC}"

# Verificar se está logado
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Você não está logado no Firebase${NC}"
    echo "Fazendo login..."
    firebase login
fi

echo -e "${GREEN}✓ Autenticado no Firebase${NC}"

# Ir para o diretório functions
cd "$(dirname "$0")/functions"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Compilar TypeScript
echo ""
echo "🔨 Compilando TypeScript..."
npx tsc

# Verificar se há erros
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro na compilação TypeScript${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Compilação bem-sucedida${NC}"

# Voltar para o diretório raiz
cd ..

# Perguntar qual deploy fazer
echo ""
echo "Escolha o tipo de deploy:"
echo "1) Deploy de todas as functions"
echo "2) Deploy apenas de functions específicas"
echo "3) Apenas validar (não fazer deploy)"
read -p "Opção (1-3): " option

case $option in
    1)
        echo ""
        echo "🚀 Fazendo deploy de todas as functions..."
        firebase deploy --only functions
        ;;
    2)
        echo ""
        echo "Functions disponíveis:"
        echo "  - sendNewClassNotification"
        echo "  - checkInGeo"
        echo "  - processPayment"
        echo "  - onEvaluationUpdate"
        echo "  - scheduledFirestoreExport"
        echo "  - sendPaymentReminder"
        echo "  - sendClassReminder"
        echo ""
        read -p "Digite o nome da function (separadas por vírgula): " functions
        
        IFS=',' read -ra FUNC_ARRAY <<< "$functions"
        for func in "${FUNC_ARRAY[@]}"; do
            func=$(echo "$func" | xargs) # trim whitespace
            echo "🚀 Fazendo deploy de: $func"
            firebase deploy --only functions:$func
        done
        ;;
    3)
        echo ""
        echo -e "${GREEN}✓ Validação concluída com sucesso!${NC}"
        echo "Nenhum deploy foi realizado."
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo ""
    echo "📊 Para ver os logs:"
    echo "   firebase functions:log"
    echo ""
    echo "🔍 Para testar localmente:"
    echo "   firebase emulators:start"
else
    echo ""
    echo -e "${RED}❌ Erro durante o deploy${NC}"
    exit 1
fi
