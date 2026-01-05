# Cloud Functions - MyGym App

Este diretório contém todas as Cloud Functions do Firebase para o aplicativo MyGym.

## 📁 Estrutura

```
functions/
├── src/
│   ├── index.ts                    # Entry point - exporta todas as functions
│   ├── backup/
│   │   └── firestoreBackup.ts      # Backup automático do Firestore
│   ├── checkin/
│   │   └── geoCheckin.ts           # Validação de check-in com geolocalização
│   ├── evaluations/
│   │   └── evaluationProcessor.ts  # Processamento de avaliações
│   ├── notifications/
│   │   ├── classNotifications.ts   # Notificações de novas aulas
│   │   ├── classReminders.ts       # Lembretes de aulas
│   │   └── paymentReminders.ts     # Lembretes de pagamento
│   └── payments/
│       └── paymentProcessor.ts     # Processamento de pagamentos
├── package.json
└── tsconfig.json
```

## 🚀 Functions Implementadas

### 1. **sendNewClassNotification**
- **Tipo**: Firestore Trigger (onCreate)
- **Trigger**: `gyms/{academiaId}/classes/{classId}`
- **Descrição**: Envia notificação push para todos os usuários quando uma nova aula é criada
- **Região**: southamerica-east1

### 2. **checkInGeo**
- **Tipo**: HTTPS Callable
- **Descrição**: Valida a localização do usuário antes de permitir check-in
- **Parâmetros**:
  ```typescript
  {
    userLat: number,
    userLng: number,
    classId: string,
    academiaId: string,
    userId: string
  }
  ```
- **Retorno**:
  ```typescript
  {
    success: boolean,
    message: string,
    distance?: number,
    checkInId?: string
  }
  ```

### 3. **processPayment**
- **Tipo**: HTTPS Callable
- **Descrição**: Processa pagamentos (template para integração com Mercado Pago/Stripe)
- **Parâmetros**:
  ```typescript
  {
    paymentMethodId: string,
    amount: number,
    currency: string,
    studentId: string,
    academiaId: string,
    description?: string,
    planId?: string
  }
  ```

### 4. **onEvaluationUpdate**
- **Tipo**: Firestore Trigger (onWrite)
- **Trigger**: `gyms/{academiaId}/evaluations/{evaluationId}`
- **Descrição**: Calcula médias e atualiza perfis de alunos/instrutores automaticamente

### 5. **sendPaymentReminder**
- **Tipo**: Scheduled (Cron)
- **Schedule**: Diariamente às 9h (horário de Brasília)
- **Descrição**: Envia lembretes para pagamentos que vencem em até 3 dias

### 6. **sendClassReminder**
- **Tipo**: Scheduled (Cron)
- **Schedule**: A cada hora
- **Descrição**: Envia lembretes 2 horas antes das aulas começarem

### 7. **scheduledFirestoreExport**
- **Tipo**: Scheduled (Cron)
- **Schedule**: Diariamente às 2h da manhã
- **Descrição**: Faz backup automático do Firestore para Cloud Storage
- **Requer**: Configuração adicional (ver abaixo)

## 🛠️ Setup Inicial

### 1. Instalar Dependências

```bash
cd functions
npm install
```

### 2. Configurar Backup (Opcional)

Para habilitar backups automáticos:

```bash
# Habilitar API do Firestore
gcloud services enable firestore.googleapis.com

# Criar bucket para backups
gsutil mb -l southamerica-east1 gs://SEU-PROJECT-ID-backups

# Conceder permissões
gcloud projects add-iam-policy-binding SEU-PROJECT-ID \
  --member serviceAccount:SEU-PROJECT-ID@appspot.gserviceaccount.com \
  --role roles/datastore.importExportAdmin
```

### 3. Configurar Variáveis de Ambiente (se necessário)

```bash
# Exemplo: configurar token do Mercado Pago
firebase functions:config:set mercadopago.access_token="SEU_TOKEN"

# Ver configurações atuais
firebase functions:config:get
```

## 📦 Deploy

