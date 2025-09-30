import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Logger } from '@utils/logger';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log detalhado do erro
    Logger.errorWithContext(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      props: this.props,
    });
    
    // Em produção, enviar para serviço de crash analytics
    if (!__DEV__) {
      // Aqui você pode integrar com Sentry, Firebase Crashlytics, etc.
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content style={styles.content}>
              <Ionicons name="alert-circle-outline" size={64} color={COLORS.error[500]} />
              <Text style={styles.title}>Ops! Algo deu errado</Text>
              <Text style={styles.message}>
                Ocorreu um erro inesperado. Tente novamente ou reinicie o aplicativo.
              </Text>
              <Button 
                mode="contained" 
                onPress={this.handleRetry}
                style={styles.button}
                icon="refresh"
              >
                Tentar Novamente
              </Button>
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
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    marginTop: 16,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  message: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.info[500],
  },
});

export default ErrorBoundary;
