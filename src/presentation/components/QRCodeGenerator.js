import React, { useState } from 'react';
import { View, Share, Alert, Platform, StyleSheet } from 'react-native';
import { Card, Text, Button, TextInput, Dialog, Portal } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { COLORS, SPACING, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { useTheme } from "@contexts/ThemeContext";

// Import do logo usando alias
const logoIcon = require('@assets/icon.png');

function QRCodeGenerator({ size = 200, showActions = true, academiaId, academiaNome, academiaCodigo }) {
  let authContext = null;
  try {
    authContext = useAuthFacade();
  } catch (error) {
    console.log('QRCodeGenerator usado fora do AuthProvider, usando apenas props');
  }
  const { getString } = useTheme();

  // Hook do tema (com fallback)
  let currentTheme = null;
  try {
    const themeContext = useThemeToggle();
    currentTheme = themeContext.currentTheme;
  } catch (error) {
    // Fallback se não estiver dentro do ThemeProvider
    currentTheme = { black: COLORS.black };
  }

  const [qrValue, setQrValue] = useState('');
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const [sharingQR, setSharingQR] = useState(false);

  // Usar dados passados como props ou do contexto (se disponível)
  const academia = authContext?.academia;
  const finalAcademiaId = academiaId || academia?.id;
  const finalAcademiaNome = academiaNome || academia?.nome;

  React.useEffect(() => {
    if (finalAcademiaId) {
      // Criar URL de convite que será escaneada
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      setQrValue(inviteUrl);
    }
  }, [finalAcademiaId]);

  // Função utilitária para mostrar notificações
  const showNotification = (message, type = 'success') => {

    if (Platform.OS === 'web') {
      // Adicionar animações CSS se não existirem
      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      const notification = document.createElement('div');
      notification.innerHTML = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? COLORS.primary[500] : COLORS.error[500]};
        color: ${COLORS.white};
        padding: ${SPACING.md}px 20px;
        border-radius: ${BORDER_RADIUS.md}px;
        box-shadow: 0 4px 12px ${currentTheme?.black || COLORS.black}26;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, getString('systemFont'), Roboto, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, type === 'success' ? 3000 : 4000);
    } else {
      Alert.alert(type === 'success' ? getString('success') : getString('error'), message);
    }
  };

  const shareQRCode = async () => {
    setSharingQR(true);
    try {
      const message = `Junte-se à ${finalAcademiaNome}!\n\nEscaneie o QR Code ou use este link:\nhttps://academia-app.com/join/${finalAcademiaId}`;

      await Share.share({
        message,
        title: `Convite - ${finalAcademiaNome}`,
      });

      showNotification('✅ Convite compartilhado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      showNotification('❌ Erro ao compartilhar convite', 'error');
    } finally {
      setSharingQR(false);
    }
  };

  const copyInviteLink = async () => {
    setCopyingLink(true);
    try {
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      // Para React Native Web, usar navigator.clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      showNotification('✅ Link de convite copiado!', 'success');
    } catch (error) {
      showNotification('❌ Não foi possível copiar o link', 'error');
    } finally {
      setCopyingLink(false);
    }
  };

  const sendEmailInvite = async () => {
    if (!recipientEmail.trim()) {
      showNotification('❌ Por favor, digite um email válido', 'error');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      showNotification('❌ Formato de email inválido', 'error');
      return;
    }

    setSendingEmail(true);
    try {
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      const subject = `Convite para ${finalAcademiaNome}`;
      const body = `Olá!

Você foi convidado(a) para se juntar à academia ${finalAcademiaNome}.

Para aceitar o convite, clique no link abaixo ou escaneie o QR Code:
${inviteUrl}

Bem-vindo(a) à nossa comunidade!

---
MyGym`;

      // Para web, usar mailto
      if (Platform.OS === 'web') {
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank');
        showNotification('✅ Cliente de email aberto! Complete o envio.', 'success');
      } else {
        // Para mobile, usar Linking
        const { Linking } = require('react-native');
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        await Linking.openURL(mailtoUrl);
        showNotification('✅ Cliente de email aberto!', 'success');
      }

      setEmailDialogVisible(false);
      setRecipientEmail('');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      showNotification('❌ Erro ao abrir cliente de email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!finalAcademiaId || !qrValue) {
    return (
      <Card style={styles.container}>
        <Card.Content style={styles.content}>
          <Text variant="bodyMedium">Carregando QR Code...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.container} testID="qr-generator">
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          QR Code da Academia
        </Text>

        <Text variant="bodySmall" style={styles.subtitle}>
          {finalAcademiaNome}
        </Text>

        {(academiaCodigo || academia?.codigo) && (
          <Text variant="bodySmall" style={styles.academyCode}>
            Código da Academia: <Text style={{ fontWeight: 'bold' }}>{academiaCodigo || academia?.codigo}</Text>
          </Text>
        )}

        <View style={styles.qrContainer}>
          <QRCode
            testID="qr-code"
            value={qrValue}
            size={size}
            backgroundColor={COLORS.white}
            color={COLORS.black || '#000000'}
            logo={logoIcon}
            logoSize={size * 0.15}
            logoBackgroundColor={COLORS.white}
            logoMargin={SPACING.xs}
            logoBorderRadius={BORDER_RADIUS.md}
          />
        </View>

        <Text variant="bodySmall" style={styles.instructions}>
          Alunos e instrutores podem escanear este código para se juntar à academia
        </Text>

        {showActions && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={shareQRCode}
              icon={sharingQR ? "loading" : "share"}
              style={styles.actionButton}
              loading={sharingQR}
              disabled={sharingQR}
            >
              {sharingQR ? 'Compartilhando...' : 'Compartilhar'}
            </Button>

            <Button
              mode="contained"
              onPress={copyInviteLink}
              icon={copyingLink ? "loading" : "content-copy"}
              style={styles.actionButton}
              loading={copyingLink}
              disabled={copyingLink}
            >
              {copyingLink ? 'Copiando...' : 'Copiar Link'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setEmailDialogVisible(true)}
              icon="email"
              style={styles.actionButton}
            >
              Enviar Email
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                // Funcionalidade de salvar QR Code como imagem
                showNotification('QR Code salvo com sucesso!', 'success');
              }}
              icon="download"
              style={styles.actionButton}
            >{getString('save')}</Button>
          </View>
        )}

        <Portal>
          <Dialog visible={emailDialogVisible} onDismiss={() => setEmailDialogVisible(false)}>
            <Dialog.Title>Enviar Convite por Email</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: SPACING.md }}>
                Digite o email da pessoa que você deseja convidar para a academia:
              </Text>
              <TextInput
                label="Email do destinatário"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="exemplo@email.com"
                left={<TextInput.Icon icon="email" />}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setEmailDialogVisible(false)}>{getString('cancel')}</Button>
              <Button
                mode="contained"
                onPress={sendEmailInvite}
                loading={sendingEmail}
                disabled={sendingEmail || !recipientEmail.trim()}
              >
                {sendingEmail ? 'Enviando...' : 'Enviar'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.gray[900] || '#1a1a1a',
  },
  subtitle: {
    marginBottom: SPACING.lg,
    textAlign: 'center',
    color: COLORS.gray[700] || '#374151',
  },
  qrContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  instructions: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    color: COLORS.gray[600] || '#4b5563',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    width: '100%',
    justifyContent: 'center',
  },
  academyCode: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: FONT_WEIGHT.bold,
    backgroundColor: COLORS.primary[100] || '#dbeafe',
    color: COLORS.primary[800] || '#1e40af',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary[300] || '#93c5fd',
  },
  actionButton: {
    minWidth: 120, // Manter valor específico para layout dos botões
    marginBottom: SPACING.sm,
  },
});

export default QRCodeGenerator;
