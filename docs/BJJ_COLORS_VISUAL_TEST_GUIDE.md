# 🎨 Guia de Testes Visuais - Cores BJJ Control

**Data:** 2025-10-02  
**Objetivo:** Validar visualmente as mudanças de cores no estilo BJJ Control

---

## 🚀 Preparação

### 1. Limpar Cache e Iniciar
```bash
# Limpar cache do Metro
npx expo start --clear

# Ou reiniciar completamente
rm -rf node_modules/.cache
npx expo start --clear
```

### 2. Dispositivos de Teste
- [ ] iOS (simulador ou físico)
- [ ] Android (emulador ou físico)
- [ ] Tablet (opcional)

---

## 📋 Checklist de Validação Visual

### 🔴 ALTA PRIORIDADE

#### 1. Telas de Autenticação

**LoginScreen:**
- [ ] Background: Preto profundo (#0A0A0A)
- [ ] Inputs: Fundo branco (#F5F5F5)
- [ ] Botão principal: Vermelho coral (#FF4757)
- [ ] Texto: Branco (#FFFFFF)
- [ ] Texto secundário: Cinza claro (#BDBDBD)
- [ ] Contraste adequado para leitura

**RegisterScreen:**
- [ ] Mesmas cores do Login
- [ ] Checkboxes visíveis
- [ ] Bordas sutis (#2A2A2A)

**AcademiaSelectionScreen:**
- [ ] Background: Preto profundo
- [ ] Cards: Cinza muito escuro (#1C1C1C)
- [ ] Bordas sutis (#2A2A2A)
- [ ] Hover/Press feedback visível

---

#### 2. Dashboards

**StudentDashboard:**
- [ ] Background: Preto profundo (#0A0A0A)
- [ ] Cards: Cinza muito escuro (#1C1C1C)
- [ ] Bordas: Cinza escuro sutil (#2A2A2A)
- [ ] Badges: Vermelho coral (#FF4757)
- [ ] Texto primário: Branco (#FFFFFF)
- [ ] Texto secundário: Cinza claro (#BDBDBD)
- [ ] Ícones visíveis e contrastados
- [ ] Sombras suaves nos cards

**InstructorDashboard:**
- [ ] Mesmas validações do StudentDashboard
- [ ] Botões de ação: Vermelho coral
- [ ] Cards de turmas destacados
- [ ] Estatísticas legíveis

**AdminDashboard:**
- [ ] Mesmas validações
- [ ] Gradientes nos cards de estatísticas
- [ ] Botões de ação rápida visíveis
- [ ] Contraste em todos os elementos

---

#### 3. Navegação (Tab Bars)

**StudentNavigator:**
- [ ] Tab bar: Cinza muito escuro (#1C1C1C)
- [ ] Ícone ativo: Vermelho coral (#FF4757)
- [ ] Ícone inativo: Cinza médio (#9E9E9E)
- [ ] Label ativo: Vermelho coral
- [ ] Label inativo: Cinza médio
- [ ] Transições suaves

**InstructorNavigator:**
- [ ] Mesmas validações

**AdminNavigator:**
- [ ] Mesmas validações

---

#### 4. Componentes Críticos

**UniversalHeader:**
- [ ] Background: Cinza muito escuro (#1C1C1C)
- [ ] Texto: Branco (#FFFFFF)
- [ ] Ícones: Branco
- [ ] Sombra sutil
- [ ] Contraste com background da tela

**ActionButton:**
- [ ] Primary: Vermelho coral (#FF4757)
- [ ] Secondary: Cinza escuro (#424242)
- [ ] Texto: Branco
- [ ] Estados hover/press visíveis
- [ ] Disabled: Cinza (#757575)

**OptimizedStudentCard:**
- [ ] Background: Cinza muito escuro (#1C1C1C)
- [ ] Borda: Cinza escuro sutil (#2A2A2A)
- [ ] Texto: Branco/Cinza claro
- [ ] Ícones visíveis
- [ ] Sombra suave

**GraduationBoard:**
- [ ] Background: Preto profundo
- [ ] Cards: Cinza muito escuro
- [ ] Badges de faixa com cores corretas
- [ ] Texto legível

**NotificationBell:**
- [ ] Badge: Vermelho coral (#FF4757)
- [ ] Ícone: Branco
- [ ] Contador legível

---

### 🟡 MÉDIA PRIORIDADE

#### 5. Perfil e Configurações

**ProfileScreen:**
- [ ] Cards de informação: Cinza muito escuro
- [ ] Bordas sutis
- [ ] Botões de ação visíveis
- [ ] Avatar destacado

**SettingsScreen:**
- [ ] Lista de opções legível
- [ ] Switches visíveis
- [ ] Separadores sutis

---

#### 6. Turmas e Check-in

**CheckIn:**
- [ ] Lista de alunos legível
- [ ] Botão de check-in: Vermelho coral
- [ ] Status de presença visível
- [ ] QR Code scanner funcional

**ClassDetailsScreen:**
- [ ] Informações da turma destacadas
- [ ] Lista de alunos legível
- [ ] Botões de ação visíveis

---

#### 7. Graduações

**AddGraduationScreen:**
- [ ] Formulário legível
- [ ] Seletor de faixa com cores corretas
- [ ] Botão salvar: Vermelho coral
- [ ] Validações visíveis

**GraduationBoardScreen:**
- [ ] Abas visíveis
- [ ] Cards de graduação destacados
- [ ] Estatísticas legíveis

---

### 🟢 BAIXA PRIORIDADE

#### 8. Avaliações e Lesões

**PhysicalEvaluationScreen:**
- [ ] Formulário legível
- [ ] Inputs com fundo claro
- [ ] Botões visíveis

**InjuryScreen:**
- [ ] Formulário legível
- [ ] Campos destacados

---

#### 9. Relatórios

**ReportsScreen:**
- [ ] Gráficos visíveis
- [ ] Legendas legíveis
- [ ] Cards de estatísticas destacados

---

## 🎯 Pontos de Atenção Especiais

### Contraste (WCAG AA)
- [ ] Texto branco em fundo escuro: Ratio ≥ 7:1
- [ ] Texto cinza claro em fundo escuro: Ratio ≥ 4.5:1
- [ ] Ícones visíveis: Ratio ≥ 3:1
- [ ] Bordas sutis mas visíveis

### Hierarquia Visual
- [ ] Background (#0A0A0A) mais escuro que cards (#1C1C1C)
- [ ] Cards (#1C1C1C) mais escuros que modais (#242424)
- [ ] Elementos destacados usam vermelho coral (#FF4757)
- [ ] Bordas sutis (#2A2A2A) não competem com conteúdo

### Consistência
- [ ] Todas as telas usam o mesmo background
- [ ] Todos os cards usam a mesma cor
- [ ] Todos os botões primários são vermelho coral
- [ ] Todas as bordas são sutis e consistentes

### Responsividade
- [ ] Cores mantêm contraste em telas pequenas
- [ ] Elementos visíveis em diferentes tamanhos
- [ ] Sombras funcionam em iOS e Android

---

## 📸 Capturas de Tela Recomendadas

### Antes vs Depois
Capture screenshots das seguintes telas para comparação:

1. **LoginScreen** - Tela inicial
2. **StudentDashboard** - Dashboard completo
3. **InstructorDashboard** - Dashboard completo
4. **AdminDashboard** - Dashboard completo
5. **CheckIn** - Lista de alunos
6. **ProfileScreen** - Perfil do usuário
7. **Navegadores** - Tab bars (todas as 3)

### Como Capturar:
```bash
# iOS Simulator
Cmd + S

# Android Emulator
Ctrl + S (Linux/Windows)
Cmd + S (Mac)
```

---

## 🐛 Problemas Comuns e Soluções

### Problema: Cores não mudaram
**Solução:**
```bash
# Limpar cache completamente
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

### Problema: Contraste ruim
**Verificar:**
- Texto secundário deve ser #BDBDBD (não #E0E0E0)
- Bordas devem ser #2A2A2A (não #424242)
- Background deve ser #0A0A0A (não #0D0D0D)

### Problema: Cards não visíveis
**Verificar:**
- Cards devem ser #1C1C1C (não #1A1A1A)
- Bordas devem ser #2A2A2A
- Sombras devem estar aplicadas

---

## ✅ Critérios de Aprovação

### Mínimo Aceitável:
- [ ] Todas as cores seguem o design tokens
- [ ] Contraste WCAG AA em todos os textos
- [ ] Bordas visíveis mas sutis
- [ ] Hierarquia visual clara
- [ ] Sem erros de renderização

### Ideal:
- [ ] Visual idêntico ao BJJ Control
- [ ] Contraste WCAG AAA onde possível
- [ ] Animações suaves
- [ ] Performance mantida
- [ ] Feedback visual em todas as interações

---

## 📊 Relatório de Testes

### Template:
```markdown
## Teste Visual - [Data]

### Dispositivo:
- Modelo: [iPhone 14 / Pixel 6 / etc]
- OS: [iOS 17 / Android 13]
- Resolução: [390x844 / etc]

### Resultados:
- [ ] Alta Prioridade: X/Y aprovados
- [ ] Média Prioridade: X/Y aprovados
- [ ] Baixa Prioridade: X/Y aprovados

### Problemas Encontrados:
1. [Descrição do problema]
   - Tela: [Nome da tela]
   - Severidade: [Alta/Média/Baixa]
   - Screenshot: [Link]

### Conclusão:
[Aprovado / Aprovado com ressalvas / Reprovado]
```

---

## 🚀 Próximos Passos Após Aprovação

1. [ ] Remover backups: `find src -name "*.backup-bjj" -delete`
2. [ ] Commit das mudanças
3. [ ] Atualizar documentação
4. [ ] Comunicar equipe
5. [ ] Deploy para staging

---

**Tempo Estimado de Testes:** 30-45 minutos  
**Prioridade:** Alta  
**Responsável:** [Nome]
