# Análise do Fluxo de Login - MyGym

## Data: 2026-01-14

## Problemas Identificados

### 1. **Login com Google seguido de Login Normal com mesmo email**

**Problema Atual:**
- Quando um usuário faz login com Google, o sistema cria uma conta no Firebase Auth
- O sistema tenta buscar o perfil do usuário no Firestore
- Se o perfil não existe, o sistema mantém o usuário autenticado mas sem perfil
- Se o usuário tentar fazer login "normal" (email/senha) com o mesmo email, o Firebase Auth retornará erro porque a conta já existe mas foi criada via Google

**Comportamento Esperado:**
- O sistema deve aceitar/validar o login normal se o email já existe no Firebase Auth (independente do método de criação)
- O sistema deve verificar se existe um perfil no Firestore para aquele usuário
- Se não existir perfil, deve permitir que o usuário complete o cadastro

**Código Afetado:**
- `src/presentation/auth/AuthFacade.ts` - Função `signIn` (linha 108-181)
- `src/data/auth/FirebaseAuthRepository.ts` - Função `signInWithEmail` (linha 45-58)
- `src/domain/auth/usecases/SignInWithEmail.ts`

### 2. **Cadastro com email já usado no login com Google**

**Problema Atual:**
- Se um usuário fez login com Google, o Firebase Auth já criou uma conta
- Se o usuário tentar se cadastrar com o mesmo email via formulário de registro, o Firebase retornará erro `auth/email-already-in-use`
- O sistema mostra erro mas não orienta o usuário a fazer login

**Comportamento Esperado:**
- O sistema deve detectar que o email já existe no Firebase Auth
- Verificar se já existe um perfil completo no Firestore
- Se NÃO existe perfil: permitir que o usuário complete o cadastro usando os dados fornecidos
- Se JÁ existe perfil: informar que deve fazer login ao invés de cadastro

**Código Afetado:**
- `src/presentation/screens/auth/RegisterScreen.tsx` - Função `handleRegister` (linha 148-229)
- `src/presentation/auth/AuthFacade.ts` - Função `signUp` (linha 183-232)
- `src/domain/auth/usecases/SignUpWithEmail.ts` - Função `execute` (linha 14-72)

## Fluxo Atual

### Login com Google:
```
1. Usuário clica em "Login com Google"
2. signInWithGoogle() → FirebaseAuthRepository.signInWithGoogle()
3. Firebase Auth cria/autentica usuário
4. GetUserSessionUseCase.execute() tenta buscar perfil
5. Se perfil não existe → UserProfileNotFoundError
6. AuthFacade mantém usuário autenticado mas sem perfil
7. Usuário fica em estado "autenticado sem perfil"
```

### Login Normal (Email/Senha):
```
1. Usuário digita email e senha
2. signIn() → SignInWithEmailUseCase.execute()
3. FirebaseAuthRepository.signInWithEmail() → signInWithEmailAndPassword()
4. Se conta foi criada via Google → Firebase retorna erro
5. Sistema mostra erro genérico
```

### Cadastro Normal:
```
1. Usuário preenche formulário de cadastro
2. signUp() → SignUpWithEmailUseCase.execute()
3. FirebaseAuthRepository.signUpWithEmail() → createUserWithEmailAndPassword()
4. Se email já existe (criado via Google) → auth/email-already-in-use
5. Sistema mostra erro mas não oferece solução
```

## Soluções Propostas

### Solução 1: Unificar Login Normal e Social

**Implementação:**
1. Modificar `signIn` no AuthFacade para:
   - Tentar fazer login com email/senha
   - Se falhar com erro de credenciais inválidas, verificar se o usuário existe no Firebase Auth
   - Se existir, informar que a conta foi criada via provedor social
   - Sugerir login com o provedor correto

2. Adicionar método helper para detectar provedores de login:
```typescript
async getSignInMethodsForEmail(email: string): Promise<string[]>
```

### Solução 2: Permitir Completar Cadastro para Contas Sociais

**Implementação:**
1. Modificar `signUp` no AuthFacade para:
   - Tentar criar conta normalmente
   - Se receber `auth/email-already-in-use`:
     - Verificar se existe perfil no Firestore
     - Se NÃO existe perfil: criar perfil com os dados fornecidos
     - Se JÁ existe perfil: redirecionar para login

2. Adicionar método no FirebaseAuthRepository:
```typescript
async checkIfUserHasProfile(email: string): Promise<boolean>
```

### Solução 3: Melhorar Feedback Visual

**Implementação:**
1. No RegisterScreen, quando detectar `auth/email-already-in-use`:
   - Verificar se usuário tem perfil
   - Se não tem: oferecer botão "Completar Cadastro"
   - Se tem: oferecer botão "Fazer Login"

2. No LoginScreen, quando detectar erro de credenciais:
   - Verificar métodos de login disponíveis
   - Mostrar mensagem específica: "Esta conta foi criada com Google. Use o botão 'Login com Google'"

## Arquivos que Precisam ser Modificados

### 1. FirebaseAuthRepository.ts
- Adicionar método `getSignInMethodsForEmail(email: string)`
- Adicionar método `checkIfUserHasProfile(email: string)`

### 2. AuthFacade.ts
- Modificar `signIn` para detectar e informar sobre contas sociais
- Modificar `signUp` para permitir completar cadastro de contas sociais sem perfil

### 3. RegisterScreen.tsx
- Melhorar tratamento de erro `auth/email-already-in-use`
- Adicionar lógica para completar cadastro de contas sociais

### 4. LoginScreen.tsx
- Melhorar feedback quando credenciais são inválidas
- Informar sobre métodos de login disponíveis

### 5. Domain Layer
- Adicionar novo erro: `AccountExistsWithDifferentProviderError`
- Modificar `SignUpWithEmail.ts` para lidar com contas existentes

## Prioridades

1. **Alta**: Permitir completar cadastro para contas criadas via Google (Solução 2)
2. **Alta**: Melhorar feedback no login quando conta existe via provedor social (Solução 1)
3. **Média**: Adicionar verificação de métodos de login disponíveis
4. **Baixa**: Adicionar opção de vincular contas (link accounts)

## Próximos Passos

1. Implementar método `getSignInMethodsForEmail` no FirebaseAuthRepository
2. Modificar fluxo de cadastro para detectar e completar perfis de contas sociais
3. Melhorar mensagens de erro nas telas de Login e Register
4. Adicionar testes para os novos fluxos
5. Documentar o novo comportamento

## Notas Técnicas

- Firebase Auth permite múltiplos provedores para o mesmo email se configurado
- Atualmente o sistema não está configurado para vincular contas
- O Firestore é a fonte de verdade para perfis de usuário
- Firebase Auth é apenas para autenticação
- Custom claims são gerenciados via Cloud Functions (não visível no código atual)
