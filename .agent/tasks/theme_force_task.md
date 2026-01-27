# 🌓 Força Tarefa: Perfeição em Temas (Light & Dark)

> **Status:** � Implementado (Fases 1 & 2 Concluídas)
> **Objetivo:** Adequação total aos princípios de visualização, acessibilidade e usabilidade dos temas Claro e Escuro.

---

## 📋 Diagnóstico Atual

### Pontos Fortes (Compliance ✅)
1.  **Estrutura de Cores**: Uso de `#121212` (Material Dark) em vez de `#000000` para fundos.
2.  **Arquitetura Sólida**: Sistema centralizado em `profileThemes.ts` e `lightTheme.ts`.
3.  **Mecanismo de Toggle**: Componente `ThemeToggleSwitch.js` funcional.
4.  **Glassmorphism**: Suporte nativo via `GlassCard.tsx` com variantes de opacidade.

### Pontos de Atenção Resolvidos (Fixed 🛠️)
1.  **Texto Branco Puro**: ✅ Ajustado para `#F2F2F2` (Off-White) evitando fadiga visual.
2.  **Inputs Brancos Estáticos**: ✅ Reformulados (`FormInput`, `FormSelect`) para usar fundo dinâmico (`currentTheme.background.paper`).
3.  **Botões com Cor Incorreta**: ✅ `ActionButton` e `FloatingActionButton` agora respeitam o tema do perfil (Laranja/Student, Vermelho/Instructor, Azul/Admin) em vez de hardcoded Red.
4.  **Pickers**: ✅ `ModalityPicker` e chips agora usam cores do tema.

---

## 🛠️ Plano de Ação (A Força Tarefa)

### Fase 1: Refinamento de Tokens (Concluído)
- [x] **Ajuste de Texto**: Alterar `text.primary` de `#FFFFFF` para `#F2F2F2` em todos os temas Dark.
- [x] **Padronização Secundária**: Refinar `text.secondary` para `#E0E0E0`.

### Fase 2: Componentes Críticos (Concluído)
- [x] **Inputs**: Validar fundos de inputs em Dark Mode (agora usam `background.paper` via Contexto).
- [x] **Selects & Pickers**: `FormSelect` e `ModalityPicker` convertidos para `useThemeToggle` e cores dinâmicas.
- [x] **Botões de Ação**: Botões agora consomem `currentTheme.primary` e `gradients` corretos.

### Fase 3: Validação (Pendente)
- [ ] **Teste de Halos**: Verificar textos longos em telas OLED.
- [ ] **Contraste WCAG**: Rodar testes automatizados para garantir 4.5:1.

---

## 👥 Responsáveis
- **Driver**: @frontend-specialist
- **Reviewer**: @mobile-design
- **Tech**: React Native Paper + Context API
