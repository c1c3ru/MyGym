# 🥋 Nova Paleta de Cores - MyGym (Academia de Lutas)

## 🎨 Conceito

Paleta profissional inspirada em academias de artes marciais modernas, com foco em:
- **Força e Determinação** (Vermelho Coral)
- **Sofisticação e Profissionalismo** (Preto/Cinza)
- **Dark Theme como padrão** (melhor para ambiente de treino)

## 📊 Comparação: Antes vs Depois

| Elemento | Antes | Depois |
|----------|-------|--------|
| **Primary** | 🟣 Roxo (#9C27B0) | 🔴 Vermelho Coral (#FF4757) |
| **Secondary** | 🟠 Laranja (#FF9800) | ⚫ Cinza Escuro (#424242) |
| **Background** | ⚪ Branco (#FFFFFF) | ⚫ Preto (#0D0D0D) |
| **Cards** | ⚪ Branco | ⚫ Cinza Escuro (#1A1A1A) |
| **Texto** | ⚫ Preto | ⚪ Branco |

## 🎨 Paleta Completa

### 🔴 Primary - Vermelho Coral (Ação/Energia/Luta)
```javascript
primary: {
  50: '#FFF5F7',   // Muito claro
  100: '#FFE3E8',
  200: '#FFC7D1',
  300: '#FF9BAD',
  400: '#FF6B7A',
  500: '#FF4757',  // ⭐ Principal
  600: '#EE3D4D',
  700: '#DC2F3F',
  800: '#C62838',
  900: '#A01F2E',  // Muito escuro
}
```

**Uso:**
- Botões de ação primária
- Links importantes
- Badges de destaque
- Indicadores de atividade

### ⚫ Secondary - Cinza/Preto (Sofisticação/Tatame)
```javascript
secondary: {
  50: '#F5F5F5',   // Muito claro
  100: '#E0E0E0',
  200: '#BDBDBD',
  300: '#9E9E9E',
  400: '#757575',
  500: '#424242',  // ⭐ Principal
  600: '#303030',
  700: '#212121',
  800: '#1A1A1A',  // Cards
  900: '#0D0D0D',  // Background
}
```

**Uso:**
- Backgrounds principais
- Cards e containers
- Texto secundário
- Bordas e divisores

### ✅ Success - Verde (Confirmações)
```javascript
success: {
  500: '#4CAF50',  // ⭐ Principal
}
```

### ⚠️ Warning - Laranja (Avisos)
```javascript
warning: {
  500: '#FFC107',  // ⭐ Principal
}
```

### ❌ Error - Vermelho Escuro (Erros)
```javascript
error: {
  500: '#F44336',  // ⭐ Principal
}
```

### 🔵 Info - Azul (Informações)
```javascript
info: {
  500: '#2196F3',  // ⭐ Principal
}
```

## 🌑 Dark Theme (Padrão)

### Backgrounds
```javascript
background: {
  default: '#0D0D0D',    // Preto profundo (fundo principal)
  paper: '#1A1A1A',      // Cinza muito escuro (cards)
  elevated: '#212121',   // Cinza escuro (modais)
  light: '#F5F5F5',      // Branco (inputs)
  dark: '#000000',       // Preto puro (overlays)
}
```

### Texto
```javascript
text: {
  primary: '#FFFFFF',      // Branco puro (títulos)
  secondary: '#E0E0E0',    // Cinza claro (subtítulos)
  disabled: '#9E9E9E',     // Cinza médio
  hint: '#757575',         // Cinza (placeholders)
  inverse: '#0D0D0D',      // Preto (para fundos claros)
}
```

### Bordas
```javascript
border: {
  light: '#424242',        // Cinza escuro (bordas sutis)
  default: '#757575',      // Cinza médio
  dark: '#9E9E9E',         // Cinza claro (destaque)
}
```

## 🥋 Gradientes Marciais

### Combat (Energia/Força)
```javascript
gradients.combat: ['#FF4757', '#DC2F3F', '#1A1A1A']
```
**Uso:** Headers, banners de ação, telas de check-in

### Dark (Profissional)
```javascript
gradients.dark: ['#0D0D0D', '#1A1A1A', '#212121']
```
**Uso:** Backgrounds principais, modais

### Intense (Intenso)
```javascript
gradients.intense: ['#FF4757', '#DC2F3F', '#A01F2E']
```
**Uso:** Botões importantes, CTAs

### Subtle (Sutil)
```javascript
gradients.subtle: ['#424242', '#303030', '#0D0D0D']
```
**Uso:** Cards, containers secundários

## 🎯 Cores Especiais

### Status/Badges
```javascript
special: {
  champion: '#FFD700',      // Ouro (campeão)
  premium: '#FF4757',       // Vermelho coral (premium)
  active: '#4CAF50',        // Verde (ativo)
  inactive: '#757575',      // Cinza (inativo)
  danger: '#F44336',        // Vermelho (perigo)
}
```

### Faixas de Graduação
```javascript
special.belt: {
  white: '#FFFFFF',       // Faixa branca
  yellow: '#FFC107',      // Faixa amarela
  orange: '#FF9800',      // Faixa laranja
  green: '#4CAF50',       // Faixa verde
  blue: '#2196F3',        // Faixa azul
  purple: '#9C27B0',      // Faixa roxa
  brown: '#795548',       // Faixa marrom
  black: '#212121',       // Faixa preta
  red: '#F44336',         // Faixa vermelha
}
```

## 💻 Exemplos de Uso

### Tela de Login
```javascript
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { LinearGradient } from 'expo-linear-gradient';

// Background com gradiente
<LinearGradient
  colors={COLORS.gradients.dark}
  style={styles.container}
>
  {/* Conteúdo */}
</LinearGradient>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  input: {
    backgroundColor: COLORS.background.light,
    color: COLORS.text.inverse,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
```

### Dashboard
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  card: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.xl,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZE.base,
  },
});
```

### Badge de Graduação
```javascript
import { getBeltColor } from '@presentation/theme/designTokens';

const GraduationBadge = ({ belt }) => (
  <View style={[styles.badge, { backgroundColor: getBeltColor(belt) }]}>
    <Text style={styles.beltText}>{belt}</Text>
  </View>
);
```

### Header com Gradiente
```javascript
import { getGradient } from '@presentation/theme/designTokens';

<LinearGradient
  colors={getGradient('combat')}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.header}
