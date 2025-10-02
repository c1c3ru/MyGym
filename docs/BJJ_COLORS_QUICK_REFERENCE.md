# 🎨 Referência Rápida - Cores BJJ Control

**Guia rápido para uso das novas cores no MyGym**

---

## 🚀 Comandos Úteis

### Iniciar App com Cache Limpo
```bash
npx expo start --clear
```

### Validar Cores
```bash
./scripts/validate-bjj-colors.sh
```

### Remover Backups (após aprovação)
```bash
find src -name "*.backup-bjj" -delete
```

---

## 🎨 Cores Principais

### Backgrounds
```javascript
import { COLORS } from '@presentation/theme/designTokens';

// Preto profundo (fundo principal)
backgroundColor: COLORS.background.default  // #0A0A0A

// Cinza muito escuro (cards)
backgroundColor: COLORS.background.paper    // #1C1C1C

// Cinza escuro (modais/elevados)
backgroundColor: COLORS.background.elevated // #242424

// Branco (inputs/áreas claras)
backgroundColor: COLORS.background.light    // #F5F5F5
```

### Texto
```javascript
// Branco puro (títulos)
color: COLORS.text.primary      // #FFFFFF

// Cinza claro (subtítulos)
color: COLORS.text.secondary    // #BDBDBD

// Cinza médio (desabilitado)
color: COLORS.text.disabled     // #9E9E9E

// Cinza (hints/placeholders)
color: COLORS.text.hint         // #757575
```

### Bordas
```javascript
// Cinza muito escuro (bordas sutis)
borderColor: COLORS.border.light    // #2A2A2A

// Cinza escuro (bordas padrão)
borderColor: COLORS.border.default  // #424242

// Cinza médio (bordas destacadas)
borderColor: COLORS.border.dark     // #757575
```

### Cards
```javascript
// Card padrão (uso geral)
backgroundColor: COLORS.card.default.background  // #1C1C1C
borderColor: COLORS.card.default.border          // #2A2A2A

// Card elevado (modais/drawers)
backgroundColor: COLORS.card.elevated.background // #242424

// Card destacado (selecionado/ativo)
backgroundColor: COLORS.card.highlighted.background // #2A2A2A
borderColor: COLORS.card.highlighted.border         // #FF4757

// Card claro (destaques especiais - estilo BJJ Control)
backgroundColor: COLORS.card.light.background    // #FFF5F5
borderColor: COLORS.card.light.border            // #E0E0E0
color: COLORS.card.light.text                    // #424242

// 🎨 Card premium (neutros refinados - lista de alunos/turmas)
backgroundColor: COLORS.card.premium.background  // #0D0C0D
borderColor: COLORS.card.premium.border          // #595859
color: COLORS.card.premium.text                  // #D9D9D9

// Card secundário (neutros - modais, seções)
backgroundColor: COLORS.card.secondary.background // #262626
borderColor: COLORS.card.secondary.border         // #595859
color: COLORS.card.secondary.text                 // #8C8B8C
```

### Cores Neutras Refinadas
```javascript
// Neutros para cards e elementos sutis
COLORS.neutral.darkest   // #0D0C0D - Preto refinado (cards premium)
COLORS.neutral.dark      // #262626 - Cinza muito escuro (cards secundários)
COLORS.neutral.medium    // #595859 - Cinza médio (separadores, bordas)
COLORS.neutral.light     // #8C8B8C - Cinza claro (texto secundário)
COLORS.neutral.lighter   // #D9D9D9 - Cinza muito claro (placeholders)
```

### Botões
```javascript
// Botão primário (ação principal)
backgroundColor: COLORS.button.primary.background  // #FF4757
color: COLORS.button.primary.text                  // #FFFFFF

// Botão secundário
backgroundColor: COLORS.button.secondary.background // #424242
color: COLORS.button.secondary.text                 // #FFFFFF

// Botão de sucesso
backgroundColor: COLORS.button.success.background   // #4CAF50
color: COLORS.button.success.text                   // #FFFFFF

// Botão de perigo
backgroundColor: COLORS.button.danger.background    // #F44336
color: COLORS.button.danger.text                    // #FFFFFF

// Botão outline
borderColor: COLORS.button.outline.border           // #FF4757
color: COLORS.button.outline.text                   // #FF4757
```

---

## 📋 Exemplos Práticos

