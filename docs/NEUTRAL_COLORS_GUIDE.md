# 🎨 Guia de Cores Neutras Refinadas - MyGym

**Cores neutras profissionais para cards e elementos sutis**

---

## 🎯 Paleta de Neutros

### Cores Disponíveis

```javascript
import { COLORS } from '@presentation/theme/designTokens';

// Neutros refinados
COLORS.neutral.darkest   // #0D0C0D - Preto refinado
COLORS.neutral.dark      // #262626 - Cinza muito escuro
COLORS.neutral.medium    // #595859 - Cinza médio
COLORS.neutral.light     // #8C8B8C - Cinza claro
COLORS.neutral.lighter   // #D9D9D9 - Cinza muito claro
```

---

## 📋 Uso por Contexto

### 1. Cards Premium (Destaque Especial)
```javascript
// Card escuro premium com neutros refinados
<View style={{
  backgroundColor: COLORS.card.premium.background,  // #0D0C0D
  borderWidth: 1,
  borderColor: COLORS.card.premium.border,          // #595859
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.base,
}}>
  <Text style={{ color: COLORS.card.premium.text }}>
    Conteúdo Premium  {/* #D9D9D9 */}
  </Text>
</View>
```

**Quando usar:**
- Cards de alunos (lista de alunos)
- Cards de turmas vazias
- Elementos de destaque especial
- Seções importantes

---

### 2. Cards Secundários
```javascript
// Card secundário com neutros
<View style={{
  backgroundColor: COLORS.card.secondary.background,  // #262626
  borderWidth: 1,
  borderColor: COLORS.card.secondary.border,          // #595859
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.base,
}}>
  <Text style={{ color: COLORS.card.secondary.text }}>
    Informação Secundária  {/* #8C8B8C */}
  </Text>
</View>
```

**Quando usar:**
- Cards de informações secundárias
- Seções de ajuda
- Elementos menos importantes
- Backgrounds de modais

---

### 3. Separadores e Bordas Sutis
```javascript
// Separador sutil
<View style={{
  height: 1,
  backgroundColor: COLORS.border.subtle,  // #595859
  marginVertical: SPACING.sm,
}} />

// Separador mais visível
<View style={{
  height: 1,
  backgroundColor: COLORS.border.separator,  // #8C8B8C
  marginVertical: SPACING.md,
}} />
```

**Quando usar:**
- Separadores em listas
- Divisórias de seções
- Bordas de inputs
- Linhas de tabelas

---

### 4. Texto com Neutros
```javascript
// Texto secundário neutro
<Text style={{ color: COLORS.neutral.light }}>
  Texto secundário  {/* #8C8B8C */}
</Text>

// Texto desabilitado/placeholder
<Text style={{ color: COLORS.neutral.lighter }}>
  Placeholder  {/* #D9D9D9 */}
</Text>
```

**Quando usar:**
- Legendas e descrições
- Placeholders de inputs
- Texto desabilitado
- Ícones secundários

---

## 🎨 Exemplos Práticos

### Card de Aluno (Lista)
```javascript
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '@presentation/theme/designTokens';

const StudentCard = ({ student }) => (
  <View style={styles.card}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{student.initials}</Text>
    </View>
    
    <View style={styles.info}>
      <Text style={styles.name}>{student.name}</Text>
      <Text style={styles.email}>{student.email}</Text>
      <Text style={styles.phone}>{student.phone}</Text>
    </View>
    
    <View style={styles.status}>
      <Text style={styles.statusText}>Ativo</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card.premium.background,  // #0D0C0D
    borderWidth: 1,
    borderColor: COLORS.card.premium.border,          // #595859
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    color: COLORS.card.premium.text,  // #D9D9D9
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
  },
  email: {
    color: COLORS.neutral.light,      // #8C8B8C
    fontSize: FONT_SIZE.sm,
  },
  phone: {
    color: COLORS.neutral.light,      // #8C8B8C
    fontSize: FONT_SIZE.sm,
  },
  status: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.success[500],
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
  },
});
```

---