### Deploy Automático (Recomendado)

Use o script de deploy fornecido:

```bash
./deploy-functions.sh
```

### Deploy Manual

```bash
# Deploy de todas as functions
firebase deploy --only functions

# Deploy de uma function específica
firebase deploy --only functions:sendNewClassNotification

# Deploy de múltiplas functions
firebase deploy --only functions:checkInGeo,functions:processPayment
```

## 🧪 Testes Locais

### Iniciar Emuladores

```bash
# Iniciar todos os emuladores
firebase emulators:start

# Iniciar apenas functions
firebase emulators:start --only functions

# Iniciar functions + firestore
firebase emulators:start --only functions,firestore
```

### Testar Functions Localmente

```typescript
// No seu app React Native, configure para usar emuladores
import { connectFunctionsEmulator } from 'firebase/functions';
import { functions } from '@infrastructure/services/firebase';

if (__DEV__) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## 📊 Monitoramento

### Ver Logs

```bash
# Logs em tempo real
firebase functions:log

# Logs de uma function específica
firebase functions:log --only sendNewClassNotification

# Logs com limite
firebase functions:log --limit 100
```

### Métricas no Console

Acesse: [Firebase Console](https://console.firebase.google.com) > Functions > Dashboard

## 🔧 Desenvolvimento

### Compilar TypeScript

```bash
cd functions
npx tsc
```

### Verificar Erros

```bash
cd functions
npx tsc --noEmit
```

### Lint

```bash
cd functions
npm run lint
```

## 💰 Custos (Plano Gratuito)

O plano Spark (gratuito) do Firebase inclui:
- **2 milhões** de invocações/mês
- **400.000 GB-segundos** de tempo de computação
- **200.000 CPU-segundos**
- **5 GB** de saída de rede/mês

### Dicas para Economizar

1. **Otimize o código** - Functions mais rápidas custam menos
2. **Use regiões próximas** - Reduz latência e custos
3. **Implemente cache** - Evite chamadas desnecessárias
4. **Monitore o uso** - Configure alertas no Console

## 🔐 Segurança

### Boas Práticas

1. **Sempre valide dados** de entrada nas Callable Functions
2. **Use autenticação** - Verifique `context.auth`
3. **Implemente rate limiting** para evitar abuso
4. **Não exponha secrets** no código - use Firebase Config
5. **Valide permissões** antes de operações sensíveis

### Exemplo de Validação

```typescript
export const minhaFunction = functions.https.onCall(async (data, context) => {
  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuário deve estar autenticado'
    );
  }

  // Verificar permissões
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();
    
  if (userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Apenas admins podem executar esta ação'
    );
  }

  // Validar dados
  if (!data.requiredField) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Campo obrigatório ausente'
    );
  }

  // Processar...
});
```

## 🐛 Troubleshooting

### Erro: "Function deployment failed"

```bash
# Limpar e reinstalar dependências
cd functions
rm -rf node_modules package-lock.json
npm install

# Recompilar
npx tsc

# Tentar deploy novamente
firebase deploy --only functions
```

### Erro: "Insufficient permissions"

Verifique se o service account tem as permissões necessárias:

```bash
gcloud projects get-iam-policy SEU-PROJECT-ID
```

### Function não está sendo acionada

1. Verifique os logs: `firebase functions:log`
2. Confirme que o trigger está correto
3. Verifique as regras do Firestore
4. Teste localmente com emuladores

## 📚 Recursos

- [Documentação Firebase Functions](https://firebase.google.com/docs/functions)
- [Samples do Firebase](https://github.com/firebase/functions-samples)
- [Guia de Segurança](https://firebase.google.com/docs/functions/security)
- [Otimização de Performance](https://firebase.google.com/docs/functions/tips)

## 📝 Notas

- **Node.js**: Versão 18 (configurada no package.json)
- **TypeScript**: Versão 5.8.3
- **Firebase Functions**: v4.9.0 (v1 API)
- **Firebase Admin**: v12.0.0

---

**Última atualização**: 05/01/2026
