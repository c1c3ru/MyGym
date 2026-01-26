# 🔧 Solução para Erro CORS do Firebase Storage

## 🚨 Problema Identificado

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:5000' has been blocked by CORS policy
```

## ✅ Solução Rápida (Recomendada)

### Opção 1: Configurar CORS via Google Cloud SDK

**1. Instalar Google Cloud SDK:**
```bash
# Linux/macOS
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows: Baixe de https://cloud.google.com/sdk/docs/install
```

**2. Autenticar e configurar:**
```bash
gcloud auth login
gcloud config set project academia-app-5cf79
```

**3. Aplicar configuração CORS:**
```bash
gsutil cors set cors.json gs://academia-app-5cf79.firebasestorage.app
```

**4. Verificar:**
```bash
gsutil cors get gs://academia-app-5cf79.firebasestorage.app
```

---

### Opção 2: Configurar Regras de Segurança no Firebase Console

**1. Acesse:** https://console.firebase.google.com/project/academia-app-5cf79/storage/rules

**2. Atualize as regras:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Templates de certificados - Leitura pública, escrita autenticada
    match /templates/certificates/{allPaths=**} {
      allow read: if true;  // Permite leitura pública
      allow write: if request.auth != null;  // Apenas usuários autenticados
    }
    
    // Certificados gerados - Apenas usuários autenticados
    match /certificates/{academiaId}/{studentId}/{graduationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Outras regras existentes
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**3. Clique em "Publicar"**

---

### Opção 3: Usar URL com Token (Temporário para Desenvolvimento)

Se você só precisa testar rapidamente, pode usar URLs com token de acesso:

```typescript
// No certificateService.ts, ao obter a URL:
const downloadURL = await getDownloadURL(storageRef);

// A URL já vem com token de acesso, exemplo:
// https://firebasestorage.googleapis.com/v0/b/.../o/...?alt=media&token=abc123
```

**Certifique-se de usar `?alt=media` na URL:**

```typescript
// Ao usar a URL no HTML do certificado:
const bgUrl = templateInfo.imageUrl.includes('?') 
  ? templateInfo.imageUrl 
  : `${templateInfo.imageUrl}?alt=media`;
```

---

## 🔍 Verificação

### Teste 1: Acesso direto no navegador
```
https://firebasestorage.googleapis.com/v0/b/academia-app-5cf79.firebasestorage.app/o/templates%2Fcertificates%2FyCRtgOHYvw7kiHmF12aw_1769432141147.jpg?alt=media
```

Se funcionar, o problema é apenas CORS.

### Teste 2: Verificar regras de segurança
No Firebase Console > Storage > Rules, verifique se há regras bloqueando o acesso.

### Teste 3: Verificar autenticação
Certifique-se de que o usuário está autenticado ao fazer upload:

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (!user) {
  throw new Error('Usuário não autenticado');
}
```

---

## 📝 Arquivo cors.json (Já Criado)

O arquivo `cors.json` na raiz do projeto está configurado para permitir:
- ✅ Localhost nas portas 5000, 19006, 8081
- ✅ Métodos GET, POST, PUT, DELETE, HEAD
- ✅ Headers necessários

---

## 🎯 Próximos Passos

1. **Execute a configuração CORS** (Opção 1 ou 2 acima)
2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   # Pare o servidor atual (Ctrl+C)
   npx expo start --web --port 5000 --clear
   ```
3. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
4. **Teste novamente**

---

## 🐛 Troubleshooting

### Erro persiste após configurar CORS?

1. **Verifique se está usando a URL correta:**
   ```typescript
   // ❌ Errado
   const url = 'https://firebasestorage.googleapis.com/v0/b/.../o?name=...'
   
   // ✅ Correto
   const url = await getDownloadURL(storageRef);
   ```

2. **Verifique se o bucket existe:**
   ```bash
   gsutil ls
   ```

3. **Verifique permissões do projeto:**
   - Acesse: https://console.cloud.google.com/iam-admin/iam?project=academia-app-5cf79
   - Certifique-se de ter permissões de Storage Admin

---

## 📚 Referências

- [Firebase Storage CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud CORS](https://cloud.google.com/storage/docs/configuring-cors)
- [Firebase Security Rules](https://firebase.google.com/docs/storage/security)
