#!/bin/bash

# Script para fazer deploy das regras do Firestore

echo "🔥 Fazendo deploy das regras do Firestore..."

# Verifica se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI não encontrado. Instalando..."
    npm install -g firebase-tools
fi

# Copia as regras para o local correto
echo "📋 Copiando regras do Firestore..."
cp src/infrastructure/services/firestore.rules firestore.rules

# Faz o deploy
echo "🚀 Fazendo deploy..."
firebase deploy --only firestore:rules

echo "✅ Deploy concluído!"
echo ""
echo "⚠️  IMPORTANTE: As regras podem levar alguns minutos para serem aplicadas."
echo "    Se ainda houver erros de permissão, aguarde 2-3 minutos e tente novamente."
