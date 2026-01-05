# 🚀 Guia Rápido - Firebase Features MyGym

## ⚡ Início Rápido (5 minutos)

### 1. Verificar Instalação ✅

Todas as dependências já estão instaladas! Verifique:

```bash
# Verificar se as functions compilam
cd functions
npx tsc --noEmit
cd ..
```

**✅ Resultado esperado**: Nenhum erro de compilação

---

### 2. Testar Localmente (Opcional)

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Iniciar emuladores
firebase emulators:start
```

Acesse: http://localhost:4000 para ver a UI dos emuladores

---

### 3. Deploy para Produção

#### Opção A: Script Automatizado (Recomendado)

```bash
./deploy-functions.sh
```

Escolha a opção 1 para deploy de todas as functions.

#### Opção B: Deploy Manual

```bash
# Compilar functions
cd functions
npm install
npx tsc

# Deploy
cd ..
firebase deploy --only functions
```

---

### 4. Configurar Backup (Opcional mas Recomendado)

```bash
# Substituir PROJECT_ID pelo ID do seu projeto Firebase
PROJECT_ID="seu-project-id"

# Habilitar API
gcloud services enable firestore.googleapis.com

# Criar bucket
gsutil mb -l southamerica-east1 gs://${PROJECT_ID}-backups

# Conceder permissões
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com \
  --role roles/datastore.importExportAdmin
```

---

### 5. Integrar FCM no App

Adicione ao seu componente de login ou após autenticação:

```typescript
// src/screens/auth/LoginScreen.tsx (ou similar)
import FCMService from '@infrastructure/services/FCMService';

// Após login bem-sucedido
const handleLoginSuccess = async (user) => {
  // ... código existente ...
  
  // Inicializar FCM
  try {
    await FCMService.initialize(user.id);
    console.log('FCM inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar FCM:', error);
  }
};

