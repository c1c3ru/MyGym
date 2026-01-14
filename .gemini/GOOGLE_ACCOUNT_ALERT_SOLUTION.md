# Solução: Alerta para Contas Criadas com Google

## Data: 2026-01-14 14:15

## Problema

Quando um usuário cria uma conta usando "Login com Google" e depois tenta fazer login com email/senha usando a senha do Gmail, o sistema retorna erro de "senha incorreta" sem explicar o motivo.

**Causa**: Contas criadas via Google no Firebase **não têm senha**. A senha do Gmail é diferente da senha do Firebase.

## Solução Implementada

Quando o usuário tentar fazer login com senha e o erro for de credenciais inválidas, o sistema agora:

1. ✅ **Verifica** se a conta existe com o provedor Google
2. ✅ **Mostra alerta personalizado** explicando a situação
3. ✅ **Oferece botão direto** para fazer login com Google

### Fluxo Implementado

```
1. Usuário digita email e senha
2. Firebase retorna erro: "Credenciais inválidas"
3. Sistema verifica: "Este email tem conta com Google?"
4. Se SIM:
   ├─ Mostra alerta: "🔐 Conta criada com Google"
   ├─ Explica: "Use o botão 'Entrar com Google'"
   └─ Oferece botão: [Login com Google]
5. Se NÃO:
   └─ Mostra erro padrão: "Senha incorreta"
```

## Código Implementado

### Arquivo: `LoginScreen.tsx`

**Localização**: Dentro do `handleLogin`, no bloco `catch`

**Funcionalidade**:
```typescript
// Verificar se é erro de credenciais inválidas
const errorName = error?.code || error?.name || '';
const isCredentialError = errorName.includes('wrong-password') || 
                          errorName.includes('invalid-credential') || 
                          errorName.includes('UNAUTHORIZED') ||
                          errorName.includes('UnauthorizedError');

if (isCredentialError) {
  // Usar API do Firebase para verificar provedores
  const { getAuth, fetchSignInMethodsForEmail } = await import('firebase/auth');
  const auth = getAuth();
  const signInMethods = await fetchSignInMethodsForEmail(auth, email.trim());
  
  // Se encontrou Google
  if (signInMethods.includes('google.com')) {
    // Mostrar alerta personalizado
    Alert.alert(
      '🔐 Conta criada com Google',
      `O email ${email.trim()} já possui uma conta criada através do Google.\n\nPara acessar, use o botão "Entrar com Google" abaixo.`,
      [
        { text: 'Entender', style: 'cancel' },
        { 
          text: 'Login com Google',
          onPress: () => handleGoogleLogin(),
          style: 'default'
        }
      ]
    );
    return; // Não mostrar erro padrão
  }
}
```

## Experiência do Usuário

### Antes ❌
```
Usuário: *digita email e senha do Gmail*
Sistema: "Senha incorreta"
Usuário: "Mas essa é minha senha! 😕"
```

### Depois ✅
```
Usuário: *digita email e senha do Gmail*
Sistema: 
┌─────────────────────────────────────┐
│  🔐 Conta criada com Google         │
│                                     │
│  O email cti.maracanau@ifce.edu.br │
│  já possui uma conta criada através│
│  do Google.                         │
│                                     │
│  Para acessar, use o botão "Entrar │
│  com Google" abaixo.                │
│                                     │
│  [Entender]  [Login com Google] ←  │
└─────────────────────────────────────┘
Usuário: "Ah, entendi! Vou usar o Google" 😊
```

## Benefícios

✅ **Clareza**: Usuário entende exatamente o que fazer
✅ **Conveniência**: Botão direto para login com Google
✅ **Reduz Frustração**: Não fica tentando senhas diferentes
✅ **Educativo**: Aprende a diferença entre senha do Gmail e senha do app
✅ **Profissional**: Experiência similar a apps grandes (Google, Facebook, etc.)

## Casos de Uso

### Caso 1: Conta criada com Google
```
Email: cti.maracanau@ifce.edu.br
Provedor: google.com
Resultado: Mostra alerta com botão "Login com Google"
```

### Caso 2: Conta criada com email/senha
```
Email: outro@email.com
Provedor: password
Resultado: Mostra erro padrão "Senha incorreta"
```

### Caso 3: Email não cadastrado
```
Email: novo@email.com
Provedor: nenhum
Resultado: Mostra erro "Usuário não encontrado"
```

## Testes Recomendados

### Teste 1: Conta Google Existente
1. Fazer login com Google (email: cti.maracanau@ifce.edu.br)
2. Fazer logout
3. Tentar login com email/senha
4. **Verificar**: Deve mostrar alerta personalizado
5. **Clicar**: "Login com Google"
6. **Verificar**: Deve fazer login com sucesso

### Teste 2: Conta com Senha
1. Criar conta com email/senha
2. Fazer logout
3. Tentar login com senha errada
4. **Verificar**: Deve mostrar erro padrão "Senha incorreta"

### Teste 3: Email Não Cadastrado
1. Tentar login com email que não existe
2. **Verificar**: Deve mostrar "Usuário não encontrado"

## Melhorias Futuras (Opcional)

### Opção 1: Destacar Botão Google
Quando o alerta aparecer, poderia:
- Fazer o botão "Entrar com Google" piscar
- Adicionar seta apontando para o botão
- Mudar cor do botão temporariamente

### Opção 2: Lembrar Preferência
- Salvar que o usuário usa Google
- Na próxima vez, destacar automaticamente o botão Google
- Mostrar tooltip: "Você costuma entrar com Google"

### Opção 3: Vincular Provedores
- Permitir adicionar senha a contas Google
- Usuário poderia usar ambos os métodos
- Mais complexo de implementar

## Notas Técnicas

- Usa `fetchSignInMethodsForEmail` do Firebase Auth
- Importação dinâmica para otimizar bundle size
- Tratamento de erro robusto (fallback para erro padrão)
- Não afeta performance (só executa em caso de erro)

## Conclusão

A solução implementada resolve o problema de forma elegante e profissional, melhorando significativamente a experiência do usuário ao tentar fazer login com o método errado.

**Status**: ✅ Implementado e pronto para teste
