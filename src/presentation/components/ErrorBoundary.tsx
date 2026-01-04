import React, { Component, ReactNode } from 'react';
import { BORDER_RADIUS, Button, FONT_SIZE, Platform } from 'react-native';
import { Card, SPACING, StyleSheet, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, View } from '@presentation/theme/designTokens';
import { Logger } from '@utils/logger';
// import crashlyticsService from '@infrastructure/services/crashlyticsService'; // Serviço não implementado

interface ErrorInfo {
  componentStack: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detalhado usando o sistema centralizado
    Logger.errorWithContext(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });

    this.setState({ errorInfo });

    // Callback customizado para logging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, enviar para serviço de monitoramento
    if (!(globalThis as any).__DEV__) {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implementar reportagem para Crashlytics quando o serviço estiver disponível
    // crashlyticsService.recordError(error, {
    //   errorType: 'react_error_boundary',
    //   componentStack: errorInfo.componentStack,
    //   errorBoundary: true
    // });

    console.log('📊 Erro capturado (Crashlytics não implementado):', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // Para mobile, poderia usar Updates.reloadAsync() do Expo
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI padrão melhorada
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content style={styles.content}>
              <Ionicons 
                name="alert-circle-outline" 
                size={64} 
                color={COLORS.error[500]} 
              />
              <Text style={styles.title}>
                Ops! Algo deu errado
              </Text>
              <Text style={styles.message}>
                {(globalThis as any).__DEV__ 
                  ? `Erro: ${this.state.error?.message || 'Erro desconhecido'}`
                  : 'Ocorreu um erro inesperado. Tente novamente ou reinicie o aplicativo.'
                }
              </Text>
              
              <View style={styles.buttonContainer}>
                <Button 
                  mode="contained" 
                  onPress={this.handleRetry}
                  style={[styles.button, styles.retryButton]}
                  icon="refresh"
                >
                  Tentar Novamente
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={this.handleReload}
                  style={[styles.button, styles.reloadButton]}
                  icon="reload"
                >
                  Recarregar App
                </Button>
              </View>

              {(globalThis as any).__DEV__ && this.state.error && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugText}>
                    Debug Info: {this.state.error.stack}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.gray[700],
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
    fontSize: FONT_SIZE.base,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  button: {
    width: '100%',
  },
  retryButton: {
    backgroundColor: COLORS.info[500],
  },
  reloadButton: {
    borderColor: COLORS.info[500],
  },
  debugContainer: {
    marginTop: SPACING.md,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.base,
    width: '100%',
  },
  debugText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[600],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default EnhancedErrorBoundary;