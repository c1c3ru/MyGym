/**
 * ESLint Rule: no-hardcoded-colors
 * 
 * Detecta e previne:
 * 1. Cores hexadecimais hardcoded (#4CAF50)
 * 2. Strings 'COLORS.xxx' que deveriam ser COLORS.xxx
 * 3. Atributos JSX sem chaves: color=COLORS.xxx
 * 4. Valores numéricos hardcoded em estilos
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Previne valores hardcoded, força uso de Design Tokens',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      hexColor: '🎨 Use COLORS do Design Tokens ao invés de cores hex (#{{value}})',
      colorString: '⚠️ COLORS.{{prop}} deve ser usado sem aspas',
      jsxWithoutBraces: '⚠️ Atributo JSX {{attr}} precisa de chaves: {{attr}}={COLORS.{{prop}}}',
      magicNumber: '📏 Use SPACING, FONT_SIZE ou BORDER_RADIUS ao invés de {{value}}',
    },
  },

  create(context) {
    return {
      // Detecta cores hex em strings
      Literal(node) {
        if (typeof node.value === 'string') {
          // Detecta #4CAF50, #fff, etc
          const hexColorRegex = /#[0-9A-Fa-f]{3,6}/;
          if (hexColorRegex.test(node.value)) {
            context.report({
              node,
              messageId: 'hexColor',
              data: { value: node.value },
            });
          }

          // Detecta 'COLORS.xxx' como string
          if (node.value.startsWith('COLORS.')) {
            const prop = node.value.substring(7);
            context.report({
              node,
              messageId: 'colorString',
              data: { prop },
              fix(fixer) {
                // Remove as aspas
                return fixer.replaceText(node, node.value);
              },
            });
          }
        }
      },

      // Detecta atributos JSX sem chaves
      JSXAttribute(node) {
        if (node.value && node.value.type === 'Literal') {
          const value = node.value.value;
          if (typeof value === 'string' && value.startsWith('COLORS.')) {
            const attrName = node.name.name;
            const prop = value.substring(7);
            context.report({
              node: node.value,
              messageId: 'jsxWithoutBraces',
              data: { attr: attrName, prop },
              fix(fixer) {
                return fixer.replaceText(node.value, `{${value}}`);
              },
            });
          }
        }
      },

      // Detecta números mágicos em propriedades de estilo
      Property(node) {
        if (node.value.type === 'Literal' && typeof node.value.value === 'number') {
          const key = node.key.name || node.key.value;
          const value = node.value.value;

          // Propriedades que devem usar Design Tokens
          const spacingProps = ['padding', 'margin', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 
                                'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'gap'];
          const fontProps = ['fontSize', 'lineHeight'];
          const borderProps = ['borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius'];

          // Ignora valores comuns (0, 1, 2, -1)
          if ([0, 1, 2, -1].includes(value)) return;

          if (spacingProps.includes(key) || fontProps.includes(key) || borderProps.includes(key)) {
            context.report({
              node: node.value,
              messageId: 'magicNumber',
              data: { value },
            });
          }
        }
      },
    };
  },
};
