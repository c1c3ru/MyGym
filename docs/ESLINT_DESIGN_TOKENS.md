# 🔍 ESLint para Design Tokens

## Visão Geral

O ESLint está configurado para **detectar automaticamente** valores hardcoded e garantir o uso correto dos Design Tokens.

---

## 🎯 Regras Ativas

### 1. **no-color-literals** (react-native)
Detecta cores hardcoded em código:

```javascript
// ❌ ERRO
<View style={{ backgroundColor: '#4CAF50' }} />

// ✅ CORRETO
<View style={{ backgroundColor: COLORS.primary[500] }} />
```

### 2. **no-restricted-syntax**
Detecta padrões problemáticos:

#### a) Cores Hexadecimais
```javascript
// ❌ ERRO
const color = '#FF5722';

// ✅ CORRETO
const color = COLORS.error[500];
```

#### b) Strings 'COLORS.xxx'
```javascript
// ❌ ERRO
const color = 'COLORS.primary[500]';

// ✅ CORRETO
const color = COLORS.primary[500];
```

### 3. **no-magic-numbers**
Detecta números mágicos em estilos:

```javascript
// ❌ ERRO
const styles = StyleSheet.create({
  container: {
    padding: 16,
    fontSize: 24,
  }
});

// ✅ CORRETO
const styles = StyleSheet.create({
  container: {
    padding: SPACING.base,
    fontSize: FONT_SIZE.xxl,
  }
});
```

---

## 🚀 Como Usar

### Executar ESLint

```bash
# Verificar todos os arquivos
npm run lint

# Verificar arquivo específico
npx eslint src/presentation/screens/MyScreen.js

# Corrigir automaticamente (quando possível)
npx eslint src/presentation/screens/MyScreen.js --fix
```

### Integração com IDE

O ESLint já está integrado com:
- ✅ VS Code (via extensão ESLint)
- ✅ WebStorm / IntelliJ
- ✅ Sublime Text (via plugin)

Você verá **avisos em tempo real** enquanto digita!

---

## 📋 Mensagens de Erro

| Mensagem | Significado | Solução |
|----------|-------------|---------|
| `🎨 Evite cores hardcoded` | Cor hex detectada | Use `COLORS.*` |
| `⚠️ COLORS deve ser usado sem aspas` | String 'COLORS.xxx' | Remova as aspas |
| `📏 Use SPACING/FONT_SIZE` | Número mágico | Use Design Token |

---

## 🛠️ Configuração

### Arquivo: `.eslintrc.js`

```javascript
rules: {
  'react-native/no-color-literals': 'warn',
  'no-restricted-syntax': [
    'warn',
    {
      selector: "Literal[value=/#[0-9A-Fa-f]{3,6}/]",
      message: '🎨 Use COLORS do Design Tokens',
    },
    {
      selector: "Literal[value=/^COLORS\\./]",
      message: '⚠️ COLORS sem aspas',
    },
  ],
  'no-magic-numbers': [
    'warn',
    {
      ignore: [0, 1, -1, 2],
      ignoreArrayIndexes: true,
    },
  ],
}
```

---

## 🎓 Exceções

### Arquivos de Tema
Números mágicos são **permitidos** em:
- `**/theme/**/*.js`
- `**/*.styles.js`
- `**/designTokens.js`

### Arquivos de Teste
Todas as regras são **desabilitadas** em:
- `**/__tests__/**/*.js`
- `**/*.test.js`
- `**/*.spec.js`

---

## 📊 Scripts Disponíveis

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "lint:report": "eslint src/ -f json -o eslint-report.json"
  }
}
```

---

## 🔧 Desabilitar Temporariamente

### Para uma linha:
```javascript
// eslint-disable-next-line no-magic-numbers
const padding = 16;
```

### Para um bloco:
```javascript
/* eslint-disable no-magic-numbers */
const styles = {
  padding: 16,
  margin: 8,
};
/* eslint-enable no-magic-numbers */
```

### Para um arquivo inteiro:
```javascript
/* eslint-disable react-native/no-color-literals */
// Código aqui...
```

---

## ✅ Benefícios

1. **Detecção Automática** - Erros aparecem enquanto você digita
2. **Correção Automática** - Muitos problemas podem ser corrigidos com `--fix`
3. **Prevenção** - Impede que novos hardcoded entrem no código
4. **Educação** - Mensagens claras ensinam boas práticas
5. **CI/CD** - Pode ser integrado no pipeline de deploy

---

## 🎯 Próximos Passos

1. Execute `npm run lint` para ver todos os avisos
2. Use `npm run lint:fix` para corrigir automaticamente
3. Configure seu IDE para mostrar avisos em tempo real
4. Adicione ao CI/CD: `npm run lint` antes do deploy

---

## 📚 Recursos

- [ESLint Docs](https://eslint.org/docs/rules/)
- [React Native ESLint Plugin](https://github.com/Intellicode/eslint-plugin-react-native)
- [Design Tokens Guide](/docs/DESIGN_TOKENS_GUIDE.md)

---

**💡 Dica:** Execute `npm run lint` regularmente para manter o código limpo!
