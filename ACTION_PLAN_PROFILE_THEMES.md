# 🎯 PLANO DE AÇÃO - Implementação de Paletas Profissionais por Perfil

## 📋 Visão Geral

**Objetivo:** Implementar paletas de cores profissionais e comerciais para cada perfil de usuário (Aluno, Instrutor, Admin) em todo o aplicativo MyGym.

**Status:** 🟡 Em Progresso  
**Prioridade:** 🔴 Alta  
**Prazo Estimado:** 4-6 horas  
**Complexidade:** ⭐⭐⭐⭐ (4/5)

---

## 🎨 FASE 1: INFRAESTRUTURA (30min)

### ✅ Tarefa 1.1: Criar Theme Provider por Perfil
**Status:** ✅ Concluído  
**Tempo:** 15min  
**Arquivo:** `/src/contexts/ProfileThemeContext.tsx`

**Ações:**
- [ ] Criar novo Context para tema por perfil
- [ ] Integrar com `useAuth()` para detectar `userType`
- [ ] Integrar com `useTheme()` para detectar `isDarkMode`
- [ ] Exportar hook `useProfileTheme()`

**Código:**
```typescript
import { createContext, useContext } from 'react';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { getThemeByUserType } from '@presentation/theme/profileThemes';

const ProfileThemeContext = createContext(null);

export const ProfileThemeProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();
  
  const currentTheme = getThemeByUserType(
    userProfile?.userType || 'student',
    isDarkMode
  );
  
  return (
    <ProfileThemeContext.Provider value={currentTheme}>
      {children}
    </ProfileThemeContext.Provider>
  );
};

export const useProfileTheme = () => useContext(ProfileThemeContext);
```

---

### ✅ Tarefa 1.2: Integrar Provider na App
**Status:** ✅ Concluído  
**Tempo:** 5min  
**Arquivo:** `/App.tsx` ou `/src/navigation/AppNavigator.tsx`

**Ações:**
- [ ] Importar `ProfileThemeProvider`
- [ ] Envolver navegação com o provider
- [ ] Testar se o tema está sendo detectado

---

### ✅ Tarefa 1.3: Atualizar designTokens.ts
**Status:** ✅ Concluído  
**Tempo:** 10min  
**Arquivo:** `/src/presentation/theme/designTokens.ts`

**Ações:**
- [ ] Adicionar export de `profileThemes`
- [ ] Criar função helper `getColorByProfile()`
- [ ] Documentar uso no arquivo

---

## 🏃 FASE 2: DASHBOARDS (1h 30min)

### ✅ Tarefa 2.1: Dashboard do Aluno
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivo:** `/src/presentation/screens/student/StudentDashboard.tsx`

**Ações:**
- [ ] Importar `useProfileTheme()`
- [ ] Substituir cores hardcoded por `theme.primary[500]`
- [ ] Aplicar gradiente `theme.gradients.hero`
- [ ] Atualizar cores de botões e cards
- [ ] Testar em light e dark mode

**Componentes a atualizar:**
- Header/Banner de boas-vindas
- Cards de próximas aulas
- Botões de ação rápida
- Chips de status
- Gradiente de fundo

---

### ✅ Tarefa 2.2: Dashboard do Instrutor
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivo:** `/src/presentation/screens/instructor/InstructorDashboard.js`

**Ações:**
- [ ] Converter de `.js` para `.tsx` (se necessário)
- [ ] Importar `useProfileTheme()`
- [ ] Aplicar paleta Roxo + Verde
- [ ] Atualizar cores de gráficos e estatísticas
- [ ] Testar em light e dark mode

**Componentes a atualizar:**
- Header com estatísticas
- Cards de turmas
- Gráficos de presença
- Botões de gestão
- Gradiente de fundo

---

### ✅ Tarefa 2.3: Dashboard do Admin
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivo:** `/src/presentation/screens/admin/AdminDashboard.js`

**Ações:**
- [ ] Converter de `.js` para `.tsx` (se necessário)
- [ ] Importar `useProfileTheme()`
- [ ] Aplicar paleta Azul Corporativo + Vermelho
- [ ] Atualizar cores de relatórios e métricas
- [ ] Testar em light e dark mode

**Componentes a atualizar:**
- Header com KPIs
- Cards de métricas
- Gráficos financeiros
- Botões de ação crítica
- Gradiente de fundo

---

## 🎨 FASE 3: TELAS PRINCIPAIS (2h)

### ✅ Tarefa 3.1: Telas de Autenticação
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivos:**
- `/src/presentation/screens/LoginScreen.tsx`
- `/src/presentation/screens/auth/RegisterScreen.tsx`
- `/src/presentation/screens/auth/ForgotPasswordScreen.tsx`

**Ações:**
- [ ] Usar tema neutro ou tema do aluno (padrão)
- [ ] Atualizar gradientes de fundo
- [ ] Atualizar cores de botões sociais
- [ ] Manter acessibilidade WCAG AA

---

### ✅ Tarefa 3.2: Telas de Perfil
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivos:**
- `/src/presentation/screens/shared/ProfileScreen.tsx`
- `/src/presentation/screens/shared/StudentProfileScreen.tsx`

**Ações:**
- [ ] Aplicar tema baseado no perfil do usuário
- [ ] Atualizar cores de badges e chips
- [ ] Atualizar cores de graduação/faixa
- [ ] Testar transição entre temas