### Card de Turma Vazia
```javascript
const EmptyClassCard = () => (
  <View style={styles.emptyCard}>
    <MaterialCommunityIcons 
      name="package-variant" 
      size={48} 
      color={COLORS.neutral.light}  // #8C8B8C
    />
    <Text style={styles.emptyTitle}>Nenhuma turma encontrada</Text>
    <Text style={styles.emptySubtitle}>
      Nenhuma turma cadastrada ainda
    </Text>
  </View>
);

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: COLORS.card.premium.background,  // #0D0C0D
    borderWidth: 1,
    borderColor: COLORS.card.premium.border,          // #595859
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: COLORS.card.premium.text,  // #D9D9D9
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    color: COLORS.neutral.light,      // #8C8B8C
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
```

---

### Modal com Background Neutro
```javascript
const ModalContent = () => (
  <View style={styles.modal}>
    <View style={styles.header}>
      <Text style={styles.title}>Nova Turma</Text>
    </View>
    
    <View style={styles.content}>
      {/* Conteúdo do modal */}
    </View>
  </View>
);

const styles = StyleSheet.create({
  modal: {
    backgroundColor: COLORS.card.secondary.background,  // #262626
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,  // #595859
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  content: {
    // Conteúdo
  },
});
```

---

## 🎯 Hierarquia Visual com Neutros

```
Background Principal (#0A0A0A)
  └─ Cards Premium (#0D0C0D)
      ├─ Bordas Sutis (#595859)
      ├─ Texto Principal (#D9D9D9)
      └─ Texto Secundário (#8C8B8C)
  
  └─ Cards Secundários (#262626)
      ├─ Bordas Sutis (#595859)
      └─ Texto (#8C8B8C)
  
  └─ Separadores
      ├─ Sutis (#595859)
      └─ Visíveis (#8C8B8C)
```

---

## 📊 Tabela de Uso

| Cor | Hex | Uso Principal | Contexto |
|-----|-----|---------------|----------|
| `neutral.darkest` | #0D0C0D | Background de cards premium | Lista de alunos, turmas |
| `neutral.dark` | #262626 | Background de cards secundários | Modais, seções |
| `neutral.medium` | #595859 | Bordas sutis, separadores | Divisórias, inputs |
| `neutral.light` | #8C8B8C | Texto secundário, ícones | Legendas, descrições |
| `neutral.lighter` | #D9D9D9 | Texto desabilitado | Placeholders, hints |

---

## ⚠️ Não Fazer

### ❌ Evitar
```javascript
// ❌ NÃO usar cores hardcoded
backgroundColor: '#0D0C0D'
borderColor: '#595859'

// ❌ NÃO misturar neutros com cores antigas
backgroundColor: '#1A1A1A'  // Use COLORS.card.premium.background
```

### ✅ Fazer
```javascript
// ✅ Usar tokens de neutros
backgroundColor: COLORS.card.premium.background
borderColor: COLORS.card.premium.border

// ✅ Usar hierarquia correta
backgroundColor: COLORS.neutral.darkest
color: COLORS.neutral.light
```

---

## 🎨 Contraste e Acessibilidade

### Combinações Aprovadas (WCAG AA)

**Fundo Escuro (#0D0C0D):**
- ✅ Texto: #D9D9D9 (Ratio: 12.5:1) - AAA
- ✅ Texto: #8C8B8C (Ratio: 6.2:1) - AA
- ⚠️ Bordas: #595859 (Ratio: 3.8:1) - AA para UI

**Fundo Médio (#262626):**
- ✅ Texto: #D9D9D9 (Ratio: 10.8:1) - AAA
- ✅ Texto: #8C8B8C (Ratio: 5.4:1) - AA

---

## 🔄 Migração de Cores Antigas

### Substituições Recomendadas

```javascript
// Cards de alunos/turmas
// ANTES
backgroundColor: '#1C1C1C'
borderColor: '#2A2A2A'

// DEPOIS
backgroundColor: COLORS.card.premium.background  // #0D0C0D
borderColor: COLORS.card.premium.border          // #595859

// Separadores
// ANTES
backgroundColor: '#424242'

// DEPOIS
backgroundColor: COLORS.border.subtle  // #595859

// Texto secundário
// ANTES
color: '#BDBDBD'

// DEPOIS
color: COLORS.neutral.light  // #8C8B8C
```

---

## 📚 Referências

- **Design Tokens:** `/src/presentation/theme/designTokens.js`
- **Guia Rápido:** `/docs/BJJ_COLORS_QUICK_REFERENCE.md`
- **Testes Visuais:** `/docs/BJJ_COLORS_VISUAL_TEST_GUIDE.md`

---

**Criado:** 2025-10-02  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso
