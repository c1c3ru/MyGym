# Configuração CORS para Firebase Storage

## Problema
Erro CORS ao tentar fazer upload/download de arquivos no Firebase Storage a partir do localhost.

## Solução

### 1. Instalar Google Cloud SDK (se ainda não tiver)

**Linux/macOS:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**Windows:**
Baixe e instale de: https://cloud.google.com/sdk/docs/install

### 2. Fazer login no Google Cloud
```bash
gcloud auth login
```

### 3. Configurar o projeto
```bash
gcloud config set project academia-app-5cf79
```

### 4. Aplicar configuração CORS
```bash
gsutil cors set cors.json gs://academia-app-5cf79.firebasestorage.app
```

### 5. Verificar configuração
```bash
gsutil cors get gs://academia-app-5cf79.firebasestorage.app
```

## Alternativa: Configurar via Firebase Console

1. Acesse: https://console.firebase.google.com/project/academia-app-5cf79/storage
2. Vá em "Rules" (Regras)
3. Adicione regras de segurança que permitam acesso público para templates:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir leitura pública de templates de certificados
    match /templates/certificates/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Outras regras existentes
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verificação

Após aplicar, teste acessando diretamente no navegador:
```
https://firebasestorage.googleapis.com/v0/b/academia-app-5cf79.firebasestorage.app/o/templates%2Fcertificates%2FyCRtgOHYvw7kiHmF12aw_1769432141147.jpg?alt=media
```

**Nota:** Adicione `?alt=media` no final da URL para download direto.
