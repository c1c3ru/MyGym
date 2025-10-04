# 🎯 Como Obter o Token do Expo

## ✅ EAS CLI Já Instalado!

O EAS CLI já está instalado no seu projeto. Agora vamos obter o token.

## 🔑 Obter Token do Expo

### Passo 1: Fazer Login
```bash
npx @expo/cli login
```

Você será solicitado a inserir:
- **Email/Username**: Seu email ou username do Expo
- **Password**: Sua senha do Expo

### Passo 2: Obter Token
```bash
npx @expo/cli whoami --json
```

Este comando retornará algo como:
```json
{
  "username": "c1c3ru",
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Copie o valor completo de `accessToken`** - esse será seu `EXPO_TOKEN`.

### Passo 3: Verificar EAS Login
```bash
npx eas whoami
```

## 📋 Configurar Secrets no GitHub

Agora vá para: https://github.com/c1c3ru/MyGym/settings/secrets/actions

Clique em **"New repository secret"** e adicione cada um:

| Nome do Secret | Valor |
|----------------|-------|
| `EXPO_TOKEN` | *(token obtido acima)* |
| `FIREBASE_API_KEY` | `AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI` |
| `FIREBASE_AUTH_DOMAIN` | `academia-app-5cf79.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `academia-app-5cf79` |
| `FIREBASE_STORAGE_BUCKET` | `academia-app-5cf79.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `377489252583` |
| `FIREBASE_APP_ID` | `1:377489252583:android:87f2c3948511325769c242` |

## 🧪 Testar Configuração

### Teste 1: Build Local
```bash
npx eas build --platform android --profile preview --non-interactive
```

### Teste 2: Build Manual no GitHub
1. Vá para **Actions** no repositório
2. Selecione **"Manual Build"**
3. Clique **"Run workflow"**
4. Use configurações padrão
5. Clique **"Run workflow"**

## 🚀 Testar Build Automático

Após configurar todos os secrets:

```bash
git add .
git commit -m "feat: configurar build automático"
git push origin main
```

Isso deve disparar um build automático!

## 🔍 Verificar Status

### Ver Builds EAS
```bash
npx eas build:list
```

### Ver Build Específico
```bash
npx eas build:view [BUILD_ID]
```

### Dashboard Web
- Expo: https://expo.dev/accounts/c1c3ru/projects/academia-app/builds
- GitHub: https://github.com/c1c3ru/MyGym/actions

## ❓ Não Tem Conta Expo?

Se você não tem conta no Expo:

1. Vá para: https://expo.dev/signup
2. Crie uma conta
3. Volte e execute `npx @expo/cli login`

## 🆘 Problemas Comuns

### "User not found"
- Verifique se fez login: `npx @expo/cli login`
- Confirme username: `npx @expo/cli whoami`

### "Project not found"
- Execute: `npx eas build:configure`
- Verifique `app.json` tem `owner: "c1c3ru"`

### Token inválido
- Faça logout: `npx @expo/cli logout`
- Faça login novamente: `npx @expo/cli login`
- Obtenha novo token: `npx @expo/cli whoami --json`

## ✅ Checklist Final

- [ ] Login no Expo feito (`npx @expo/cli login`)
- [ ] Token obtido (`npx @expo/cli whoami --json`)
- [ ] 7 secrets configurados no GitHub
- [ ] Teste local funcionou
- [ ] Build automático testado

Pronto! Seu sistema de build automático estará funcionando! 🎉