// No useEffect do App.tsx ou componente raiz
useEffect(() => {
  // Configurar handlers de notificação
  const unsubscribeForeground = FCMService.setupForegroundHandler((notification) => {
    console.log('Notificação recebida:', notification);
    // Mostrar toast ou alerta
  });

  const unsubscribeOpened = FCMService.setupNotificationOpenedHandler((notification) => {
    // Navegar baseado no tipo
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

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
  };
}, []);
```

---

### 6. Usar Check-in Geolocalizado

```typescript
// src/screens/student/ClassDetailsScreen.tsx (ou similar)
import { httpsCallable } from 'firebase/functions';
import { functions } from '@infrastructure/services/firebase';
import * as Location from 'expo-location';

const handleCheckIn = async (classId, academiaId) => {
  try {
    // Pedir permissão de localização
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão de localização negada');
      return;
    }

    // Obter localização atual
    const location = await Location.getCurrentPositionAsync({});
    
    // Chamar Cloud Function
    const checkInGeo = httpsCallable(functions, 'checkInGeo');
    const result = await checkInGeo({
      userLat: location.coords.latitude,
      userLng: location.coords.longitude,
      classId: classId,
      academiaId: academiaId,
      userId: currentUser.id
    });

    if (result.data.success) {
      Alert.alert('Sucesso!', result.data.message);
      // Atualizar UI
    } else {
      Alert.alert('Erro', result.data.message);
    }
  } catch (error) {
    console.error('Erro no check-in:', error);
    Alert.alert('Erro', 'Falha ao fazer check-in');
  }
};
```

---

### 7. Implementar Chat (Exemplo Básico)

```typescript
// src/screens/shared/ChatScreen.tsx
import { db } from '@infrastructure/services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const ChatScreen = ({ route }) => {
  const { academiaId, chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    // Ouvir mensagens em tempo real
    const messagesRef = collection(db, `gyms/${academiaId}/chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [academiaId, chatId]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const messagesRef = collection(db, `gyms/${academiaId}/chats/${chatId}/messages`);
      await addDoc(messagesRef, {
        text: messageText,
        senderId: currentUser.id,
        senderName: currentUser.name,
        timestamp: serverTimestamp(),
        read: false
      });
      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View>
            <Text>{item.senderName}: {item.text}</Text>
          </View>
        )}
      />
      <TextInput
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Digite uma mensagem..."
      />
      <Button title="Enviar" onPress={sendMessage} />
    </View>
  );
};
```

---

## 📊 Monitorar Após Deploy

### 1. Ver Logs das Functions

```bash
# Logs em tempo real
firebase functions:log

# Logs de uma function específica
firebase functions:log --only sendNewClassNotification

# Últimos 100 logs
firebase functions:log --limit 100
```

### 2. Verificar no Console Firebase

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **Functions** > **Dashboard**
4. Verifique:
   - ✅ Todas as 7 functions estão listadas
   - ✅ Status: "Healthy"
   - ✅ Invocações recentes

### 3. Testar Notificações

```bash
# Criar uma nova aula no Firestore (via console ou app)
# A function sendNewClassNotification deve disparar automaticamente

# Verificar logs
firebase functions:log --only sendNewClassNotification
```

---

## 🎯 Checklist Pós-Deploy

- [ ] Todas as functions deployadas com sucesso
- [ ] Logs não mostram erros
- [ ] Testar criação de aula → notificação enviada
- [ ] Testar check-in geolocalizado
- [ ] Configurar alertas de custo no Google Cloud Console
- [ ] Documentar credenciais de pagamento (quando integrar)
- [ ] Testar backup automático (aguardar 2h da manhã ou testar manualmente)

---

## 🆘 Troubleshooting Rápido

### Erro: "Function deployment failed"

```bash
cd functions
rm -rf node_modules package-lock.json
npm install
npx tsc
cd ..
firebase deploy --only functions
```

### Erro: "Insufficient permissions"

```bash
# Verificar permissões
gcloud projects get-iam-policy SEU-PROJECT-ID

# Adicionar permissão se necessário
gcloud projects add-iam-policy-binding SEU-PROJECT-ID \
  --member serviceAccount:SEU-PROJECT-ID@appspot.gserviceaccount.com \
  --role roles/cloudfunctions.developer
```

### Notificações não chegam

1. Verificar se FCM está inicializado: `FCMService.initialize(userId)`
2. Verificar se token foi salvo no Firestore
3. Verificar logs da function: `firebase functions:log --only sendNewClassNotification`
4. Testar com Firebase Console > Cloud Messaging > Send test message

---

## 📚 Próximos Passos

1. **Integrar Pagamentos**
   - Escolher provedor (Mercado Pago recomendado)
   - Obter credenciais
   - Configurar: `firebase functions:config:set mercadopago.access_token="TOKEN"`
   - Atualizar `paymentProcessor.ts` com integração real

2. **Implementar UI de Chat**
   - Criar tela de lista de chats
   - Criar tela de mensagens
   - Adicionar indicador de mensagens não lidas

3. **Analytics e Monitoramento**
   - Configurar Firebase Analytics
   - Adicionar eventos customizados
   - Configurar Crashlytics

---

## 💡 Dicas Importantes

1. **Custos**: Monitore uso no Firebase Console > Usage and Billing
2. **Segurança**: Nunca commite credenciais no código
3. **Performance**: Functions otimizadas = menos custo
4. **Backup**: Verifique se backups estão sendo criados diariamente
5. **Logs**: Monitore logs regularmente para detectar problemas

---

**Tudo pronto! 🎉**

Seu app MyGym agora tem todas as funcionalidades Firebase configuradas e prontas para uso!

Para dúvidas, consulte:
- [Documentação Completa](docs/FIREBASE_SETUP.md)
- [Resumo de Implementação](docs/FIREBASE_IMPLEMENTATION_SUMMARY.md)
- [README Functions](functions/README.md)
