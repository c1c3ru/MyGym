# 🎨 Plano de Atualização de Cores - MyGym
## Baseado na Paleta do BJJ Control

---

## 📊 Análise da Paleta BJJ Control

### Cores Identificadas nas Imagens:

**Backgrounds:**
- Preto profundo: `#000000` ou `#0A0A0A`
- Cinza muito escuro: `#1A1A1A` ou `#1C1C1C`
- Branco para inputs: `#FFFFFF` ou `#F5F5F5`

**Accent/Primary:**
- Vermelho coral vibrante: `#FF4757` ou `#FF5252`
- Usado em: botões, badges, destaques

**Texto:**
- Branco puro: `#FFFFFF`
- Cinza claro: `#E0E0E0` ou `#BDBDBD`
- Cinza médio: `#9E9E9E`

**Cards:**
- Fundo rosa muito claro: `#FFF5F5` ou `#FFEBEE`
- Bordas sutis: `#E0E0E0`

---

## 🎯 Paleta Ajustada para MyGym

```javascript
// Backgrounds (Dark Theme)
background: {
  default: '#0A0A0A',      // Preto profundo (mais escuro)
  paper: '#1C1C1C',        // Cinza muito escuro (cards)
  elevated: '#242424',     // Cinza escuro (modais)
  light: '#F5F5F5',        // Branco (inputs)
  dark: '#000000',         // Preto puro
}

// Primary (Vermelho Coral - igual BJJ Control)
primary: {
  500: '#FF4757',          // Vermelho coral principal
  600: '#EE3D4D',
  700: '#DC2F3F',
}

// Texto (Dark Theme)
text: {
  primary: '#FFFFFF',      // Branco puro
  secondary: '#BDBDBD',    // Cinza claro
  disabled: '#9E9E9E',     // Cinza médio
  hint: '#757575',         // Cinza
}

// Cards
card: {
  default: {
    background: '#1C1C1C',      // Cinza muito escuro
    border: '#2A2A2A',          // Cinza escuro sutil
  },
  light: {
    background: '#FFF5F5',      // Rosa muito claro (como BJJ)
    border: '#E0E0E0',          // Cinza claro
  },
}

// Botões
button: {
  primary: {
    background: '#FF4757',      // Vermelho coral
    text: '#FFFFFF',
  },
}
```

---

## 📁 Arquivos a Atualizar (Prioridade)

### 🔴 ALTA PRIORIDADE (Telas Principais)

#### 1. Autenticação (3 arquivos)
- [ ] `LoginScreen.js`
  - Background: `#0A0A0A`
  - Inputs: `#F5F5F5` (branco)
  - Botão: `#FF4757`
  - Texto: `#FFFFFF`

- [ ] `RegisterScreen.js`
  - Mesmas cores do Login

- [ ] `AcademiaSelectionScreen.js`
  - Background: `#0A0A0A`
  - Cards: `#1C1C1C`

#### 2. Dashboards (3 arquivos)
- [ ] `StudentDashboard.js`
  - Background: `#0A0A0A`
  - Cards: `#1C1C1C` com borda `#2A2A2A`
  - Badges: `#FF4757`
  - Texto: `#FFFFFF` / `#BDBDBD`

- [ ] `InstructorDashboard.js`
  - Mesmas cores do StudentDashboard

- [ ] `AdminDashboard.js`
  - Mesmas cores do StudentDashboard

#### 3. Navegação (3 arquivos)
- [ ] `StudentNavigator.js`
  - Tab bar: `#1C1C1C`
  - Active: `#FF4757`
  - Inactive: `#9E9E9E`

- [ ] `InstructorNavigator.js`
  - Mesmas cores

- [ ] `AdminNavigator.js`
  - Mesmas cores

#### 4. Componentes Críticos (5 arquivos)
- [ ] `UniversalHeader.js`
  - Background: `#1C1C1C`
  - Texto: `#FFFFFF`
  - Ícones: `#FFFFFF`

- [ ] `ActionButton.js`
  - Primary: `#FF4757`
  - Secondary: `#424242`

- [ ] `OptimizedStudentCard.js`
  - Background: `#1C1C1C`
  - Borda: `#2A2A2A`

- [ ] `GraduationBoard.js`
  - Background: `#0A0A0A`
  - Cards: `#1C1C1C`

- [ ] `NotificationBell.js`
  - Badge: `#FF4757`
  - Ícone: `#FFFFFF`

### 🟡 MÉDIA PRIORIDADE (Telas Secundárias)

#### 5. Perfil e Configurações (3 arquivos)
- [ ] `ProfileScreen.js`
- [ ] `SettingsScreen.js`
- [ ] `StudentProfileScreen.js`

#### 6. Turmas e Check-in (4 arquivos)
- [ ] `CheckIn.js`
- [ ] `ClassDetailsScreen.js`
- [ ] `AddClassScreen.js`
- [ ] `NovaAula.js`

#### 7. Graduações (3 arquivos)
- [ ] `AddGraduationScreen.js`
- [ ] `GraduationBoardScreen.js`
- [ ] `StudentEvolution.js`

#### 8. Pagamentos (2 arquivos)
- [ ] `PaymentManagementScreen.js`
- [ ] `StudentPayments.js`

### 🟢 BAIXA PRIORIDADE (Telas Específicas)

#### 9. Avaliações e Lesões (3 arquivos)
- [ ] `PhysicalEvaluationScreen.js`
- [ ] `PhysicalEvaluationHistoryScreen.js`
- [ ] `InjuryScreen.js`
- [ ] `InjuryHistoryScreen.js`

