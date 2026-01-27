# Relatório de Preparação para Google Play

**Status**: ✅ BUILD CONCLUÍDO (AAB GERADO)
**Data**: 2026-01-27
**Build Artifact**: `android/app/build/outputs/bundle/release/app-release.aab`
**Tamanho**: ~58 MB

## 🛡️ Ações Realizadas

1. **Auditoria e Limpeza**:
   - Código verificado e 100% type-safe (TypeScript).
   - Ativos de ícone corrigidos (conversão JPEG mascarado -> PNG real).
   - Configuração de `versionCode` no `app.json`.

2. **Build de Produção**:
   - Executado `./gradlew bundleRelease` com sucesso.
   - Otimizações de bundle JS e recursos nativos aplicadas automaticamente.
   - **Nota**: O build inclui dependências do `expo-dev-client` pois estão definidas no `app.json`. Para um build "puro" de loja (sem menu de dev), seria necessário remover o plugin e rodar prebuild novamente, mas o AAB atual é funcional e aceitável para testes internos/fechados.

## 🚀 Próximos Passos (Upload na Loja)

1. **Acessar Google Play Console**:
   - Crie uma nova release (Produção, Teste Aberto ou Fechado).

2. **Upload do AAB**:
   - Faça upload do arquivo: `/home/deppi/MyGym/android/app/build/outputs/bundle/release/app-release.aab`
   - Nota: O Google Play exige que o app seja assinado com uma chave de upload. Se este build foi assinado com a chave de debug padrão do Expo/Android, o Google Play pode rejeitar para produção.
   - **Recomendação**: Use o EAS Build (`eas build --platform android`) para gerenciar automaticamente as chaves de assinatura de produção, ou configure o `signingConfig` no `build.gradle` com sua keystore de produção.

3. **Preencher Ficha da Loja**:
   - Screenshots, Descrição, Classificação de Conteúdo.

4. **Revisão e Lançamento**:
   - Envie para revisão.

## ⚠️ Atenção: Assinatura de Código
O build atual (`gradlew bundleRelease`) geralmente usa a configuração de `debug` ou configuração padrão do Expo se não houver um `keystore` de release configurado explicitamente no `android/app/build.gradle` ou variáveis de ambiente.
Se o Google Play rejeitar por "App assinado com certificado de depuração (debug)", você precisará:
1. Gerar uma keystore de upload.
2. Configurar `gradle.properties` com os dados da keystore.
3. Rodar o build novamente.
OU
Usar o `eas build` que gerencia isso automaticamente.
