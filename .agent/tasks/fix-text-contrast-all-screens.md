---
status: in_progress
priority: high
created: 2026-01-22
---

# Correção de Contraste de Texto e UI Glassmórfica - Todas as Telas

## Objetivo
Aplicar correções de contraste de texto dinâmico e UI glassmórfica consistente em todas as telas do aplicativo MyGym.

## Padrões a Aplicar

### 1. Contraste de Texto Dinâmico
- **Headers com gradiente escuro**: Usar `COLORS.white` ou `hexToRgba(COLORS.white, 0.8)`
- **Corpo de conteúdo**: Usar `theme.colors.text` ou `theme.colors.onSurface` (adapta light/dark)
- **Texto secundário**: Usar `theme.colors.textSecondary` ou `theme.colors.onSurfaceVariant`
- **Texto desabilitado**: Usar `theme.colors.disabled`

### 2. Componentes Glassmórficos
- Substituir `Card` e `Surface` por `GlassCard`
- Usar variantes: `default`, `card`, `subtle`, `premium`
- Remover `backgroundColor` manual quando usar GlassCard

### 3. ProfileTheme (Admin/Instructor)
- Usar `profileTheme.text.primary` para texto principal
- Usar `profileTheme.text.secondary` para texto secundário
- Usar `profileTheme.text.disabled` para texto desabilitado
- Usar `profileTheme.background.paper` para fundos de cards

## Telas Concluídas ✅
- [x] AdminDashboard.js
- [x] InstructorDashboard.js
- [x] StudentDashboard.tsx
- [x] Relatorios.js (Instructor Reports)

## Telas a Corrigir

### Admin Screens
- [ ] AdminClasses.js - Aplicar dynamic text colors em stats e empty states
- [ ] AdminStudents.js
- [ ] AdminModalities.js
- [ ] AddClassScreen.tsx
- [ ] AddStudentScreen.tsx
- [ ] EditClassScreen.tsx
- [ ] EditStudentScreen.tsx
- [ ] CertificateTemplateScreen.tsx - Já usa GlassCard, verificar text colors
- [ ] GraduationManagementScreen.tsx
- [ ] InviteManagement.js
- [ ] ReportsScreen.tsx

### Instructor Screens
- [ ] CheckIn.js
- [ ] InstructorClasses.js
- [ ] InstructorStudents.js
- [ ] NovaAula.js
- [ ] ScheduleClassesScreen.tsx

### Student Screens
- [ ] CheckInModalContent.tsx
- [ ] CheckInScreen.tsx
- [ ] PaymentManagementScreen.tsx
- [ ] StudentCalendar.js
- [ ] StudentEvolution.js
- [ ] StudentPayments.js

### Shared Screens
- [ ] AddGraduationScreen.tsx
- [ ] ChangePasswordScreen.tsx
- [ ] ClassDetailsScreen.tsx
- [ ] GraduationBoardScreen.tsx
- [ ] ImprovedCalendarScreen.tsx
- [ ] InjuryHistoryScreen.tsx
- [ ] InjuryScreen.tsx
- [ ] NotificationSettingsScreen.tsx
- [ ] PhysicalEvaluationHistoryScreen.tsx
- [ ] PhysicalEvaluationScreen.tsx
- [ ] PrivacyPolicyScreen.tsx
- [ ] PrivacySettingsScreen.tsx
- [ ] ProfileScreen.tsx
- [ ] SettingsScreen.tsx
- [ ] StudentDetailsScreen.tsx
- [ ] StudentProfileScreen.tsx

## Componentes a Verificar
- [ ] ClassListItem.js - Já usa GlassCard ✅
- [ ] Outros componentes memoized
- [ ] Skeletons

## Notas de Implementação
- Priorizar telas mais usadas primeiro
- Testar em light e dark mode
- Verificar acessibilidade (WCAG AA)
