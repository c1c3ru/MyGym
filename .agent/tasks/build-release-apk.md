# Task: Build Release APK via Gradlew

## Status
- [ ] Run Expo Prebuild
- [ ] Build Release APK
- [ ] Verify Output

## Execution Log

### 1. Expo Prebuild
Comando: `npx expo prebuild --platform android --clean`
Status: ✅ Concluído

### 2. Gradle Build
Comando: `cd android && ./gradlew assembleRelease`
Status: 🔄 Reiniciando (Build anterior interrompido ou arquivo não encontrado)

### 3. Verification
Localização esperada: `android/app/build/outputs/apk/release/app-release.apk`
Status: Aguardando...
