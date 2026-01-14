import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Chip, Divider, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";

class ErrorBoundaryInner extends React.Component {
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
      const { fallback, showErrorDetails = false, getString } = this.props;
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
                color={COLORS.error[500]}
              />

              <Text style={styles.title}>Ops! Algo deu errado</Text>

              <Text style={styles.message}>
                {errorMessage}
              </Text>

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
                    {this.state.showDetails ? getString('hide') : 'Ver'} Detalhes
                  </Button>
                )}
              </View>

              {this.state.showDetails && showErrorDetails && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.errorDetails}>
                    <Text style={styles.detailsTitle}>Detalhes Técnicos</Text>
                    <Text style={styles.errorText}>
                      <Text style={styles.errorLabel}>Erro:</Text> {this.state.error?.message}
                    </Text>
                    {this.state.error?.stack && (
                      <Text style={styles.stackTrace}>
                        <Text style={styles.errorLabel}>Stack Trace:</Text>
                        {'\n'}{this.state.error.stack}
                      </Text>
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

const EnhancedErrorBoundary = (props) => {
  const { getString } = useTheme();
  return <ErrorBoundaryInner {...props} getString={getString} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.black,
  },
  message: {
    textAlign: 'center',
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  errorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  errorIdChip: {
    marginHorizontal: 4,
  },
  timestampChip: {
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.info[500],
  },
  detailsButton: {
    borderColor: COLORS.gray[500],
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  detailsTitle: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.md,
    color: COLORS.black,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  errorLabel: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  stackTrace: {
    fontSize: FONT_SIZE.xxs,
    color: COLORS.gray[500],
    fontFamily: 'monospace',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
});

export default EnhancedErrorBoundary;
