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
Status: ✅ Concluído (BUILD SUCCESSFUL)

### 3. Verification
Localização: `android/app/build/outputs/apk/release/app-release.apk`
Cópia na raiz: `MyGym-release.apk`
Status: ✅ Verificado e Copiado
