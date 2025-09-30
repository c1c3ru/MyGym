import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator, Text, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const { width } = Dimensions.get('window');

// Loading state para tela completa
export const FullScreenLoading = memo(({ 
  message = 'Carregando...', 
  showLogo = false 
}) => (
  <View style={styles.fullScreenContainer}>
    {showLogo && (
      <Ionicons name="fitness-outline" size={48} color="COLORS.info[500]" style={styles.logo} />
    )}
    <ActivityIndicator size="large" color="COLORS.info[500]" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
));

// Loading state para seções
export const SectionLoading = memo(({ 
  message = 'Carregando...', 
  size = 'medium',
  style 
}) => (
  <View style={[styles.sectionContainer, style]}>
    <ActivityIndicator size={size} color="COLORS.info[500]" />
    <Text style={styles.sectionText}>{message}</Text>
  </View>
));

// Loading state para listas (skeleton)
export const ListItemSkeleton = memo(() => (
  <Card style={styles.skeletonCard}>
    <Card.Content style={styles.skeletonContent}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonTextContainer}>
          <View style={[styles.skeletonText, styles.skeletonTitle]} />
          <View style={[styles.skeletonText, styles.skeletonSubtitle]} />
        </View>
      </View>
      <View style={styles.skeletonActions}>
        <View style={styles.skeletonButton} />
        <View style={styles.skeletonButton} />
      </View>
    </Card.Content>
  </Card>
));

// Loading state para formulários
export const FormLoading = memo(({ message = 'Salvando...' }) => (
  <View style={styles.formLoadingContainer}>
    <ActivityIndicator size="small" color="COLORS.info[500]" />
    <Text style={styles.formLoadingText}>{message}</Text>
  </View>
));

// Estado de erro consistente
export const ErrorState = memo(({ 
  title = 'Ops! Algo deu errado',
  message = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry,
  showIcon = true 
}) => (
  <View style={styles.errorContainer}>
    {showIcon && (
      <Ionicons name="alert-circle-outline" size={48} color="COLORS.error[500]" style={styles.errorIcon} />
    )}
    <Text style={styles.errorTitle}>{title}</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry && (
      <Button 
        mode="outlined" 
        onPress={onRetry}
        style={styles.retryButton}
        icon="refresh"
      >
        Tentar Novamente
      </Button>
    )}
  </View>
));

// Estado vazio consistente
export const EmptyState = memo(({ 
  title = 'Nenhum item encontrado',
  message = 'Não há dados para exibir no momento.',
  icon = 'folder-open-outline',
  action,
  actionLabel = 'Adicionar',
  onAction 
}) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={48} color={COLORS.gray[500]} style={styles.emptyIcon} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {action && onAction && (
      <Button 
        mode="contained" 
        onPress={onAction}
        style={styles.actionButton}
        icon="plus"
      >
        {actionLabel}
      </Button>
    )}
  </View>
));

// Loading state para botões
export const ButtonLoading = memo(({ 
  loading = false, 
  children, 
  ...props 
}) => (
  <Button 
    {...props}
    loading={loading}
    disabled={loading || props.disabled}
  >
    {children}
  </Button>
));

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 20,
  },
  logo: {
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionText: {
    marginLeft: 12,
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  skeletonCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: BORDER_RADIUS.md,
  },
  skeletonContent: {
    padding: SPACING.base,
  },
  skeletonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[300],
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonText: {
    backgroundColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  skeletonTitle: {
    height: 16,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 12,
    width: '40%',
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonButton: {
    width: 80,
    height: 32,
    backgroundColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
  },
  formLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  formLoadingText: {
    marginLeft: 8,
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.gray[100],
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    borderColor: COLORS.info[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.gray[100],
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary[500],
  },
});

export default {
  FullScreenLoading,
  SectionLoading,
  ListItemSkeleton,
  FormLoading,
  ErrorState,
  EmptyState,
  ButtonLoading,
};