#!/bin/bash

# Restore original App.tsx after E2E testing

echo "🔄 Restaurando App.tsx original..."

if [ -f "App.backup.tsx" ]; then
    cp App.backup.tsx App.tsx
    rm App.backup.tsx
    echo "✅ App.tsx restaurado com sucesso!"
    echo "✅ Backup removido"
else
    echo "❌ Erro: App.backup.tsx não encontrado!"
    echo "Por favor, restaure manualmente se necessário."
    exit 1
fi
