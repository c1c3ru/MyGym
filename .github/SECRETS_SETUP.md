# Configuração de Secrets para GitHub Actions

Para que as GitHub Actions funcionem corretamente, você precisa configurar os seguintes secrets no seu repositório GitHub.

## 📋 Como Configurar Secrets

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret** para cada secret abaixo

## 🔑 Secrets Necessários

### Expo/EAS Build
```
EXPO_TOKEN
```
**Como obter:**
1. Instale o Expo CLI: `npm install -g @expo/cli`
2. Faça login: `expo login`
3. Gere um token: `expo whoami --json` ou `eas whoami --json`
4. Ou crie um token em: https://expo.dev/accounts/[seu-username]/settings/access-tokens

### Firebase Configuration
```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

**Como obter:**
1. Vá para o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem)
4. Na aba **General**, role até **Your apps**
5. Selecione seu app web e copie os valores da configuração

Exemplo de configuração Firebase:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // FIREBASE_API_KEY
  authDomain: "seu-projeto.firebaseapp.com", // FIREBASE_AUTH_DOMAIN
  projectId: "seu-projeto", // FIREBASE_PROJECT_ID
  storageBucket: "seu-projeto.appspot.com", // FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789", // FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abcdef123456" // FIREBASE_APP_ID
};
```

## 🔧 Configuração do EAS

### 1. Instalar EAS CLI
```bash
npm install -g @expo/cli eas-cli
```

### 2. Login no Expo
```bash
expo login
eas login
```

### 3. Configurar projeto EAS
```bash
eas build:configure
```

### 4. Verificar configuração
```bash
eas build:list
```

## 📱 Perfis de Build Disponíveis

### `development`
- APK de desenvolvimento
- Inclui dev tools
- Não otimizado

### `preview`
- APK para testes
- Otimizado mas não assinado para produção
- Ideal para QA e testes internos

### `production-apk`
- APK de produção
- Totalmente otimizado
- Pronto para distribuição

### `production`
- AAB (Android App Bundle)
- Para publicação na Google Play Store

## 🚀 Como Usar as Actions

### Build Automático (Push/PR)
- **Push para `main`/`develop`**: Executa build preview automaticamente
- **Pull Request**: Cria build preview e comenta no PR
- **Tag/Release**: Cria build de produção e release no GitHub

### Build Manual
1. Vá para **Actions** no seu repositório
2. Selecione **Manual Build**
3. Clique em **Run workflow**
4. Escolha as opções desejadas:
   - **Perfil de build**: development, preview, production-apk, production
   - **Plataforma**: android, ios, all
   - **Mensagem**: Opcional
   - **Baixar APK**: Se deve baixar o APK após o build

### Build de Release
1. Vá para **Actions** no seu repositório
2. Selecione **Build and Release**
3. Clique em **Run workflow**
4. Informe:
   - **Versão**: Ex: 1.0.1
   - **Notas do release**: Opcional

## 📋 Checklist de Configuração

- [ ] Todos os secrets configurados no GitHub
- [ ] EAS CLI instalado e configurado
- [ ] Projeto configurado no Expo/EAS
- [ ] Firebase configurado corretamente
- [ ] Arquivo `eas.json` presente no projeto
- [ ] Teste manual de build local funcionando

## 🔍 Troubleshooting

### Erro: "EXPO_TOKEN is not set"
- Verifique se o secret `EXPO_TOKEN` está configurado corretamente
- Gere um novo token se necessário

### Erro: "Project not found"
- Verifique se o `projectId` no `app.json` está correto
- Execute `eas build:configure` localmente

### Erro: "Firebase configuration"
- Verifique se todos os secrets do Firebase estão configurados
- Confirme se os valores estão corretos (sem aspas extras)

### Build muito lento
- Builds podem levar 15-30 minutos
- Use `--no-wait` para não aguardar conclusão
- Verifique status no Expo Dashboard

## 📞 Suporte

- **Expo Documentation**: https://docs.expo.dev/build/introduction/
- **EAS Build**: https://docs.expo.dev/build/setup/
- **GitHub Actions**: https://docs.github.com/en/actions
