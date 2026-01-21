---
description: Plano para modernizar o visual do app com glassmorphism e animações
---

# 🎨 Plano de Modernização Visual do MyGym

## Objetivo
Aplicar o estilo visual moderno com glassmorphism, animações suaves e design premium em todo o aplicativo, seguindo o padrão estabelecido no `StudentDetailsModal`.

## 📋 Padrões de Design a Aplicar

### 1. **Glassmorphism Cards**
```typescript
glassCard: {
  backgroundColor: surfaceColor,
  borderRadius: BORDER_RADIUS.lg,
  borderWidth: 1,
  borderColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : hexToRgba(COLORS.gray[300], 0.5),
  padding: SPACING.lg,
  ...Platform.select({
    ios: { shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDarkMode ? 0.3 : 0.1, shadowRadius: 12 },
    android: { elevation: 4 },
    web: { boxShadow: `0 8px 32px 0 ${hexToRgba(COLORS.black, isDarkMode ? 0.3 : 0.1)}` }
  })
}
```

### 2. **Animações de Entrada**
```typescript
const slideAnim = useMemo(() => new Animated.Value(50), []);
const fadeAnim = useMemo(() => new Animated.Value(0), []);

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
  ]).start();
}, []);
```

### 3. **Headers Modernos**
```typescript
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: SPACING.lg,
  borderBottomWidth: 1,
  borderBottomColor: isDarkMode ? COLORS.gray[700] : COLORS.gray[200],
  backgroundColor: surfaceColor,
  ...shadowStyles
}
```

### 4. **Ícones com Background Colorido**
```typescript
iconContainer: {
  width: 40,
  height: 40,
  borderRadius: BORDER_RADIUS.md,
  backgroundColor: hexToRgba(COLORS.primary[500], 0.15),
  justifyContent: 'center',
  alignItems: 'center'
}
```

### 5. **Seções com Emojis e Títulos**
```typescript
<Text style={styles.sectionTitle}>📋 {getString("sectionName")}</Text>
```

### 6. **Badges de Status com Transparência**
```typescript
statusBadge: {
  paddingHorizontal: SPACING.sm,
  paddingVertical: 4,
  borderRadius: BORDER_RADIUS.full,
  backgroundColor: hexToRgba(statusColor, 0.15)
}
```

### 7. **Botões com Elevação**
```typescript
button: {
  borderRadius: BORDER_RADIUS.lg,
  elevation: 2,
  ...Platform.select({
    ios: { shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    web: { boxShadow: `0 2px 8px ${hexToRgba(COLORS.black, 0.1)}` }
  })
}
```

## 🎯 Prioridades de Implementação

### **Fase 1: Dashboards (Alta Prioridade)**
- [ ] InstructorDashboard.js
- [ ] AdminDashboard.js
- [ ] StudentDashboard.tsx

### **Fase 2: Listagens (Alta Prioridade)**
- [ ] InstructorStudents.js (já tem modal, melhorar lista)
- [ ] AdminStudents.js
- [ ] AdminClasses.js
- [ ] InstructorClasses.js

### **Fase 3: Detalhes e Perfis (Média Prioridade)**
- [ ] ClassDetailsScreen.tsx
- [ ] StudentProfileScreen.tsx
- [ ] ProfileScreen.tsx

### **Fase 4: Formulários (Média Prioridade)**
- [ ] AddStudentScreen.tsx
- [ ] EditStudentScreen.tsx
- [ ] EditClassScreen.tsx
- [ ] PhysicalEvaluationScreen.tsx

### **Fase 5: Outras Telas (Baixa Prioridade)**
- [ ] CheckIn.js
- [ ] StudentPayments.js
- [ ] ReportsScreen.tsx
- [ ] SettingsScreen.tsx

## 🛠️ Componentes Reutilizáveis a Criar

### 1. **GlassCard Component**
```typescript
<GlassCard>
  <CardHeader icon="school" title="Título" />
  <CardContent>...</CardContent>
</GlassCard>
```

### 2. **AnimatedScreen Wrapper**
```typescript
<AnimatedScreen>
  {/* Conteúdo com animação automática */}
</AnimatedScreen>
```

### 3. **SectionHeader Component**
```typescript
<SectionHeader emoji="📋" title="Seção" />
```

### 4. **StatusBadge Component**
```typescript
<StatusBadge status="active" label="Ativo" />
```

### 5. **IconButton Component**
```typescript
<IconButton icon="add" color="primary" onPress={...} />
```

## 📝 Checklist de Modernização por Tela

Para cada tela, aplicar:
- [ ] Animações de entrada (fade + slide)
- [ ] Glass cards ao invés de cards simples
- [ ] Ícones com background colorido
- [ ] Seções com emojis
- [ ] Badges de status modernos
- [ ] Sombras e elevações adequadas
- [ ] Suporte completo a tema claro/escuro
- [ ] Espaçamento consistente (SPACING tokens)
- [ ] Bordas arredondadas (BORDER_RADIUS tokens)
- [ ] Cores do design system (COLORS tokens)

## 🎨 Paleta de Cores por Contexto

### Status
- ✅ Ativo/Sucesso: `COLORS.success[500]` com `hexToRgba(COLORS.success[500], 0.15)` para background
- ⚠️ Pendente/Aviso: `COLORS.warning[500]` com `hexToRgba(COLORS.warning[500], 0.15)` para background
- ❌ Inativo/Erro: `COLORS.error[500]` com `hexToRgba(COLORS.error[500], 0.15)` para background
- ℹ️ Info: `COLORS.info[500]` com `hexToRgba(COLORS.info[500], 0.15)` para background

### Ações
- 🔵 Primária: `COLORS.primary[500]`
- 🟣 Secundária: `COLORS.secondary[500]`
- ⚪ Neutra: `COLORS.gray[500]`

## 🚀 Próximos Passos

1. Criar componentes reutilizáveis (GlassCard, AnimatedScreen, etc.)
2. Começar pela Fase 1 (Dashboards)
3. Aplicar padrões consistentemente
4. Testar em tema claro e escuro
5. Validar responsividade
6. Otimizar performance das animações
