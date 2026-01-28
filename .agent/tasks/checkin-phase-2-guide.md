# 🔄 Fase 2: Migração de Dados Históricos

**Data de Início:** 2026-01-28  
**Status:** 🟡 EM ANDAMENTO  
**Duração Estimada:** 1-2 horas

---

## 🎯 Objetivo

Copiar todos os check-ins históricos das subcoleções (`/classes/{id}/checkIns`) para a localização global (`/checkIns`), sem perder dados e sem downtime.

---

## 📋 Pré-requisitos

- [x] Fase 1 completa (dual-write ativo)
- [x] Firebase Emulator rodando (para testes)
- [ ] Backup do Firestore (recomendado)
- [ ] Academia ID em mãos

---

## 🔍 Passo 1: Análise dos Dados

### Objetivo
Entender quantos check-ins existem e onde estão.

### Comandos

```bash
# 1. Ir para pasta de scripts
cd /home/deppi/MyGym

# 2. Executar análise
node scripts/migrations/analyze-checkins.js <ACADEMIA_ID>
```

### O Que Esperar

```
📊 RELATÓRIO DE ANÁLISE
==========================================================

📍 Localização Global (/checkIns):
   Total: 150 check-ins

📍 Subcoleções (/classes/{id}/checkIns):
   Total: 450 check-ins
   Distribuídos em: 8 turmas

📅 Período dos dados:
   De: 2025-01-15
   Até: 2026-01-28

🔄 Status da Migração:
   ✅ Dual-write ativo: 150 check-ins já em ambas localizações
   📦 Precisam ser migrados: 300 check-ins

💡 Recomendações:
   ⚠️ Volume moderado de check-ins
   ⚠️ Migração estimada: 2-5 minutos
```

### Decisão

- **Se "Precisam ser migrados: 0"** → Pular para Fase 3 ✅
- **Se "Precisam ser migrados: >0"** → Continuar para Passo 2 ⏭️

---

## 💾 Passo 2: Backup (RECOMENDADO)

### Opção A: Backup Manual (Firebase Console)

1. Abrir: https://console.firebase.google.com
2. Ir para **Firestore Database**
3. Clicar em **⋮** (menu) → **Export data**
4. Selecionar coleção: `gyms/{academiaId}/checkIns`
5. Exportar para Cloud Storage

### Opção B: Backup via CLI

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Login
firebase login

# Exportar
firebase firestore:export gs://[SEU_BUCKET]/backups/checkins-$(date +%Y%m%d)
```

### Opção C: Pular Backup (Não Recomendado)

⚠️ **Risco:** Se algo der errado, dados podem ser perdidos.  
✅ **Mitigação:** Script tem validação e rollback parcial.

---

## 🧪 Passo 3: Migração em Dry-Run

### Objetivo
Simular a migração sem modificar dados.

### Comando

```bash
node scripts/migrations/migrate-checkins.js <ACADEMIA_ID> --dry-run
```

### O Que Esperar

```
🚀 Iniciando migração de check-ins
📋 Configurações:
   Academia ID: abc123
   Modo: DRY-RUN (simulação)
   Batch size: 500

📚 Buscando turmas...
✅ Encontradas 8 turmas

📖 Turma: Jiu-Jitsu Iniciante (class-001)
   📊 45 check-ins encontrados
   ⏭️  Check-in abc123 já existe (pulando)
   ⏭️  Check-in def456 já existe (pulando)
   ...
   📊 Resumo: 30 migrados, 15 pulados

...

📊 RESUMO DA MIGRAÇÃO
==========================================================
Turmas processadas:     8
Check-ins encontrados:  450
Check-ins migrados:     300
Check-ins pulados:      150
Erros:                  0

⏱️  Tempo total: 3.45s

⚠️  MODO DRY-RUN: Nenhum dado foi modificado
   Execute sem --dry-run para aplicar as mudanças
```

### Validação

- ✅ **Sem erros:** Continuar para Passo 4
- ❌ **Com erros:** Investigar e corrigir antes de prosseguir

---

## 🚀 Passo 4: Migração Real

### ⚠️ ATENÇÃO

- Certifique-se de que o backup foi feito
- Escolha um horário de baixo tráfego (se possível)
- Monitore os logs durante a execução

### Comando

```bash
node scripts/migrations/migrate-checkins.js <ACADEMIA_ID>
```

### O Que Esperar

```
🚀 Iniciando migração de check-ins
📋 Configurações:
   Academia ID: abc123
   Modo: PRODUÇÃO
   Batch size: 500

📚 Buscando turmas...
✅ Encontradas 8 turmas

📖 Turma: Jiu-Jitsu Iniciante (class-001)
   📊 45 check-ins encontrados
   ✅ Batch de 30 check-ins migrados
   📊 Resumo: 30 migrados, 15 pulados

...

✅ Migração concluída!
   Total migrado: 300
   Total pulado: 150
   Erros: 0

⏱️  Tempo total: 4.12s

