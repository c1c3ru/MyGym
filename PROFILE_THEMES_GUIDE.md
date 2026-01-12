# 🎨 Guia de Implementação - Paletas de Cores Profissionais por Perfil

## 📊 Visão Geral das Paletas

### 🏃 **ALUNO - Energia & Motivação**
**Cores:** Laranja Vibrante + Azul Confiança

**Psicologia:**
- **Laranja (#FF9800):** Energia, entusiasmo, ação, motivação
- **Azul (#2196F3):** Confiança, estabilidade, foco, disciplina

**Público-alvo:** Alunos que buscam motivação e energia para treinar

**Quando usar:**
- Telas de treino e exercícios
- Dashboard do aluno
- Metas e conquistas
- Check-in e presença

---

### 🥋 **INSTRUTOR - Autoridade & Expertise**
**Cores:** Roxo Profissional + Verde Crescimento

**Psicologia:**
- **Roxo (#9C27B0):** Sabedoria, autoridade, expertise, liderança
- **Verde (#4CAF50):** Crescimento, desenvolvimento, saúde, progresso

**Público-alvo:** Instrutores que precisam transmitir conhecimento e autoridade

**Quando usar:**
- Gestão de turmas
- Avaliações físicas
- Planejamento de aulas
- Relatórios de alunos

---

### 👔 **ADMIN - Poder & Controle**
**Cores:** Azul Escuro Corporativo + Vermelho Ação

**Psicologia:**
- **Azul Escuro (#1976D2):** Profissionalismo, confiança, controle, estabilidade
- **Vermelho (#F44336):** Urgência, ação, decisão, poder

**Público-alvo:** Administradores que gerenciam e tomam decisões críticas

**Quando usar:**
- Dashboard administrativo
- Relatórios financeiros
- Gestão de usuários
- Configurações do sistema

---

## 🚀 Como Implementar

### 1. **Importar o Tema**

```typescript
import { 
  getThemeByUserType,
  STUDENT_THEME,
  INSTRUCTOR_THEME,
  ADMIN_THEME 
} from '@presentation/theme/profileThemes';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
```

### 2. **Usar o Tema Dinâmico**

```typescript
const MyScreen = () => {
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Obter tema baseado no tipo de usuário
  const currentTheme = getThemeByUserType(
    userProfile?.userType || 'student',
    isDarkMode
  );
  
  return (
    <View style={{
      backgroundColor: currentTheme.background.default
    }}>
      <Button 
        style={{
          backgroundColor: currentTheme.primary[500]
        }}
      >
        Ação Principal
      </Button>
      
      <Button 
        style={{
          backgroundColor: currentTheme.secondary[500]
        }}
      >
        Ação Secundária
      </Button>
    </View>
  );
};
```

### 3. **Usar Gradientes**

```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={currentTheme.gradients.hero}
  style={styles.header}
>
  <Text>Hero Section</Text>
</LinearGradient>
```

### 4. **Aplicar em Componentes**

```typescript
// Card com tema do perfil
<Card style={{
  backgroundColor: currentTheme.background.paper,
  borderColor: currentTheme.primary[500],
  borderWidth: 2,
}}>
  <Card.Content>
    <Text style={{ color: currentTheme.text.primary }}>
      Conteúdo do Card
    </Text>
  </Card.Content>
</Card>

// Botão primário
<Button
  mode="contained"
  buttonColor={currentTheme.primary[500]}
  textColor={currentTheme.text.primary}
>
  Ação Principal
</Button>

// Chip de status
<Chip
  style={{ backgroundColor: currentTheme.accent }}
  textStyle={{ color: '#FFFFFF' }}
>
  Ativo
</Chip>
```

---

## 🎨 Paleta Completa por Perfil

### 🏃 ALUNO (Student)

#### Light Mode
```typescript
primary: {
  main: '#FF9800',      // Laranja energia
  light: '#FFB74D',     // Laranja claro
  dark: '#F57C00',      // Laranja escuro
}

secondary: {
  main: '#2196F3',      // Azul confiança
  light: '#64B5F6',     // Azul claro
  dark: '#1976D2',      // Azul escuro
}

background: {
  default: '#FAFAFA',   // Branco quente
  paper: '#FFFFFF',     // Branco puro
}

text: {
  primary: '#212121',   // Preto suave
  secondary: '#757575', // Cinza médio
}
```

#### Dark Mode
```typescript
background: {
  default: '#121212',   // Preto premium
  paper: '#1E1E1E',     // Cinza escuro
}

text: {
  primary: '#FFFFFF',   // Branco puro
  secondary: '#B0B0B0', // Cinza claro
}
```

---

### 🥋 INSTRUTOR (Instructor)

#### Light Mode
```typescript
primary: {
  main: '#9C27B0',      // Roxo autoridade
  light: '#BA68C8',     // Roxo claro
  dark: '#7B1FA2',      // Roxo escuro
}

secondary: {
  main: '#4CAF50',      // Verde crescimento
  light: '#81C784',     // Verde claro
  dark: '#388E3C',      // Verde escuro
}

background: {
  default: '#FAFAFA',   // Branco neutro
  paper: '#FFFFFF',     // Branco puro
}

text: {
  primary: '#212121',   // Preto suave
  secondary: '#757575', // Cinza médio
}
```

#### Dark Mode
```typescript
background: {
  default: '#121212',   // Preto premium
  paper: '#1E1E1E',     // Cinza escuro
}

text: {
  primary: '#FFFFFF',   // Branco puro
  secondary: '#B0B0B0', // Cinza claro
}
```

---

### 👔 ADMIN (Admin)

#### Light Mode
```typescript
primary: {
  main: '#1976D2',      // Azul corporativo
  light: '#64B5F6',     // Azul claro
  dark: '#0D47A1',      // Azul escuro
}

secondary: {
  main: '#F44336',      // Vermelho ação
  light: '#EF5350',     // Vermelho claro
  dark: '#D32F2F',      // Vermelho escuro
}

background: {
  default: '#FAFAFA',   // Branco corporativo
  paper: '#FFFFFF',     // Branco puro
}

text: {
  primary: '#212121',   // Preto corporativo
  secondary: '#757575', // Cinza médio
}
```

#### Dark Mode
```typescript
background: {
  default: '#121212',   // Preto premium
  paper: '#1E1E1E',     // Cinza escuro
}

text: {
  primary: '#FFFFFF',   // Branco puro
  secondary: '#B0B0B0', // Cinza claro
}
```

---

## 🔄 Migração das Cores Atuais

### Antes (Cores Genéricas):
```typescript
import { COLORS } from '@presentation/theme/designTokens';

<Button style={{ backgroundColor: COLORS.primary[500] }}>
  Botão
</Button>
```

### Depois (Cores por Perfil):
```typescript
import { getThemeByUserType } from '@presentation/theme/profileThemes';
import { useAuth } from '@contexts/AuthProvider';

const { userProfile } = useAuth();
const theme = getThemeByUserType(userProfile?.userType);

<Button style={{ backgroundColor: theme.primary[500] }}>
  Botão
</Button>
```

---

## 📊 Comparação Visual

| Perfil | Cor Principal | Emoção | Uso |
|--------|---------------|--------|-----|
| **Aluno** | 🟠 Laranja | Energia, Motivação | Treinos, Metas |
| **Instrutor** | 🟣 Roxo | Autoridade, Expertise | Gestão, Avaliações |
| **Admin** | 🔵 Azul Escuro | Poder, Controle | Dashboard, Relatórios |

---

## ✅ Checklist de Implementação

- [ ] Importar `profileThemes.ts` nas telas principais
- [ ] Substituir `COLORS.primary` por `theme.primary`
- [ ] Aplicar tema baseado em `userProfile.userType`
- [ ] Testar em modo claro e escuro
- [ ] Verificar contraste (WCAG AA)
- [ ] Atualizar gradientes e overlays
- [ ] Documentar uso em componentes compartilhados

---

## 🎯 Exemplos de Uso por Tela

### Dashboard do Aluno
```typescript
const StudentDashboard = () => {
  const theme = STUDENT_THEME;
  
  return (
    <LinearGradient colors={theme.gradients.hero}>
      <Card style={{ backgroundColor: theme.background.paper }}>
        <Text style={{ color: theme.primary[500] }}>
          Bem-vindo ao treino!
        </Text>
        <Button buttonColor={theme.accent}>
          Iniciar Treino
        </Button>
      </Card>
    </LinearGradient>
  );
};
```

### Dashboard do Instrutor
```typescript
const InstructorDashboard = () => {
  const theme = INSTRUCTOR_THEME;
  
  return (
    <LinearGradient colors={theme.gradients.hero}>
      <Card style={{ backgroundColor: theme.background.paper }}>
        <Text style={{ color: theme.primary[500] }}>
          Gerencie suas turmas
        </Text>
        <Button buttonColor={theme.accent}>
          Ver Turmas
        </Button>
      </Card>
    </LinearGradient>
  );
};
```

### Dashboard do Admin
```typescript
const AdminDashboard = () => {
  const theme = ADMIN_THEME;
  
  return (
    <LinearGradient colors={theme.gradients.hero}>
      <Card style={{ backgroundColor: theme.background.paper }}>
        <Text style={{ color: theme.primary[500] }}>
          Controle total do sistema
        </Text>
        <Button buttonColor={theme.secondary[500]}>
          Ação Crítica
        </Button>
      </Card>
    </LinearGradient>
  );
};
```

---

## 🚀 Próximos Passos

1. **Integrar com ThemeContext** - Criar provider que detecta userType
2. **Atualizar componentes compartilhados** - Aplicar tema dinâmico
3. **Criar variantes de componentes** - Button, Card, Chip por perfil
4. **Testar acessibilidade** - Verificar contraste em todos os temas
5. **Documentar padrões** - Criar guia de estilo por perfil

---

**Criado em:** 2026-01-12  
**Versão:** 1.0  
**Status:** ✅ Pronto para implementação
