# Preparação para Google Play Store

**Data**: 2026-01-27  
**Objetivo**: Preparar o MyGym para publicação na Google Play Store

## 📋 Checklist de Preparação

### Fase 1: Análise e Auditoria ✅ EM ANDAMENTO
- [ ] Identificar código não utilizado
- [ ] Identificar arquivos desnecessários
- [ ] Analisar dependências não utilizadas
- [ ] Verificar imports não utilizados
- [ ] Identificar console.logs e debugs

### Fase 2: Limpeza de Código
- [ ] Remover código comentado
- [ ] Remover imports não utilizados
- [ ] Remover funções/componentes não utilizados
- [ ] Remover console.logs de desenvolvimento
- [ ] Remover arquivos de teste não necessários

### Fase 3: Otimização de Dependências
- [ ] Remover dependências não utilizadas do package.json
- [ ] Verificar versões de dependências
- [ ] Otimizar bundle size

### Fase 4: Configuração de Build
- [ ] Configurar app.json/app.config.js
- [ ] Configurar ícones e splash screen
- [ ] Configurar permissões Android
- [ ] Configurar versão e build number
- [ ] Configurar signing keys

### Fase 5: Testes Finais
- [ ] Testar build de produção
- [ ] Verificar funcionalidades críticas
- [ ] Testar em diferentes dispositivos
- [ ] Verificar performance

### Fase 6: Build e Submissão
- [ ] Gerar APK/AAB de produção
- [ ] Preparar assets da loja
- [ ] Preparar descrição e screenshots
- [ ] Submeter para Google Play

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
