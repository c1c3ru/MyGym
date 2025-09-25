# 🚀 Melhores Práticas - MyGym App

Este documento descreve as melhores práticas implementadas no projeto MyGym, seguindo as diretrizes modernas de React Native.

## 📁 Estrutura do Projeto

### Clean Architecture Implementada
```
src/
├── presentation/     # UI Layer
├── domain/          # Business Logic
├── infrastructure/  # External Services
├── shared/          # Utilities
└── features/        # Feature-based modules
```

## 🔧 Aliases de Importação

### Configuração no babel.config.js
```javascript
alias: {
  '@': './src',
  '@components': './src/presentation/components',
  '@screens': './src/presentation/screens',
  '@hooks': './src/presentation/hooks',
  '@services': './src/infrastructure/services',
  '@utils': './src/shared/utils',
  '@assets': './assets'
}
```

### Uso nos Componentes
```javascript
// ❌ Antes (caminhos relativos longos)
import Button from '../../../presentation/components/Button';
import { Logger } from '../../../shared/utils/logger';

// ✅ Depois (aliases limpos)
import Button from '@components/Button';
import { Logger } from '@utils/logger';
```

## 🎨 Estilização

### Separação de Estilos
```
components/
├── Button/
│   ├── Button.js
│   ├── Button.styles.js
│   └── index.js
```

### Exemplo de Implementação
```javascript
// Button.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007bff',
  },
});

// Button.js
import styles from './Button.styles';
```

## 🔧 Props e Componentes

### Desestruturação de Props
```javascript
// ✅ Bom - Desestruturação clara
const MyComponent = ({ title, subtitle, onPress, disabled = false }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
      <Text>{subtitle}</Text>
    </TouchableOpacity>
  );
};

// ❌ Evitar - Props não desestruturadas
const MyComponent = (props) => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
};
```

### Memo para Performance
```javascript
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Componente só re-renderiza se props mudarem
  return <ComplexUI data={data} onUpdate={onUpdate} />;
});
```

## 📊 Logging

### Sistema de Log Implementado
```javascript
import { Logger } from '@utils/logger';

// Diferentes níveis de log
Logger.debug('Debug information');
Logger.info('General information');
Logger.warn('Warning message');
Logger.error('Error occurred');

// Logs contextuais
Logger.auth('User logged in');
Logger.api('API call completed');
Logger.firebase('Firestore query executed');

// Performance tracking
Logger.performance('API_CALL', 250);

// Error com contexto
Logger.errorWithContext(error, { userId, action: 'login' });
```

## 🛡️ Error Handling

### Error Boundary Melhorado
```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Logger.errorWithContext(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });
    
    // Em produção, enviar para analytics
    if (!__DEV__) {
      // Sentry.captureException(error);
    }
  }
}
```

## ⚡ Performance

### Hook de Performance
```javascript
import { usePerformance } from '@hooks/usePerformance';

const MyComponent = () => {
  const { measureAsync, measureSync } = usePerformance();

  const handleApiCall = async () => {
    const result = await measureAsync('API_CALL', async () => {
      return await apiService.getData();
    });
  };

  const handleCalculation = () => {
    const result = measureSync('CALCULATION', () => {
      return heavyCalculation();
    });
  };
};
```

## 🧪 Testing

### Estrutura de Testes
```
__tests__/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
└── e2e/           # Testes end-to-end
```

### Exemplo de Teste
```javascript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '@components/Button';

describe('Button Component', () => {
  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Test" onPress={mockOnPress} testID="test-button" />
    );
    
    fireEvent.press(getByTestId('test-button'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

## 🔄 State Management

### Preferências de Estado
1. **Estado Local**: Para dados específicos do componente
2. **Context API**: Para estado simples compartilhado
3. **Redux Toolkit**: Para estado complexo global

### Exemplo com Context
```javascript
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## 📱 Acessibilidade

### Implementação de Acessibilidade
```javascript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Salvar dados"
  accessibilityHint="Salva as informações inseridas"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Salvar</Text>
</TouchableOpacity>
```

## 🚀 Checklist de Qualidade

### Antes de Fazer Commit
- [ ] Código segue padrões de estilo
- [ ] Imports organizados com aliases
- [ ] Componentes têm PropTypes/TypeScript
- [ ] Logs apropriados implementados
- [ ] Error handling adequado
- [ ] Testes unitários passando
- [ ] Performance verificada
- [ ] Acessibilidade implementada

### Antes de Deploy
- [ ] Expo Doctor sem erros
- [ ] Build de produção funcionando
- [ ] Testes E2E passando
- [ ] Logs de produção configurados
- [ ] Analytics configurado
- [ ] Crash reporting ativo

## 📚 Recursos Adicionais

- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Expo Development Guide](https://docs.expo.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript with React Native](https://reactnative.dev/docs/typescript)

---

**Lembre-se**: Consistência é mais importante que perfeição. Siga estas práticas em todo o projeto para manter a qualidade e facilitar a manutenção.
