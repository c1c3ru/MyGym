import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Share } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  List,
  Chip,
  FAB,
  Modal,
  Portal,
  Divider
} from 'react-native-paper';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { InviteService } from '@infrastructure/services/inviteService';
import QRCodeGenerator from '@components/QRCodeGenerator';
import ActionButton, { ActionButtonGroup } from '@components/ActionButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";

export default function InviteManagement({ navigation }) {
  const { user, userProfile, academia } = useAuthFacade();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    tipo: 'aluno'
  });

  useEffect(() => {
    if (academia?.id) {
      loadInvites();
    }
  }, [academia]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      // Usar a nova função que já filtra convites ativos (pendentes e expirados)
      const activeInvites = await InviteService.getActiveInvites(academia.id);
      setInvites(activeInvites);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      Alert.alert(getString('error'), 'Não foi possível carregar os convites');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!newInvite.email.trim()) {
      Alert.alert(getString('error'), 'Email é obrigatório');
      return;
    }

    if (!academia || !academia.id) {
      Alert.alert(getString('error'), 'Você precisa estar associado a uma academia para enviar convites. Crie ou associe-se a uma academia primeiro.');
      return;
    }

    try {
      setLoading(true);

      // Criar convite
      const inviteResult = await InviteService.createInvite(
        academia.id,
        newInvite.email,
        newInvite.tipo,
        user.id
      );

      // Gerar link do convite usando o token retornado
      const inviteLink = InviteService.generateInviteLink(inviteResult.token);

      // Enviar email
      const emailSent = await InviteService.sendInviteEmail(
        newInvite.email,
        academia.nome,
        inviteLink,
        userProfile.name || getString('administrator'),
        newInvite.tipo
      );

      if (!emailSent) {
        Alert.alert(getString('warning'), 'Convite criado, mas houve problema no envio do email. O convite ainda é válido.');
      }

      Alert.alert(
        'Convite Enviado!',
        `Convite enviado para ${newInvite.email}`,
        [{
          text: getString('ok'), onPress: () => {
            setShowInviteModal(false);
            setNewInvite({ email: '', tipo: 'aluno' });
            loadInvites();
          }
        }]
      );
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      Alert.alert(getString('error'), 'Não foi possível enviar o convite');
    } finally {
      setLoading(false);
    }
  };

  const shareQRCode = async () => {
    try {
      const joinLink = InviteService.generateJoinLink(academia.id);
      const message = `Junte-se à ${academia.nome}!\n\nEscaneie o QR Code ou use este link:\n${joinLink}`;

      await Share.share({
        message,
        title: `Convite - ${academia.nome}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const cleanupAcceptedInvites = async () => {
    try {
      setLoading(true);
      const cleanedCount = await InviteService.cleanupAcceptedInvites(academia.id);

      if (cleanedCount > 0) {
        Alert.alert(
          'Limpeza Concluída',
          `${cleanedCount} convite(s) aceito(s) foram removidos do mural.`,
          [{ text: getString('ok'), onPress: loadInvites }]
        );
      } else {
        Alert.alert(getString('info'), 'Nenhum convite aceito encontrado para remover.');
      }
    } catch (error) {
      console.error('Erro ao limpar convites:', error);
      Alert.alert(getString('error'), 'Não foi possível limpar os convites aceitos');
    } finally {
      setLoading(false);
    }
  };

  const deleteInvite = async (inviteId, inviteEmail) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o convite para ${inviteEmail}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await InviteService.deleteInvite(academia.id, inviteId);
              Alert.alert('Sucesso', 'Convite excluído com sucesso!');
              loadInvites();
            } catch (error) {
              console.error('Erro ao excluir convite:', error);
              Alert.alert(getString('error'), 'Não foi possível excluir o convite');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const deleteAllInvites = async () => {
    Alert.alert(
      'Confirmar Exclusão em Massa',
      `Deseja realmente excluir TODOS os ${invites.length} convites? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Todos',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const deletedCount = await InviteService.deleteAllInvites(academia.id);
              Alert.alert(
                'Sucesso',
                `${deletedCount} convite(s) excluído(s) com sucesso!`,
                [{ text: getString('ok'), onPress: loadInvites }]
              );
            } catch (error) {
              console.error('Erro ao excluir todos os convites:', error);
              Alert.alert(getString('error'), 'Não foi possível excluir os convites');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const deleteExpiredInvites = async () => {
    const expiredCount = invites.filter(inv => inv.status === 'expired').length;

    if (expiredCount === 0) {
      Alert.alert(getString('info'), 'Nenhum convite expirado encontrado.');
      return;
    }

    Alert.alert(
      'Limpar Convites Expirados',
      `Deseja excluir ${expiredCount} convite(s) expirado(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Expirados',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const deletedCount = await InviteService.deleteExpiredInvites(academia.id);
              Alert.alert(
                'Sucesso',
                `${deletedCount} convite(s) expirado(s) excluído(s)!`,
                [{ text: getString('ok'), onPress: loadInvites }]
              );
            } catch (error) {
              console.error('Erro ao excluir convites expirados:', error);
              Alert.alert(getString('error'), 'Não foi possível excluir os convites expirados');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning[500];
      case 'accepted': return COLORS.primary[500];
      case 'expired': return COLORS.error[500];
      default: return COLORS.gray[500];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return getString('paymentPending');
      case 'accepted': return 'Aceito';
      case 'expired': return getString('expired');
      default: return 'Desconhecido';
    }
  };

  const renderInviteItem = (invite) => (
    <Card key={invite.id} style={styles.inviteCard}>
      <Card.Content>
        <View style={styles.inviteHeader}>
          <View style={styles.inviteInfo}>
            <Text variant="titleMedium" style={styles.inviteEmail}>
              {invite.email}
            </Text>
            <Text variant="bodySmall" style={styles.inviteType}>
              {invite.tipo === 'aluno' ? getString('student') : getString('instructor')}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(invite.status) }]}
            textStyle={{ color: COLORS.white }}
          >
            {getStatusText(invite.status)}
          </Chip>
        </View>

        <Text variant="bodySmall" style={styles.inviteDate}>
          Enviado em: {invite.createdAt?.toDate?.()?.toLocaleDateString() || getString('dataNotAvailable')}
        </Text>

        {invite.status === 'pending' && (
          <Text variant="bodySmall" style={styles.expiryDate}>
            Expira em: {invite.expiresAt?.toDate?.()?.toLocaleDateString() || getString('dataNotAvailable')}
          </Text>
        )}

        {/* Botão de exclusão individual */}
        <View style={styles.inviteActions}>
          <ActionButton
            mode="text"
            onPress={() => deleteInvite(invite.id, invite.email)}
            icon="delete"
            size="small"
            variant="danger"
            style={styles.deleteButton}
          >
            Excluir
          </ActionButton>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Gerenciar Convites
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Convide alunos e instrutores para sua academia
            </Text>
          </Card.Content>
        </Card>

        {/* Opções de Convite */}
        <Card style={styles.optionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Formas de Convite
            </Text>

            <ActionButtonGroup style={styles.optionButtons}>
              <ActionButton
                mode="contained"
                onPress={() => setShowInviteModal(true)}
                icon="email"
                style={styles.optionButton}
                variant="primary"
                size="medium"
              >
                Convite por Email
              </ActionButton>

              <ActionButton
                mode="outlined"
                onPress={() => setShowQRModal(true)}
                icon="qrcode"
                style={styles.optionButton}
                variant="secondary"
                size="medium"
              >
                QR Code
              </ActionButton>
            </ActionButtonGroup>
          </Card.Content>
        </Card>

        {/* Lista de Convites */}
        <Card style={styles.listCard}>
          <Card.Content>
            <View style={styles.listHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Convites Enviados ({invites.length})
              </Text>
              <ActionButton
                mode="text"
                onPress={cleanupAcceptedInvites}
                loading={loading}
                icon="broom"
                size="small"
                variant="secondary"
                style={styles.cleanupButton}
              >
                Limpar Aceitos
              </ActionButton>
            </View>

            {invites.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                Nenhum convite enviado ainda
              </Text>
            ) : (
              invites.map(renderInviteItem)
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal de Convite por Email */}
      <Portal>
        <Modal
          visible={showInviteModal}
          onDismiss={() => setShowInviteModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Enviar Convite por Email
          </Text>

          <TextInput
            label="Email do convidado"
            value={newInvite.email}
            onChangeText={(text) => setNewInvite(prev => ({ ...prev, email: text }))}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text variant="bodyMedium" style={styles.typeLabel}>
            Tipo de usuário:
          </Text>

          <ActionButtonGroup style={styles.typeButtons}>
            <ActionButton
              mode={newInvite.tipo === 'aluno' ? 'contained' : 'outlined'}
              onPress={() => setNewInvite(prev => ({ ...prev, tipo: 'aluno' }))}
              style={styles.typeButton}
              variant="primary"
              size="small"
            >{getString('student')}</ActionButton>
            <ActionButton
              mode={newInvite.tipo === 'instrutor' ? 'contained' : 'outlined'}
              onPress={() => setNewInvite(prev => ({ ...prev, tipo: 'instrutor' }))}
              style={styles.typeButton}
              variant="success"
              size="small"
            >{getString('instructor')}</ActionButton>
          </ActionButtonGroup>

          <ActionButtonGroup style={styles.modalActions}>
            <ActionButton
              mode="outlined"
              onPress={() => setShowInviteModal(false)}
              style={styles.modalButton}
              variant="secondary"
            >{getString('cancel')}</ActionButton>
            <ActionButton
              mode="contained"
              onPress={sendInvite}
              loading={loading}
              disabled={loading}
              style={styles.modalButton}
              variant="success"
            >
              Enviar Convite
            </ActionButton>
          </ActionButtonGroup>
        </Modal>
      </Portal>

      {/* Modal de QR Code */}
      <Portal>
        <Modal
          visible={showQRModal}
          onDismiss={() => setShowQRModal(false)}
          contentContainerStyle={styles.qrModal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            QR Code da Academia
          </Text>

          <QRCodeGenerator
            size={250}
            showActions={false}
            academiaId={academia?.id}
            academiaNome={academia?.nome}
          />

          <Text variant="bodySmall" style={styles.qrInstructions}>
            Compartilhe este QR Code para que alunos e instrutores possam se juntar à academia instantaneamente
          </Text>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowQRModal(false)}
              style={styles.modalButton}
            >{getString('close')}</Button>
            <Button
              mode="contained"
              onPress={shareQRCode}
              icon="share"
              style={styles.modalButton}
            >
              Compartilhar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: SPACING.sm,
  },
  optionsCard: {
    margin: SPACING.md,
    marginVertical: 8,
  },
  listCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cleanupButton: {
    marginLeft: SPACING.sm,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  optionButton: {
    flex: 1,
  },
  inviteCard: {
    marginBottom: SPACING.md,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteEmail: {
    fontWeight: FONT_WEIGHT.bold,
  },
  inviteType: {
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  statusChip: {
    marginLeft: SPACING.md,
  },
  inviteDate: {
    opacity: 0.6,
    marginTop: SPACING.xs,
  },
  expiryDate: {
    opacity: 0.6,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginVertical: 20,
  },
  modal: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  qrModal: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: FONT_WEIGHT.bold,
  },
  input: {
    marginBottom: SPACING.md,
  },
  typeLabel: {
    marginBottom: SPACING.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  typeButton: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
  qrInstructions: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: SPACING.md,
    paddingHorizontal: 20,
  },
};
