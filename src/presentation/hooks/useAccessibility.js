import { useCallback, useMemo } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';
import { getString } from '@utils/theme';

/**
 * Hook customizado para melhorias de acessibilidade
 */
export const useAccessibility = () => {
  // Verifica se o screen reader está ativo
  const announceForAccessibility = useCallback((message) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  // Gera props de acessibilidade padronizadas
  const getAccessibilityProps = useCallback((options = {}) => {
    const {
      label,
      hint,
      role = 'button',
      state,
      value,
      isDisabled = false,
      isSelected = false,
      isExpanded,
      onAccessibilityTap,
      onAccessibilityFocus,
      children
    } = options;

    const accessibilityProps = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
    };

    // Estados dinâmicos
    if (state) {
      accessibilityProps.accessibilityState = {
        disabled: isDisabled,
        selected: isSelected,
        expanded: isExpanded,
        ...state
      };
    }

    // Valor atual (para sliders, inputs, etc.)
    if (value !== undefined) {
      accessibilityProps.accessibilityValue = value;
    }

    // Callbacks de acessibilidade
    if (onAccessibilityTap) {
      accessibilityProps.onAccessibilityTap = onAccessibilityTap;
    }

    if (onAccessibilityFocus) {
      accessibilityProps.onAccessibilityFocus = onAccessibilityFocus;
    }

    return accessibilityProps;
  }, []);

  // Props específicas para listas
  const getListAccessibilityProps = useCallback((totalItems, currentIndex) => ({
    accessibilityRole: 'list',
    accessibilityLabel: `Lista com ${totalItems} itens`,
    accessibilityValue: {
      min: 1,
      max: totalItems,
      now: currentIndex + 1,
      text: `Item ${currentIndex + 1} de ${totalItems}`
    }
  }), []);

  // Props para botões de ação
  const getButtonAccessibilityProps = useCallback((action, context = '') => {
    const actions = {
      add: { label: `Adicionar ${context}`, hint: 'Toque duas vezes para adicionar' },
      edit: { label: `Editar ${context}`, hint: 'Toque duas vezes para editar' },
      delete: { label: `Excluir ${context}`, hint: 'Toque duas vezes para excluir' },
      view: { label: `Ver detalhes ${context}`, hint: 'Toque duas vezes para ver detalhes' },
      back: { label: getString('back'), hint: 'Toque duas vezes para voltar' },
      close: { label: getString('close'), hint: 'Toque duas vezes para fechar' },
      save: { label: getString('save'), hint: 'Toque duas vezes para salvar' },
      cancel: { label: getString('cancel'), hint: 'Toque duas vezes para cancelar' },
    };

    return getAccessibilityProps({
      label: actions[action]?.label || `${action} ${context}`,
      hint: actions[action]?.hint || 'Toque duas vezes para executar a ação',
      role: 'button'
    });
  }, [getAccessibilityProps]);

  // Props para formulários
  const getFormFieldAccessibilityProps = useCallback((fieldName, isRequired = false, errorMessage = null) => ({
    accessible: true,
    accessibilityLabel: `${fieldName}${isRequired ? ', obrigatório' : ''}`,
    accessibilityHint: errorMessage || `Digite ${fieldName.toLowerCase()}`,
    accessibilityRole: 'text',
    accessibilityState: {
      disabled: false,
      invalid: !!errorMessage
    }
  }), []);

  // Props para status/chips
  const getStatusAccessibilityProps = useCallback((status, type = 'status') => {
    const statusMessages = {
      active: getString('active'),
      inactive: getString('inactive'),
      paid: getString('paid'),
      pending: getString('paymentPending'), 
      overdue: getString('overdue'),
      approved: getString('approved'),
      rejected: getString('rejected')
    };

    return getAccessibilityProps({
      label: `${type}: ${statusMessages[status] || status}`,
      role: 'text'
    });
  }, [getAccessibilityProps]);

  // Props para navegação
  const getNavigationAccessibilityProps = useCallback((screenName, params = {}) => ({
    accessible: true,
    accessibilityLabel: `Navegar para ${screenName}`,
    accessibilityHint: 'Toque duas vezes para abrir esta tela',
    accessibilityRole: 'button'
  }), []);

  return {
    announceForAccessibility,
    getAccessibilityProps,
    getListAccessibilityProps,
    getButtonAccessibilityProps,
    getFormFieldAccessibilityProps,
    getStatusAccessibilityProps,
    getNavigationAccessibilityProps
  };
};