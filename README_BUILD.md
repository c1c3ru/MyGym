# 📱 MyGym App - Build e Deploy

Este documento explica como fazer build e deploy do MyGym App usando GitHub Actions e EAS Build.

## 🚀 Builds Automáticos

### 1. Build em Push/Merge
- **Branch `main`**: Cria build preview automaticamente
- **Branch `develop`**: Cria build preview automaticamente
- **Tags `v*`**: Cria build de produção e release no GitHub

### 2. Build em Pull Request
- Cria build preview automaticamente
- Comenta no PR com link para download
- Executa testes e verificações

### 3. Build Manual
- Acesse **Actions** > **Manual Build**
- Escolha perfil, plataforma e opções
- Pode baixar APK automaticamente

## 📋 Perfis de Build

| Perfil | Descrição | Uso |
|--------|-----------|-----|
| `development` | APK de desenvolvimento com dev tools | Desenvolvimento local |
| `preview` | APK otimizado para testes | QA e testes internos |
| `production-apk` | APK de produção | Distribuição direta |
| `production` | AAB para Google Play | Publicação na loja |

## 🔧 Configuração Inicial

### 1. Instalar EAS CLI
```bash
npm install -g @expo/cli eas-cli
```

### 2. Login e Configuração
```bash
# Login no Expo
expo login
eas login

# Configurar projeto
eas build:configure
```

### 3. Configurar Secrets no GitHub
Veja o arquivo `.github/SECRETS_SETUP.md` para instruções detalhadas.

**Secrets necessários:**
- `EXPO_TOKEN`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## 🏗️ Build Local

### Usando Script Personalizado
```bash
# Build preview (padrão)
npm run build:android

# Build de produção APK
npm run build:android:apk

# Build preview
npm run build:preview

# Usando script diretamente
node scripts/build-android.js preview
node scripts/build-android.js production-apk
```

### Usando EAS Diretamente
```bash
# Preview APK
eas build --platform android --profile preview

# Produção APK
eas build --platform android --profile production-apk

# Produção AAB
eas build --platform android --profile production
```

## 📱 Workflows Disponíveis

### 1. `build-apk.yml` - Build Principal
- **Trigger**: Push para main/develop, tags, PRs
- **Função**: Build automático com base no evento
- **Outputs**: APK e comentários em PRs

### 2. `build-release.yml` - Release Completo
- **Trigger**: Release publicado ou manual
- **Função**: Build de produção + criação de release
- **Outputs**: APK anexado ao release do GitHub

### 3. `build-pr.yml` - Preview de PR
- **Trigger**: Pull requests
- **Função**: Build preview para testes
- **Outputs**: Comentário no PR com link

### 4. `manual-build.yml` - Build Manual
- **Trigger**: Manual via interface do GitHub
- **Função**: Build customizável com opções
- **Outputs**: APK como artifact (opcional)

## 🔄 Fluxo de Desenvolvimento

### Para Desenvolvimento
```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"

# 2. Push para branch de desenvolvimento
git push origin develop

# 3. GitHub Actions cria build preview automaticamente
```

### Para Release
```bash
# 1. Criar tag de versão
git tag v1.0.1
git push origin v1.0.1

# 2. GitHub Actions cria build de produção
# 3. Release é criado automaticamente com APK
```

### Para Testes em PR
```bash
# 1. Criar PR para main
# 2. GitHub Actions cria build preview
# 3. Link de download aparece como comentário no PR
```

## 📥 Download de APKs

### Via GitHub Releases
1. Vá para [Releases](https://github.com/c1c3ru/MyGym/releases)
2. Baixe o APK da versão desejada

### Via Expo Dashboard
1. Acesse https://expo.dev/accounts/c1c3ru/projects/academia-app/builds
2. Encontre o build desejado
3. Clique para baixar

### Via GitHub Actions Artifacts
1. Vá para **Actions** no repositório
2. Clique no workflow executado
3. Baixe o artifact gerado

## 🔍 Monitoramento

### Status de Builds
- **GitHub Actions**: Status em tempo real
- **Expo Dashboard**: Logs detalhados e histórico
- **PR Comments**: Status e links diretos

### Logs e Debug
```bash
# Ver builds recentes
eas build:list

# Ver detalhes de um build
eas build:view [BUILD_ID]

# Logs em tempo real
eas build --platform android --profile preview --wait
```

## 🚨 Troubleshooting

### Build Falha
1. Verifique os logs no GitHub Actions
2. Verifique o Expo Dashboard
3. Teste build local primeiro

### Secrets Incorretos
1. Verifique se todos os secrets estão configurados
2. Confirme se os valores estão corretos
3. Regenere tokens se necessário

### Timeout de Build
1. Builds podem levar 15-45 minutos
2. Use `--no-wait` para não aguardar
3. Monitore via Expo Dashboard

## 📊 Métricas

### Tempos Típicos de Build
- **Development**: 10-15 minutos
- **Preview**: 15-25 minutos  
- **Production**: 20-30 minutos

### Tamanhos Típicos de APK
- **Development**: ~50-80 MB
- **Preview**: ~30-50 MB
- **Production**: ~25-40 MB

## 🔗 Links Úteis

- [Expo Dashboard](https://expo.dev/accounts/c1c3ru/projects/academia-app)
- [GitHub Actions](https://github.com/c1c3ru/MyGym/actions)
- [GitHub Releases](https://github.com/c1c3ru/MyGym/releases)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Firebase Console](https://console.firebase.google.com/)
