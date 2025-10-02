/**
 * UndoManager - Sistema de desfazer ações destrutivas
 * 
 * Permite que usuários desfaçam ações destrutivas como exclusões,
 * melhorando a confiança e reduzindo erros acidentais.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Button } from 'react-native-paper';
import { COLORS, SPACING } from '@presentation/theme/designTokens';

// ============================================
// CONTEXT
// ============================================
const UndoContext = createContext(null);

// ============================================
// PROVIDER
// ============================================
export const UndoProvider = ({ children }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);

  /**
   * Registra uma ação que pode ser desfeita
   * @param {Object} action - Ação a ser registrada
   * @param {string} action.id - ID único da ação
   * @param {string} action.message - Mensagem a ser exibida
   * @param {Function} action.onUndo - Função a ser chamada ao desfazer
   * @param {Function} action.onCommit - Função a ser chamada se não desfizer
   * @param {number} action.timeout - Tempo em ms antes de confirmar (padrão: 5000)
   */
  const registerUndo = useCallback((action) => {
    const undoAction = {
      id: action.id || Date.now().toString(),
      message: action.message,
      onUndo: action.onUndo,
      onCommit: action.onCommit,
      timeout: action.timeout || 5000,
      timestamp: Date.now(),
    };

    setCurrentAction(undoAction);
    setSnackbarVisible(true);

    // Auto-commit após timeout
    const timeoutId = setTimeout(() => {
      commitAction(undoAction.id);
    }, undoAction.timeout);

    setUndoStack(prev => [...prev, { ...undoAction, timeoutId }]);
  }, []);

  /**
   * Desfaz a ação atual
   */
  const undo = useCallback(() => {
    if (!currentAction) return;

    const action = undoStack.find(a => a.id === currentAction.id);
    if (action) {
      // Cancela o timeout
      if (action.timeoutId) {
        clearTimeout(action.timeoutId);
      }

      // Executa a função de desfazer
      if (action.onUndo) {
        action.onUndo();
      }

      // Remove da pilha
      setUndoStack(prev => prev.filter(a => a.id !== action.id));
      setSnackbarVisible(false);
      setCurrentAction(null);
    }
  }, [currentAction, undoStack]);

  /**
   * Confirma a ação (não permite mais desfazer)
   */
  const commitAction = useCallback((actionId) => {
    const action = undoStack.find(a => a.id === actionId);
    if (action) {
      // Cancela o timeout
      if (action.timeoutId) {
        clearTimeout(action.timeoutId);
      }

      // Executa a função de commit
      if (action.onCommit) {
        action.onCommit();
      }

      // Remove da pilha
      setUndoStack(prev => prev.filter(a => a.id !== actionId));
      
      // Fecha o snackbar se for a ação atual
      if (currentAction && currentAction.id === actionId) {
        setSnackbarVisible(false);
        setCurrentAction(null);
      }
    }
  }, [undoStack, currentAction]);

  /**
   * Limpa todas as ações pendentes
   */
  const clearAll = useCallback(() => {
    undoStack.forEach(action => {
      if (action.timeoutId) {
        clearTimeout(action.timeoutId);
      }
      if (action.onCommit) {
        action.onCommit();
      }
    });
    setUndoStack([]);
    setSnackbarVisible(false);
    setCurrentAction(null);
  }, [undoStack]);

  const value = {
    registerUndo,
    undo,
    commitAction,
    clearAll,
    hasUndo: undoStack.length > 0,
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
      
      {/* Snackbar de Undo */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          if (currentAction) {
            commitAction(currentAction.id);
          }
        }}
        duration={currentAction?.timeout || 5000}
        action={{
          label: 'Desfazer',
          onPress: undo,
          labelStyle: { color: COLORS.warning[500] },
        }}
        style={{
          backgroundColor: COLORS.gray[800],
          marginBottom: SPACING.base,
        }}
      >
        {currentAction?.message || 'Ação realizada'}
      </Snackbar>
    </UndoContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================
export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo deve ser usado dentro de UndoProvider');
  }
  return context;
};

// ============================================
// COMPONENTE DE AÇÃO DESTRUTIVA
// ============================================
export const DestructiveAction = ({
  onConfirm,
  onCancel,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  undoMessage,
  undoTimeout = 5000,
  children,
}) => {
  const { registerUndo } = useUndo();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAction = async () => {
    setShowConfirm(false);

    // Executa a ação
    const result = await onConfirm();

    // Registra para desfazer
    if (undoMessage) {
      registerUndo({
        message: undoMessage,
        timeout: undoTimeout,
        onUndo: async () => {
          if (onCancel) {
            await onCancel(result);
          }
        },
        onCommit: () => {
          // Ação confirmada, nada a fazer
        },
      });
    }
  };

  return (
    <>
      {children({
        onPress: () => setShowConfirm(true),
      })}

      {/* Modal de confirmação poderia ser adicionado aqui */}
    </>
  );
};

// ============================================
// HELPERS
// ============================================

/**
 * Helper para ações de exclusão
 */
export const useDeleteWithUndo = () => {
  const { registerUndo } = useUndo();

  const deleteWithUndo = useCallback(
    async (item, deleteFunction, restoreFunction, itemName = 'item') => {
      // Executa a exclusão
      await deleteFunction(item);

      // Registra para desfazer
      registerUndo({
        message: `${itemName} excluído`,
        onUndo: async () => {
          await restoreFunction(item);
        },
        onCommit: () => {
          console.log(`${itemName} excluído permanentemente`);
        },
      });
    },
    [registerUndo]
  );

  return { deleteWithUndo };
};

/**
 * Helper para ações de atualização
 */
export const useUpdateWithUndo = () => {
  const { registerUndo } = useUndo();

  const updateWithUndo = useCallback(
    async (
      newData,
      oldData,
      updateFunction,
      itemName = 'item'
    ) => {
      // Executa a atualização
      await updateFunction(newData);

      // Registra para desfazer
      registerUndo({
        message: `${itemName} atualizado`,
        onUndo: async () => {
          await updateFunction(oldData);
        },
        onCommit: () => {
          console.log(`${itemName} atualizado permanentemente`);
        },
      });
    },
    [registerUndo]
  );

  return { updateWithUndo };
};

/**
 * Helper para múltiplas ações em lote
 */
export const useBatchUndo = () => {
  const { registerUndo } = useUndo();

  const batchWithUndo = useCallback(
    async (
      items,
      batchFunction,
      restoreFunction,
      actionName = 'Ação em lote'
    ) => {
      // Executa a ação em lote
      await batchFunction(items);

      // Registra para desfazer
      registerUndo({
        message: `${actionName} (${items.length} itens)`,
        onUndo: async () => {
          await restoreFunction(items);
        },
        onCommit: () => {
          console.log(`${actionName} confirmado`);
        },
      });
    },
    [registerUndo]
  );

  return { batchWithUndo };
};

export default {
  UndoProvider,
  useUndo,
  DestructiveAction,
  useDeleteWithUndo,
  useUpdateWithUndo,
  useBatchUndo,
};
