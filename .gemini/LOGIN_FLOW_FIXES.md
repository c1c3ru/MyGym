# Correções Implementadas no Fluxo de Login - MyGym

## Data: 2026-01-14

## Resumo das Mudanças

Foram implementadas correções para resolver os problemas identificados no fluxo de autenticação, especialmente relacionados ao login com Google e cadastro com email já existente.

## Problemas Resolvidos

### 1. ✅ Login com Google seguido de Login Normal
**Problema:** Usuário fazia login com Google, depois tentava login normal com mesmo email e recebia erro.

**Solução Implementada:**
- Adicionado método `getSignInMethodsForEmail()` para verificar provedores de login disponíveis
- Modificado `signIn()` no AuthFacade para detectar quando credenciais são inválidas e verificar se a conta existe com outro provedor
- Sistema agora informa ao usuário: "Esta conta foi criada com Google. Use o método de login correto."

### 2. ✅ Cadastro com Email já usado no Login com Google
**Problema:** Usuário fazia login com Google (criando conta no Auth mas sem perfil), depois tentava se cadastrar com mesmo email e recebia erro genérico.

**Solução Implementada:**
- Adicionado método `getUserProfileByEmail()` para verificar se existe perfil no Firestore
- Modificado `signUp()` no AuthFacade para:
  - Detectar erro `email-already-in-use`
  - Verificar se existe perfil no Firestore
  - Se NÃO existe perfil: fazer login e criar perfil com dados fornecidos
  - Se JÁ existe perfil: informar que deve fazer login
- Sistema agora permite completar o cadastro de contas criadas via Google

## Arquivos Modificados

### 1. `/home/deppi/MyGym/src/domain/auth/repositories.ts`
**Mudanças:**
- Adicionados métodos à interface `AuthRepository`:
  - `getSignInMethodsForEmail(email: string): Promise<string[]>`
  - `getUserProfileByEmail(email: string): Promise<UserProfile | null>`

### 2. `/home/deppi/MyGym/src/data/auth/FirebaseAuthRepository.ts`
**Mudanças:**
- Implementado `getSignInMethodsForEmail()`:
  - Usa `fetchSignInMethodsForEmail` do Firebase Auth
  - Retorna lista de provedores disponíveis para o email
  
- Implementado `getUserProfileByEmail()`:
  - Busca perfil no Firestore usando query por email
  - Retorna perfil se existir, null caso contrário

### 3. `/home/deppi/MyGym/src/presentation/auth/AuthFacade.ts`
**Mudanças:**

#### Função `signIn()`:
- Adicionada verificação de provedores quando credenciais são inválidas
- Se conta existe com outro provedor, informa ao usuário qual provedor usar
- Mensagens mais específicas e úteis

#### Função `signUp()`:
- Adicionado tratamento especial para `EmailAlreadyInUseError`
- Verifica se existe perfil no Firestore
- Se não existe perfil:
  - Faz login com credenciais fornecidas
  - Cria perfil com dados do formulário
  - Atualiza estado da aplicação
  - Mostra mensagem de sucesso
- Se existe perfil:
  - Informa que deve fazer login

## Fluxos Corrigidos

### Fluxo 1: Login Google → Login Normal
```
1. Usuário faz login com Google
2. Sistema cria conta no Firebase Auth
3. Sistema tenta buscar perfil (não existe)
4. Usuário fica autenticado sem perfil

5. Usuário tenta login normal com mesmo email
6. Firebase Auth retorna erro (credenciais inválidas)
7. Sistema verifica provedores disponíveis
8. Sistema informa: "Esta conta foi criada com Google"
9. Usuário usa botão de login com Google
```

### Fluxo 2: Login Google → Cadastro Normal
```
1. Usuário faz login com Google
2. Sistema cria conta no Firebase Auth
3. Sistema tenta buscar perfil (não existe)
4. Usuário faz logout

5. Usuário tenta se cadastrar com mesmo email
6. Firebase Auth retorna erro (email já em uso)
7. Sistema verifica se existe perfil no Firestore
8. Perfil não existe → Sistema permite completar cadastro
9. Sistema faz login com credenciais fornecidas
10. Sistema cria perfil com dados do formulário
11. Usuário fica autenticado com perfil completo
```

### Fluxo 3: Cadastro Completo → Tentativa de Novo Cadastro
```
1. Usuário se cadastra normalmente
2. Sistema cria conta e perfil

3. Usuário tenta se cadastrar novamente (mesmo email)
4. Firebase Auth retorna erro (email já em uso)
5. Sistema verifica se existe perfil no Firestore
6. Perfil existe → Sistema informa: "Faça login"
7. Usuário é direcionado para tela de login
```

## Melhorias de UX

### Mensagens Mais Claras
- ❌ Antes: "Email já está em uso"
- ✅ Agora: "Este email já está cadastrado com um perfil completo. Por favor, faça login."

- ❌ Antes: "Email ou senha incorretos"
- ✅ Agora: "Esta conta foi criada com Google. Use o método de login correto."

### Fluxo Mais Inteligente
- Sistema detecta automaticamente o estado da conta
- Permite completar cadastro quando apropriado
- Orienta usuário para ação correta

## Testes Recomendados

### Teste 1: Login Google → Login Normal
1. Fazer login com Google (conta nova)
2. Fazer logout
3. Tentar login normal com mesmo email
4. Verificar mensagem informando sobre Google
5. Fazer login com Google novamente

### Teste 2: Login Google → Cadastro
1. Fazer login com Google (conta nova)
2. Fazer logout
3. Tentar cadastro com mesmo email
4. Verificar que sistema permite completar cadastro
5. Verificar que perfil foi criado corretamente

### Teste 3: Cadastro → Tentativa de Novo Cadastro
1. Fazer cadastro normal
2. Fazer logout
3. Tentar cadastro novamente com mesmo email
4. Verificar mensagem orientando para login
5. Fazer login normalmente

## Próximos Passos (Opcional)

### Melhorias Futuras
1. **Link de Contas**: Permitir vincular múltiplos provedores à mesma conta
2. **Migração de Senha**: Permitir adicionar senha a contas criadas via social
3. **Detecção Proativa**: Mostrar provedores disponíveis antes do erro
4. **UI Melhorada**: Adicionar ícones dos provedores nas mensagens

### Monitoramento
1. Adicionar analytics para rastrear:
   - Tentativas de login com provedor errado
   - Completamento de cadastro via fluxo alternativo
   - Erros de autenticação por tipo

## Notas Técnicas

- As mudanças são retrocompatíveis
- Não afetam usuários já cadastrados
- Funcionam tanto para web quanto mobile
- Logs detalhados foram adicionados para debugging
- Tratamento de erros robusto implementado

## Conclusão

O fluxo de autenticação agora é mais inteligente e amigável:
- ✅ Detecta contas criadas via provedores sociais
- ✅ Permite completar cadastro quando apropriado
- ✅ Fornece mensagens claras e acionáveis
- ✅ Evita frustração do usuário
- ✅ Mantém segurança e integridade dos dados
