import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error, errorInfo) {
    const { onError, reportError = true } = this.props;
    
    this.setState({ errorInfo });
    
    // Log detalhado do erro
    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent,
      url: window?.location?.href
    });

    // Callback customizado para tratamento de erro
    if (onError) {
      onError(error, errorInfo, this.state.errorId);
    }

    // Reportar erro para serviço de analytics (se habilitado)
    if (reportError && this.reportErrorToService) {
      this.reportErrorToService(error, errorInfo);
    }
  }

  reportErrorToService = async (error, errorInfo) => {
    try {
      // Aqui você pode integrar com serviços como Sentry, Crashlytics, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent,
        url: window?.location?.href,
        props: this.props.errorContext || {}
      };

      // Exemplo de integração com serviço de monitoramento
      console.log('📊 Error report:', errorReport);
      
      // TODO: Implementar integração real com serviço de monitoramento
      // await analyticsService.reportError(errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    const { onRetry } = this.props;
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      showDetails: false
    });

    if (onRetry) {
      onRetry();
    }
  };

  toggleDetails = () => {
    this.setState(prevState => ({ 
      showDetails: !prevState.showDetails 
    }));
  };

  getErrorType = (error) => {
    if (error?.message?.includes('Network')) return 'network';
    if (error?.message?.includes('Firebase')) return 'firebase';
    if (error?.message?.includes('Permission')) return 'permission';
    if (error?.name === 'ChunkLoadError') return 'chunk';
    return 'generic';
  };

  getErrorMessage = (errorType) => {
    const messages = {
      network: 'Problema de conexão com a internet. Verifique sua conexão e tente novamente.',
      firebase: 'Erro no servidor. Tente novamente em alguns instantes.',
      permission: 'Você não tem permissão para acessar este recurso.',
      chunk: 'Erro ao carregar recursos. Recarregue a página.',
      generic: 'Ocorreu um erro inesperado. Tente novamente ou reinicie o aplicativo.'
    };
    return messages[errorType] || messages.generic;
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showErrorDetails = false } = this.props;
      const errorType = this.getErrorType(this.state.error);
      const errorMessage = this.getErrorMessage(errorType);

      // Se um componente fallback customizado foi fornecido
      if (fallback) {
        return fallback(this.state.error, this.handleRetry);
      }

      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Card style={styles.card}>
            <Card.Content style={styles.content}>
              <Ionicons 
                name={errorType === 'network' ? 'wifi-outline' : 'alert-circle-outline'} 
                size={64} 
                color="#F44336" 
              />
              
              <Title style={styles.title}>Ops! Algo deu errado</Title>
              
              <Paragraph style={styles.message}>
                {errorMessage}
              </Paragraph>

              <View style={styles.errorMeta}>
                <Chip icon="identifier" mode="outlined" style={styles.errorIdChip}>
                  ID: {this.state.errorId}
                </Chip>
                <Chip icon="clock-outline" mode="outlined" style={styles.timestampChip}>
                  {new Date().toLocaleTimeString()}
                </Chip>
              </View>

              <View style={styles.buttonContainer}>
                <Button 
                  mode="contained" 
                  onPress={this.handleRetry}
                  style={styles.retryButton}
                  icon="refresh"
                >
                  Tentar Novamente
                </Button>

                {showErrorDetails && (
                  <Button 
                    mode="outlined" 
                    onPress={this.toggleDetails}
                    style={styles.detailsButton}
                    icon={this.state.showDetails ? "chevron-up" : "chevron-down"}
                  >
                    {this.state.showDetails ? 'Ocultar' : 'Ver'} Detalhes
                  </Button>
                )}
              </View>

              {this.state.showDetails && showErrorDetails && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.errorDetails}>
                    <Title style={styles.detailsTitle}>Detalhes Técnicos</Title>
                    <Paragraph style={styles.errorText}>
                      <Text style={styles.errorLabel}>Erro:</Text> {this.state.error?.message}
                    </Paragraph>
                    {this.state.error?.stack && (
                      <Paragraph style={styles.stackTrace}>
                        <Text style={styles.errorLabel}>Stack Trace:</Text>
                        {'\n'}{this.state.error.stack}
                      </Paragraph>
                    )}
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  errorIdChip: {
    marginHorizontal: 4,
  },
  timestampChip: {
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#2196F3',
  },
  detailsButton: {
    borderColor: '#666',
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  errorLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  stackTrace: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});

export default EnhancedErrorBoundary;
