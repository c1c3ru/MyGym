# 🔄 Unificação do Sistema de Check-in

**Data de Criação:** 2026-01-28  
**Status:** 📋 PLANEJAMENTO  
**Prioridade:** 🔴 ALTA  
**Estimativa:** 4-6 semanas

---

## 📊 Contexto

### Problema Atual
O sistema de check-in possui **fragmentação crítica de dados**:

| Perfil | Localização de Escrita | Localização de Leitura | Problema |
|--------|------------------------|------------------------|----------|
| **Aluno** | `/gyms/{id}/checkIns` | `/gyms/{id}/checkIns` | ✅ Funciona |
| **Instrutor** | `/gyms/{id}/classes/{classId}/checkIns` | `/gyms/{id}/classes/{classId}/checkIns` | ❌ Não vê check-ins de alunos |
| **Admin** | N/A | Ambas localizações | ❌ Relatórios incompletos |

### Impacto
- Instrutores não conseguem ver presença real dos alunos
- Relatórios de frequência são imprecisos
- Duplicação de lógica de negócio
- Confusão na manutenção do código

---

## 🎯 Objetivos

### Principais
1. ✅ **Unificar localização de dados** em `/gyms/{id}/checkIns`
2. ✅ **Migrar dados históricos** sem perda
3. ✅ **Zero downtime** durante transição
4. ✅ **Adicionar notificações push** quando aluno faz check-in

### Secundários
- Melhorar performance de queries
- Simplificar código de leitura/escrita
- Documentar nova arquitetura
- Criar testes de integração

---

## 🏗️ Arquitetura Alvo

### Estrutura de Dados Unificada

