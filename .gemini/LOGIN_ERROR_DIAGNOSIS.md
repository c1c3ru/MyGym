# Diagnóstico do Erro de Login

## Problema Reportado
Ao tentar fazer login com o email `cti.maracanau@ifce.edu.br`, o sistema exibe a mensagem genérica "somethingWentWrong" (algo deu errado).

## Causa Provável
O erro específico que está ocorrendo não está sendo mapeado corretamente pela função `mapAuthErrorToCode`, resultando em um erro genérico "unknown" que exibe a mensagem "somethingWentWrong".

## Correção Aplicada

### 1. Logging Detalhado
Adicionei logs detalhados na função `mapAuthErrorToCode` para capturar:
- Código do erro
- Nome do erro
- Mensagem do erro
- Objeto de erro completo

Isso permitirá identificar exatamente qual erro está sendo retornado pelo Firebase Auth.

### 2. Mapeamento Adicional
Adicionei o mapeamento para `InvalidCredentialsError`, que é um erro comum quando as credenciais estão incorretas.

## Como Testar

1. **Limpe o cache do navegador** (Ctrl+Shift+R ou Cmd+Shift+R)
2. **Tente fazer login novamente** com o email `cti.maracanau@ifce.edu.br`
3. **Abra o Console do Navegador** (F12 → Console)
4. **Procure pelos logs**:
   - `🔍 [LoginScreen] Mapeando erro:` - Mostrará os detalhes do erro
   - `⚠️ [LoginScreen] Erro não mapeado:` - Aparecerá se o erro ainda não estiver mapeado

## Possíveis Erros e Soluções

### Erro: auth/user-not-found
**Significado**: Não existe uma conta com este email.
**Solução**: Criar uma conta primeiro ou verificar se o email está correto.

### Erro: auth/wrong-password ou auth/invalid-credential
**Significado**: A senha está incorreta.
**Solução**: Verificar a senha ou usar "Esqueci minha senha".

### Erro: auth/invalid-email
**Significado**: O formato do email está incorreto.
**Solução**: Verificar se o email está digitado corretamente.

### Erro: auth/too-many-requests
**Significado**: Muitas tentativas de login.
**Solução**: Aguardar alguns minutos antes de tentar novamente.

## Próximos Passos

1. **Verificar os logs** no console após tentar fazer login
2. **Compartilhar os logs** comigo para que eu possa adicionar o mapeamento correto
3. **Verificar se a conta existe** no Firebase Authentication
4. **Verificar se há um perfil** no Firestore para este usuário

## Informações Adicionais

### Fluxo de Login Atual
```
1. Usuário digita email e senha
2. Sistema valida o formulário
3. Sistema chama signIn(email, password)
4. AuthFacade tenta fazer login via Firebase
5. Se erro ocorrer:
   - Erro é capturado
   - mapAuthErrorToCode tenta mapear o erro
   - Se não reconhecido → retorna 'unknown'
   - EnhancedErrorMessage exibe "somethingWentWrong"
```

### Como Adicionar Novo Mapeamento
Se você identificar um novo tipo de erro nos logs, posso adicionar o mapeamento específico editando a função `mapAuthErrorToCode` em `/home/deppi/MyGym/src/presentation/screens/LoginScreen.tsx`.

## Comandos Úteis

### Verificar logs em tempo real
```bash
# No terminal onde o Expo está rodando
# Os logs aparecerão automaticamente
```

### Limpar cache e reiniciar
```bash
# Parar o servidor (Ctrl+C)
# Limpar cache
npx expo start --clear --web --port 5000
```

## Contato
Se o problema persistir após estas correções, por favor:
1. Copie os logs do console
2. Tire um screenshot do erro
3. Compartilhe comigo para análise adicional
