import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';

type AccessibleDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
} & Record<string, any>;

const AccessibleDialog: React.FC<AccessibleDialogProps> = ({ visible, onDismiss, children, style, ...props }) => {
  const dialogRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      // Para web, garantir que o diálogo tenha foco adequado
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          // Remove aria-hidden de elementos focáveis dentro do diálogo
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
          );
          
          focusableElements.forEach((element: any) => {
            // Remove aria-hidden se existir
            if (element.hasAttribute('aria-hidden')) {
              element.removeAttribute('aria-hidden');
            }
            
            // Garante que elementos focáveis não tenham aria-hidden
            let parent = element.parentElement;
            while (parent && parent !== dialogRef.current) {
              if (parent.hasAttribute('aria-hidden') && parent.getAttribute('aria-hidden') === 'true') {
                // Se o pai tem aria-hidden, remove do elemento focável
                element.setAttribute('aria-hidden', 'false');
                break;
              }
              parent = parent.parentElement;
            }
          });
        }
      }, 100);

      return () => { clearTimeout(timer); };
    }
    return undefined;
  }, [visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, style]} {...props}>
        <View ref={dialogRef}>{children}</View>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    ...(Platform.OS === 'web' && {
      // Garantir z-index adequado para web
      zIndex: 1000,
    }),
  },
});

export default AccessibleDialog;
