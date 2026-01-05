# Guia de Configuração Firebase - MyGym App

Este guia explica como configurar e usar todas as funcionalidades Firebase implementadas no MyGym App, focando nos planos no-cost.

## 📋 Índice

1. [Firebase Cloud Messaging (FCM)](#1-firebase-cloud-messaging-fcm)
2. [Cloud Firestore para Chat](#2-cloud-firestore-para-chat)
3. [Cloud Functions](#3-cloud-functions)
4. [Cloud Storage para Backup](#4-cloud-storage-para-backup)
5. [Custos e Limites](#5-custos-e-limites)

---

## 1. Firebase Cloud Messaging (FCM)

### 📱 Configuração Inicial

#### Passo 1: Habilitar FCM no Console Firebase
```bash
# Já está habilitado por padrão no seu projeto
# Acesse: Firebase Console > Project Settings > Cloud Messaging
```

#### Passo 2: Configurar no Android
1. O arquivo `google-services.json` já está configurado
2. As dependências já foram instaladas:
   - `@react-native-firebase/app@23.4.0`
   - `@react-native-firebase/messaging@23.4.0`

#### Passo 3: Inicializar FCM no App

```typescript
// No componente de login ou após autenticação
import FCMService from '@infrastructure/services/FCMService';

// Após o usuário fazer login
await FCMService.initialize(userId);

// Configurar handlers de notificação
FCMService.setupForegroundHandler((notification) => {
  console.log('Notificação recebida:', notification);
  // Mostrar notificação local ou atualizar UI
});

FCMService.setupNotificationOpenedHandler((notification) => {
  // Navegar para a tela apropriada baseado no tipo
  const { type, classId, academiaId } = notification.data;
  
  switch(type) {
    case 'new_class':
      navigation.navigate('ClassDetails', { classId });
      break;
    case 'payment_reminder':
      navigation.navigate('Payments');
      break;
    // ... outros casos
  }
});
```

### 🔔 Tipos de Notificações Implementadas

1. **Nova Aula Criada** - Enviada automaticamente quando uma aula é adicionada
2. **Lembrete de Pagamento** - Enviada diariamente às 9h para pagamentos pendentes
3. **Lembrete de Aula** - Enviada 2 horas antes da aula começar
4. **Confirmação de Pagamento** - Enviada após processamento de pagamento
5. **Falha no Backup** - Enviada para admins se o backup falhar

### 📊 Limites no-cost
- **Ilimitado** - FCM é completamente gratuito

---

## 2. Cloud Firestore para Chat

### 💬 Estrutura de Dados

```typescript
// Estrutura de chat
gyms/{academiaId}/chats/{chatId}/messages/{messageId}
{
  text: string,
  senderId: string,
  senderName: string,
  timestamp: Timestamp,
  read: boolean
}
```

### 🚀 Implementação do Chat

```typescript
import { db } from '@infrastructure/services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Enviar mensagem
const sendMessage = async (academiaId: string, chatId: string, messageText: string, userId: string) => {
  const messagesRef = collection(db, `gyms/${academiaId}/chats/${chatId}/messages`);
  
  await addDoc(messagesRef, {
    text: messageText,
    senderId: userId,
    senderName: currentUser.name,
    timestamp: serverTimestamp(),
    read: false
  });
};

// Ouvir novas mensagens em tempo real
const listenToMessages = (academiaId: string, chatId: string, onNewMessage: (messages: any[]) => void) => {
  const messagesRef = collection(db, `gyms/${academiaId}/chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onNewMessage(messages);
  });
  
  return unsubscribe; // Chamar para parar de ouvir
};
```

### 📊 Limites no-cost
- **1 GB** de armazenamento
- **50.000 leituras/dia**
- **20.000 gravações/dia**
- **20.000 exclusões/dia**

---

## 3. Cloud Functions

### ⚙️ Configuração e Deploy

#### Passo 1: Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Passo 2: Inicializar Functions (já feito)
```bash
cd functions
npm install
```

#### Passo 3: Configurar Permissões para Backup
```bash
# Habilitar APIs necessárias
gcloud services enable firestore.googleapis.com

# Criar bucket para backups
gsutil mb -l southamerica-east1 gs://mygym-app-backups

# Conceder permissões
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member serviceAccount:PROJECT_ID@appspot.gserviceaccount.com \
  --role roles/datastore.importExportAdmin
```

#### Passo 4: Deploy das Functions
```bash
# Deploy todas as functions
firebase deploy --only functions

# Ou deploy individual
firebase deploy --only functions:sendNewClassNotification
firebase deploy --only functions:checkInGeo
firebase deploy --only functions:processPayment
```

### 🔧 Functions Implementadas

#### 1. **sendNewClassNotification**
- **Trigger**: Firestore onCreate
- **Caminho**: `gyms/{academiaId}/classes/{classId}`
- **Função**: Envia notificação push quando nova aula é criada

#### 2. **checkInGeo**
- **Tipo**: HTTPS Callable
- **Função**: Valida localização do usuário para check-in
- **Uso no App**:
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@infrastructure/services/firebase';

const checkInGeo = httpsCallable(functions, 'checkInGeo');

const handleCheckIn = async () => {
  const location = await getCurrentLocation(); // Usar expo-location
  
  const result = await checkInGeo({
    userLat: location.coords.latitude,
    userLng: location.coords.longitude,
    classId: 'class123',
    academiaId: 'gym456',
    userId: currentUser.id
  });
  
  if (result.data.success) {
    Alert.alert('Sucesso!', result.data.message);
  } else {
    Alert.alert('Erro', result.data.message);
  }
};
```

#### 3. **processPayment**
- **Tipo**: HTTPS Callable
- **Função**: Processa pagamentos (template para integração)
- **Uso no App**:
```typescript
const processPayment = httpsCallable(functions, 'processPayment');

const handlePayment = async () => {
  const result = await processPayment({
    paymentMethodId: 'pm_123',
    amount: 150.00,
    currency: 'BRL',
    studentId: currentUser.id,
    academiaId: 'gym456',
    description: 'Mensalidade Janeiro 2026'
  });
  
  if (result.data.success) {
    console.log('Pagamento processado:', result.data.transactionId);
  }
};
```

#### 4. **onEvaluationUpdate**
- **Trigger**: Firestore onWrite
- **Caminho**: `gyms/{academiaId}/evaluations/{evaluationId}`
- **Função**: Calcula médias e atualiza perfis automaticamente

#### 5. **sendPaymentReminder**
- **Tipo**: Scheduled (Cron)
- **Horário**: Diariamente às 9h (horário de Brasília)
- **Função**: Envia lembretes de pagamentos pendentes

#### 6. **sendClassReminder**
- **Tipo**: Scheduled (Cron)
- **Horário**: A cada hora
- **Função**: Envia lembretes 2h antes das aulas

#### 7. **scheduledFirestoreExport**
- **Tipo**: Scheduled (Cron)
- **Horário**: Diariamente às 2h da manhã
- **Função**: Backup automático do Firestore para Cloud Storage

### 📊 Limites no-cost
- **2 milhões** de invocações/mês
- **400.000 GB-segundos** de tempo de computação
- **200.000 CPU-segundos**
- **5 GB** de saída de rede/mês

---

## 4. Cloud Storage para Backup

### 💾 Configuração de Backups Automáticos

#### Estrutura de Backups
```
gs://mygym-app-backups/
  └── firestore-backups/
      ├── 2026-01-05T05-00-00/
      ├── 2026-01-06T05-00-00/
      └── 2026-01-07T05-00-00/
```

#### Restaurar um Backup
```bash
# Listar backups disponíveis
gsutil ls gs://mygym-app-backups/firestore-backups/

# Restaurar backup específico
gcloud firestore import gs://mygym-app-backups/firestore-backups/2026-01-05T05-00-00
```

### 📤 Upload de Arquivos (Fotos de Perfil, etc.)

```typescript
import storage from '@react-native-firebase/storage';

// Upload de imagem
const uploadProfilePhoto = async (userId: string, imageUri: string) => {
  const filename = `profile_photos/${userId}.jpg`;
  const reference = storage().ref(filename);
  
  await reference.putFile(imageUri);
  const url = await reference.getDownloadURL();
  
  // Salvar URL no Firestore
  await updateDoc(doc(db, 'users', userId), {
    photoURL: url
  });
  
  return url;
};
```

### 📊 Limites no-cost
- **5 GB** de armazenamento
- **1 GB/dia** de download
- **50.000 operações** de leitura/dia
- **50.000 operações** de gravação/dia

---

## 5. Custos e Limites

### 📈 Resumo dos Limites Gratuitos

| Serviço | Limite Gratuito | Custo Adicional |
|---------|----------------|-----------------|
| **FCM** | Ilimitado | Gratuito |
| **Firestore** | 1GB, 50k leituras, 20k gravações/dia | $0.06/100k leituras |
| **Functions** | 2M invocações, 400k GB-s/mês | $0.40/M invocações |
| **Storage** | 5GB, 1GB download/dia | $0.026/GB/mês |
| **Authentication** | Ilimitado | Gratuito |

### 💡 Dicas para Manter no Plano Gratuito

1. **Firestore**:
   - Use listeners em tempo real com moderação
   - Implemente paginação em listas
   - Cache dados localmente com AsyncStorage
   - Use índices compostos para queries eficientes

2. **Functions**:
   - Otimize código para execução rápida
   - Use batching para operações múltiplas
   - Implemente retry logic com backoff exponencial

3. **Storage**:
   - Comprima imagens antes do upload
   - Use CDN para conteúdo estático
   - Implemente cache de imagens no app

4. **Monitoramento**:
   ```bash
   # Ver uso atual
   firebase projects:list
   firebase use mygym-app
   firebase functions:log
   ```

---

## 🚀 Próximos Passos

1. **Testar Localmente**:
   ```bash
   # Iniciar emuladores
   firebase emulators:start
   ```

2. **Deploy para Produção**:
   ```bash
   # Deploy completo
   firebase deploy
   
   # Deploy apenas functions
   firebase deploy --only functions
   
   # Deploy apenas regras
   firebase deploy --only firestore:rules
   ```

3. **Monitorar Uso**:
   - Acesse Firebase Console > Usage and Billing
   - Configure alertas de uso
   - Monitore logs das functions

4. **Integrar Pagamentos**:
   - Escolha provedor (Mercado Pago, Stripe, etc.)
   - Configure credenciais em Firebase Config:
   ```bash
   firebase functions:config:set mercadopago.access_token="YOUR_TOKEN"
   ```

---

## 📚 Recursos Adicionais

- [Documentação Firebase](https://firebase.google.com/docs)
- [Firebase Functions Samples](https://github.com/firebase/functions-samples)
- [React Native Firebase](https://rnfirebase.io/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## ⚠️ Notas Importantes

1. **Segurança**: Sempre valide dados no backend (Cloud Functions)
2. **Performance**: Use índices do Firestore para queries complexas
3. **Backup**: Os backups automáticos mantêm apenas os últimos 30 dias
4. **Notificações**: Tokens FCM podem expirar - o sistema limpa automaticamente
5. **Geolocalização**: Raio padrão de check-in é 100m (configurável por academia)

---

**Última atualização**: 05/01/2026
**Versão**: 1.0.0
