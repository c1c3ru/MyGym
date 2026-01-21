# 🚀 Quick Reference - Glassmorphism & Animations

## 📦 Import Components

```typescript
import AnimatedScreen from '@components/AnimatedScreen';
import AnimatedList from '@components/AnimatedList';
import GlassCard from '@components/GlassCard';
import StatusBadge from '@components/StatusBadge';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';
```

## 🎬 AnimatedScreen

Wrap your entire screen for automatic entry animation:

```tsx
<AnimatedScreen animationType="fadeSlide" duration={300}>
  {/* Your content */}
</AnimatedScreen>
```

**Props:**
- `animationType`: `'fade'` | `'slide'` | `'scale'` | `'fadeSlide'` (default: `'fadeSlide'`)
- `duration`: number (default: 300ms)
- `delay`: number (default: 0ms)

---

## 📜 AnimatedList

Staggered cascade animation for lists:

```tsx
<AnimatedList staggerDelay={50} animationType="fadeSlide">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</AnimatedList>
```

**Props:**
- `staggerDelay`: number (default: 50ms) - Delay between each item
- `animationType`: `'fade'` | `'fadeSlide'` | `'fadeScale'` (default: `'fadeSlide'`)
- `duration`: number (default: 300ms)

---

## 🎴 GlassCard

Modern glassmorphism card:

```tsx
<GlassCard 
  variant="card" 
  padding={16} 
  marginBottom={12}
  pressable
  onPress={() => navigate('Details')}
>
  <Text>Content</Text>
</GlassCard>
```

**Props:**
- `variant`: `'default'` | `'light'` | `'heavy'` | `'card'` | `'modal'` | `'subtle'` (default: `'default'`)
- `padding`: number
- `margin`: number
- `marginBottom`: number
- `marginTop`: number
- `marginHorizontal`: number
- `borderRadius`: number (default: 16)
- `pressable`: boolean - Enable press animation
- `onPress`: () => void - Press handler
- `animated`: boolean - Enable hover animation

**Variants:**
- `default`: Standard glass effect (auto light/dark)
- `light`: Subtle glass (60% opacity light, 3% dark)
- `heavy`: Strong glass (95% opacity light, 8% dark)
- `card`: Card glass (85% opacity light, 6% dark)
- `modal`: Modal glass (98% opacity light, 10% dark)
- `subtle`: Very subtle glass

---

## 🏷️ StatusBadge

Color-coded status badges:

```tsx
<StatusBadge 
  status="active" 
  label="ATIVO" 
  size="medium"
  showIcon={true}
/>
```

**Props:**
- `status`: `'active'` | `'inactive'` | `'pending'` | `'success'` | `'error'` | `'warning'` | `'info'`
- `label`: string - Text to display
- `size`: `'small'` | `'medium'` | `'large'` (default: `'medium'`)
- `icon`: string - Custom icon name (optional)
- `showIcon`: boolean (default: true)

**Status Colors:**
- `active` / `success`: Green (#4CAF50)
- `inactive`: Gray (#9E9E9E)
- `pending` / `warning`: Yellow (#FFC107)
- `error`: Red (#F44336)
- `info`: Blue (#03A9F4)

---

## 🎨 Design Tokens

### Spacing
```typescript
SPACING.xs    // 4px
SPACING.sm    // 8px
SPACING.md    // 12px
SPACING.base  // 16px
SPACING.lg    // 24px
SPACING.xl    // 32px
```

### Border Radius
```typescript
BORDER_RADIUS.sm    // 4px
BORDER_RADIUS.base  // 8px
BORDER_RADIUS.md    // 12px
BORDER_RADIUS.lg    // 16px
BORDER_RADIUS.xl    // 20px
BORDER_RADIUS.full  // 9999px (pill)
```

### Font Sizes
```typescript
FONT_SIZE.xs    // 12px
FONT_SIZE.sm    // 14px
FONT_SIZE.base  // 16px
FONT_SIZE.lg    // 20px
FONT_SIZE.xl    // 24px
FONT_SIZE.xxl   // 28px
```

### Colors
```typescript
// Primary
COLORS.primary[500]   // #2196F3 (blue)
COLORS.success[500]   // #4CAF50 (green)
COLORS.warning[500]   // #FFC107 (yellow)
COLORS.error[500]     // #F44336 (red)
COLORS.info[500]      // #03A9F4 (light blue)

// Grays
COLORS.gray[300]      // Light gray
COLORS.gray[500]      // Medium gray
COLORS.gray[700]      // Dark gray

// Text (theme-aware)
COLORS.text.primary   // Main text
COLORS.text.secondary // Secondary text
COLORS.text.tertiary  // Tertiary text

// Background (theme-aware)
COLORS.background.default  // Main background
COLORS.background.paper    // Card background
```

---

## 🎭 Theme Usage

```typescript
const { isDarkMode, getString } = useTheme();

// Conditional styling
<Text style={{ 
  color: isDarkMode ? COLORS.white : COLORS.text.primary 
}}>
  {getString('title')}
</Text>
```

---

## 📋 Common Patterns

### Dashboard Stats Grid
```tsx
<View style={styles.statsGrid}>
  {stats.map((stat, index) => (
    <View key={index} style={{ width: '50%', padding: 4 }}>
      <GlassCard variant="card" padding={16}>
        <IconContainer icon={stat.icon} color={stat.color} />
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </GlassCard>
    </View>
  ))}
</View>
```

### List with Stagger
```tsx
<GlassCard variant="card" padding={16}>
  <SectionHeader emoji="📋" title="Items" />
  <AnimatedList staggerDelay={50}>
    {items.map(item => (
      <GlassCard 
        key={item.id}
        variant="subtle"
        padding={12}
        marginBottom={8}
        pressable
        onPress={() => handlePress(item.id)}
      >
        <Text>{item.title}</Text>
        <StatusBadge status={item.status} label={item.statusLabel} />
      </GlassCard>
    ))}
  </AnimatedList>
</GlassCard>
```

### Modal with Animation
```tsx
<Modal visible={visible} transparent>
  <View style={styles.modalOverlay}>
    <AnimatedScreen animationType="fadeSlide">
      <GlassCard variant="modal" padding={24}>
        <Text>Modal Content</Text>
      </GlassCard>
    </AnimatedScreen>
  </View>
</Modal>
```

---

## ⚡ Performance Tips

1. **Use `useNativeDriver: true`** - All animations use native driver by default
2. **Avoid inline styles** - Use StyleSheet.create() for better performance
3. **Memoize expensive calculations** - Use useMemo() and useCallback()
4. **Limit stagger items** - Don't animate more than 20 items at once
5. **Use appropriate variants** - `subtle` for nested cards, `card` for main cards

---

## ✅ Accessibility Checklist

- [x] Text contrast ratio ≥ 4.5:1 (WCAG AA)
- [x] Touch targets ≥ 44x44px
- [x] Press feedback (scale to 0.98)
- [x] Focus indicators
- [x] Semantic HTML/components
- [x] Screen reader support

---

## 🐛 Troubleshooting

**Problem:** Glass effect not showing
- **Solution:** Ensure backdrop-filter is supported (web only) or use fallback colors

**Problem:** Animations stuttering
- **Solution:** Check useNativeDriver is true, reduce number of animated items

**Problem:** Theme not switching
- **Solution:** Verify useTheme() hook is called, check ThemeProvider wraps app

**Problem:** TypeScript errors on variant
- **Solution:** Use supported variants: 'default', 'light', 'heavy', 'card', 'modal', 'subtle'

---

## 📚 Full Documentation

See `/docs/UI_UX_OVERHAUL.md` for complete documentation.