#### 10. Relatórios e Admin (3 arquivos)
- [ ] `ReportsScreen.js`
- [ ] `Relatorios.js`
- [ ] `AdminModalities.js`
- [ ] `AdminStudents.js`
- [ ] `AdminClasses.js`

---

## 🛠️ Script de Atualização Automática

### Fase 1: Atualizar Design Tokens

```javascript
// /src/presentation/theme/designTokens.js

// Ajustar backgrounds para mais escuros
background: {
  default: '#0A0A0A',      // Era #0D0D0D
  paper: '#1C1C1C',        // Era #1A1A1A
  elevated: '#242424',     // Era #212121
  light: '#F5F5F5',
  dark: '#000000',
}

// Ajustar bordas para mais sutis
border: {
  light: '#2A2A2A',        // Era #424242
  default: '#424242',      // Era #757575
  dark: '#757575',         // Era #9E9E9E
}

// Adicionar card light (como BJJ Control)
card: {
  default: {
    background: '#1C1C1C',
    border: '#2A2A2A',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  elevated: {
    background: '#242424',
    border: '#2A2A2A',
    shadow: 'rgba(0, 0, 0, 0.7)',
  },
  highlighted: {
    background: '#2A2A2A',
    border: '#FF4757',
    shadow: 'rgba(255, 71, 87, 0.3)',
  },
  // NOVO: Card claro (como BJJ Control)
  light: {
    background: '#FFF5F5',   // Rosa muito claro
    border: '#E0E0E0',       // Cinza claro
    text: '#424242',         // Texto escuro
  },
}
```

### Fase 2: Script de Migração

```bash
#!/bin/bash
# migrate-to-bjj-colors.sh

# Substituições automáticas
find src/presentation -name "*.js" -type f -exec sed -i \
  -e "s/'#0D0D0D'/COLORS.background.default/g" \
  -e "s/'#1A1A1A'/COLORS.background.paper/g" \
  -e "s/'#212121'/COLORS.background.elevated/g" \
  {} +

echo "✅ Cores atualizadas!"
```

---

## 📝 Checklist de Atualização

### Por Arquivo:

```markdown
- [ ] Ler arquivo completo
- [ ] Identificar cores hardcoded
- [ ] Substituir por COLORS.*
- [ ] Ajustar backgrounds (#0A0A0A)
- [ ] Ajustar cards (#1C1C1C)
- [ ] Ajustar bordas (#2A2A2A)
- [ ] Testar visualmente
- [ ] Commit
```

### Por Categoria:

#### Backgrounds
```javascript
// ANTES
backgroundColor: '#0D0D0D'
backgroundColor: '#1A1A1A'

// DEPOIS
backgroundColor: COLORS.background.default  // #0A0A0A
backgroundColor: COLORS.background.paper    // #1C1C1C
```

#### Cards
```javascript
// ANTES
backgroundColor: '#1A1A1A'
borderColor: '#424242'

// DEPOIS
backgroundColor: COLORS.card.default.background  // #1C1C1C
borderColor: COLORS.card.default.border          // #2A2A2A
```

#### Botões
```javascript
// ANTES
backgroundColor: '#FF4757'

// DEPOIS
backgroundColor: COLORS.button.primary.background  // #FF4757 (mantém)
```

#### Texto
```javascript
// ANTES
color: '#FFFFFF'
color: '#E0E0E0'

// DEPOIS
color: COLORS.text.primary    // #FFFFFF
color: COLORS.text.secondary  // #BDBDBD
```

---

## 🚀 Plano de Execução (3 Fases)

### Fase 1: Fundação (30 min)
1. ✅ Atualizar `designTokens.js`
2. ✅ Criar script de migração
3. ✅ Testar em 1 tela (LoginScreen)

### Fase 2: Telas Principais (1-2 horas)
1. Autenticação (3 arquivos)
2. Dashboards (3 arquivos)
3. Navegação (3 arquivos)
4. Componentes críticos (5 arquivos)

### Fase 3: Telas Secundárias (2-3 horas)
1. Perfil e configurações
2. Turmas e check-in
3. Graduações
4. Pagamentos
5. Avaliações e lesões
6. Relatórios e admin

---

## 🎯 Resultado Esperado

### Antes vs Depois:

| Elemento | Antes | Depois (BJJ Style) |
|----------|-------|-------------------|
| Background | `#0D0D0D` | `#0A0A0A` (mais escuro) |
| Cards | `#1A1A1A` | `#1C1C1C` (mais escuro) |
| Bordas | `#424242` | `#2A2A2A` (mais sutis) |
| Primary | `#FF4757` | `#FF4757` (mantém) |
| Texto | `#FFFFFF` | `#FFFFFF` (mantém) |

### Características do Visual BJJ Control:
✅ Preto mais profundo
✅ Bordas mais sutis
✅ Cards com rosa claro para destaque
✅ Contraste forte (preto + branco)
✅ Vermelho coral vibrante
✅ Minimalista e clean

---

## 📊 Métricas de Sucesso

- [ ] 100% dos arquivos usando COLORS.*
- [ ] Zero cores hardcoded
- [ ] Visual consistente com BJJ Control
- [ ] Contraste WCAG AA compliant
- [ ] Testes visuais aprovados
- [ ] Performance mantida

---

## 🔧 Ferramentas

1. **Script de migração automática**
   - `migrate-to-bjj-colors.sh`

2. **Validação**
   - `grep -r "#0D0D0D" src/` (deve retornar 0)
   - `grep -r "#1A1A1A" src/` (deve retornar 0)

3. **Testes visuais**
   - Screenshot de cada tela
   - Comparação com BJJ Control

---

**Tempo Total Estimado:** 3-5 horas
**Arquivos a Atualizar:** ~40 arquivos
**ROI:** Visual profissional + Consistência total
