# 🏗️ Arquitetura do Sistema de Check-in Unificado

## 📊 Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SISTEMA DE CHECK-IN                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STUDENT    │     │  INSTRUCTOR  │     │    ADMIN     │
│   Profile    │     │   Profile    │     │   Profile    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ Check-in           │ Manual             │ View
       │ (QR/Geo/Manual)    │ Check-in           │ Reports
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                  checkInService.js                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  create(checkInData, academiaId)                   │ │
│  │  - Validações                                      │ │
│  │  - Dual-write (Fase 1-4)                          │ │
│  │  - Single-write (Fase 5+)                         │ │
│  │  - Notificações                                    │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  getByClass(classId, academiaId, date)            │ │
│  │  getByStudent(studentId, academiaId, limit)       │ │
│  │  getByInstructor(instructorId, academiaId, date)  │ │
│  │  hasCheckedInToday(studentId, classId, ...)       │ │
│  │  getStatistics(academiaId, startDate, endDate)    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         │ FASE 1-4: Dual-write
                         ▼
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│  NOVA LOCALIZAÇÃO │          │ LOCALIZAÇÃO LEGADA   │
│  (Global)         │          │ (Subcoleção)         │
├──────────────────┤          ├──────────────────────┤
│ /gyms/{id}/      │          │ /gyms/{id}/classes/  │
│   checkIns/      │          │   {classId}/         │
│     {checkInId}  │          │     checkIns/        │
│                  │          │       {checkInId}    │
│ ✅ Fonte única   │          │ ⚠️  Deprecated       │
│ ✅ Queries rápidas│         │ ⏳ Removido Fase 6   │
│ ✅ Índices otimiz.│         │                      │
└──────────────────┘          └──────────────────────┘
        │
        │ FASE 5+: Single-write
        ▼
┌──────────────────────────────────────────────┐
│         ESTRUTURA DE DADOS                   │
├──────────────────────────────────────────────┤
│ {                                            │
│   id: string,                                │
│   studentId: string,                         │
│   studentName: string,                       │
│   classId: string,                           │
│   className: string,                         │
│   instructorId: string,                      │
│   instructorName: string,                    │
│   academiaId: string,                        │
│   type: 'manual' | 'qr' | 'geo',            │
│   date: 'YYYY-MM-DD',                        │
│   timestamp: Timestamp,                      │
│   location?: GeoPoint,                       │
│   distance?: number,                         │
│   verified: boolean,                         │
│   createdAt: Timestamp,                      │
│   updatedAt: Timestamp                       │
│ }                                            │
└──────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Migração (6 Fases)

```
FASE 0: Preparação
├─ Criar índices Firestore
├─ Implementar checkInService
├─ Escrever testes
└─ Script de migração
    ↓
FASE 1: Dual-Write (Semana 2)
├─ Atualizar telas Student/Instructor
├─ Escrever em AMBAS localizações
└─ Monitorar performance
    ↓
FASE 2: Migração de Dados (Semana 3)
├─ Executar script de migração
├─ Validar integridade
└─ Backup de segurança
    ↓
FASE 3: Dual-Read (Semana 4)
├─ Ler de AMBAS localizações
├─ Consolidar resultados
└─ Testar relatórios
    ↓
FASE 4: Notificações Push (Semana 5)
├─ Integrar com notificationService
├─ Testar envio em tempo real
└─ Preferências de usuário
    ↓
FASE 5: Remover Dual-Write (Semana 6)
├─ Escrever APENAS na nova localização
├─ Simplificar código
└─ Reduzir custo 50%
    ↓
FASE 6: Deprecação (Semana 7+)
├─ Marcar subcoleção como deprecated
├─ Agendar exclusão (90 dias)
└─ Atualizar documentação
```

---

## 📱 Fluxo de Notificações

```
┌─────────────────────────────────────────────────────┐
│              NOTIFICAÇÃO PUSH                        │
└─────────────────────────────────────────────────────┘

Student faz check-in
       │
       ▼
checkInService.create()
       │
       ├─ Salvar no Firestore
       │
       └─ Verificar tipo !== 'manual'
              │
              ▼
       ┌─────────────────────┐
       │ Buscar preferências │
       │ do instrutor        │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │ Preferência         │
       │ habilitada?         │
       └──────────┬──────────┘
                  │
           ┌──────┴──────┐
           │             │
          SIM           NÃO
           │             │
           ▼             ▼
    ┌──────────┐   ┌─────────┐
    │ Enviar   │   │ Pular   │
    │ Push     │   │         │
    └────┬─────┘   └─────────┘
         │
         ├─ notificationService.sendLocalNotification()
         │
         └─ notificationService.saveNotificationToFirestore()
                │
                ▼
         ┌──────────────┐
         │ Instrutor    │
         │ recebe       │
         │ notificação  │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ Ao clicar:   │
         │ Abre tela    │
         │ Check-in     │
         └──────────────┘
```

