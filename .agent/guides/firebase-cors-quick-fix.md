# 🚀 Solução Rápida: Configurar CORS via Firebase Console

## ⚡ Método Mais Fácil (5 minutos)

### Passo 1: Acessar Firebase Console
Abra no navegador: https://console.firebase.google.com/project/academia-app-5cf79/storage/rules

### Passo 2: Atualizar Regras de Segurança

Cole o seguinte código:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ✅ Templates de certificados - Leitura pública
    match /templates/certificates/{allPaths=**} {
      allow read: if true;  // Permite leitura de qualquer origem
      allow write: if request.auth != null;  // Apenas usuários autenticados podem fazer upload
    }
    
    // ✅ Certificados gerados - Apenas autenticados
    match /certificates/{academiaId}/{studentId}/{graduationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // ✅ Outras regras existentes
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Passo 3: Publicar
Clique no botão **"Publicar"** (azul, canto superior direito)

### Passo 4: Aguardar
Aguarde 1-2 minutos para as regras propagarem

### Passo 5: Testar
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página
3. Tente fazer upload novamente

---

## 🔍 Verificação

Se ainda não funcionar, verifique:

1. **URL está correta?**
   - ✅ Deve ter `?alt=media` no final
   - ❌ Não deve ter `?name=...`

2. **Usuário está autenticado?**
   ```javascript
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   console.log('Usuário:', auth.currentUser);
   ```

3. **Bucket está correto?**
   - Verifique em: https://console.firebase.google.com/project/academia-app-5cf79/storage

---

## 📝 Notas

- As regras de leitura pública (`allow read: if true`) são seguras para templates
- Apenas usuários autenticados podem fazer upload
- Certificados gerados ficam protegidos (apenas autenticados)

---

## ❓ Ainda com problemas?

Execute o comando para configurar via gcloud:
```bash
source ~/.bashrc
gcloud auth login
gcloud config set project academia-app-5cf79
gsutil cors set cors.json gs://academia-app-5cf79.firebasestorage.app
```