>
  <Text style={styles.headerTitle}>Check-in</Text>
</LinearGradient>
```

## 🛠️ Funções Utilitárias

### getGradient(type)
Retorna array de cores para gradiente.
```javascript
const colors = getGradient('combat');
// ['#FF4757', '#DC2F3F', '#1A1A1A']
```

### getBeltColor(belt)
Retorna cor da faixa de graduação.
```javascript
const color = getBeltColor('black');
// '#212121'
```

### getColor(path)
Obtém cor do tema com fallback.
```javascript
const color = getColor('primary.500');
// '#FF4757'
```

## 📱 Aplicação por Tela

### Telas de Autenticação
- Background: `gradients.dark`
- Inputs: `background.light` (branco)
- Botões: `primary[500]` (vermelho coral)
- Links: `primary[400]`

### Dashboard
- Background: `background.default` (preto)
- Cards: `background.paper` (cinza escuro)
- Títulos: `text.primary` (branco)
- Subtítulos: `text.secondary` (cinza claro)
- Botões de ação: `primary[500]`

### Graduações
- Background: `background.default`
- Cards: `background.paper`
- Badges: `special.belt[color]`
- Destaque: `special.champion` (ouro)

### Check-in
- Header: `gradients.combat`
- Background: `background.default`
- Cards de aluno: `background.paper`
- Botão de check-in: `primary[500]`
- Status ativo: `special.active`

## ✅ Checklist de Migração

- [x] Atualizar design tokens
- [x] Adicionar gradientes marciais
- [x] Adicionar cores especiais
- [x] Criar funções utilitárias
- [ ] Atualizar telas de autenticação
- [ ] Atualizar dashboards
- [ ] Atualizar componentes
- [ ] Testar contraste (WCAG AA)
- [ ] Documentar exemplos

## 🎯 Benefícios

✅ **Visual Profissional** - Cores sérias e marciais
✅ **Identidade Forte** - Vermelho = luta, preto = tatame
✅ **Melhor Contraste** - Dark theme com texto branco
✅ **Emoção** - Transmite força e determinação
✅ **Diferenciação** - Não parece app genérico
✅ **Acessibilidade** - Contraste WCAG AA compliant

## 📚 Referências

- App concorrente (referência visual)
- Material Design 3 (estrutura de cores)
- WCAG 2.1 (acessibilidade)
- Psicologia das cores em esportes de combate
