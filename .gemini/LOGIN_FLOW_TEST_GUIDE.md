# Guia de Testes - Correções do Fluxo de Login

## Data: 2026-01-14

## Pré-requisitos
- Aplicativo rodando localmente ou em ambiente de teste
- Acesso ao Firebase Console para verificar usuários criados
- Acesso ao Firestore para verificar perfis de usuários

## Cenários de Teste

### 📋 Teste 1: Login com Google → Tentativa de Login Normal

**Objetivo:** Verificar que o sistema informa corretamente quando uma conta foi criada via Google

**Passos:**
1. Abra o aplicativo
2. Clique em "Login com Google"
3. Selecione uma conta Google (ou crie uma nova)
4. Verifique que você foi autenticado
5. Faça logout
6. Na tela de login, digite o mesmo email usado no Google
7. Digite qualquer senha
8. Clique em "Login"

**Resultado Esperado:**
- ❌ Sistema NÃO deve aceitar o login
- ✅ Sistema deve mostrar mensagem: "Esta conta foi criada com Google. Use o método de login correto."
- ✅ Usuário deve entender que precisa usar o botão "Login com Google"

**Verificação no Console:**
```
Procure por logs:
- "🔐 Erro no login:"
- "Verificando métodos de login para email..."
```

---

### 📋 Teste 2: Login com Google → Cadastro com Mesmo Email (Sem Perfil)

**Objetivo:** Verificar que o sistema permite completar o cadastro quando não há perfil

**Passos:**
1. Abra o aplicativo
2. Clique em "Login com Google"
3. Selecione uma conta Google (ou crie uma nova)
4. Verifique que você foi autenticado mas sem perfil completo
5. Faça logout
6. Clique em "Criar Conta" ou "Cadastrar"
7. Preencha o formulário com:
   - Email: mesmo email do Google
   - Senha: qualquer senha válida (mínimo 6 caracteres)
   - Nome completo
   - Telefone (opcional)
   - Tipo de usuário: Aluno
   - Aceite os termos
8. Clique em "Criar Conta"

**Resultado Esperado:**
- ✅ Sistema deve detectar que o email já existe
- ✅ Sistema deve verificar que NÃO existe perfil
- ✅ Sistema deve fazer login automaticamente
- ✅ Sistema deve criar o perfil com os dados fornecidos
- ✅ Mensagem: "Perfil criado com sucesso! Bem-vindo!"
- ✅ Usuário deve estar autenticado com perfil completo

**Verificação no Firestore:**
```
1. Abra Firebase Console → Firestore
2. Navegue para coleção 'users'
3. Procure pelo documento com o UID do usuário
4. Verifique que o perfil foi criado com:
   - name: nome fornecido
   - email: email do Google
   - phone: telefone fornecido
   - userType: 'student'
   - isActive: true
```

**Verificação no Console:**
```
Procure por logs:
- "📝 Email existe no Auth mas sem perfil. Permitindo completar cadastro..."
- "Perfil criado com sucesso!"
```

---

### 📋 Teste 3: Cadastro Completo → Tentativa de Novo Cadastro

**Objetivo:** Verificar que o sistema impede cadastro duplicado quando já existe perfil

**Passos:**
1. Abra o aplicativo
2. Faça um cadastro normal completo:
   - Email: novo email (ex: teste@example.com)
   - Senha: senha123
   - Nome: João Silva
   - Aceite os termos
3. Verifique que foi criado com sucesso
4. Faça logout
5. Tente se cadastrar novamente com o mesmo email
6. Preencha o formulário com os mesmos dados

**Resultado Esperado:**
- ❌ Sistema NÃO deve criar novo perfil
- ✅ Mensagem: "Este email já está cadastrado com um perfil completo. Por favor, faça login."
- ✅ Usuário deve ser orientado a fazer login

**Verificação no Console:**
```
Procure por logs:
- "📝 Erro no registro:"
- "Perfil já existe - usuário deve fazer login"
```

---

### 📋 Teste 4: Login com Google → Logout → Login com Google Novamente

