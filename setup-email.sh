#!/bin/bash

# Script para configurar email de convites do MyGym
# Execute: bash setup-email.sh

echo "🔧 Configuração de Email para MyGym"
echo "===================================="
echo ""

# Verificar se o arquivo .env existe
if [ ! -f "functions/.env" ]; then
    echo "❌ Arquivo functions/.env não encontrado!"
    echo "Criando arquivo .env..."
    cat > functions/.env << 'EOF'
GMAIL_EMAIL=seu-email@gmail.com
GMAIL_PASSWORD=sua-senha-app-aqui
EOF
    echo "✅ Arquivo .env criado em functions/.env"
fi

echo "📧 Passo 1: Obter Senha de Aplicativo do Gmail"
echo "----------------------------------------------"
echo "1. Acesse: https://myaccount.google.com/apppasswords"
echo "2. Faça login com sua conta Gmail"
echo "3. Clique em 'Criar' e escolha 'Outro (nome personalizado)'"
echo "4. Digite 'MyGym' e clique em 'Criar'"
echo "5. Copie a senha de 16 caracteres gerada"
echo ""

read -p "Digite seu email do Gmail: " gmail_email
read -p "Digite a senha de aplicativo (16 caracteres): " gmail_password

# Atualizar arquivo .env
cat > functions/.env << EOF
# Configuração de Email para envio de convites
GMAIL_EMAIL=$gmail_email
GMAIL_PASSWORD=$gmail_password
EOF

echo ""
echo "✅ Configuração salva em functions/.env"
echo ""
echo "📦 Passo 2: Compilar e fazer deploy"
echo "-----------------------------------"

# Compilar TypeScript
cd functions
echo "Compilando TypeScript..."
npx tsc

if [ $? -eq 0 ]; then
    echo "✅ Compilação bem-sucedida"
    echo ""
    echo "🚀 Passo 3: Deploy da Cloud Function"
    echo "------------------------------------"
    cd ..
    
    read -p "Deseja fazer deploy agora? (s/n): " deploy_now
    
    if [ "$deploy_now" = "s" ] || [ "$deploy_now" = "S" ]; then
        firebase deploy --only functions:sendInviteEmail
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Configuração concluída com sucesso!"
            echo ""
            echo "✅ Agora você pode enviar convites por email!"
            echo "   Os emails serão enviados de: $gmail_email"
        else
            echo "❌ Erro no deploy. Verifique os logs acima."
        fi
    else
        echo ""
        echo "⏸️  Deploy cancelado."
        echo "   Execute quando estiver pronto: firebase deploy --only functions:sendInviteEmail"
    fi
else
    echo "❌ Erro na compilação. Verifique os erros acima."
fi
