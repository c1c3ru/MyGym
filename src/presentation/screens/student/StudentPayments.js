import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, useWindowDimensions } from 'react-native';
import {
  Card,
  Button,
  Chip,
  Divider,
  Text,
  FAB,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { paymentService, firestoreService } from '@infrastructure/services/firestoreService';
import academyCollectionsService from '@infrastructure/services/academyCollectionsService';
import { Linking, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_WIDTH, BORDER_RADIUS } from '@presentation/theme/designTokens';

const StudentPayments = ({ navigation }) => {
  const { user, userProfile, academia } = useAuthFacade();
  const { getString, theme } = useTheme();
  const colors = theme.colors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const userPayments = await paymentService.getPaymentsByStudent(user.id, academia?.id);
      setPayments(userPayments);

      // Carregar planos disponíveis
      if (academia?.id) {
        const availablePlans = await academyCollectionsService.getPlans(academia.id);
        setPlans(availablePlans || []);
      }

      // Encontrar pagamento atual (mais recente)
      const current = userPayments.find(p => p.status === 'pending') || userPayments[0];
      setCurrentPayment(current);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      Alert.alert(getString('error'), getString('cannotLoadPayments'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const handlePayWithPix = () => {
    Alert.alert(
      getString('pixPayment'),
      getString('pixFeatureComingSoon'),
      [{ text: getString('ok') }]
    );
  };

  const handleContactWhatsApp = async () => {
    try {
      let phoneNumber = academia?.phone;

      // Se não tiver telefone na academia, tentar buscar do dono (admin)
      if (!phoneNumber && academia?.ownerId) {
        try {
          const adminProfile = await firestoreService.getById('users', academia.ownerId);
          if (adminProfile?.phone) {
            phoneNumber = adminProfile.phone;
          }
        } catch (err) {
          console.log('Erro ao buscar telefone do admin:', err);
        }
      }

      if (!phoneNumber) {
        Alert.alert(getString('attention'), getString('whatsappNotFound') || 'Contato não cadastrado');
        return;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove caracteres não numéricos
      // Verifica se o número já tem código do país (assumindo BR +55 se > 11 dígitos ou começa com 55)
      // Caso simples: Adiciona 55 se parecer um número local
      const countryCode = cleanPhone.length <= 11 ? '55' : '';

      const fullPhone = `${countryCode}${cleanPhone}`;

      const message = encodeURIComponent(`Olá! Sou ${userProfile?.name || 'um aluno'} e gostaria de tirar dúvidas sobre pagamentos.`);

      const appUrl = `whatsapp://send?phone=${fullPhone}&text=${message}`;
      const webUrl = `https://wa.me/${fullPhone}?text=${message}`;

      try {
        const supported = await Linking.canOpenURL(appUrl);
        if (supported) {
          await Linking.openURL(appUrl);
        } else {
          await Linking.openURL(webUrl);
        }
      } catch (linkError) {
        console.log('Erro ao verificar URL do WhatsApp, tentando link web:', linkError);
        // Fallback garantido para web em caso de erro no check
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert(getString('error'), getString('cannotOpenWhatsapp') || 'Não foi possível abrir o WhatsApp');
    }
  };

  const handleRequestPlan = async (plan) => {
    try {
      let phoneNumber = academia?.phone;
      if (!phoneNumber && academia?.ownerId) {
        const adminProfile = await firestoreService.getById('users', academia.ownerId);
        if (adminProfile?.phone) phoneNumber = adminProfile.phone;
      }

      if (!phoneNumber) {
        Alert.alert(getString('attention'), getString('whatsappNotFound'));
        return;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const countryCode = cleanPhone.length <= 11 ? '55' : '';
      const fullPhone = `${countryCode}${cleanPhone}`;

      const message = encodeURIComponent(`Olá! Sou ${userProfile?.name || 'um aluno'} e tenho interesse no plano *${plan.name}* (${formatCurrency(plan.value)}). Como faço para assinar?`);

      const url = Platform.OS === 'web'
        ? `https://wa.me/${fullPhone}?text=${message}`
        : `whatsapp://send?phone=${fullPhone}&text=${message}`;

      await Linking.openURL(url).catch(() => Linking.openURL(`https://wa.me/${fullPhone}?text=${message}`));
    } catch (error) {
      console.error('Erro ao solicitar plano:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return COLORS.success[500];
      case 'pending': return COLORS.warning[500];
      case 'overdue': return COLORS.error[500];
      default: return colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return getString('paid');
      case 'pending': return getString('paymentPending');
      case 'overdue': return getString('overdue');
      default: return getString('notInformed');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString('currency')
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return getString('dateNotInformed');
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Status Atual */}
        {currentPayment && (
          <Card style={styles.currentCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="card-outline" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, styles.title]}>Mensalidade Atual</Text>
              </View>

              <View style={styles.currentPaymentInfo}>
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Plano:</Text>
                  <Text style={styles.value}>{currentPayment.planName || 'Mensal'}</Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Valor:</Text>
                  <Text style={styles.value}>{formatCurrency(currentPayment.amount)}</Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Vencimento:</Text>
                  <Text style={styles.value}>{formatDate(currentPayment.dueDate)}</Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Chip
                    mode="outlined"
                    style={[styles.statusChip, { borderColor: getStatusColor(currentPayment.status) }]}
                    textStyle={{ color: getStatusColor(currentPayment.status) }}
                  >
                    {getStatusText(currentPayment.status)}
                  </Chip>
                </View>
              </View>

              {currentPayment.status === 'pending' && (
                <Button
                  mode="contained"
                  onPress={handlePayWithPix}
                  style={styles.payButton}
                  icon="qrcode"
                  buttonColor={colors.primary}
                  textColor={colors.onPrimary}
                >
                  Pagar com PIX
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Histórico de Pagamentos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color={colors.onSurfaceVariant} />
              <Text style={[styles.cardTitle, styles.title]}>Histórico de Pagamentos</Text>
            </View>

            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <View key={payment.id || index}>
                  <List.Item
                    title={`${payment.planName || getString('monthlyFee')} - ${formatCurrency(payment.amount)}`}
                    titleStyle={{ color: colors.onSurface }}
                    description={`Vencimento: ${formatDate(payment.dueDate)}`}
                    descriptionStyle={{ color: colors.onSurfaceVariant }}
                    left={() => (
                      <List.Icon
                        icon="receipt"
                        color={getStatusColor(payment.status)}
                      />
                    )}
                    right={() => (
                      <Chip
                        mode="outlined"
                        style={[styles.listStatusChip, { borderColor: getStatusColor(payment.status) }]}
                        textStyle={{ color: getStatusColor(payment.status), fontSize: FONT_SIZE.sm }}
                      >
                        {getStatusText(payment.status)}
                      </Chip>
                    )}
                  />
                  {index < payments.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, styles.paragraph]}>
                Nenhum pagamento encontrado
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Planos Disponíveis - Visual Premium */}
        <View style={styles.plansSection}>
          <View style={styles.cardHeader}>
            <Ionicons name="pricetags-outline" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, styles.title]}>Planos Disponíveis</Text>
          </View>

          {plans.length > 0 ? (
            Platform.OS === 'web' ? (
              <View style={styles.webPlansGrid}>
                {plans.map((plan, index) => (
                  <View key={plan.id || index} style={styles.webPlanWrapper}>
                    <Card style={styles.planPremiumCard}>
                      <LinearGradient
                        colors={index % 2 === 0
                          ? [colors.primary, '#8E2DE2']
                          : ['#8E2DE2', '#4A00E0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.planGradient}
                      >
                        <View style={styles.planCardContent}>
                          <Text style={styles.planNamePremium}>{plan.name}</Text>
                          <View style={styles.planPriceContainer}>
                            <Text style={styles.planCurrency}>{getString('currency')}</Text>
                            <Text style={styles.planValuePremium}>
                              {plan.value?.toString().split(',')[0] || plan.value}
                            </Text>
                            <Text style={styles.planPeriod}>/{plan.duration || 1}m</Text>
                          </View>

                          <Text style={styles.planDescriptionPremium} numberOfLines={2}>
                            {plan.description || "Ideal para quem busca evolução constante no tatame."}
                          </Text>

                          <TouchableOpacity
                            style={styles.subscribeButtonPremium}
                            onPress={() => handleRequestPlan(plan)}
                          >
                            <Text style={styles.subscribeButtonText}>Quero Assinar</Text>
                            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </Card>
                  </View>
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansHorizontalScroll}
              >
                {plans.map((plan, index) => (
                  <Card key={plan.id || index} style={styles.planPremiumCard}>
                    <LinearGradient
                      colors={index % 2 === 0
                        ? [colors.primary, '#8E2DE2']
                        : ['#8E2DE2', '#4A00E0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.planGradient}
                    >
                      <View style={styles.planCardContent}>
                        <Text style={styles.planNamePremium}>{plan.name}</Text>
                        <View style={styles.planPriceContainer}>
                          <Text style={styles.planCurrency}>{getString('currency')}</Text>
                          <Text style={styles.planValuePremium}>
                            {plan.value?.toString().split(',')[0] || plan.value}
                          </Text>
                          <Text style={styles.planPeriod}>/{plan.duration || 1}m</Text>
                        </View>

                        <Text style={styles.planDescriptionPremium} numberOfLines={2}>
                          {plan.description || "Ideal para quem busca evolução constante no tatame."}
                        </Text>

                        <TouchableOpacity
                          style={styles.subscribeButtonPremium}
                          onPress={() => handleRequestPlan(plan)}
                        >
                          <Text style={styles.subscribeButtonText}>Quero Assinar</Text>
                          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </Card>
                ))}
              </ScrollView>
            )
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.emptyText}>Nenhum plano disponível</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Informações Adicionais */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Informações</Text>
            <Text style={[styles.infoText, styles.paragraph]}>
              • Os pagamentos devem ser realizados até a data de vencimento
            </Text>
            <Text style={[styles.infoText, styles.paragraph]}>
              • Após o vencimento, será cobrada multa de 2% + juros de 1% ao mês
            </Text>
            <Text style={[styles.infoText, styles.paragraph]}>
              • Em caso de dúvidas, entre em contato com a administração
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Botão de Contato */}
      <FAB
        style={styles.fab}
        icon="whatsapp"
        label="Contato"
        onPress={handleContactWhatsApp}
        color={colors.onTertiaryContainer}
        theme={{ colors: { primary: colors.tertiaryContainer } }}
      />
    </SafeAreaView >
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  currentCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 4,
    backgroundColor: colors.surface,
  },
  card: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    elevation: 2,
    backgroundColor: colors.surface
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
    color: colors.onSurface
  },
  title: { color: colors.onSurface },
  paragraph: { color: colors.onSurfaceVariant },
  currentPaymentInfo: {
    marginBottom: SPACING.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.md,
    color: colors.onSurfaceVariant,
  },
  value: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: colors.onSurface
  },
  statusChip: {
    borderWidth: BORDER_WIDTH.base,
    backgroundColor: 'transparent'
  },
  listStatusChip: {
    borderWidth: BORDER_WIDTH.base,
    height: 24,
    backgroundColor: 'transparent'
  },
  payButton: {
    marginTop: SPACING.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  infoText: {
    marginBottom: SPACING.sm,
    color: colors.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.tertiary,
  },
  plansSection: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  plansHorizontalScroll: {
    paddingRight: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  planPremiumCard: {
    width: 200,
    height: 220,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  planGradient: {
    flex: 1,
    padding: SPACING.md,
  },
  planCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  planNamePremium: {
    color: '#FFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCurrency: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.sm,
    marginRight: 2,
  },
  planValuePremium: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  planPeriod: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.sm,
  },
  planDescriptionPremium: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 16,
    marginVertical: SPACING.sm,
  },
  subscribeButtonPremium: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  subscribeButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  webPlansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  webPlanWrapper: {
    width: '16%', // Aproximadamente 6 por linha considerando o gap
    minWidth: 180,
    marginBottom: SPACING.md,
  },
});

export default StudentPayments;