**Objetivo:** Verificar que login com Google continua funcionando normalmente

**Passos:**
1. Abra o aplicativo
2. Clique em "Login com Google"
3. Selecione uma conta Google
4. Verifique que foi autenticado
5. Faça logout
6. Clique em "Login com Google" novamente
7. Selecione a mesma conta

**Resultado Esperado:**
- ✅ Login deve funcionar normalmente
- ✅ Se perfil existe, deve carregar perfil
- ✅ Se perfil não existe, deve manter usuário autenticado sem perfil

---

### 📋 Teste 5: Cadastro Normal → Login Normal

**Objetivo:** Verificar que fluxo normal não foi afetado

**Passos:**
1. Abra o aplicativo
2. Clique em "Criar Conta"
3. Preencha formulário completo
4. Clique em "Criar Conta"
5. Verifique que foi criado com sucesso
6. Faça logout
7. Faça login com email e senha cadastrados

**Resultado Esperado:**
- ✅ Cadastro deve funcionar normalmente
- ✅ Login deve funcionar normalmente
- ✅ Perfil deve ser carregado corretamente

---

## Checklist de Verificação

### ✅ Funcionalidades Básicas
- [ ] Login com email/senha funciona
- [ ] Cadastro com email/senha funciona
- [ ] Login com Google funciona
- [ ] Logout funciona

### ✅ Novos Comportamentos
- [ ] Sistema detecta contas criadas via Google
- [ ] Sistema informa método de login correto
- [ ] Sistema permite completar cadastro de contas Google sem perfil
- [ ] Sistema impede cadastro duplicado quando perfil existe

### ✅ Mensagens de Erro
- [ ] Mensagens são claras e acionáveis
- [ ] Usuário entende o que fazer
- [ ] Não há mensagens genéricas ou confusas

### ✅ Integridade de Dados
- [ ] Perfis são criados corretamente
- [ ] Não há duplicação de perfis
- [ ] Dados do usuário são preservados

## Problemas Conhecidos

### Limitações Atuais
1. **Múltiplos Provedores**: Sistema não vincula automaticamente contas de diferentes provedores
2. **Senha para Contas Sociais**: Não é possível adicionar senha a contas criadas via Google
3. **Migração de Contas**: Não há ferramenta para migrar contas entre provedores

### Workarounds
1. Se usuário criou conta com Google e quer usar senha:
   - Fazer logout
   - Usar "Esqueci minha senha" (não funcionará)
   - Orientar a continuar usando Google

## Logs Importantes

### Logs de Sucesso
```
✅ [FirebaseAuthRepository] signInWithGoogle bem-sucedido
✅ [AuthFacade] Sessão carregada com sucesso
📝 Email existe no Auth mas sem perfil. Permitindo completar cadastro...
✅ Perfil criado com sucesso!
```

### Logs de Erro Esperados
```
🔐 Erro no login: InvalidCredentialsError
📝 Erro no registro: EmailAlreadyInUseError
❌ Perfil já existe - usuário deve fazer login
```

## Ferramentas de Debug

### Firebase Console
- **Authentication**: Ver usuários criados e provedores
- **Firestore**: Ver perfis de usuários
- **Logs**: Ver erros e atividades

### Console do Navegador/App
- Filtrar por: `[AuthFacade]`, `[FirebaseAuthRepository]`
- Procurar por emojis: 🔐, 📝, ✅, ❌

## Relatório de Bugs

Se encontrar problemas, reporte com:
1. **Cenário**: Qual teste estava executando
2. **Passos**: O que fez exatamente
3. **Esperado**: O que deveria acontecer
4. **Obtido**: O que aconteceu
5. **Logs**: Console logs relevantes
6. **Screenshots**: Se possível

## Conclusão

Após executar todos os testes, você deve ter verificado que:
- ✅ Sistema detecta e informa sobre contas criadas via provedores sociais
- ✅ Sistema permite completar cadastro quando apropriado
- ✅ Sistema impede duplicação de perfis
- ✅ Mensagens são claras e úteis
- ✅ Fluxo normal não foi afetado
