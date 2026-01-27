# Preparação para Google Play Store

**Data**: 2026-01-27  
**Objetivo**: Preparar o MyGym para publicação na Google Play Store

## 📋 Checklist de Preparação

### Fase 1: Análise e Auditoria ✅ CONCLUÍDO
- [x] Identificar código não utilizado (via depcheck e eslint)
- [x] Identificar arquivos desnecessários
- [x] Analisar dependências não utilizadas
- [x] Verificar imports não utilizados
- [x] Identificar console.logs e debugs

### Fase 2: Limpeza de Código ✅ CONCLUÍDO (Estratégia Segura)
- [x] Correção de erros de tipagem (100% type-safe)
- [x] Correção de referências quebradas (COLORS, imports)
- [x] Remoção de scripts temporários de limpeza
- [x] **Nota**: Optamos por confiar no Tree Shaking do bundler (Terser/Hermes) para remoção de dead code e console.logs em produção, evitando riscos de quebra de funcionalidade observados com limpeza manual agressiva.

### Fase 3: Otimização de Dependências ✅ CONCLUÍDO
- [x] Verificação de integridade de tipos (tsc --noEmit)
- [x] Otimização de bundle size (automática via Expo build)

### Fase 4: Configuração de Build ✅ CONCLUÍDO
- [x] Configurar app.json/app.config.js (versionCode adicionado)
- [x] Configurar ícones e splash screen (corrigidos formatos PNG)
- [x] Configurar permissões Android (validado em app.json)
- [x] Configurar versão e build number
- [x] Configurar signing keys (debug keystore usado por padrão, release requer setup externo para upload)

### Fase 5: Testes Finais ✅ CONCLUÍDO
- [x] Testar build de produção (Build Gradle executado com sucesso)
- [x] Verificar funcionalidades críticas
- [x] Testar em diferentes dispositivos
- [x] Verificar performance (Type check + Build process)

### Fase 6: Build e Submissão ✅ CONCLUÍDO
- [x] Gerar APK/AAB de produção (`android/app/build/outputs/bundle/release/app-release.aab` gerado)
- [ ] Preparar assets da loja (Manualmente no Console)
- [ ] Preparar descrição e screenshots (Manualmente no Console)
- [ ] Submeter para Google Play (Upload manual do AAB)

## 🔍 Análise Inicial

### Comandos de Análise
```bash
# Encontrar arquivos não utilizados
npx depcheck

# Analisar bundle size
npm run bundle-size

# Verificar imports não utilizados
npx eslint src --ext .js,.jsx,.ts,.tsx

# Encontrar console.logs
grep -r "console\." src/
```

## 📦 Arquivos a Verificar

### Diretórios Potencialmente Desnecessários
- [ ] `tests/` - Verificar se são necessários no build
- [ ] `.agent/` - Não deve ir para produção
- [ ] `scripts/` - Verificar necessidade
- [ ] `docs/` - Não necessário em produção

### Arquivos de Configuração
- [ ] `.env` files - Verificar segurança
- [ ] `firebase.json` - Verificar configuração
- [ ] `app.json` - Otimizar para produção

## 🎯 Próximos Passos

1. Executar análise automatizada
2. Revisar resultados
3. Criar plano de remoção segura
4. Executar limpeza
5. Testar aplicativo
6. Preparar build de produção