---

## 🔍 Queries Otimizadas

### Índices Compostos Necessários

```javascript
// 1. Por turma e data
{
  collection: 'checkIns',
  fields: [
    { field: 'academiaId', order: 'ASCENDING' },
    { field: 'classId', order: 'ASCENDING' },
    { field: 'date', order: 'ASCENDING' }
  ]
}

// 2. Por aluno (histórico)
{
  collection: 'checkIns',
  fields: [
    { field: 'academiaId', order: 'ASCENDING' },
    { field: 'studentId', order: 'ASCENDING' },
    { field: 'timestamp', order: 'DESCENDING' }
  ]
}

// 3. Por instrutor e data
{
  collection: 'checkIns',
  fields: [
    { field: 'academiaId', order: 'ASCENDING' },
    { field: 'instructorId', order: 'ASCENDING' },
    { field: 'date', order: 'ASCENDING' }
  ]
}

// 4. Relatórios por período
{
  collection: 'checkIns',
  fields: [
    { field: 'academiaId', order: 'ASCENDING' },
    { field: 'date', order: 'ASCENDING' },
    { field: 'timestamp', order: 'DESCENDING' }
  ]
}
```

### Performance Esperada

| Query | Antes | Depois | Melhoria |
|-------|-------|--------|----------|
| Check-ins por turma | 800ms | 200ms | 75% ⬇️ |
| Histórico do aluno | 1200ms | 300ms | 75% ⬇️ |
| Check-ins do instrutor | N/A | 250ms | ✨ Nova |
| Estatísticas mensais | 2000ms | 500ms | 75% ⬇️ |

---

## 💾 Comparação de Custos

### Firestore Pricing (estimativa)

**Antes da unificação:**
```
Writes/dia: 1000 check-ins
Reads/dia:  5000 queries
Storage:    100 MB

Custo mensal: ~$15
```

**Durante Fase 1-4 (Dual-write):**
```
Writes/dia: 2000 (dobro) ⚠️
Reads/dia:  5000 (igual)
Storage:    140 MB (+40%)

Custo mensal: ~$25 (+67%) ⏳ Temporário
```

**Após Fase 5 (Single-write):**
```
Writes/dia: 1000 (igual)
Reads/dia:  3000 (40% menos) ✅
Storage:    120 MB (+20%)

Custo mensal: ~$12 (-20%) 💰
```

---

## 🎯 Métricas de Sucesso

### KPIs por Fase

| Fase | Métrica | Meta | Status |
|------|---------|------|--------|
| 0 | Testes passando | 100% | ✅ |
| 1 | Dual-write funcionando | 100% | ⏳ |
| 2 | Dados migrados | 100% | ⏳ |
| 3 | Queries unificadas | <500ms | ⏳ |
| 4 | Notificações entregues | <5s | ⏳ |
| 5 | Custo reduzido | -20% | ⏳ |
| 6 | Código limpo | 0 deprecated | ⏳ |

---

## 🔒 Segurança (Firestore Rules)

### Regras Atualizadas

```javascript
// /gyms/{academiaId}/checkIns/{checkInId}
match /checkIns/{checkInId} {
  // Admin e instrutor podem ler todos os check-ins
  allow read: if request.auth != null && 
                 hasValidAcademia() &&
                 gymId == getAcademiaId() && 
                 (isAdminOrInstructor() || 
                  (isStudent() && resource.data.studentId == request.auth.uid));
  
  // Instrutor pode criar check-ins para suas turmas
  allow create: if request.auth != null && 
                   hasValidAcademia() &&
                   gymId == getAcademiaId() && 
                   isInstructor() && 
                   validateCheckInData();
  
  // Aluno pode criar check-in APENAS para si mesmo
  allow create: if request.auth != null && 
                   hasValidAcademia() &&
                   gymId == getAcademiaId() && 
                   isStudent() && 
                   request.resource.data.studentId == request.auth.uid;
}
```

---

## 📚 Referências Técnicas

### Documentação
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Composite Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)

### Arquivos do Projeto
- `src/infrastructure/services/checkInService.js` - Serviço principal
- `scripts/migrations/migrate-checkins.js` - Script de migração
- `tests/integration/checkIn.test.js` - Testes
- `.agent/tasks/checkin-system-unification.md` - Plano completo

---

**Última atualização:** 2026-01-28  
**Versão:** 1.0 (Fase 0)