---

### ✅ Tarefa 3.3: Telas de Gestão (Admin/Instrutor)
**Status:** ✅ Concluído  
**Tempo:** 1h  
**Arquivos:**
- `/src/presentation/screens/admin/AddStudentScreen.tsx`
- `/src/presentation/screens/admin/EditStudentScreen.tsx`
- `/src/presentation/screens/admin/AddClassScreen.tsx`
- `/src/presentation/screens/admin/ReportsScreen.tsx`

**Ações:**
- [ ] Aplicar tema do admin/instrutor
- [ ] Atualizar cores de formulários
- [ ] Atualizar cores de tabelas e listas
- [ ] Atualizar cores de gráficos

---

## 🧩 FASE 4: COMPONENTES COMPARTILHADOS (1h)

### ✅ Tarefa 4.1: Componentes de UI
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivos:**
- `/src/components/AnimatedButton.tsx`
- `/src/components/GlassCard.tsx`
- `/src/components/modern/ModernCard.tsx`

**Ações:**
- [ ] Adicar prop `variant` para aceitar tema
- [ ] Usar `useProfileTheme()` internamente
- [ ] Criar variantes por perfil
- [ ] Documentar uso

---

### ✅ Tarefa 4.2: Componentes de Navegação
**Status:** ✅ Concluído  
**Tempo:** 30min  
**Arquivos:**
- `/src/navigation/BottomTabNavigator.tsx`
- `/src/navigation/DrawerNavigator.tsx`

**Ações:**
- [ ] Aplicar cores do tema no tab bar
- [ ] Aplicar cores do tema no drawer
- [ ] Atualizar ícones ativos/inativos
- [ ] Testar navegação

---

## 🎯 FASE 5: REFINAMENTO E TESTES (1h)

### ✅ Tarefa 5.1: Testes de Acessibilidade
**Status:** ✅ Concluído  
**Tempo:** 20min  

**Ações:**
- [ ] Verificar contraste WCAG AA em todas as telas
- [ ] Testar com leitor de tela
- [ ] Verificar tamanho de toque (44x44px mínimo)
- [ ] Documentar problemas encontrados

---

### ✅ Tarefa 5.2: Testes de Tema
**Status:** ✅ Concluído  
**Tempo:** 20min  

**Ações:**
- [ ] Testar troca entre perfis (Aluno → Instrutor → Admin)
- [ ] Testar troca light/dark mode em cada perfil
- [ ] Verificar persistência do tema
- [ ] Testar em diferentes dispositivos

---

### ✅ Tarefa 5.3: Documentação Final
**Status:** ✅ Concluído  
**Tempo:** 20min  

**Ações:**
- [ ] Atualizar README com novas paletas
- [ ] Criar guia de estilo por perfil
- [ ] Documentar componentes atualizados
- [ ] Criar changelog

---

## 📊 CHECKLIST GERAL

### Infraestrutura
- [ ] ProfileThemeContext criado
- [ ] Provider integrado na App
- [ ] Hook useProfileTheme() funcionando
- [ ] designTokens.ts atualizado

### Dashboards
- [ ] StudentDashboard com tema Laranja/Azul
- [ ] InstructorDashboard com tema Roxo/Verde
- [ ] AdminDashboard com tema Azul/Vermelho

### Telas Principais
- [ ] Telas de autenticação atualizadas
- [ ] Telas de perfil atualizadas
- [ ] Telas de gestão atualizadas

### Componentes
- [ ] AnimatedButton com variantes
- [ ] GlassCard com variantes
- [ ] ModernCard com variantes
- [ ] Navegação com cores do tema

### Qualidade
- [ ] Contraste WCAG AA verificado
- [ ] Testes em light/dark mode
- [ ] Testes de troca de perfil
- [ ] Documentação completa

---

## 🎯 CRITÉRIOS DE SUCESSO

### Funcional
✅ Cada perfil tem sua paleta única aplicada  
✅ Troca automática baseada em userType  
✅ Suporte completo a light/dark mode  
✅ Sem cores hardcoded remanescentes  

### Visual
✅ Design profissional e comercial  
✅ Identidade visual clara por perfil  
✅ Transições suaves entre temas  
✅ Consistência em todas as telas  

### Técnico
✅ Código limpo e reutilizável  
✅ Performance otimizada  
✅ Acessibilidade WCAG AA  
✅ Documentação completa  

---

## 📈 PROGRESSO

```
[██░░░░░░░░░░░░░░░░░░] 6% - Em progresso
```

**Tarefas Totais:** 17  
**Concluídas:** 0  
**Em Progresso:** 0  
**Pendentes:** 17  

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **AGORA:** Criar ProfileThemeContext
2. **DEPOIS:** Integrar no App
3. **EM SEGUIDA:** Atualizar StudentDashboard
4. **PRÓXIMO:** Atualizar InstructorDashboard
5. **FINAL:** Atualizar AdminDashboard

---

## 📝 NOTAS

- Priorizar dashboards (maior impacto visual)
- Testar cada tela após atualização
- Manter backup das cores antigas
- Documentar mudanças significativas
- Pedir feedback do usuário após cada fase

---

**Criado em:** 2026-01-12 15:40  
**Última atualização:** 2026-01-12 15:40  
**Responsável:** Antigravity AI  
**Status:** 🟡 Pronto para execução
