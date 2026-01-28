# 🗑️ DEPRECATED: Subcoleção de Check-ins

**Data de Deprecação:** 2026-01-28  
**Remoção Planejada:** 2026-04-28 (90 dias)  
**Status:** ⚠️ DEPRECATED - NÃO USAR

---

## ⚠️ AVISO IMPORTANTE

Esta subcoleção está **DEPRECATED** e será removida em **90 dias**.

### Localização Deprecated
```
/gyms/{academiaId}/classes/{classId}/checkIns/
```

### Nova Localização (Use Esta)
```
/gyms/{academiaId}/checkIns/
```

---

## 📅 Timeline de Deprecação

| Data | Evento | Status |
|------|--------|--------|
| **2026-01-28** | Deprecação anunciada | ✅ Completo |
| **2026-02-28** | Avisos nos logs (30 dias) | ⏳ Agendado |
| **2026-03-28** | Avisos críticos (60 dias) | ⏳ Agendado |
| **2026-04-28** | Remoção completa (90 dias) | ⏳ Agendado |

---

## 🔄 Como Migrar

### Se Você Ainda Usa a Subcoleção

**Passo 1: Atualizar Código**
```javascript
// ❌ DEPRECATED - Não use mais
const checkIns = await academyFirestoreService.getSubcollectionDocuments(
  'classes',
  classId,
  'checkIns',
  academiaId
);

// ✅ CORRETO - Use o novo serviço
import { checkInService } from '@infrastructure/services/checkInService';

const checkIns = await checkInService.getByClass(
  classId,
  academiaId,
  date // opcional
);
```

**Passo 2: Migrar Dados Históricos**
```bash
# Executar script de migração
node scripts/migrations/migrate-checkins.js <ACADEMIA_ID>
```

**Passo 3: Testar**
- Verificar que todas as queries funcionam
- Validar dados migrados
- Confirmar performance

---

## 📊 Dados Afetados

### O Que Será Removido
- ✅ Subcoleções `/classes/{classId}/checkIns`
- ✅ Todos os documentos dentro dessas subcoleções
- ✅ Índices relacionados

### O Que Será Mantido
- ✅ Localização global `/checkIns` (nova)
- ✅ Todos os dados migrados
- ✅ Histórico completo

---

## 🚨 Ação Necessária

**Se você tem dados nesta subcoleção:**

1. **Antes de 2026-02-28 (30 dias):**
   - Executar script de migração
   - Validar dados migrados
   - Atualizar código para usar nova localização

2. **Antes de 2026-04-28 (90 dias):**
   - Confirmar que não há mais dependências
   - Fazer backup final (se necessário)

**Após 2026-04-28:**
- Subcoleções serão **REMOVIDAS PERMANENTEMENTE**
- Dados não migrados serão **PERDIDOS**

---

## 📞 Suporte

**Dúvidas?**
- Consulte: `.agent/tasks/checkin-system-unification.md`
- Script de migração: `scripts/migrations/migrate-checkins.js`
- Novo serviço: `src/infrastructure/services/checkInService.js`

---

## ✅ Checklist de Migração

- [ ] Executar script de análise
- [ ] Executar script de migração (dry-run)
- [ ] Executar script de migração (produção)
- [ ] Atualizar código para usar novo serviço
- [ ] Testar todas as funcionalidades
- [ ] Validar dados migrados
- [ ] Confirmar performance
- [ ] Remover código deprecated

---

**Última atualização:** 2026-01-28  
**Próxima revisão:** 2026-02-28