```
/gyms/{academiaId}/checkIns/{checkInId}
{
  id: string,
  studentId: string,
  studentName: string,
  classId: string,
  className: string,
  instructorId: string,
  instructorName: string,
  academiaId: string,
  type: 'manual' | 'qr' | 'geo',
  date: string (YYYY-MM-DD),
  timestamp: Timestamp,
  location?: GeoPoint,
  distance?: number,
  verified: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Índices Firestore Necessários

```javascript
// Composite indexes
checkIns: [
  { fields: ['academiaId', 'date', 'timestamp'], order: 'desc' },
  { fields: ['academiaId', 'classId', 'date'], order: 'desc' },
  { fields: ['academiaId', 'studentId', 'date'], order: 'desc' },
  { fields: ['academiaId', 'instructorId', 'date'], order: 'desc' }
]
```

---

## 📅 Plano de Execução (6 Fases)

### **Fase 0: Preparação** (Semana 1)
**Objetivo:** Infraestrutura e testes

**Tasks:**
- [ ] Criar índices compostos no Firestore Console
- [ ] Implementar `CheckInServiceV2` com dual-write
- [ ] Escrever testes de integração
- [ ] Criar script de migração de dados
- [ ] Testar em ambiente de staging

**Arquivos a modificar:**
- `src/infrastructure/services/checkInService.js` (novo)
- `src/infrastructure/services/academyFirestoreService.js` (atualizar)
- `tests/integration/checkIn.test.js` (novo)
- `scripts/migrations/migrate-checkins.js` (novo)

**Validação:**
- ✅ Testes passam em staging
- ✅ Script de migração roda sem erros
- ✅ Performance de queries aceitável (<500ms)

---

### **Fase 1: Dual-Write** (Semana 2)
**Objetivo:** Escrever em ambas localizações sem quebrar nada

**Tasks:**
- [ ] Atualizar `CheckInScreen.tsx` (Student) para usar novo service
- [ ] Atualizar `CheckIn.js` (Instructor) para usar novo service
- [ ] Implementar dual-write com batched writes
- [ ] Adicionar logs detalhados
- [ ] Deploy em produção

**Código exemplo:**
```javascript
// src/infrastructure/services/checkInService.js
export const checkInService = {
  async create(checkInData, academiaId) {
    const batch = db.batch();
    
    // Write 1: Nova localização (global)
    const globalRef = db.collection('gyms').doc(academiaId)
      .collection('checkIns').doc();
    batch.set(globalRef, {
      ...checkInData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Write 2: Localização legada (subcoleção)
    if (checkInData.classId) {
      const legacyRef = db.collection('gyms').doc(academiaId)
        .collection('classes').doc(checkInData.classId)
        .collection('checkIns').doc(globalRef.id);
      batch.set(legacyRef, {
        ...checkInData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
    
    // Trigger notification
    await notificationService.sendCheckInNotification(checkInData);
    
    return globalRef.id;
  }
};
```

**Validação:**
- ✅ Check-ins aparecem em ambas localizações
- ✅ Sem erros de permissão no Firestore
- ✅ Custo de escrita duplicado aceitável

---

### **Fase 2: Migração de Dados** (Semana 3)
**Objetivo:** Copiar dados históricos para nova localização

**Tasks:**
- [ ] Executar script de migração em horário de baixo tráfego
- [ ] Validar integridade dos dados migrados
- [ ] Comparar contagens (origem vs destino)
- [ ] Criar backup antes da migração

**Script de migração:**
```javascript
// scripts/migrations/migrate-checkins.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function migrateCheckIns(academiaId) {
  console.log(`🚀 Iniciando migração para academia: ${academiaId}`);
  
  // 1. Buscar todas as turmas
  const classesSnapshot = await db
    .collection('gyms').doc(academiaId)
    .collection('classes').get();
  
  let totalMigrated = 0;
  let errors = [];
  
  // 2. Para cada turma, buscar check-ins da subcoleção
  for (const classDoc of classesSnapshot.docs) {
    try {
      const checkInsSnapshot = await classDoc.ref
        .collection('checkIns').get();
      
      console.log(`📚 Turma ${classDoc.data().name}: ${checkInsSnapshot.size} check-ins`);
      
      // 3. Copiar para localização global (em batches de 500)
      const batch = db.batch();
      let batchCount = 0;
      
      for (const checkInDoc of checkInsSnapshot.docs) {
        const globalRef = db.collection('gyms').doc(academiaId)
          .collection('checkIns').doc(checkInDoc.id);
        
        batch.set(globalRef, {
          ...checkInDoc.data(),
          classId: classDoc.id,
          migratedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        batchCount++;
        totalMigrated++;
        
        // Commit a cada 500 documentos
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
          console.log(`  ✅ ${totalMigrated} migrados...`);
        }
      }
      
      // Commit restante
      if (batchCount > 0) {
        await batch.commit();
      }
      
    } catch (error) {
      console.error(`❌ Erro na turma ${classDoc.id}:`, error);
      errors.push({ classId: classDoc.id, error: error.message });
    }
  }
  
  console.log(`\n✅ Migração concluída!`);
  console.log(`   Total migrado: ${totalMigrated}`);
  console.log(`   Erros: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    errors.forEach(e => console.log(`   - ${e.classId}: ${e.error}`));
  }
  
  return { totalMigrated, errors };
}

// Executar
const academiaId = process.argv[2];
if (!academiaId) {
  console.error('❌ Uso: node migrate-checkins.js <academiaId>');
  process.exit(1);
}

migrateCheckIns(academiaId)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erro fatal:', err);
    process.exit(1);
  });
```

**Validação:**
- ✅ Contagem de documentos bate (origem == destino)
- ✅ Campos obrigatórios presentes em todos os docs
- ✅ Sem duplicatas (mesmo ID)

---

### **Fase 3: Dual-Read** (Semana 4)
**Objetivo:** Ler de ambas localizações e consolidar

**Tasks:**
- [ ] Implementar leitura consolidada no service
- [ ] Atualizar telas de Instrutor para usar nova query
- [ ] Atualizar relatórios de Admin
- [ ] Testar performance de queries

**Código exemplo:**
```javascript
// src/infrastructure/services/checkInService.js
export const checkInService = {
  async getByClass(classId, academiaId, date) {
    // Ler apenas da localização global (dados já migrados)
    const snapshot = await db.collection('gyms').doc(academiaId)
      .collection('checkIns')
      .where('classId', '==', classId)
      .where('date', '==', date)
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  async getByStudent(studentId, academiaId, limit = 10) {
    const snapshot = await db.collection('gyms').doc(academiaId)
      .collection('checkIns')
      .where('studentId', '==', studentId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};
```

**Validação:**
- ✅ Instrutores veem todos os check-ins (alunos + manual)
- ✅ Relatórios mostram dados completos
- ✅ Performance aceitável (<500ms)

---

### **Fase 4: Notificações Push** (Semana 5)
**Objetivo:** Notificar instrutor quando aluno faz check-in

**Tasks:**
- [ ] Integrar com `notificationService.js` existente
- [ ] Criar template de notificação
- [ ] Adicionar preferências de notificação
- [ ] Testar envio em tempo real

**Código exemplo:**
```javascript
// src/infrastructure/services/checkInService.js
import { notificationService } from './notificationService';

export const checkInService = {
  async create(checkInData, academiaId) {
    // ... código de dual-write ...
    
    // Enviar notificação para instrutor
    if (checkInData.instructorId && checkInData.type !== 'manual') {
      await notificationService.sendNotification({
        userId: checkInData.instructorId,
        title: '✅ Novo Check-in',
        body: `${checkInData.studentName} fez check-in em ${checkInData.className}`,
        data: {
          type: 'checkin',
          classId: checkInData.classId,
          studentId: checkInData.studentId,
          checkInId: globalRef.id
        }
      });
    }
    
    return globalRef.id;
  }
};
```

**Validação:**
- ✅ Instrutor recebe notificação em <5s
- ✅ Notificação abre tela de check-in da turma
- ✅ Usuário pode desabilitar notificações

---

### **Fase 5: Remover Dual-Write** (Semana 6)
**Objetivo:** Escrever apenas na localização global

**Tasks:**
- [ ] Remover código de escrita na subcoleção
- [ ] Simplificar `checkInService`
- [ ] Atualizar testes
- [ ] Deploy em produção

**Validação:**
- ✅ Check-ins continuam funcionando
- ✅ Sem erros em produção
- ✅ Custo de escrita reduzido pela metade

---

### **Fase 6: Deprecação e Limpeza** (Semana 7+)
**Objetivo:** Remover código legado

**Tasks:**
- [ ] Marcar subcoleção como deprecated (comentários)
- [ ] Agendar exclusão de dados legados (90 dias)
- [ ] Atualizar documentação
- [ ] Criar ADR (Architecture Decision Record)

**Validação:**
- ✅ Documentação atualizada
- ✅ Equipe treinada na nova arquitetura

---

## 🔔 Sistema de Notificações

### Integração com Sistema Existente

O projeto já possui `notificationService.js`. Vamos estender para check-ins:

**Tipos de notificação:**
1. **Instrutor:** Aluno fez check-in na sua turma
2. **Admin:** Resumo diário de check-ins
3. **Aluno:** Confirmação de check-in realizado

**Preferências (em `NotificationSettingsScreen.tsx`):**
```javascript
{
  checkIn: {
    enabled: true,
    studentCheckIn: true,  // Instrutor recebe quando aluno chega
    dailySummary: false,   // Admin recebe resumo diário
    confirmation: true     // Aluno recebe confirmação
  }
}
```

---

## 📊 Métricas de Sucesso

### KPIs
- ✅ **Uptime:** 99.9% durante migração
- ✅ **Performance:** Queries <500ms (p95)
- ✅ **Custo:** Redução de 40% após Fase 5
- ✅ **Adoção:** 100% dos check-ins na nova localização

### Monitoramento
```javascript
// Firebase Analytics
analytics.logEvent('checkin_created', {
  type: checkInData.type,
  location: 'unified', // vs 'legacy'
  duration_ms: Date.now() - startTime
});
```

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados na migração | Baixa | Alto | Backup antes + validação pós-migração |
| Performance degradada | Média | Médio | Índices compostos + cache |
| Custo Firestore elevado | Alta | Baixo | Dual-write por apenas 2 semanas |
| Bugs em produção | Média | Alto | Testes extensivos + rollback plan |

---

## 📝 Checklist de Validação

### Antes de cada deploy:
- [ ] Testes de integração passando
- [ ] Testes manuais em staging
- [ ] Backup do Firestore
- [ ] Plano de rollback documentado
- [ ] Equipe avisada sobre deploy

### Após cada deploy:
- [ ] Monitorar logs por 24h
- [ ] Verificar métricas de performance
- [ ] Coletar feedback de usuários
- [ ] Validar custo Firestore

---

## 🔗 Arquivos Relacionados

### A criar:
- `src/infrastructure/services/checkInService.js`
- `tests/integration/checkIn.test.js`
- `scripts/migrations/migrate-checkins.js`
- `.agent/docs/ADR-001-checkin-unification.md`

### A modificar:
- `src/presentation/screens/student/CheckInScreen.tsx`
- `src/presentation/screens/instructor/CheckIn.js`
- `src/infrastructure/services/academyFirestoreService.js`
- `firestore.rules` (otimizar índices)

---

## 📚 Referências

- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Data Migration Strategies](https://cloud.google.com/firestore/docs/manage-data/move-data)
- [Push Notifications - Expo](https://docs.expo.dev/push-notifications/overview/)

---

**Próximo passo:** Implementar Fase 0 (Preparação)
