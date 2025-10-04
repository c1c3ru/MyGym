# Fluxo de Criação de Perfil

## Cenário
Quando um usuário tenta fazer login com credenciais válidas, mas não possui um perfil cadastrado no Firestore, o sistema agora oferece uma experiência guiada para criação do perfil.

## Como Funciona

### 1. Tentativa de Login
```typescript
const { signIn } = useAuthFacade();

try {
  await signIn(email, password);
  // Login bem-sucedido com perfil existente
} catch (error) {
  if (error.name === 'ProfileCreationNeededError') {
    // Usuário tem credenciais válidas mas precisa criar perfil
    handleProfileCreationNeeded(error);
  } else {
    // Outros erros de login (credenciais inválidas, etc.)
    handleLoginError(error);
  }
}
```

### 2. Tratamento do Erro de Perfil Não Encontrado
```typescript
const handleProfileCreationNeeded = (error) => {
  // O erro contém email e password para uso posterior
  const { email, password } = error;
  
  // Mostrar modal/dialog perguntando se usuário quer criar perfil
  showConfirmDialog({
    title: 'Perfil não encontrado',
    message: 'Suas credenciais estão corretas, mas você ainda não possui um perfil cadastrado. Deseja criar seu perfil agora?',
    confirmText: 'Sim, criar perfil',
    cancelText: 'Cancelar',
    onConfirm: () => redirectToProfileCreation(email, password),
    onCancel: () => {
      // Usuário escolheu não criar perfil agora
      console.log('Usuário cancelou criação de perfil');
    }
  });
};
```

### 3. Redirecionamento para Criação de Perfil
```typescript
const { startProfileCreation } = useAuthFacade();

const redirectToProfileCreation = async (email, password) => {
  try {
    // Autentica o usuário e prepara estado para criação de perfil
    await startProfileCreation(email, password);
    
    // Redirecionar para página de cadastro/criação de perfil
    navigate('/profile/create');
    // ou
    router.push('/profile/create');
    
  } catch (error) {
    console.error('Erro ao iniciar criação de perfil:', error);
    showError('Erro ao preparar criação de perfil. Tente novamente.');
  }
};
```

### 4. Na Página de Criação de Perfil
```typescript
const ProfileCreationPage = () => {
  const { user, needsProfileCreation } = useAuthFacade();
  
  // Verificar se usuário está no estado correto
  if (!user || !needsProfileCreation()) {
    // Redirecionar para login se estado não for válido
    navigate('/login');
    return null;
  }
  
  return (
    <div>
      <h1>Complete seu Perfil</h1>
      <p>Olá {user.email}, vamos configurar seu perfil!</p>
      
      <ProfileForm 
        userId={user.id}
        userEmail={user.email}
        onSuccess={() => {
          // Perfil criado com sucesso
          navigate('/dashboard');
        }}
      />
    </div>
  );
};
```

## Benefícios

1. **Experiência Controlada**: Usuário decide se quer criar perfil
2. **Não Invasivo**: Não redireciona automaticamente
3. **Informativo**: Mensagem clara sobre o que aconteceu
4. **Flexível**: Interface pode customizar o modal/dialog
5. **Seguro**: Credenciais são validadas antes de oferecer criação

## Estados Possíveis

- `needsProfileCreation()`: `true` quando usuário autenticado sem perfil
- `isAuthenticated`: `true` após `startProfileCreation()`
- `user`: Dados do Firebase Auth disponíveis
- `userProfile`: `null` até perfil ser criado

## Exemplo Completo de Implementação

```typescript
// LoginScreen.tsx
const LoginScreen = () => {
  const { signIn, startProfileCreation } = useAuthFacade();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);
  
  const handleLogin = async (email, password) => {
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      if (error.name === 'ProfileCreationNeededError') {
        setPendingCredentials({ email: error.email, password: error.password });
        setShowProfileDialog(true);
      } else {
        showError(error.message);
      }
    }
  };
  
  const handleCreateProfile = async () => {
    try {
      await startProfileCreation(
        pendingCredentials.email, 
        pendingCredentials.password
      );
      navigate('/profile/create');
    } catch (error) {
      showError('Erro ao iniciar criação de perfil');
    } finally {
      setShowProfileDialog(false);
      setPendingCredentials(null);
    }
  };
  
  return (
    <div>
      {/* Formulário de login */}
      
      {showProfileDialog && (
        <ConfirmDialog
          title="Criar Perfil"
          message="Suas credenciais estão corretas, mas você precisa criar um perfil. Deseja continuar?"
          onConfirm={handleCreateProfile}
          onCancel={() => setShowProfileDialog(false)}
        />
      )}
    </div>
  );
};
```
