import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Chip,
  Divider,
  Surface,
  Modal,
  Portal,
  TextInput,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { firestoreService } from '@services/firestoreService';
import { getThemeColors } from '@theme/professionalTheme';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp } from '@react-navigation/native';

interface PaymentManagementScreenProps {
  navigation: NavigationProp<any>;
}

const PaymentManagementScreen: React.FC<PaymentManagementScreenProps> = ({ navigation }) => {
  const { currentTheme } = useThemeToggle();
  const { getString } = useTheme();
  const { user, userProfile, academia } = useAuth();
  const { getUserTypeColor } = useCustomClaims();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customDueDate, setCustomDueDate] = useState(new Date());

  const themeColors = { primary: getUserTypeColor() };

  useEffect(() => {
    loadPaymentData();
    loadPlans();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);

      // Buscar pagamentos do usuário
      const userPayments = await firestoreService.getDocuments(
        `gyms/${academia.id}/payments`,
        [{ field: 'userId', operator: '==', value: user.id }],
        { field: 'createdAt', direction: 'desc' }
      );

      setPayments(userPayments);

      // Buscar plano atual
      const activePlan = userPayments.find(p => p.status === 'active');
      setCurrentPlan(activePlan);

    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPlans = async () => {
    try {
      const availablePlans = await firestoreService.getAll('plans');
      setPlans(availablePlans);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPaymentData();
    loadPlans();
  };

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      Alert.alert(getString('error'), 'Selecione um plano');
      return;
    }

    try {
      const paymentData = {
        userId: user.id,
        userName: userProfile?.name || user.email,
        academiaId: academia.id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.value,
        dueDate: customDueDate,
        status: 'pending',
        createdAt: new Date(),
        paymentMethod: null,
        paidAt: null
      };

      await firestoreService.create(`gyms/${academia.id}/payments`, paymentData);

      Alert.alert(
        'Plano Selecionado!',
        `Plano ${selectedPlan.name} selecionado com sucesso. Vencimento: ${customDueDate.toLocaleDateString('pt-BR')}`,
        [{
          text: getString('ok'), onPress: () => {
            setShowPlanModal(false);
            loadPaymentData();
          }
        }]
      );

    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
      Alert.alert(getString('error'), 'Não foi possível selecionar o plano');
    }
  };

  const handlePayment = (payment) => {
    Alert.alert(
      'Realizar Pagamento',
      `Confirmar pagamento de ${formatCurrency(payment.amount)}?`,
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('confirm'),
          onPress: async () => {
            try {
              await firestoreService.update(`gyms/${academia.id}/payments`, payment.id, {
                status: 'paid',
                paidAt: new Date(),
                paymentMethod: 'app'
              });

              Alert.alert(getString('success'), 'Pagamento realizado com sucesso!');
              loadPaymentData();
            } catch (error) {
              Alert.alert(getString('error'), 'Não foi possível processar o pagamento');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString('currency')
    }).format(value || 0);
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'paid': COLORS.success[500],
      'pending': COLORS.warning[500],
      'overdue': COLORS.error[500],
      'active': themeColors.primary
    };
    return colors[status] || COLORS.text.secondary;
  };

  const getPaymentStatusText = (status: string) => {
    const texts = {
      'paid': getString('paid'),
      'pending': getString('paymentPending'),
      'overdue': getString('overdue'),
      'active': getString('active')
    };
    return texts[status] || status;
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Plano Atual */}
        {currentPlan && (
          <Card style={[styles.card, styles.currentPlanCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color={themeColors.primary} />
                <Text style={styles.cardTitle}>Plano Atual</Text>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getPaymentStatusColor(currentPlan.status) }]}
                  textStyle={{ color: COLORS.white, fontWeight: '700' as const }}
                >
                  {getPaymentStatusText(currentPlan.status)}
                </Chip>
              </View>

              <View style={styles.planDetails}>
                <Text style={styles.planName}>{currentPlan.planName}</Text>
                <Text style={styles.planValue}>{formatCurrency(currentPlan.amount)}</Text>

                {currentPlan.dueDate && (
                  <View style={styles.dueDateContainer}>
                    <Text style={styles.dueDateLabel}>Próximo vencimento:</Text>
                    <Text style={[
                      styles.dueDateValue,
                      { color: getDaysUntilDue(currentPlan.dueDate) <= 3 ? COLORS.error[500] : COLORS.text.secondary }
                    ]}>
                      {formatDate(currentPlan.dueDate)}
                      {getDaysUntilDue(currentPlan.dueDate) !== null && (
                        <Text style={styles.daysLeft}>
                          {getDaysUntilDue(currentPlan.dueDate) > 0
                            ? ` (${getDaysUntilDue(currentPlan.dueDate)} dias)`
                            : ' (Vencido)'
                          }
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Pagamentos Pendentes */}
        {payments.filter(p => p.status === 'pending' || p.status === 'overdue').length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color={COLORS.warning[500]} />
                <Text style={styles.cardTitle}>Pagamentos Pendentes</Text>
              </View>

              {payments.filter(p => p.status === 'pending' || p.status === 'overdue').map((payment) => (
                <Surface key={payment.id} style={styles.paymentItem} elevation={1}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentPlan}>{payment.planName}</Text>
                      <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                      <Text style={styles.paymentDue}>
                        Vence em: {formatDate(payment.dueDate)}
                      </Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handlePayment(payment)}
                      style={[styles.payButton, { backgroundColor: COLORS.success[500] }]}
                      icon="credit-card"
                    >
                      Pagar
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Histórico de Pagamentos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color={themeColors.secondary} />
              <Text style={styles.cardTitle}>Histórico de Pagamentos</Text>
            </View>

            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <View key={payment.id || index}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyPlan}>{payment.planName}</Text>
                      <Text style={styles.historyAmount}>{formatCurrency(payment.amount)}</Text>
                      <Text style={styles.historyDate}>
                        {payment.paidAt ? `Pago em ${formatDate(payment.paidAt)}` : `Criado em ${formatDate(payment.createdAt)}`}
                      </Text>
                    </View>
                    <Chip
                      mode="outlined"
                      style={[styles.historyStatus, { borderColor: getPaymentStatusColor(payment.status) }]}
                      textStyle={{ color: getPaymentStatusColor(payment.status) }}
                    >
                      {getPaymentStatusText(payment.status)}
                    </Chip>
                  </View>
                  {index < payments.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="currentTheme.gray[300]" />
                <Text style={styles.emptyText}>Nenhum pagamento registrado</Text>
                <Text style={styles.emptySubtext}>Selecione um plano para começar</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB para Selecionar Plano */}
      <FAB
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        icon="plus"
        label="Selecionar Plano"
        onPress={() => setShowPlanModal(true)}
      />

      {/* Modal de Seleção de Plano */}
      <Portal>
        <Modal
          visible={showPlanModal}
          onDismiss={() => setShowPlanModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Selecionar Plano</Text>

          <ScrollView style={styles.modalContent}>
            <RadioButton.Group
              onValueChange={(value: any) => {
                const plan = plans.find(p => p.id === value);
                setSelectedPlan(plan);
              }}
              value={selectedPlan?.id || ''}
            >
              {plans.map((plan) => (
                <Surface key={plan.id} style={styles.planOption} elevation={1}>
                  <View style={styles.planOptionContent}>
                    <RadioButton value={plan.id} />
                    <View style={styles.planOptionInfo}>
                      <Text style={styles.planOptionName}>{plan.name}</Text>
                      <Text style={styles.planOptionValue}>{formatCurrency(plan.value)}</Text>
                      {plan.description && (
                        <Text style={styles.planOptionDescription}>{plan.description}</Text>
                      )}
                    </View>
                  </View>
                </Surface>
              ))}
            </RadioButton.Group>

            {selectedPlan && (
              <View style={styles.dueDateSection}>
                <Text style={styles.dueDateSectionTitle}>Data de Vencimento</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  icon="calendar"
                  style={styles.dateButton}
                >
                  {customDueDate.toLocaleDateString('pt-BR')}
                </Button>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowPlanModal(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSelectPlan}
              style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
              disabled={!selectedPlan}
            >
              Confirmar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={customDueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setCustomDueDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.base,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  currentPlanCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    marginLeft: 8,
    flex: 1,
  },
  statusChip: {
    elevation: 2,
  },
  planDetails: {
    marginTop: SPACING.sm,
  },
  planName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700' as const,
    marginBottom: SPACING.xs,
  },
  planValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700' as const,
    color: COLORS.primary[500],
    marginBottom: SPACING.md,
  },
  dueDateContainer: {
    backgroundColor: COLORS.background.light,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  dueDateLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  dueDateValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
  },
  daysLeft: {
    fontSize: FONT_SIZE.base,
    fontWeight: 'normal',
  },
  paymentItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentPlan: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },
  paymentAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    color: COLORS.warning[500],
    marginBottom: SPACING.xs,
  },
  paymentDue: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  payButton: {
    borderRadius: BORDER_RADIUS.lg,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyPlan: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500' as const,
    marginBottom: SPACING.xs,
  },
  historyAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    marginBottom: SPACING.xs,
  },
  historyDate: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  historyStatus: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[400],
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700' as const,
    textAlign: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalContent: {
    padding: SPACING.lg,
    maxHeight: 400,
  },
  planOption: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  planOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  planOptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  planOptionName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
  },
  planOptionValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  planOptionDescription: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  dueDateSection: {
    marginTop: 20,
    padding: SPACING.base,
    backgroundColor: COLORS.background.light,
    borderRadius: BORDER_RADIUS.md,
  },
  dueDateSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    marginBottom: SPACING.md,
  },
  dateButton: {
    borderColor: COLORS.info[500],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default PaymentManagementScreen;
