# 🚀 Fase 2: Migração - GUIA RÁPIDO

**Status:** ✅ Scripts Prontos | ⏳ Aguardando Execução  
**Tempo Estimado:** 10-30 minutos

---

## 📋 O Que Você Precisa

1. **Academia ID** - ID da academia no Firestore
2. **Service Account** - Arquivo JSON com credenciais do Firebase Admin
3. **Backup** - (Recomendado) Exportação do Firestore

---

## 🎯 Execução em 3 Passos

### Passo 1: Análise (2 min)

```bash
cd /home/deppi/MyGym
node scripts/migrations/analyze-checkins.js <ACADEMIA_ID>
```

**O que faz:**
- Conta check-ins na localização global
- Conta check-ins nas subcoleções
- Detecta duplicatas
- Estima tempo de migração

**Decisão:**
- Se "Precisam ser migrados: 0" → **Pular para Fase 3** ✅
- Se "Precisam ser migrados: >0" → **Continuar** ⏭️

---

### Passo 2: Dry-Run (3 min)

```bash
node scripts/migrations/migrate-checkins.js <ACADEMIA_ID> --dry-run
```

**O que faz:**
- Simula migração SEM modificar dados
- Mostra o que seria migrado
- Detecta erros antes da migração real

**Validação:**
- ✅ Sem erros → Continuar
- ❌ Com erros → Investigar e corrigir

---

### Passo 3: Migração Real (5-30 min)

```bash
node scripts/migrations/migrate-checkins.js <ACADEMIA_ID>
```

**O que faz:**
- Copia check-ins das subcoleções para localização global
- Usa batches de 500 documentos
- Pula duplicatas automaticamente
- Valida integridade ao final

**Monitorar:**
- Logs no terminal
- Firebase Console (número de documentos aumentando)
- Sem erros de permissão

---

## ✅ Validação Pós-Migração

### Automática (incluída no script)

```
✅ Check-ins na localização global: 450
📊 Check-ins nas subcoleções: 450
✅ Validação OK: Todos os check-ins foram migrados
```

### Manual (Firebase Console)

1. Abrir: https://console.firebase.google.com
2. Ir para Firestore Database
3. Navegar: `gyms/{academiaId}/checkIns`
4. Verificar:
   - ✅ Número de documentos correto
   - ✅ Campos obrigatórios presentes
   - ✅ Datas corretas

### Funcional (App)

1. Login como instrutor
2. Selecionar turma
3. Ver lista de check-ins
4. Verificar:
   - ✅ Check-ins históricos aparecem
   - ✅ Contagem correta

---

## 🚨 Problemas Comuns

### "Service account inválido"

**Solução:**
1. Baixar service account do Firebase Console
2. Salvar como `service-account.json` na raiz do projeto
3. Atualizar scripts para usar `service-account.json`

### "Academia não encontrada"

**Solução:**
```bash
# Listar academias disponíveis
firebase firestore:get gyms
```

### "Migração lenta"

**Solução:**
```bash
# Reduzir batch size
node scripts/migrations/migrate-checkins.js <ID> --batch-size=100
```

---

## 📊 Estrutura Esperada Após Migração

```
gyms/
  └─ {academiaId}/
      ├─ checkIns/                    ← TODOS os check-ins aqui
      │   ├─ {id1} (histórico)
      │   ├─ {id2} (histórico)
      │   ├─ {id3} (dual-write)
      │   └─ {id4} (dual-write)
      │
      └─ classes/
          └─ {classId}/
              └─ checkIns/            ← Mesmos check-ins (duplicados)
                  ├─ {id1} (_migratedFrom: "subcollection")
                  ├─ {id2} (_migratedFrom: "subcollection")
                  ├─ {id3} (_migratedFrom: "dual-write")
                  └─ {id4} (_migratedFrom: "dual-write")
```

---

## 🎯 Critérios de Sucesso

- ✅ Contagem de check-ins bate (global == subcoleções)
- ✅ Nenhum check-in perdido
- ✅ App funciona normalmente
- ✅ Performance aceitável (<500ms)
- ✅ Sem erros no Firestore

---

## 📝 Checklist Rápido

**Antes:**
- [ ] Tenho o Academia ID
- [ ] Tenho service account configurado
- [ ] Fiz backup (ou decidi pular)

**Durante:**
- [ ] Análise executada
- [ ] Dry-run sem erros
- [ ] Migração real executada
- [ ] Logs monitorados

**Depois:**
- [ ] Validação automática OK
- [ ] Firebase Console verificado
- [ ] App testado
- [ ] Fase 2 completa ✅

---

## 🚀 Próxima Fase

Após Fase 2 completa:
- **Fase 3:** Atualizar queries para ler apenas de `/checkIns`
- **Fase 4:** Implementar notificações push
- **Fase 5:** Remover dual-write
- **Fase 6:** Limpeza e deprecação

---

## 📚 Arquivos

- **Análise:** `scripts/migrations/analyze-checkins.js`
- **Migração:** `scripts/migrations/migrate-checkins.js`
- **Guia Completo:** `.agent/tasks/checkin-phase-2-guide.md`

---

## 💡 Dica

Se você não tem dados de produção ainda, pode pular para **Fase 3** e voltar aqui quando tiver check-ins históricos para migrar.

---

**Última atualização:** 2026-01-28 14:30
