# 🚨 Ação Necessária: Atualização de Regras do Firestore

Identificamos que o problema de "Turmas não aparecem" é causado por **permissões de segurança do Firestore**.

O código do app está correto, mas as regras de segurança no banco de dados bloqueiam o instrutor de ver turmas que não foram criadas por ele.

## 📝 O que fazer agora

Você precisa atualizar as regras de segurança do Firestore. Como você está usando o Firebase Real, isso deve ser feito manualmente no Console do Firebase.

### Opção 1: Via Console do Firebase (Mais Rápido)

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Vá em **Firestore Database** > **Regras** (Rules)
3. Procure pela seção de regras de turmas (`classes`)
4. **Substitua** este bloco:

```javascript
    // Turmas da academia
    match /gyms/{gymId}/classes/{classId} {
      // ... (regras de admin mantidas)
      
      // ❌ REGRA ANTIGA (REMOVER)
      /*
      allow read, write: if request.auth != null && 
                           hasValidAcademia() &&
                           gymId == getAcademiaId() && 
                           isInstructor() && 
                           (resource == null || resource.data.instructorId == request.auth.uid);
      */

      // ✅ REGRA NOVA (ADICIONAR)
      // Instrutor pode LER todas as turmas
      allow read: if request.auth != null && 
                     hasValidAcademia() &&
                     gymId == getAcademiaId() && 
                     isInstructor();

      // Instrutor pode ESCREVER apenas suas próprias turmas
      allow write: if request.auth != null && 
                      hasValidAcademia() &&
                      gymId == getAcademiaId() && 
                      isInstructor() && 
                      (resource == null || resource.data.instructorId == request.auth.uid);
                      
      // ... (outras regras mantidas)
    }
```

5. Clique em **Publicar** (Publish)

### Opção 2: Via Terminal (Se tiver Firebase CLI configurado)

Se você tiver o Firebase CLI configurado nesta máquina, posso tentar rodar o comando para você.

```bash
firebase deploy --only firestore:rules
```

## ✅ Resultado Esperado

Após atualizar as regras (leva alguns segundos para propagar):
1. **Recarregue o app**
2. O erro `Missing or insufficient permissions` vai desaparecer
3. As 5 turmas aparecerão para o instrutor

---
**Status da Tarefa**: Código corrigido localmente. Aguardando atualização das regras no servidor.
