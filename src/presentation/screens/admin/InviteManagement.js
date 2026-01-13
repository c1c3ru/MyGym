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
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deletingInviteId, setDeletingInviteId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      console.log('🔄 Carregando convites para academia:', academia?.id);

      // Usar a nova função que já filtra convites ativos (pendentes e expirados)
      const activeInvites = await InviteService.getActiveInvites(academia.id);

      console.log('📥 Convites carregados:', activeInvites.length);
      console.log('📋 Lista de convites:', activeInvites);

      setInvites(activeInvites);
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', error);
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

      // Obter nome da academia com fallback
      const academiaName = academia.nome || academia.name || 'Academia';
      const inviterName = userProfile?.name || user?.displayName || getString('administrator');

      console.log('📧 Enviando email com parâmetros:', {
        email: newInvite.email,
        academiaName,
        inviteLink,
        inviterName,
        userType: newInvite.tipo
      });

      // Enviar email
      const emailSent = await InviteService.sendInviteEmail(
        newInvite.email,
        academiaName,
        inviteLink,
        inviterName,
        newInvite.tipo
      );

      console.log('✅ Convite criado com sucesso. Token:', inviteResult.token);

      // Fechar modal e recarregar lista independente do resultado do email
      setShowInviteModal(false);
      setNewInvite({ email: '', tipo: 'aluno' });
      await loadInvites();

      // Mostrar feedback apropriado
      if (!emailSent) {
        Alert.alert(
          'Convite Criado!',
          `Convite criado com código: ${inviteResult.token}\n\nHouve problema no envio do email, mas o código é válido e pode ser compartilhado manualmente.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Convite Enviado!',
          `Convite enviado com sucesso para ${newInvite.email}\n\nCódigo: ${inviteResult.token}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      Alert.alert(getString('error'), `Não foi possível enviar o convite: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const shareQRCode = async () => {
    try {
      const joinLink = InviteService.generateJoinLink(academia.id);
      const academiaName = academia.nome || academia.name || 'Academia';
      const message = `Junte-se à ${academiaName}!\n\nEscaneie o QR Code ou use este link:\n${joinLink}`;

      await Share.share({
        message,
        title: `Convite - ${academiaName}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const deleteInvite = async (inviteId, inviteEmail) => {
    console.log('🗑️ Iniciando exclusão de convite:', { inviteId, inviteEmail, academiaId: academia?.id });

    // Usar window.confirm para compatibilidade web
    const confirmed = window.confirm(`Deseja realmente excluir o convite para ${inviteEmail}?`);

    if (!confirmed) {
      console.log('❌ Usuário cancelou a exclusão');
      return;
    }


    try {
      console.log('✅ Usuário confirmou exclusão');
      setDeletingInviteId(inviteId);

      console.log('📞 Chamando InviteService.deleteInvite...');
      await InviteService.deleteInvite(academia.id, inviteId);

      console.log('✅ Convite excluído com sucesso no Firestore!');

      // Remover imediatamente da lista local para feedback instantâneo
      console.log('🔄 Removendo convite da lista local...');
      setInvites(prevInvites => {
        const updated = prevInvites.filter(inv => inv.id !== inviteId);
        console.log('📊 Lista atualizada. Antes:', prevInvites.length, 'Depois:', updated.length);
        return updated;
      });

      console.log('🔄 Recarregando lista de convites do servidor...');
      await loadInvites();

      console.log('✅ Exclusão concluída!');
      window.alert('Convite excluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao excluir convite:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      console.error('❌ Detalhes da operação:', {
        inviteId,
        inviteEmail,
        academiaId: academia?.id,
        userRole: 'Verificar custom claims no console'
      });

      let errorMessage = 'Não foi possível excluir o convite';

      if (error.code === 'permission-denied') {
        errorMessage = '🔒 Permissão negada. Verifique se você é admin e se as regras do Firestore estão atualizadas.\n\nDetalhes técnicos: ' + error.message;
        console.error('📋 ERRO DE PERMISSÃO - Verifique:', {
          'Custom Claims': 'Execute no console: firebase.auth().currentUser.getIdTokenResult().then(t => console.log(t.claims))',
          'Academia ID': academia?.id,
          'Invite ID': inviteId
        });
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      window.alert('Erro ao Excluir: ' + errorMessage);
    } finally {
      setDeletingInviteId(null);
    }
  };


  const handleDeleteByStatus = async (status) => {
    setShowDeleteModal(false);

    const statusLabels = {
      'pending': 'Pendentes',
      'accepted': 'Aceitos',
      'expired': 'Expirados',
      'all': 'Todos'
    };

    const statusLabel = statusLabels[status] || status;

    // Usar window.confirm para compatibilidade web
    const confirmed = window.confirm(`Deseja excluir ${status === 'all' ? 'TODOS os' : 'os convites'} ${statusLabel}?`);

    if (!confirmed) return;

    try {
      setLoadingDelete(true);
      const count = await InviteService.deleteAllInvites(academia.id, status);
      window.alert(`${count} convite(s) excluído(s)!`);
      loadInvites();
    } catch (error) {
      console.error('Erro ao excluir convites:', error);
      window.alert('Não foi possível excluir os convites');
    } finally {
      setLoadingDelete(false);
    }
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
    <Card
      key={invite.id}
      style={[
        styles.inviteCard,
        deletingInviteId === invite.id && { opacity: 0.5 }
      ]}
    >
      <Card.Content>
        <View style={styles.inviteHeader}>
          <View style={styles.inviteInfo}>
            <Text variant="titleMedium" style={styles.inviteEmail}>
              {invite.email}
            </Text>
            <Text variant="bodySmall" style={styles.inviteType}>
              {invite.tipo === 'aluno' ? getString('student') : getString('instructor')}
            </Text>
            {invite.inviteToken && (
              <Text variant="bodySmall" style={styles.inviteCode}>
                Código: <Text style={{ fontWeight: 'bold', color: COLORS.primary[600] }}>{invite.inviteToken}</Text>
              </Text>
            )}
            <Text variant="bodySmall" style={styles.inviteDate}>
              Enviado em: {invite.createdAt?.toDate?.()?.toLocaleDateString() || getString('dataNotAvailable')}
            </Text>
            {invite.status === 'pending' && (
              <Text variant="bodySmall" style={styles.expiryDate}>
                Expira: {invite.expiresAt?.toDate?.()?.toLocaleDateString() || getString('dataNotAvailable')}
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(invite.status), alignSelf: 'flex-end', marginRight: 0 }]}
              textStyle={{ color: COLORS.white, fontSize: 10, marginVertical: 0, marginHorizontal: 4 }}
              compact
            >
              {getStatusText(invite.status)}
            </Chip>

            <ActionButton
              mode="text"
              onPress={() => deleteInvite(invite.id, invite.email)}
              loading={deletingInviteId === invite.id}
              disabled={deletingInviteId !== null}
              icon="delete"
              size="small"
              variant="danger"
              style={{ margin: 0, minWidth: 0, paddingHorizontal: 0 }}
              labelStyle={{ marginHorizontal: 0 }}
            >
              Excluir
            </ActionButton>
          </View>
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
              <View style={styles.headerActions}>
                <ActionButton
                  mode="text"
                  onPress={() => setShowDeleteModal(true)}
                  loading={loadingDelete}
                  disabled={loadingDelete}
                  icon="delete-sweep"
                  size="small"
                  variant="secondary"
                  style={styles.actionButton}
                >
                  Gerenciar Exclusão
                </ActionButton>
              </View>
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
            academiaCodigo={academia?.codigo}
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

      {/* Modal de Opções de Exclusão */}
      <Portal>
        <Modal
          visible={showDeleteModal}
          onDismiss={() => setShowDeleteModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Excluir Convites
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 20, textAlign: 'center' }}>
            Selecione o tipo de convite que deseja remover:
          </Text>

          <View style={{ gap: 10 }}>
            <Button
              mode="outlined"
              onPress={() => handleDeleteByStatus('pending')}
              textColor={COLORS.warning[600]}
              style={{ borderColor: COLORS.warning[600] }}
            >
              Excluir Pendentes
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeleteByStatus('accepted')}
              textColor={COLORS.primary[600]}
              style={{ borderColor: COLORS.primary[600] }}
            >
              Excluir Aceitos
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleDeleteByStatus('expired')}
              textColor={COLORS.error[600]}
              style={{ borderColor: COLORS.error[600] }}
            >
              Excluir Expirados
            </Button>
            <Divider style={{ marginVertical: 10 }} />
            <Button
              mode="contained"
              onPress={() => handleDeleteByStatus('all')}
              buttonColor={COLORS.error[600]}
            >
              Excluir TODOS
            </Button>
          </View>

          <Button
            mode="text"
            onPress={() => setShowDeleteModal(false)}
            style={{ marginTop: 20 }}
          >
            Cancelar
          </Button>
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
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: SPACING.xs,
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
  inviteCode: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.gray[600],
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
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  deleteButton: {
    marginLeft: SPACING.sm,
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
