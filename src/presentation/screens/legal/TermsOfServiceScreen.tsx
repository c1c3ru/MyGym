import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import { useTheme } from '@contexts/ThemeContext';
import type { NavigationProp } from '@react-navigation/native';



interface TermsOfServiceScreenProps {
  navigation: NavigationProp<any>;
}

/**
 * Termos de uso
 * Exibe termos e condições de uso do aplicativo
 */
const TermsOfServiceScreen = ({ navigation }: TermsOfServiceScreenProps) => {
  const { isDarkMode } = useTheme();

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Termos de Uso" />
        </Appbar.Header>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Termos de Uso do MyGym</Text>
              <Text style={styles.lastUpdate}>Última atualização: 01 de outubro de 2025</Text>

              <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
              <Text style={styles.paragraph}>
                Ao acessar e usar o aplicativo MyGym, você concorda em cumprir e estar vinculado a estes
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nosso aplicativo.
              </Text>

              <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
              <Text style={styles.paragraph}>
                O MyGym é uma plataforma de gestão para academias de artes marciais que oferece:
              </Text>
              <Text style={styles.listItem}>• Gerenciamento de alunos e turmas</Text>
              <Text style={styles.listItem}>• Controle de frequência e check-in</Text>
              <Text style={styles.listItem}>• Acompanhamento de graduações e evolução</Text>
              <Text style={styles.listItem}>• Gestão de pagamentos e mensalidades</Text>
              <Text style={styles.listItem}>• Comunicação entre instrutores e alunos</Text>

              <Text style={styles.sectionTitle}>3. Cadastro e Conta de Usuário</Text>
              <Text style={styles.paragraph}>
                Para utilizar o MyGym, você deve:
              </Text>
              <Text style={styles.listItem}>• Fornecer informações verdadeiras, precisas e completas</Text>
              <Text style={styles.listItem}>• Manter suas credenciais de acesso seguras</Text>
              <Text style={styles.listItem}>• Ser responsável por todas as atividades em sua conta</Text>
              <Text style={styles.listItem}>• Notificar-nos imediatamente sobre uso não autorizado</Text>

              <Text style={styles.sectionTitle}>4. Uso Aceitável</Text>
              <Text style={styles.paragraph}>
                Você concorda em NÃO:
              </Text>
              <Text style={styles.listItem}>• Usar o serviço para fins ilegais ou não autorizados</Text>
              <Text style={styles.listItem}>• Tentar acessar áreas restritas do sistema</Text>
              <Text style={styles.listItem}>• Interferir no funcionamento do aplicativo</Text>
              <Text style={styles.listItem}>• Compartilhar conteúdo ofensivo ou inadequado</Text>
              <Text style={styles.listItem}>• Violar direitos de propriedade intelectual</Text>

              <Text style={styles.sectionTitle}>5. Privacidade e Proteção de Dados</Text>
              <Text style={styles.paragraph}>
                Seus dados pessoais são tratados de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
                e nossa Política de Privacidade. Coletamos apenas os dados necessários para o funcionamento do serviço.
              </Text>

              <Text style={styles.sectionTitle}>6. Propriedade Intelectual</Text>
              <Text style={styles.paragraph}>
                Todo o conteúdo do MyGym, incluindo textos, gráficos, logos, ícones e software, é propriedade
                exclusiva do MyGym e está protegido por leis de direitos autorais.
              </Text>

              <Text style={styles.sectionTitle}>7. Limitação de Responsabilidade</Text>
              <Text style={styles.paragraph}>
                O MyGym é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será
                ininterrupto, seguro ou livre de erros. Não nos responsabilizamos por:
              </Text>
              <Text style={styles.listItem}>• Perda de dados ou informações</Text>
              <Text style={styles.listItem}>• Interrupções no serviço</Text>
              <Text style={styles.listItem}>• Erros ou imprecisões no conteúdo</Text>
              <Text style={styles.listItem}>• Danos indiretos ou consequenciais</Text>

              <Text style={styles.sectionTitle}>8. Modificações dos Termos</Text>
              <Text style={styles.paragraph}>
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações
                entrarão em vigor imediatamente após a publicação. O uso continuado do aplicativo após as
                modificações constitui aceitação dos novos termos.
              </Text>

              <Text style={styles.sectionTitle}>9. Cancelamento e Suspensão</Text>
              <Text style={styles.paragraph}>
                Podemos suspender ou encerrar sua conta a qualquer momento, sem aviso prévio, por violação
                destes termos ou por qualquer outro motivo que consideremos apropriado.
              </Text>

              <Text style={styles.sectionTitle}>10. Lei Aplicável</Text>
              <Text style={styles.paragraph}>
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer
                disputa será resolvida nos tribunais brasileiros.
              </Text>

              <Text style={styles.sectionTitle}>11. Contato</Text>
              <Text style={styles.paragraph}>
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </Text>
              <Text style={styles.listItem}>• Email: suporte@mygym.com.br</Text>
              <Text style={styles.listItem}>• Telefone: (11) 9999-9999</Text>

              <Text style={styles.footer}>
                Ao usar o MyGym, você confirma que leu, compreendeu e concorda com estes Termos de Uso.
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary[600],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  lastUpdate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT_SIZE.base,
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: SPACING.md,
    textAlign: 'justify',
  },
  listItem: {
    fontSize: FONT_SIZE.base,
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.md,
  },
  footer: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen;
