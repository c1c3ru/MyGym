#!/bin/bash

# Script para fazer build do APK usando Gradlew ao invés do EAS
# Uso: ./build-apk-local.sh [debug|release]

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar argumento
BUILD_TYPE=${1:-debug}

if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
    print_error "Tipo de build inválido. Use 'debug' ou 'release'"
    echo "Uso: ./build-apk-local.sh [debug|release]"
    exit 1
fi

print_info "Iniciando build do APK (tipo: $BUILD_TYPE)"
echo ""

# Passo 1: Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    print_warning "node_modules não encontrado. Instalando dependências..."
    npm install
    print_success "Dependências instaladas"
else
    print_success "node_modules encontrado"
fi

echo ""

# Passo 2: Gerar pasta Android nativa (se não existir)
if [ ! -d "android" ]; then
    print_info "Gerando pasta Android nativa com expo prebuild..."
    npx expo prebuild --platform android --clean
    print_success "Pasta Android gerada"
else
    print_warning "Pasta Android já existe"
    read -p "Deseja regenerar a pasta Android? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Regenerando pasta Android..."
        npx expo prebuild --platform android --clean
        print_success "Pasta Android regenerada"
    else
        print_info "Usando pasta Android existente"
    fi
fi

echo ""

# Passo 3: Verificar se o Gradlew existe
if [ ! -f "android/gradlew" ]; then
    print_error "Gradlew não encontrado em android/gradlew"
    exit 1
fi

# Dar permissão de execução ao gradlew
chmod +x android/gradlew
print_success "Permissões do Gradlew configuradas"

echo ""

# Passo 4: Limpar build anterior (opcional)
print_info "Limpando builds anteriores..."
cd android
./gradlew clean
print_success "Build anterior limpo"

echo ""

# Passo 5: Fazer o build
print_info "Iniciando build do APK ($BUILD_TYPE)..."
echo ""

if [ "$BUILD_TYPE" = "debug" ]; then
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    OUTPUT_NAME="MyGym-debug.apk"
else
    # Para release, você precisará de um keystore configurado
    print_warning "Build de release requer keystore configurado"
    print_info "Certifique-se de ter configurado o keystore em android/app/build.gradle"
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    OUTPUT_NAME="MyGym-release.apk"
fi

cd ..

echo ""

# Passo 6: Verificar se o APK foi gerado
if [ -f "android/$APK_PATH" ]; then
    print_success "APK gerado com sucesso!"
    
    # Copiar APK para a raiz do projeto com nome amigável
    cp "android/$APK_PATH" "$OUTPUT_NAME"
    
    # Informações sobre o APK
    APK_SIZE=$(du -h "$OUTPUT_NAME" | cut -f1)
    print_info "Localização: $(pwd)/$OUTPUT_NAME"
    print_info "Tamanho: $APK_SIZE"
    
    echo ""
    print_success "Build concluído! 🎉"
    echo ""
    print_info "Para instalar no dispositivo:"
    echo "  adb install $OUTPUT_NAME"
    echo ""
    print_info "Ou copie o arquivo $OUTPUT_NAME para seu dispositivo"
else
    print_error "APK não foi gerado. Verifique os logs acima para erros."
    exit 1
fi
