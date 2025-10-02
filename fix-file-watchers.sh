#!/bin/bash

# Script para corrigir o erro ENOSPC (file watchers limit)

echo "🔧 Corrigindo limite de file watchers..."
echo ""

# Verificar limite atual
current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "📊 Limite atual: $current_limit"
echo ""

# Aumentar limite temporariamente (até reiniciar)
echo "⚡ Aumentando limite temporariamente..."
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p
echo ""

# Tornar permanente
echo "💾 Tornando permanente..."
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
echo ""

# Verificar novo limite
new_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "✅ Novo limite: $new_limit"
echo ""

echo "🎉 Pronto! Agora você pode executar:"
echo "   npx expo start --clear"
echo ""
