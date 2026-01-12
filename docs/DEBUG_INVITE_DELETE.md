# Guia de Debug: Exclusão de Convites

## Como Testar a Exclusão

### Passo 1: Abrir o Console
1. Pressione **F12** no navegador
2. Vá para a aba **Console**
3. Limpe o console (ícone 🚫 ou Ctrl+L)

### Passo 2: Tentar Excluir um Convite
1. Na página "Gerenciar Convites"
2. Clique no botão **"Excluir"** de qualquer convite
3. Confirme a exclusão

### Passo 3: Verificar os Logs

Você deve ver uma sequência de logs assim:

#### ✅ **Se funcionar corretamente:**
```
🗑️ Iniciando exclusão de convite: { inviteId: "abc123", inviteEmail: "user@example.com", academiaId: "xyz789" }
✅ Usuário confirmou exclusão
📞 Chamando InviteService.deleteInvite...
🗑️ Tentando deletar convite: { academiaId: "xyz789", inviteId: "abc123" }
📄 Convite encontrado: { email: "user@example.com", status: "pending", ... }
✅ Convite deletado com sucesso: abc123
✅ Convite excluído com sucesso, recarregando lista...
🔄 Carregando convites para academia: xyz789
📋 Buscando convites ativos para academia: xyz789
📊 Convites encontrados: 18
✅ Convites retornados: 18
📥 Convites carregados: 18
```

#### ❌ **Se houver erro:**

##### Erro de Permissão:
```
❌ Erro ao excluir convite: FirebaseError: Missing or insufficient permissions
❌ Detalhes do erro: {
  message: "Missing or insufficient permissions",
  code: "permission-denied",
  ...
}
```

**Solução**: Verificar se você está logado como **admin** da academia

##### Erro de Convite Não Encontrado:
```
⚠️ Convite não encontrado: abc123
❌ Erro ao excluir convite: Error: Convite não encontrado
```

**Solução**: O convite pode ter sido excluído anteriormente ou não existe

##### Erro de Rede:
```
❌ Erro ao excluir convite: FirebaseError: Failed to get document
```

**Solução**: Verificar conexão com internet e status do Firebase

## Verificações Importantes

### 1. Verificar Role do Usuário

No console, execute:
```javascript
// Verificar claims do usuário
firebase.auth().currentUser.getIdTokenResult().then(token => {
  console.log('🔐 User Claims:', {
    role: token.claims.role,
    academiaId: token.claims.academiaId
  });
});
```

**Resultado esperado:**
```
🔐 User Claims: {
  role: "admin",
  academiaId: "yCRtgOHYvw7kiHmF12aw"
}
```

### 2. Verificar Regras do Firestore

As regras atuais permitem exclusão se:
- ✅ Usuário está autenticado (`request.auth != null`)
- ✅ Usuário tem academia válida (`hasValidAcademia()`)
- ✅ O `gymId` corresponde à academia do usuário (`gymId == getAcademiaId()`)
- ✅ Usuário é admin (`isAdmin()`)

### 3. Testar Diretamente no Firestore

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá para **Firestore Database**
3. Navegue até: `gyms/{sua-academia-id}/invites`
4. Tente deletar um convite manualmente
5. Se der erro, as regras de segurança estão bloqueando

## Possíveis Causas do Problema

### Causa 1: Claims Desatualizados
O token do usuário pode estar desatualizado. Força refresh:

```javascript
// No console do navegador
firebase.auth().currentUser.getIdToken(true).then(() => {
  console.log('✅ Token atualizado');
  location.reload();
});
```

### Causa 2: Academia ID Incorreto
Verifique se o `academiaId` nos claims corresponde ao `gymId` no Firestore:

```javascript
// Verificar no console
console.log('Academia do usuário:', firebase.auth().currentUser.academiaId);
console.log('Academia da tela:', academia?.id);
```

### Causa 3: Regras do Firestore Muito Restritivas
As regras na linha 328 do `firestore.rules`:
```
allow read, write: if request.auth != null && 
                     hasValidAcademia() &&
                     gymId == getAcademiaId() &&
                     isAdmin();
```

Teste temporário (⚠️ **APENAS PARA DEBUG**):
```
// Adicionar temporariamente após a linha 331:
allow delete: if request.auth != null;
```

Depois de testar, **REMOVA** esta linha!

## Solução Rápida

Se o problema persistir, tente estas soluções em ordem:

### 1. Forçar Logout/Login
```javascript
// No console
firebase.auth().signOut().then(() => {
  location.reload();
});
```

### 2. Limpar Cache do Navegador
- Ctrl+Shift+Delete
- Selecionar "Cached images and files"
- Limpar

### 3. Verificar Firestore Rules
Execute o deploy das regras:
```bash
firebase deploy --only firestore:rules
```

### 4. Verificar Custom Claims
No Firebase Functions, verifique se os claims estão sendo setados corretamente ao fazer login.

## Informações para Reportar

Se o problema persistir, copie e cole estas informações:

1. **Logs completos** do console (desde "🗑️ Iniciando exclusão..." até o erro)
2. **User Claims** (resultado do comando na seção "Verificar Role do Usuário")
3. **Academia ID** da tela e do usuário
4. **Mensagem de erro** completa (se houver)

## Teste Alternativo: Exclusão em Lote

Tente excluir múltiplos convites de uma vez:

1. Clique em "Gerenciar Exclusão"
2. Escolha "Excluir Pendentes" (ou outro status)
3. Confirme

Verifique os logs para ver se o erro é o mesmo ou diferente.
