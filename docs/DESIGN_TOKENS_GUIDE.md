# 🎨 Guia de Design Tokens - MyGym

## 📋 Índice

1. [Introdução](#introdução)
2. [Por que usar Design Tokens?](#por-que-usar-design-tokens)
3. [Tokens Disponíveis](#tokens-disponíveis)
4. [Como Usar](#como-usar)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Migração de Código Existente](#migração-de-código-existente)
7. [Boas Práticas](#boas-práticas)
8. [FAQ](#faq)

---

## 📖 Introdução

Design Tokens são valores de design centralizados que garantem consistência visual em todo o aplicativo. Em vez de usar valores hardcoded como `#4CAF50` ou `padding: 16`, usamos tokens como `COLORS.primary[500]` e `SPACING.base`.

---

## 🎯 Por que usar Design Tokens?

### ✅ Benefícios

- **Consistência**: Todos os componentes usam os mesmos valores
- **Manutenibilidade**: Altere em um lugar, aplique em todos
- **Dark Mode**: Facilita implementação de temas
- **Acessibilidade**: Contraste e tamanhos padronizados
- **Escalabilidade**: Adicione novos valores facilmente
- **Documentação**: Valores auto-documentados

### ❌ Problemas com Hardcoded

```javascript
// ❌ EVITE - Valores hardcoded
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',  // Qual cor é essa?
    padding: 16,                  // Por que 16?
  },
  title: {
    fontSize: 24,                 // Tamanho consistente?
    color: '#333',                // Texto primário?
  }
});
```

```javascript
// ✅ PREFIRA - Design Tokens
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.light,  // Claro e semântico
    padding: SPACING.base,                      // Padrão do app
  },
  title: {
    fontSize: FONT_SIZE.xxl,                    // Tamanho de título
    color: COLORS.text.primary,                 // Texto principal
  }
});
```

---

## 🎨 Tokens Disponíveis

### 1. **COLORS** - Cores

#### Cores Primárias
```javascript
COLORS.primary[50]   // #E8F5E9 - Muito claro
COLORS.primary[100]  // #C8E6C9
COLORS.primary[200]  // #A5D6A7
COLORS.primary[300]  // #81C784
COLORS.primary[400]  // #66BB6A
COLORS.primary[500]  // #4CAF50 - Principal
COLORS.primary[600]  // #43A047
COLORS.primary[700]  // #388E3C
COLORS.primary[800]  // #2E7D32
COLORS.primary[900]  // #1B5E20 - Muito escuro
```

#### Cores Semânticas
```javascript
COLORS.success[500]  // Verde de sucesso
COLORS.error[500]    // Vermelho de erro
COLORS.warning[500]  // Laranja de aviso
COLORS.info[500]     // Azul de informação
```

#### Cores de Texto
```javascript
COLORS.text.primary    // #212121 - Texto principal
COLORS.text.secondary  // #757575 - Texto secundário
COLORS.text.disabled   // #BDBDBD - Texto desabilitado
COLORS.text.hint       // #9E9E9E - Texto de dica
```

#### Cores de Fundo
```javascript
COLORS.background.light   // #F5F5F5 - Fundo claro
COLORS.background.dark    // #303030 - Fundo escuro
COLORS.background.paper   // #FFFFFF - Fundo de card
```

#### Cores Básicas
```javascript
COLORS.white    // #FFFFFF
COLORS.black    // #000000
COLORS.gray[50] // #FAFAFA
COLORS.gray[100] // #F5F5F5
// ... até gray[900]
```

### 2. **SPACING** - Espaçamentos

```javascript
SPACING.none   // 0
SPACING.xs     // 4px
SPACING.sm     // 8px
SPACING.md     // 12px
SPACING.base   // 16px
SPACING.lg     // 20px
SPACING.xl     // 24px
SPACING.xxl    // 32px
SPACING.xxxl   // 40px
SPACING.huge   // 48px
```

### 3. **FONT_SIZE** - Tamanhos de Fonte

```javascript
FONT_SIZE.xxs     // 10px
FONT_SIZE.xs      // 12px
FONT_SIZE.sm      // 14px
FONT_SIZE.base    // 16px
FONT_SIZE.md      // 18px
FONT_SIZE.lg      // 20px
FONT_SIZE.xl      // 24px
FONT_SIZE.xxl     // 28px
FONT_SIZE.xxxl    // 32px
FONT_SIZE.display // 40px
```

### 4. **FONT_WEIGHT** - Pesos de Fonte

```javascript
FONT_WEIGHT.light      // '300'
FONT_WEIGHT.normal     // '400'
FONT_WEIGHT.medium     // '500'
FONT_WEIGHT.semibold   // '600'
FONT_WEIGHT.bold       // '700'
FONT_WEIGHT.extrabold  // '800'
```

### 5. **BORDER_RADIUS** - Raios de Borda

```javascript
BORDER_RADIUS.none   // 0
BORDER_RADIUS.sm     // 4px
BORDER_RADIUS.md     // 8px
BORDER_RADIUS.lg     // 12px
BORDER_RADIUS.xl     // 16px
BORDER_RADIUS.xxl    // 20px
BORDER_RADIUS.full   // 9999px (círculo)
```

### 6. **ELEVATION** - Sombras

```javascript
ELEVATION.none    // Sem sombra
ELEVATION.sm      // Sombra pequena
ELEVATION.base    // Sombra padrão
ELEVATION.md      // Sombra média
ELEVATION.lg      // Sombra grande
ELEVATION.xl      // Sombra extra grande
ELEVATION.xxl     // Sombra máxima
```

---

## 🚀 Como Usar

### Passo 1: Importar os Tokens

```javascript
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
```

### Passo 2: Usar nos Estilos

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.light,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary[500],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
});
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Card de Produto

```javascript
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, ELEVATION } from '@presentation/theme/designTokens';

const ProductCard = () => (
  <View style={styles.card}>
    <Image source={product.image} style={styles.image} />
    <View style={styles.content}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>R$ {product.price}</Text>
      <Button style={styles.button}>Comprar</Button>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...ELEVATION.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  content: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary[500],
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary[500],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
});
```

### Exemplo 2: Formulário

```javascript
const LoginForm = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Login</Text>
    <TextInput style={styles.input} placeholder="Email" />
    <TextInput style={styles.input} placeholder="Senha" secureTextEntry />
    <Button style={styles.button}>Entrar</Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: SPACING.base,
    backgroundColor: COLORS.background.light,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.text.primary,
  },
  button: {
    backgroundColor: COLORS.primary[500],
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
});
```

---

## 🔄 Migração de Código Existente

### Opção 1: Script Automático

```bash
# Migrar um arquivo específico
node scripts/migrate-to-design-tokens.js src/presentation/screens/admin/AdminDashboard.js

# O script irá:
# 1. Criar backup (.backup)
# 2. Adicionar imports
# 3. Substituir valores hardcoded
# 4. Salvar arquivo migrado
```

### Opção 2: Manual

1. **Adicionar import:**
```javascript
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
```

2. **Substituir cores:**
```javascript
// Antes
backgroundColor: '#4CAF50'
// Depois
backgroundColor: COLORS.primary[500]
```

3. **Substituir espaçamentos:**
```javascript
// Antes
padding: 16
// Depois
padding: SPACING.base
```

4. **Substituir fontes:**
```javascript
// Antes
fontSize: 24
fontWeight: 'bold'
// Depois
fontSize: FONT_SIZE.xxl
fontWeight: FONT_WEIGHT.bold
```

---

## ✨ Boas Práticas

### ✅ FAÇA

```javascript
// Use tokens semânticos
backgroundColor: COLORS.background.light
color: COLORS.text.primary

// Use espaçamentos consistentes
padding: SPACING.base
margin: SPACING.md

// Use tamanhos de fonte da escala
fontSize: FONT_SIZE.lg

// Use pesos de fonte padronizados
fontWeight: FONT_WEIGHT.bold
```

### ❌ NÃO FAÇA

```javascript
// Não use valores hardcoded
backgroundColor: '#f8f9fa'
color: '#333'

// Não use valores arbitrários
padding: 17
margin: 13

// Não use tamanhos fora da escala
fontSize: 23

// Não use strings de peso
fontWeight: 'bold' // Use FONT_WEIGHT.bold
```

---

## ❓ FAQ

### P: Posso criar meus próprios tokens?

**R:** Sim! Adicione em `/src/presentation/theme/designTokens.js`:

```javascript
export const CUSTOM_SPACING = {
  tiny: 2,
  massive: 64,
};
```

### P: E se eu precisar de uma cor específica?

**R:** Adicione à paleta de cores no `designTokens.js` ou use variações:

```javascript
// Adicionar nova cor
COLORS.brand = {
  500: '#YOUR_COLOR',
};

// Ou usar variação existente
COLORS.primary[300] // Mais claro
COLORS.primary[700] // Mais escuro
```

### P: Como funciona o Dark Mode?

**R:** Os tokens facilitam! Basta trocar os valores:

```javascript
const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
```

### P: Preciso migrar tudo de uma vez?

**R:** Não! Migre gradualmente, começando pelas telas mais importantes.

---

## 📚 Recursos Adicionais

- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [Material Design Color System](https://material.io/design/color)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## 🤝 Contribuindo

Encontrou um valor hardcoded? Abra uma PR com a migração!

1. Use o script de migração
2. Teste visualmente
3. Commit com mensagem clara
4. Abra PR

---

**Última atualização:** 2025-09-30  
**Versão:** 1.0.0
