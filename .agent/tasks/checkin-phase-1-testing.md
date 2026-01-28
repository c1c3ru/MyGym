# 🧪 Guia Rápido de Teste - Fase 1

## ⚡ Teste Rápido (5 minutos)

### 1. Verificar Compilação
```bash
# O servidor já está rodando, verificar se não há erros
# Abrir: http://localhost:5000
```

### 2. Teste como Aluno
1. **Login** como aluno
2. **Navegar** para tela de Check-in
3. **Fazer check-in** em uma turma
4. **Verificar:**
   - ✅ Mensagem de sucesso aparece
   - ✅ Check-in aparece no histórico
   - ✅ Console mostra: `🎯 [Student] Iniciando check-in...`
   - ✅ Console mostra: `✅ [Student] Check-in criado: {id}`

### 3. Teste como Instrutor
1. **Login** como instrutor
2. **Navegar** para tela de Check-in
3. **Selecionar** uma turma
4. **Fazer check-in manual** para um aluno
5. **Verificar:**
   - ✅ Mensagem de sucesso aparece
   - ✅ Check-in aparece na lista
   - ✅ Console mostra: `🎯 [Instructor] Iniciando check-in manual...`
   - ✅ Console mostra: `✅ [Instructor] Check-in criado: {id}`

### 4. Verificar Firestore (CRÍTICO)
1. **Abrir** Firebase Console: https://console.firebase.google.com
2. **Navegar** para Firestore Database
3. **Verificar** estrutura:

```
gyms/
  └─ {academiaId}/
      ├─ checkIns/              ← NOVA LOCALIZAÇÃO (deve ter documentos)
      │   └─ {checkInId}
      │       ├─ studentId
      │       ├─ studentName
      │       ├─ classId
      │       ├─ className
      │       ├─ instructorId
      │       ├─ instructorName
      │       ├─ type: "manual"
      │       ├─ verified: true
      │       ├─ date: "2026-01-28"
      │       ├─ timestamp
      │       ├─ createdAt
      │       └─ updatedAt
      │
      └─ classes/
          └─ {classId}/
              └─ checkIns/      ← LOCALIZAÇÃO LEGADA (deve ter documentos)
                  └─ {checkInId} (mesmo ID da global)
                      ├─ (mesmos campos)
                      └─ _migratedFrom: "dual-write"
```

**✅ SUCESSO se:**
- Ambas as localizações têm o documento
- IDs são idênticos
- Campo `_migratedFrom: "dual-write"` existe na subcoleção

**❌ FALHA se:**
- Apenas uma localização tem o documento
- IDs são diferentes
- Campos obrigatórios faltando

---

## 🔍 Verificação Detalhada (15 minutos)

### Teste de Batch Check-in

1. **Login** como instrutor
2. **Selecionar** uma turma
3. **Selecionar** 3-5 alunos
4. **Fazer check-in em lote**
5. **Verificar:**
   - ✅ Mensagem: "Check-in realizado para X aluno(s)!"
   - ✅ Console mostra logs para cada aluno
   - ✅ Firestore tem X documentos em ambas localizações

### Teste de Performance

**Expectativa:**
- Check-in individual: <500ms
- Batch de 5 alunos: <2s
- Batch de 10 alunos: <4s

**Como medir:**
```javascript
// Já está nos logs
console.log('✅ [Student] Check-in criado:', checkInId);
// Verificar timestamp entre "Iniciando" e "criado"
```

### Teste de Validação

**Tentar criar check-in inválido:**
1. Modificar código temporariamente:
```typescript
// Remover studentId para testar validação
const checkInId = await checkInService.create({
  // studentId: user.id, // ← Comentar
  studentName: 'Teste',
  // ...
}, academiaId);
```

2. **Verificar:**
   - ✅ Erro: "studentId é obrigatório"
   - ✅ Nenhum documento criado no Firestore

3. **Reverter** código

---

## 📊 Comandos Úteis

### Ver logs em tempo real
```bash
# Console do navegador (F12)
# Filtrar por: [Student] ou [Instructor] ou [Batch]
```

### Contar documentos no Firestore
```javascript
// Firebase Console > Firestore > Query
// Collection: gyms/{academiaId}/checkIns
// Count: (ver número de documentos)
```

### Limpar dados de teste
```javascript
// Firebase Console > Firestore
// Selecionar documentos de teste
// Delete
```

---

## 🚨 Troubleshooting

### Erro: "Cannot find module checkInService"
**Solução:**
```bash
# Reiniciar servidor
# Ctrl+C
npx expo start --web --port 5000 --clear
```

### Erro: "academiaId é obrigatório"
**Solução:**
```javascript
// Verificar se academia está carregada
console.log('Academia:', academia);
console.log('UserProfile:', userProfile);

// Usar fallback
const academiaId = academia?.id || userProfile?.academiaId;
```

### Dual-write não está funcionando
**Solução:**
```javascript
// Verificar em: src/infrastructure/services/checkInService.js
const ENABLE_DUAL_WRITE = true; // Linha 16

// Deve estar true!
```

### Notificações não aparecem
**Esperado!** Notificações só são enviadas para check-ins automáticos (QR/Geo).  
Check-ins manuais não geram notificação para evitar spam.

---

## ✅ Checklist Final

Antes de considerar Fase 1 completa:

- [ ] Compilação sem erros
- [ ] Check-in de aluno funciona
- [ ] Check-in manual de instrutor funciona
- [ ] Check-in em lote funciona
- [ ] Documentos aparecem em AMBAS localizações no Firestore
- [ ] IDs são idênticos nas duas localizações
- [ ] Campo `_migratedFrom: "dual-write"` presente
- [ ] Performance aceitável (<500ms individual, <2s batch de 5)
- [ ] Logs detalhados aparecem no console
- [ ] Sem erros no console do navegador

---

## 📝 Relatório de Teste

Preencher após testes:

**Data:** _____________  
**Testador:** _____________  

**Resultados:**
- [ ] ✅ Todos os testes passaram
- [ ] ⚠️ Alguns testes falharam (detalhar abaixo)
- [ ] ❌ Fase 1 precisa de correções

**Observações:**
```
(escrever aqui problemas encontrados, performance, etc.)
```

**Próximo passo:**
- [ ] Iniciar Fase 2 (Migração de Dados)
- [ ] Corrigir problemas encontrados
- [ ] Rollback (reverter mudanças)

---

**Última atualização:** 2026-01-28
