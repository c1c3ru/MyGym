# 🔑 Configuração Rápida de Secrets

Você já tem as configurações do Firebase! Agora vamos configurar tudo no GitHub.

## 📋 Seus Valores Firebase

```
FIREBASE_API_KEY=AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI
FIREBASE_AUTH_DOMAIN=academia-app-5cf79.firebaseapp.com
FIREBASE_PROJECT_ID=academia-app-5cf79
FIREBASE_STORAGE_BUCKET=academia-app-5cf79.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=377489252583
FIREBASE_APP_ID=1:377489252583:android:87f2c3948511325769c242
```

## 🚀 Passo a Passo para Configurar

### 1. Obter Token do Expo

Execute estes comandos no terminal:

```bash
# Instalar EAS CLI (se não tiver)
npm install -g @expo/cli eas-cli

# Fazer login no Expo
expo login

# Obter token de acesso
expo whoami --json
```

O comando `expo whoami --json` retornará algo como:
```json
{
  "username": "c1c3ru",
  "accessToken": "seu-token-aqui"
}
```

**Copie o valor de `accessToken`** - esse será seu `EXPO_TOKEN`.

### 2. Configurar Secrets no GitHub

1. Vá para: https://github.com/c1c3ru/MyGym/settings/secrets/actions
2. Clique em **"New repository secret"** para cada um:

| Nome do Secret | Valor |
|----------------|-------|
| `EXPO_TOKEN` | *(token obtido acima)* |
| `FIREBASE_API_KEY` | `AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI` |
| `FIREBASE_AUTH_DOMAIN` | `academia-app-5cf79.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `academia-app-5cf79` |
| `FIREBASE_STORAGE_BUCKET` | `academia-app-5cf79.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `377489252583` |
| `FIREBASE_APP_ID` | `1:377489252583:android:87f2c3948511325769c242` |

### 3. Testar Configuração

Após configurar todos os secrets:

1. Vá para **Actions** no seu repositório
2. Selecione **"Manual Build"**
3. Clique **"Run workflow"**
4. Deixe as opções padrão e clique **"Run workflow"**

Se tudo estiver correto, o build iniciará!

## 🔧 Comandos Úteis

### Verificar Login Expo
```bash
expo whoami
eas whoami
```

### Testar Build Local
```bash
# Build preview
npm run build:android

# Ou usando EAS diretamente
eas build --platform android --profile preview
```

### Ver Builds no Dashboard
```bash
eas build:list
```

## ✅ Checklist Final

- [ ] EAS CLI instalado (`npm install -g @expo/cli eas-cli`)
- [ ] Login feito no Expo (`expo login`)
- [ ] Token obtido (`expo whoami --json`)
- [ ] Todos os 7 secrets configurados no GitHub
- [ ] Teste manual executado com sucesso

## 🎯 Próximo Passo

Depois de configurar os secrets, faça um push para testar:

```bash
git add .
git commit -m "feat: configurar build automático"
git push origin main
```

Isso deve disparar um build automático! 🚀

## 🆘 Se Algo Der Errado

### Erro: "EXPO_TOKEN is not set"
- Verifique se copiou o token corretamente
- Certifique-se de que não tem espaços extras

### Erro: "Project not found"
- Execute `eas build:configure` localmente
- Verifique se o `projectId` no `app.json` está correto

### Erro: "Firebase configuration"
- Verifique se todos os 6 secrets do Firebase estão configurados
- Confirme se não há espaços ou caracteres extras nos valores

### Build não inicia
- Verifique se todos os secrets estão configurados
- Tente executar um build manual primeiro
- Verifique os logs no GitHub Actions