🔍 Validando integridade da migração...
✅ Check-ins na localização global: 450
📊 Check-ins nas subcoleções: 450
✅ Validação OK: Todos os check-ins foram migrados
```

### Monitoramento

Durante a execução, abrir **Firebase Console** e verificar:
- Número de documentos em `/checkIns` aumentando
- Sem erros de permissão
- Performance do Firestore estável

---

## ✅ Passo 5: Validação Pós-Migração

### 5.1 Validação Automática

O script já faz validação automática, mas você pode rodar novamente:

```bash
node scripts/migrations/analyze-checkins.js <ACADEMIA_ID>
```

**Esperado:**
```
📍 Localização Global (/checkIns):
   Total: 450 check-ins  ← Deve ser igual ao total das subcoleções

📍 Subcoleções (/classes/{id}/checkIns):
   Total: 450 check-ins

🔄 Status da Migração:
   ✅ Dual-write ativo: 450 check-ins já em ambas localizações
   📦 Precisam ser migrados: 0 check-ins  ← DEVE SER ZERO
```

### 5.2 Validação Manual (Firebase Console)

1. Abrir: https://console.firebase.google.com
2. Ir para **Firestore Database**
3. Navegar para: `gyms/{academiaId}/checkIns`
4. **Verificar:**
   - ✅ Número de documentos bate com o esperado
   - ✅ Campos obrigatórios presentes (studentId, classId, date)
   - ✅ Campo `_migratedFrom` presente em docs migrados

### 5.3 Teste Funcional (App)

1. **Login como Instrutor**
2. **Selecionar uma turma**
3. **Ver lista de check-ins**
4. **Verificar:**
   - ✅ Check-ins históricos aparecem
   - ✅ Check-ins recentes aparecem
   - ✅ Contagem está correta

---

## 🚨 Troubleshooting

### Problema 1: "Erro: academiaId não encontrado"

**Causa:** Academia ID inválido  
**Solução:**
```bash
# Listar academias disponíveis
firebase firestore:get gyms --project [SEU_PROJETO]

# Usar ID correto
node scripts/migrations/migrate-checkins.js [ACADEMIA_ID_CORRETO]
```

### Problema 2: "Erro de permissão ao escrever"

**Causa:** Service account sem permissões  
**Solução:**
1. Verificar `google-services.json` está presente
2. Verificar service account tem role `Firebase Admin`
3. Re-baixar service account do Firebase Console

### Problema 3: "Migração muito lenta"

**Causa:** Muitos check-ins ou conexão lenta  
**Solução:**
```bash
# Reduzir batch size
node scripts/migrations/migrate-checkins.js <ACADEMIA_ID> --batch-size=100
```

### Problema 4: "Alguns check-ins não foram migrados"

**Causa:** Dados incompletos ou erro durante migração  
**Solução:**
1. Verificar logs de erro
2. Rodar migração novamente (duplicatas serão puladas)
3. Investigar check-ins problemáticos manualmente

---

## 📊 Métricas de Sucesso

### Critérios de Aceitação

- ✅ Todos os check-ins das subcoleções estão na localização global
- ✅ Nenhum check-in foi perdido (contagem bate)
- ✅ Campos obrigatórios presentes em todos os documentos
- ✅ App funciona normalmente (instrutor vê check-ins)
- ✅ Performance aceitável (<500ms para queries)

### KPIs

| Métrica | Antes | Depois | Status |
|---------|-------|--------|--------|
| Check-ins em /checkIns | ~150 | ~450 | ⏳ |
| Check-ins em subcoleções | ~450 | ~450 | ✅ |
| Duplicatas | ~150 | ~450 | ⏳ |
| Dados faltando | 0 | 0 | ✅ |

---

## 🎯 Próximos Passos (Fase 3)

Após validação bem-sucedida:

1. ⏳ Atualizar queries para ler apenas de `/checkIns`
2. ⏳ Remover código de leitura das subcoleções
3. ⏳ Testar relatórios e dashboards
4. ⏳ Validar performance

**Estimativa:** 2-3 dias

---

## 📝 Checklist de Execução

### Preparação
- [ ] Análise executada
- [ ] Backup realizado (ou decisão consciente de pular)
- [ ] Dry-run executado sem erros
- [ ] Horário de baixo tráfego escolhido (se aplicável)

### Execução
- [ ] Migração real executada
- [ ] Logs monitorados
- [ ] Sem erros reportados
- [ ] Validação automática passou

### Validação
- [ ] Contagem de documentos bate
- [ ] Firebase Console verificado
- [ ] App testado (instrutor vê check-ins)
- [ ] Performance aceitável

### Conclusão
- [ ] Documentação atualizada
- [ ] Equipe notificada
- [ ] Fase 2 marcada como completa
- [ ] Fase 3 agendada

---

## 📚 Arquivos Relacionados

- **Script de Análise:** `scripts/migrations/analyze-checkins.js`
- **Script de Migração:** `scripts/migrations/migrate-checkins.js`
- **Plano Geral:** `.agent/tasks/checkin-system-unification.md`
- **Arquitetura:** `.agent/docs/checkin-architecture.md`

---

**Última atualização:** 2026-01-28 14:25
