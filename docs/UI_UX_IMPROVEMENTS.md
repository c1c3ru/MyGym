# 🎨 Melhorias de UI/UX - MyGym

Documentação completa das melhorias implementadas para UI/UX seguindo as melhores práticas.

## 📋 Índice

1. [Design Tokens](#design-tokens)
2. [Mensagens de Erro Melhoradas](#mensagens-de-erro-melhoradas)
3. [Componentes Acessíveis](#componentes-acessíveis)
4. [Breadcrumb](#breadcrumb)
5. [Sistema de Undo](#sistema-de-undo)
6. [Onboarding](#onboarding)

---

## 🎨 Design Tokens

### Localização
`/src/presentation/theme/designTokens.js`

### Descrição
Sistema centralizado de tokens de design que garante consistência visual em todo o aplicativo.

### Tokens Disponíveis

#### Spacing (Espaçamentos)
```javascript
import { SPACING } from '@presentation/theme/designTokens';

<View style={{ padding: SPACING.md, margin: SPACING.lg }} />
```

Valores: `none`, `xxs`, `xs`, `sm`, `md`, `base`, `lg`, `xl`, `xxl`, `xxxl`, `huge`

#### Font Size (Tamanhos de Fonte)
```javascript
import { FONT_SIZE } from '@presentation/theme/designTokens';

<Text style={{ fontSize: FONT_SIZE.lg }} />
```

Valores: `xxs`, `xs`, `sm`, `base`, `md`, `lg`, `xl`, `xxl`, `xxxl`, `huge`, `display`

#### Colors (Cores)
```javascript
import { COLORS } from '@presentation/theme/designTokens';

<View style={{ backgroundColor: COLORS.primary[500] }} />
```

Paletas: `primary`, `secondary`, `success`, `error`, `warning`, `info`, `gray`

#### Border Radius
```javascript
import { BORDER_RADIUS } from '@presentation/theme/designTokens';

<Card style={{ borderRadius: BORDER_RADIUS.lg }} />
```

#### Elevation (Sombras)
```javascript
import { getElevation } from '@presentation/theme/designTokens';

<Card style={getElevation('md')} />
```

### Exemplo Completo
```javascript
import { SPACING, FONT_SIZE, COLORS, BORDER_RADIUS, getElevation } from '@presentation/theme/designTokens';

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    ...getElevation('base'),
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
});
```

---

## ❌ Mensagens de Erro Melhoradas

### Localização
`/src/presentation/components/EnhancedErrorMessage.js`

### Descrição
Componente que fornece mensagens de erro específicas, acionáveis e amigáveis ao usuário.

### Uso Básico
```javascript
import EnhancedErrorMessage from '@components/EnhancedErrorMessage';

<EnhancedErrorMessage
  errorCode="auth/invalid-email"
  onAction={(action) => {
    if (action === 'focus-email') {
      emailInputRef.current.focus();
    }
  }}
  onDismiss={() => setError(null)}
/>
```

### Modo Compacto
```javascript
<EnhancedErrorMessage
  errorCode="network/offline"
  compact={true}
  onDismiss={() => setError(null)}
/>
```

### Hook useEnhancedError
```javascript
import { useEnhancedError } from '@components/EnhancedErrorMessage';

function MyComponent() {
  const { error, showError, clearError } = useEnhancedError();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      showError('auth/wrong-password');
    }
  };

  return (
    <>
      {error && (
        <EnhancedErrorMessage
          errorCode={error.errorCode}
          customMessage={error.customMessage}
          onDismiss={clearError}
        />
      )}
    </>
  );
}
```

### Códigos de Erro Disponíveis

#### Rede
- `network/offline` - Sem conexão
- `network/timeout` - Timeout
- `network/server-error` - Erro no servidor

#### Autenticação
- `auth/invalid-email` - Email inválido
- `auth/user-not-found` - Usuário não encontrado
- `auth/wrong-password` - Senha incorreta
- `auth/too-many-requests` - Muitas tentativas
- `auth/email-already-in-use` - Email já cadastrado
- `auth/weak-password` - Senha fraca

#### Validação
- `validation/required-field` - Campo obrigatório
- `validation/invalid-format` - Formato inválido

---

## ♿ Componentes Acessíveis

### Localização
`/src/presentation/components/AccessibleComponents.js`

### Descrição
Wrappers de componentes comuns com todas as propriedades de acessibilidade configuradas.

### AccessibleButton
```javascript
import { AccessibleButton } from '@components/AccessibleComponents';

<AccessibleButton
  onPress={handleSave}
  accessibilityLabel="Salvar alterações"
  accessibilityHint="Salva as informações do formulário"
  mode="contained"
>
  Salvar
</AccessibleButton>
```

### AccessibleIconButton
```javascript
import { AccessibleIconButton } from '@components/AccessibleComponents';

<AccessibleIconButton
  icon="delete"
  onPress={handleDelete}
  accessibilityLabel="Excluir item"
  accessibilityHint="Remove este item permanentemente"
/>
```

### AccessibleCard
```javascript
import { AccessibleCard } from '@components/AccessibleComponents';

<AccessibleCard
  onPress={() => navigation.navigate('Details')}
  accessibilityLabel="Turma de Karatê"
  accessibilityHint="Toque para ver detalhes da turma"
  elevation="md"
>
  <Card.Content>
    <Text>Karatê - Segunda 20h</Text>
  </Card.Content>
</AccessibleCard>
```

### Todos os Componentes
- `AccessibleButton`
- `AccessibleIconButton`
- `AccessibleCard`
- `AccessibleFAB`
- `AccessibleChip`
- `AccessibleText`
- `AccessibleTouchable`
- `AccessibleListItem`
- `AccessibleHeader`
- `AccessibleBadge`

---

## 🗺️ Breadcrumb

### Localização
`/src/presentation/components/Breadcrumb.js`

### Descrição
Componente de navegação breadcrumb que fornece orientação visual da localização do usuário.

### Uso Básico
```javascript
import Breadcrumb from '@components/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Turmas', onPress: () => navigation.navigate('Classes') },
    { label: 'Karatê', onPress: () => navigation.navigate('Karate') },
    { label: 'Editar Turma' }, // Último item não tem onPress
  ]}
  showHome={true}
  onHomePress={() => navigation.navigate('Dashboard')}
/>
```

### Breadcrumb Compacto
```javascript
import { CompactBreadcrumb } from '@components/Breadcrumb';

<CompactBreadcrumb
  currentPage="Editar Turma"
  parentPage="Turmas"
  onParentPress={() => navigation.goBack()}
/>
```

### Hook useBreadcrumb
```javascript
import { useBreadcrumb } from '@components/Breadcrumb';

function MyScreen() {
  const { breadcrumbItems, addBreadcrumb, setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Alunos', onPress: () => navigation.navigate('Students') },
      { label: 'João Silva' },
    ]);
  }, []);

  return <Breadcrumb items={breadcrumbItems} />;
}
```

---

## ↩️ Sistema de Undo

### Localização
`/src/presentation/components/UndoManager.js`

### Descrição
Sistema que permite desfazer ações destrutivas, melhorando a confiança do usuário.

### Setup
```javascript
import { UndoProvider } from '@components/UndoManager';

function App() {
  return (
    <UndoProvider>
      <YourApp />
    </UndoProvider>
  );
}
```

### Uso Básico
```javascript
import { useUndo } from '@components/UndoManager';

function DeleteButton({ item }) {
  const { registerUndo } = useUndo();

  const handleDelete = async () => {
    // Salva o item antes de excluir
    const deletedItem = { ...item };

    // Exclui do banco
    await deleteFromDatabase(item.id);

    // Registra para desfazer
    registerUndo({
      message: 'Turma excluída',
      timeout: 5000, // 5 segundos para desfazer
      onUndo: async () => {
        // Restaura o item
        await restoreToDatabase(deletedItem);
      },
      onCommit: () => {
        // Confirmado, pode fazer limpeza final
        console.log('Exclusão confirmada');
      },
    });
  };

  return <Button onPress={handleDelete}>Excluir</Button>;
}
```

### Helper: useDeleteWithUndo
```javascript
import { useDeleteWithUndo } from '@components/UndoManager';

function StudentList() {
  const { deleteWithUndo } = useDeleteWithUndo();

  const handleDelete = async (student) => {
    await deleteWithUndo(
      student,
      (item) => deleteStudent(item.id), // Função de exclusão
      (item) => restoreStudent(item),   // Função de restauração
      'Aluno'                           // Nome do item
    );
  };

  return (
    <Button onPress={() => handleDelete(student)}>
      Excluir Aluno
    </Button>
  );
}
```

### Helper: useUpdateWithUndo
```javascript
import { useUpdateWithUndo } from '@components/UndoManager';

function EditForm() {
  const { updateWithUndo } = useUpdateWithUndo();

  const handleSave = async (newData) => {
    await updateWithUndo(
      newData,
      oldData,
      (data) => updateInDatabase(data),
      'Turma'
    );
  };
}
```

---

## 🎓 Onboarding

### Localização
`/src/presentation/components/OnboardingTour.js`

### Descrição
Sistema de onboarding interativo que guia novos usuários através das funcionalidades.

### Setup
```javascript
import { OnboardingProvider } from '@components/OnboardingTour';

function App() {
  return (
    <OnboardingProvider>
      <YourApp />
    </OnboardingProvider>
  );
}
```

### Uso Básico
```javascript
import { useOnboarding, ONBOARDING_TOURS } from '@components/OnboardingTour';

function AdminDashboard() {
  const { startTour } = useOnboarding();

  useEffect(() => {
    // Inicia o tour na primeira vez
    startTour(ONBOARDING_TOURS.ADMIN_DASHBOARD);
  }, []);

  return <View>...</View>;
}
```

### Criar Tour Customizado
```javascript
const customTour = {
  id: 'my_custom_tour',
  name: 'Tour Customizado',
  steps: [
    {
      title: 'Bem-vindo!',
      message: 'Esta é a primeira etapa do tour.',
      icon: 'hand-wave',
      position: 'center',
    },
    {
      title: 'Funcionalidade X',
      message: 'Aqui você pode fazer X.',
      icon: 'star',
      position: 'top',
      target: {
        x: 100,
        y: 200,
        width: 200,
        height: 50,
      },
    },
  ],
  onComplete: () => {
    console.log('Tour completado!');
  },
};

startTour(customTour);
```

### Tours Pré-definidos
- `ONBOARDING_TOURS.ADMIN_DASHBOARD` - Dashboard do Admin
- `ONBOARDING_TOURS.INSTRUCTOR_CHECKIN` - Sistema de Check-in
- `ONBOARDING_TOURS.STUDENT_DASHBOARD` - Dashboard do Aluno

### Resetar Tours (Desenvolvimento)
```javascript
const { resetAllTours } = useOnboarding();

// Reseta todos os tours completados
await resetAllTours();
```

---

## 📊 Checklist de Implementação

### Alta Prioridade
- [x] ✅ Design Tokens centralizados
- [x] ✅ Mensagens de erro melhoradas
- [x] ✅ Componentes acessíveis

### Média Prioridade
- [x] ✅ Breadcrumb
- [x] ✅ Sistema de Undo
- [x] ✅ Onboarding

### Próximos Passos
- [ ] Integrar componentes nas telas existentes
- [ ] Criar testes unitários
- [ ] Documentar casos de uso específicos
- [ ] Expandir catálogo de erros
- [ ] Criar mais tours de onboarding

---

## 🎯 Benefícios Alcançados

1. **Consistência Visual**: Design tokens garantem uniformidade
2. **Melhor Comunicação**: Erros claros e acionáveis
3. **Acessibilidade**: Suporte completo a leitores de tela
4. **Orientação**: Breadcrumbs e onboarding guiam o usuário
5. **Confiança**: Sistema de undo reduz medo de erros
6. **Manutenibilidade**: Código centralizado e reutilizável

---

## 📚 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Design Tokens](https://www.designtokens.org/)

---

**Última atualização**: 30/09/2025
