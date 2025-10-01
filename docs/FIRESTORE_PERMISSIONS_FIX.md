# Correção de Permissões do Firestore - Graduations

## Problema Identificado

```
academyCollectionsService.js:319 Erro ao buscar students/Kt8N7QlYfM6nnUpMtT6F/graduations: 
FirebaseError: Missing or insufficient permissions.
```

## Causa Raiz

O código estava tentando acessar a subcoleção `gyms/{gymId}/students/{studentId}/graduations`, mas as regras do Firestore não tinham permissões configuradas para essa subcoleção.

## Solução Aplicada

### 1. Regras do Firestore Atualizadas

Adicionada regra para subcoleção de graduations dentro de students:

```javascript
match /gyms/{gymId}/students/{studentId} {
  // Regras existentes do student...
  
  // Subcoleção de graduações do aluno
  match /graduations/{graduationId} {
    // Admin e instrutor podem ler/escrever graduações
    allow read, write: if request.auth != null && 
                         hasValidAcademia() &&
                         gymId == getAcademiaId() && 
                         isAdminOrInstructor();
    
    // Aluno pode ler suas próprias graduações
    allow read: if request.auth != null && 
                   hasValidAcademia() &&
                   gymId == getAcademiaId() && 
                   isStudent() && 
                   request.auth.uid == studentId;
  }
}
```

### 2. Estrutura de Dados

**Path Correto:**
```
gyms/{academiaId}/students/{studentId}/graduations/{graduationId}
```

**Código que acessa:**
```javascript
// graduationRepository.js
const graduations = await academyCollectionsService.getCollection(
  academiaId, 
  `students/${studentId}/graduations`
);
```

**Como funciona:**
```javascript
// academyCollectionsService.js
getAcademyCollection(academiaId, collectionName) {
  return collection(db, 'gyms', academiaId, collectionName);
}
// Resultado: gyms/{academiaId}/students/{studentId}/graduations ✅
```

## Deploy das Regras

### Opção 1: Script Automático

```bash
./deploy-firestore-rules.sh
```

### Opção 2: Manual

```bash
# 1. Copiar regras para raiz (se necessário)
cp src/infrastructure/services/firestore.rules firestore.rules

# 2. Fazer deploy
firebase deploy --only firestore:rules
```

### Opção 3: Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** → **Regras**
4. Cole o conteúdo de `firestore.rules`
5. Clique em **Publicar**

## Permissões Configuradas

| Perfil | Leitura | Escrita |
|--------|---------|---------|
| **Admin** | ✅ Todas as graduations da academia | ✅ Todas as graduations |
| **Instrutor** | ✅ Todas as graduations da academia | ✅ Todas as graduations |
| **Aluno** | ✅ Apenas suas próprias graduations | ❌ Não pode criar/editar |

## Validações de Segurança

Todas as operações validam:
- ✅ Usuário autenticado (`request.auth != null`)
- ✅ Academia válida (`hasValidAcademia()`)
- ✅ Academia corresponde ao token (`gymId == getAcademiaId()`)
- ✅ Role apropriado (`isAdmin()`, `isInstructor()`, `isStudent()`)

## Testando as Permissões

### Como Admin/Instrutor:
```javascript
// Buscar graduations de um aluno
const graduations = await academyCollectionsService.getCollection(
  academiaId,
  `students/${studentId}/graduations`
);
// ✅ Deve funcionar
```

### Como Aluno:
```javascript
// Buscar próprias graduations
const myGraduations = await academyCollectionsService.getCollection(
  academiaId,
  `students/${myUserId}/graduations`
);
// ✅ Deve funcionar

// Tentar buscar graduations de outro aluno
const otherGraduations = await academyCollectionsService.getCollection(
  academiaId,
  `students/${otherUserId}/graduations`
);
// ❌ Deve falhar com "Missing or insufficient permissions"
```

## Troubleshooting

### Erro persiste após deploy

**Causa:** As regras podem levar 2-3 minutos para serem aplicadas.

**Solução:** 
1. Aguarde alguns minutos
2. Faça hard refresh no navegador (Ctrl+Shift+R)
3. Verifique se o deploy foi bem-sucedido no console do Firebase

### Erro "academiaId é obrigatório"

**Causa:** O `academiaId` não está sendo passado corretamente.

**Solução:** Verifique se o `userProfile.academiaId` está disponível:
```javascript
const academiaId = userProfile?.academiaId || academia?.id;
if (!academiaId) {
  console.error('Academia ID não encontrado');
  return;
}
```

### Erro "Custom claims não encontrados"

**Causa:** O token do usuário não tem os custom claims configurados.

**Solução:** Verifique se o usuário tem `role` e `academiaId` nos custom claims:
```javascript
// Verificar no console
const token = await user.getIdTokenResult();
console.log('Custom Claims:', token.claims);
// Deve ter: { role: 'admin', academiaId: 'xyz123' }
```

## Arquivos Modificados

- ✅ `/src/infrastructure/services/firestore.rules` (linhas 64-78)
- ✅ `/firestore.rules` (cópia na raiz para deploy)
- ✅ `/deploy-firestore-rules.sh` (script de deploy)

## Referências

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Subcollections in Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure#granular_operations)
