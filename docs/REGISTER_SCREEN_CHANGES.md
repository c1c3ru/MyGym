# Script para atualizar RegisterScreen.tsx

## Mudanças necessárias:

1. Adicionar import: `import ModernCard from '@components/modern/ModernCard';`
2. Remover `getAuthCardColors` do import de authTheme
3. Substituir na linha ~244-248:
   ```tsx
   // DE:
   <View style={[
     styles.card,
     getAuthCardColors(isDarkMode),
   ]}>
     <Card.Content>
   
   // PARA:
   <ModernCard variant={isDarkMode ? 'dark' : 'light'} style={styles.card}>
     <View>
   ```
4. Substituir na linha ~487-489:
   ```tsx
   // DE:
     </Card.Content>
   </View>
   
   // PARA:
     </View>
   </ModernCard>
   ```

5. Remover do StyleSheet (linha ~585-600):
   ```tsx
   card: {
     borderRadius: BORDER_RADIUS.lg,
     borderWidth: 1.5,
     ...Platform.select({...}),
   },
   ```
   Manter apenas estilos de margem/padding se necessário.

## Status: Pendente de aplicação manual