### Tela Completa
```javascript
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,  // Preto profundo
    padding: SPACING.base,
  },
  card: {
    backgroundColor: COLORS.card.default.background,  // Cinza muito escuro
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.card.default.border,  // Borda sutil
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,  // Branco
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,  // Cinza claro
  },
});
```

### Card com Botão
```javascript
<View style={styles.card}>
  <Text style={styles.title}>Título do Card</Text>
  <Text style={styles.subtitle}>Subtítulo</Text>
  
  <TouchableOpacity
    style={{
      backgroundColor: COLORS.button.primary.background,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      marginTop: SPACING.md,
    }}
  >
    <Text style={{ color: COLORS.button.primary.text }}>
      Ação Principal
    </Text>
  </TouchableOpacity>
</View>
```

### Card Claro (Destaque Especial)
```javascript
<View
  style={{
    backgroundColor: COLORS.card.light.background,  // Rosa claro
    borderWidth: 1,
    borderColor: COLORS.card.light.border,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
  }}
>
  <Text style={{ color: COLORS.card.light.text }}>
    Conteúdo destacado (estilo BJJ Control)
  </Text>
</View>
```

### Lista com Separadores
```javascript
<FlatList
  data={items}
  ItemSeparatorComponent={() => (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border.light,  // Separador sutil
        marginVertical: SPACING.sm,
      }}
    />
  )}
  renderItem={({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
    </View>
  )}
/>
```

---

## ⚠️ Não Fazer

### ❌ Cores Hardcoded
```javascript
// ❌ NÃO FAZER
backgroundColor: '#0D0D0D'
backgroundColor: '#1A1A1A'
color: '#E0E0E0'

// ✅ FAZER
backgroundColor: COLORS.background.default
backgroundColor: COLORS.background.paper
color: COLORS.text.secondary
```

### ❌ Valores Mágicos
```javascript
// ❌ NÃO FAZER
padding: 16
fontSize: 24
borderRadius: 8

// ✅ FAZER
padding: SPACING.base
fontSize: FONT_SIZE.xl
borderRadius: BORDER_RADIUS.md
```

---

## 🎯 Padrões de Uso

### Hierarquia Visual
```
Background (#0A0A0A) 
  └─ Cards (#1C1C1C)
      └─ Modais (#242424)
          └─ Elementos destacados (#FF4757)
```

### Contraste de Texto
```
Fundo Escuro (#0A0A0A, #1C1C1C):
  ├─ Texto principal: #FFFFFF
  ├─ Texto secundário: #BDBDBD
  └─ Texto desabilitado: #9E9E9E

Fundo Claro (#FFF5F5):
  └─ Texto: #424242
```

### Bordas
```
Sutis (default): #2A2A2A
Padrão: #424242
Destacadas: #757575
Ativas: #FF4757
```

---

## 🔍 Debugging

### Verificar Cor Atual
```javascript
console.log('Background:', COLORS.background.default);
console.log('Card:', COLORS.card.default.background);
console.log('Text:', COLORS.text.primary);
```

### Testar Contraste
Use ferramentas online:
- https://webaim.org/resources/contrastchecker/
- https://contrast-ratio.com/

**Mínimo WCAG AA:**
- Texto normal: 4.5:1
- Texto grande: 3:1
- Elementos UI: 3:1

---

## 📚 Documentação Completa

- **Plano:** `/docs/COLOR_UPDATE_PLAN.md`
- **Relatório:** `/docs/BJJ_COLORS_MIGRATION_REPORT.md`
- **Testes:** `/docs/BJJ_COLORS_VISUAL_TEST_GUIDE.md`
- **Resumo:** `/docs/BJJ_COLORS_FINAL_SUMMARY.md`
- **Esta Referência:** `/docs/BJJ_COLORS_QUICK_REFERENCE.md`

---

## 🆘 Suporte

### Problema: Cores não mudaram
```bash
# Limpar cache completamente
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

### Problema: Contraste ruim
Verifique se está usando as cores corretas:
- Background: `COLORS.background.default` (#0A0A0A)
- Cards: `COLORS.card.default.background` (#1C1C1C)
- Texto: `COLORS.text.secondary` (#BDBDBD)

### Problema: Bordas não visíveis
Use bordas mais sutis:
```javascript
borderColor: COLORS.border.light  // #2A2A2A (mais sutil)
```

---

**Última atualização:** 2025-10-02  
**Versão:** 1.0.0
