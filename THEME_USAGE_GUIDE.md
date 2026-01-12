# 🎨 Guia de Uso de Temas - MyGym

## 📋 Visão Geral

Este guia explica como usar corretamente os temas centralizados do MyGym, garantindo suporte completo para **modo claro** e **modo escuro**.

---

## 🎯 INPUT_THEME - Temas para TextInput

### Opções Disponíveis:

#### 1. **INPUT_THEME** (Estático - Modo Claro)
```typescript
import { INPUT_THEME } from '@presentation/theme/designTokens';

<TextInput
  theme={INPUT_THEME}
  // ...
/>
```
✅ **Quando usar:** Telas que sempre usam modo claro
⚠️ **Limitação:** Não se adapta ao dark mode

---

#### 2. **getInputTheme(isDark)** (Dinâmico - Recomendado)
```typescript
import { getInputTheme } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

const MyScreen = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <TextInput
      theme={getInputTheme(isDarkMode)}
      // ...
    />
  );
};
```
✅ **Quando usar:** Telas que suportam light/dark mode
✅ **Vantagem:** Se adapta automaticamente ao tema

---

#### 3. **INPUT_THEME_DARK / INPUT_THEME_LIGHT** (Constantes)
```typescript
import { INPUT_THEME_DARK, INPUT_THEME_LIGHT } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

const MyScreen = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <TextInput
      theme={isDarkMode ? INPUT_THEME_DARK : INPUT_THEME_LIGHT}
      // ...
    />
  );
};
```
✅ **Quando usar:** Alternativa ao `getInputTheme()`
✅ **Vantagem:** Mais legível em alguns casos

---

## 🌈 Cores com Transparência

### hexToRgba() - Função Utilitária

```typescript
import { hexToRgba } from '@shared/utils/colorUtils';
import { COLORS } from '@presentation/theme/designTokens';

// ✅ Correto - Usa tokens centralizados
backgroundColor: hexToRgba(COLORS.white, 0.5)

// ❌ Errado - Hardcoded
backgroundColor: 'rgba(255, 255, 255, 0.5)'
```

### Cores Adaptativas ao Tema

```typescript
import { useTheme } from '@contexts/ThemeContext';
import { COLORS } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

const MyComponent = () => {
  const { isDarkMode } = useTheme();
  
  const overlayColor = isDarkMode 
    ? hexToRgba(COLORS.white, 0.1)  // Sutil no dark
    : hexToRgba(COLORS.black, 0.3); // Visível no light
    
  return <View style={{ backgroundColor: overlayColor }} />;
};
```

---

## 📊 Comparação de Valores

### Background de Inputs

| Modo | Opacidade | Valor |
|------|-----------|-------|
| **Light** | 50% | `rgba(255, 255, 255, 0.5)` |
| **Dark** | 10% | `rgba(255, 255, 255, 0.1)` |

### Text Colors

| Modo | Tipo | Cor |
|------|------|-----|
| **Light** | onSurface | `COLORS.gray[900]` (escuro) |
| **Light** | onSurfaceVariant | `COLORS.gray[600]` (médio) |
| **Dark** | onSurface | `COLORS.gray[100]` (claro) |
| **Dark** | onSurfaceVariant | `COLORS.gray[400]` (médio) |

---

## 🔄 Migração de Código Existente

### Antes (Hardcoded):
```typescript
<TextInput
  theme={{ 
    colors: { 
      background: 'rgba(255,255,255,0.5)', 
      onSurface: COLORS.gray[900], 
      onSurfaceVariant: COLORS.gray[600] 
    } 
  }}
/>
```

### Depois (Centralizado):
```typescript
import { getInputTheme } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

const { isDarkMode } = useTheme();

<TextInput
  theme={getInputTheme(isDarkMode)}
/>
```

---

## 🎨 Cores Disponíveis

### Paleta Principal
- `COLORS.primary[500]` - Cor primária
- `COLORS.secondary[500]` - Cor secundária
- `COLORS.success[500]` - Verde (sucesso)
- `COLORS.error[500]` - Vermelho (erro)
- `COLORS.warning[500]` - Amarelo (aviso)
- `COLORS.info[500]` - Azul (informação)

### Cores Neutras
- `COLORS.white` - Branco puro
- `COLORS.black` - Preto puro
- `COLORS.gray[100]` até `COLORS.gray[900]` - Escala de cinza

### Cores Especiais
- `COLORS.social.google` - `#DB4437`
- `COLORS.social.facebook` - `#4267B2`
- `COLORS.social.apple` - `#000000`

---

## ✅ Checklist de Boas Práticas

- [ ] Sempre use `getInputTheme(isDarkMode)` em telas com suporte a dark mode
- [ ] Use `hexToRgba()` para transparências ao invés de valores hardcoded
- [ ] Importe cores de `@presentation/theme/designTokens`
- [ ] Teste sua tela em **ambos** os modos (claro e escuro)
- [ ] Evite cores hardcoded como `'#FF0000'` ou `'rgba(255,0,0,0.5)'`

---

## 🚀 Exemplo Completo

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS, getInputTheme } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

const MyScreen = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? COLORS.gray[900] : COLORS.gray[100] }
    ]}>
      <TextInput
        label="Nome"
        theme={getInputTheme(isDarkMode)}
        style={styles.input}
      />
      
      <View style={[
        styles.card,
        { 
          backgroundColor: hexToRgba(
            isDarkMode ? COLORS.white : COLORS.black, 
            0.1
          ) 
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
  },
});

export default MyScreen;
```

---

## 📚 Recursos Adicionais

- **Design Tokens:** `/src/presentation/theme/designTokens.ts`
- **Color Utils:** `/src/shared/utils/colorUtils.ts`
- **Theme Context:** `/src/contexts/ThemeContext.tsx`

---

**Última atualização:** 2026-01-12
**Versão:** 2.0
