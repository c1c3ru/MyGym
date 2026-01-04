/**
 * EnhancedErrorMessage - Componente de mensagens de erro melhoradas
 * 
 * Fornece mensagens de erro específicas, acionáveis e amigáveis ao usuário.
 * Inclui sugestões de ação e links de ajuda quando apropriado.
 */

import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import {
  Text,
  Button,
  Card,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

// ============================================
// CATÁLOGO DE ERROS MELHORADOS
// ============================================
type ErrorAction = { label: string; action: string };
type ErrorCatalogEntry = {
  title: string;
  message: string;
  icon: string;
  color: 'error' | 'warning' | 'info' | string;
  actions?: ErrorAction[];
  helpLink?: string | null;
};

const ERROR_CATALOG: Record<string, ErrorCatalogEntry> = {
  // Erros de Rede
  'network/offline': {
    title: 'Sem conexão com a internet',
    message: 'Não foi possível conectar ao servidor. Verifique sua conexão Wi-Fi ou dados móveis.',
    icon: 'wifi-off',
    color: 'warning',
    actions: [
      { label: getString('tryAgain'), action: 'retry' },
      { label: 'Verificar Conexão', action: 'settings' }
    ],
    helpLink: null,
  },
  'network/timeout': {
    title: 'Tempo de conexão esgotado',
    message: 'A operação demorou muito para responder. Sua conexão pode estar lenta.',
    icon: 'clock-alert-outline',
    color: 'warning',
    actions: [
      { label: getString('tryAgain'), action: 'retry' }
    ],
  },
  'network/server-error': {
    title: 'Erro no servidor',
    message: 'Nossos servidores estão com problemas temporários. Tente novamente em alguns minutos.',
    icon: 'server-network-off',
    color: 'error',
    actions: [
      { label: getString('tryAgain'), action: 'retry' }
    ],
  },

  // Erros de Autenticação
  'auth/invalid-email': {
    title: getString('invalidEmail'),
    message: 'O formato do email está incorreto. Verifique se digitou corretamente (ex: usuario@exemplo.com).',
    icon: 'email-alert-outline',
    color: 'error',
    actions: [
      { label: 'Corrigir Email', action: 'focus-email' }
    ],
  },
  'auth/user-not-found': {
    title: getString('userNotFound'),
    message: 'Não existe uma conta com este email. Verifique o email ou crie uma nova conta.',
    icon: 'account-question-outline',
    color: 'error',
    actions: [
      { label: 'Criar Conta', action: 'register' },
      { label: 'Tentar Outro Email', action: 'focus-email' }
    ],
  },
  'auth/wrong-password': {
    title: getString('wrongPassword'),
    message: 'A senha digitada está incorreta. Tente novamente ou redefina sua senha.',
    icon: 'lock-alert-outline',
    color: 'error',
    actions: [
      { label: getString('tryAgain'), action: 'focus-password' },
      { label: 'Esqueci Minha Senha', action: 'reset-password' }
    ],
  },
  'auth/too-many-requests': {
    title: 'Muitas tentativas',
    message: 'Você fez muitas tentativas de login. Por segurança, aguarde alguns minutos antes de tentar novamente.',
    icon: 'shield-alert-outline',
    color: 'warning',
    actions: [
      { label: 'Redefinir Senha', action: 'reset-password' }
    ],
  },
  'auth/email-already-in-use': {
    title: 'Email já cadastrado',
    message: 'Já existe uma conta com este email. Faça login ou use outro email.',
    icon: 'email-check-outline',
    color: 'error',
    actions: [
      { label: 'Fazer Login', action: 'login' },
      { label: 'Usar Outro Email', action: 'focus-email' }
    ],
  },
  'auth/weak-password': {
    title: getString('weakPassword'),
    message: 'Sua senha deve ter pelo menos 6 caracteres. Use letras, números e símbolos para maior segurança.',
    icon: 'shield-lock-outline',
    color: 'warning',
    actions: [
      { label: 'Criar Senha Forte', action: 'focus-password' }
    ],
  },

  // Erros de Validação
  'validation/required-field': {
    title: getString('required'),
    message: 'Este campo é obrigatório. Por favor, preencha-o para continuar.',
    icon: 'alert-circle-outline',
    color: 'warning',
    actions: [
      { label: 'Preencher Campo', action: 'focus-field' }
    ],
  },
  'validation/invalid-format': {
    title: 'Formato inválido',
    message: 'O valor digitado não está no formato correto. Verifique e tente novamente.',
    icon: 'format-text',
    color: 'warning',
    actions: [
      { label: 'Corrigir', action: 'focus-field' }
    ],
  },

  // Erros de Permissão
  'permission/denied': {
    title: getString('permissionDenied'),
    message: 'Você não tem permissão para realizar esta ação. Entre em contato com o administrador.',
    icon: 'shield-off-outline',
    color: 'error',
    actions: [
      { label: getString('back'), action: 'back' }
    ],
  },

  // Erros de Dados
  'data/not-found': {
    title: 'Dados não encontrados',
    message: 'Os dados solicitados não foram encontrados. Eles podem ter sido removidos.',
    icon: 'database-remove-outline',
    color: 'error',
    actions: [
      { label: getString('back'), action: 'back' },
      { label: getString('update'), action: 'retry' }
    ],
  },
  'data/save-failed': {
    title: getString('errorSaving'),
    message: 'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.',
    icon: 'content-save-alert-outline',
    color: 'error',
    actions: [
      { label: getString('tryAgain'), action: 'retry' }
    ],
  },

  // Erro genérico
  'unknown': {
    title: getString('somethingWentWrong'),
    message: 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
    icon: 'alert-octagon-outline',
    color: 'error',
    actions: [
      { label: getString('tryAgain'), action: 'retry' },
      { label: 'Contatar Suporte', action: 'support' }
    ],
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
type EnhancedErrorMessageProps = {
  errorCode: string;
  customMessage?: string;
  customTitle?: string;
  onAction?: (action: string) => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

const EnhancedErrorMessage: React.FC<EnhancedErrorMessageProps> = ({
  errorCode,
  customMessage,
  customTitle,
  onAction,
  onDismiss,
  style,
  compact = false,
}) => {
  const code = (errorCode && ERROR_CATALOG[errorCode]) ? errorCode : 'unknown';
  const errorInfo = ERROR_CATALOG[code];
  
  const title = customTitle || errorInfo.title;
  const message = customMessage || errorInfo.message;
  const iconName = errorInfo.icon;
  const colorType = errorInfo.color;
  const actions = errorInfo.actions;

  const getColorByType = (type: 'error' | 'warning' | 'info' | string): string => {
    switch (type) {
      case 'error':
        return COLORS.error[500];
      case 'warning':
        return COLORS.warning[600];
      case 'info':
        return COLORS.info[500];
      default:
        return COLORS.error[500];
    }
  };

  const color = getColorByType(colorType);

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <MaterialCommunityIcons name={iconName as any} size={20} color={color} />
        <Text style={[styles.compactMessage, { color }]}>{message}</Text>
        {onDismiss && (
          <IconButton
            icon="close"
            size={16}
            onPress={onDismiss}
            accessibilityLabel="Fechar mensagem de erro"
          />
        )}
      </View>
    );
  }

  return (
    <Card 
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Erro: ${title}. ${message}`}
    >
      <Card.Content>
        {/* Header com ícone e título */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={iconName as any} size={32} color={color} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title as any, { color }]}>{title}</Text>
            {onDismiss && (
              <IconButton
                icon="close"
                size={20}
                onPress={onDismiss}
                style={styles.closeButton}
                accessibilityLabel="Fechar mensagem de erro"
              />
            )}
          </View>
        </View>

        {/* Mensagem */}
        <Text style={styles.message}>{message}</Text>

        {/* Ações */}
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action: ErrorAction, index: number) => (
              <Button
                key={index}
                mode={index === 0 ? 'contained' : 'outlined'}
                onPress={() => onAction && onAction(action.action)}
                style={[
                  styles.actionButton,
                  index === 0 && { backgroundColor: color }
                ]}
                labelStyle={styles.actionButtonLabel}
                accessibilityLabel={action.label}
                accessibilityHint={`Ação: ${action.label}`}
              >
                {action.label}
              </Button>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    flex: 1,
    marginTop: SPACING.xs,
  },
  closeButton: {
    margin: SPACING.none,
    marginTop: -SPACING.xs,
  },
  message: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    lineHeight: FONT_SIZE.base * 1.5,
    marginBottom: SPACING.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  actionButtonLabel: {
    fontSize: FONT_SIZE.sm,
  },
  // Compact mode
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.error[50],
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error[500],
  },
  compactMessage: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.sm,
  },
});

// ============================================
// HOOK PERSONALIZADO
// ============================================
export const useEnhancedError = () => {
  type ErrorState = { errorCode: string; customMessage?: string | null; customTitle?: string | null } | null;
  const [error, setError] = React.useState<ErrorState>(null);

  const showError = (errorCode: string, customMessage: string | null = null, customTitle: string | null = null) => {
    setError({ errorCode, customMessage, customTitle });
  };

  const clearError = () => {
    setError(null);
  };

  const getErrorMessage = (errorCode: string): string => {
    const code = (errorCode && ERROR_CATALOG[errorCode]) ? errorCode : 'unknown';
    const errorInfo = ERROR_CATALOG[code];
    return errorInfo.message;
  };

  return {
    error,
    showError,
    clearError,
    getErrorMessage,
  };
};

export { ERROR_CATALOG };
export default EnhancedErrorMessage;
