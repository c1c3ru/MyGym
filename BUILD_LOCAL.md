# Guia para Build Local com Gradlew

Este guia explica como fazer build do APK usando Gradlew ao invés do EAS Build.

## 🚀 Quick Start

### Build Debug (Desenvolvimento)
```bash
chmod +x build-apk-local.sh
./build-apk-local.sh debug
```

### Build Release (Produção)
```bash
./build-apk-local.sh release
```

## 📋 Pré-requisitos

1. **Node.js** (>= 22.0.0)
2. **Java JDK** (versão 17 ou superior)
3. **Android SDK** instalado
4. **Variáveis de ambiente** configuradas:
   - `ANDROID_HOME` ou `ANDROID_SDK_ROOT`
   - `JAVA_HOME`

### Verificar Instalação

```bash
# Verificar Java
java -version

# Verificar Android SDK
echo $ANDROID_HOME

# Verificar Node
node --version
```

## 🔧 O que o Script Faz

1. **Instala dependências** (se necessário)
2. **Gera pasta Android nativa** usando `expo prebuild`
3. **Configura permissões** do Gradlew
4. **Limpa builds anteriores**
5. **Compila o APK** usando Gradlew
6. **Copia o APK** para a raiz do projeto

## 📱 Tipos de Build

### Debug
- **Uso**: Desenvolvimento e testes
- **Assinatura**: Debug keystore automático
- **Tamanho**: Maior (~50-80 MB)
- **Otimização**: Mínima
- **Output**: `MyGym-debug.apk`

```bash
./build-apk-local.sh debug
```

### Release
- **Uso**: Produção
- **Assinatura**: Requer keystore configurado
- **Tamanho**: Menor (~25-40 MB)
- **Otimização**: Máxima (ProGuard/R8)
- **Output**: `MyGym-release.apk`

```bash
./build-apk-local.sh release
```

## 🔐 Configurar Build de Release

Para fazer builds de release assinados, você precisa configurar um keystore:

### 1. Gerar Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore mygym-release-key.keystore \
  -alias mygym-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Guarde as senhas em local seguro!**

### 2. Configurar Gradle

Crie o arquivo `android/gradle.properties` (se não existir):

```properties
MYAPP_UPLOAD_STORE_FILE=mygym-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=mygym-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=sua_senha_aqui
MYAPP_UPLOAD_KEY_PASSWORD=sua_senha_aqui
```

**⚠️ IMPORTANTE**: Adicione `gradle.properties` ao `.gitignore` para não commitar senhas!

### 3. Atualizar build.gradle

O arquivo `android/app/build.gradle` deve ter:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 📦 Instalação do APK

### Via ADB (USB)

```bash
# Conectar dispositivo via USB e habilitar depuração USB
adb devices

# Instalar APK
adb install MyGym-debug.apk

# Ou forçar reinstalação
adb install -r MyGym-debug.apk
```

### Via Arquivo

1. Copie o APK para o dispositivo
2. Abra o arquivo no dispositivo
3. Permita instalação de fontes desconhecidas
4. Instale o app

## 🔍 Comandos Úteis do Gradlew

### Listar todas as tasks disponíveis
```bash
cd android
./gradlew tasks
```

### Build apenas (sem limpar)
```bash
cd android
./gradlew assembleDebug
# ou
./gradlew assembleRelease
```

### Limpar build
```bash
cd android
./gradlew clean
```

### Build com logs detalhados
```bash
cd android
./gradlew assembleDebug --info
# ou para debug completo
./gradlew assembleDebug --debug
```

### Verificar dependências
```bash
cd android
./gradlew app:dependencies
```

## 🐛 Troubleshooting

### Erro: "Permission denied" no gradlew

```bash
chmod +x android/gradlew
```

### Erro: "ANDROID_HOME not set"

```bash
# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Adicione ao ~/.bashrc ou ~/.zshrc para tornar permanente
```

### Erro: "Java version incompatible"

```bash
# Instalar Java 17
sudo apt install openjdk-17-jdk  # Ubuntu/Debian
# ou
brew install openjdk@17  # Mac

# Configurar JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Build muito lento

```bash
# Habilitar daemon do Gradle
echo "org.gradle.daemon=true" >> android/gradle.properties

# Aumentar memória do Gradle
echo "org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m" >> android/gradle.properties
```

### Erro de memória durante build

```bash
# Aumentar heap do Gradle
export GRADLE_OPTS="-Xmx4096m -XX:MaxPermSize=512m"
```

## 📊 Comparação: Gradlew vs EAS

| Aspecto | Gradlew Local | EAS Build |
|---------|---------------|-----------|
| **Velocidade** | Rápido (local) | Mais lento (cloud) |
| **Custo** | Grátis | Requer plano Expo |
| **Setup** | Requer SDK Android | Apenas conta Expo |
| **Controle** | Total | Limitado |
| **CI/CD** | Manual | Automático |
| **Keystore** | Você gerencia | Expo gerencia |

## 🔄 Workflow Recomendado

### Desenvolvimento
1. Use **debug builds** locais com Gradlew
2. Teste no dispositivo via ADB
3. Itere rapidamente

### Testes Internos
1. Use **release builds** locais
2. Distribua via Firebase App Distribution ou similar

### Produção
1. Use **EAS Build** para builds oficiais
2. Publique na Google Play Store

## 📝 Notas Importantes

1. **Pasta `android/`**: Gerada pelo `expo prebuild`, pode ser regenerada a qualquer momento
2. **Não commitar**: A pasta `android/` geralmente não é commitada em projetos Expo
3. **Variáveis de ambiente**: Configure em `.env` e use `expo-constants` para acessar
4. **Google Services**: Certifique-se de ter `google-services.json` em `android/app/`

## 🔗 Links Úteis

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Android Gradle Plugin](https://developer.android.com/build)
- [Signing Your App](https://developer.android.com/studio/publish/app-signing)
- [ProGuard/R8](https://developer.android.com/studio/build/shrink-code)
