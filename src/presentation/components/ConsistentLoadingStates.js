import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator, Text, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Loading state para tela completa
export const FullScreenLoading = memo(({ 
  message = 'Carregando...', 
  showLogo = false 
}) => (
  <View style={styles.fullScreenContainer}>
    {showLogo && (
      <Ionicons name="fitness-outline" size={48} color="#2196F3" style={styles.logo} />
    )}
    <ActivityIndicator size="large" color="#2196F3" />
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
    <ActivityIndicator size={size} color="#2196F3" />
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
    <ActivityIndicator size="small" color="#2196F3" />
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
      <Ionicons name="alert-circle-outline" size={48} color="#F44336" style={styles.errorIcon} />
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
    <Ionicons name={icon} size={48} color="#9E9E9E" style={styles.emptyIcon} />
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  logo: {
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    fontSize: 14,
    color: '#666',
  },
  skeletonCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: 12,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
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
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
  },
  formLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  formLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    borderColor: '#2196F3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
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