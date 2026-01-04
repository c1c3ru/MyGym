import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import { useTheme } from '@contexts/ThemeContext';
import type { NavigationProp } from '@react-navigation/native';
import { getString } from "@utils/theme";


interface PrivacyPolicyScreenProps {
  navigation: NavigationProp<any>;
}

/**
 * Política de privacidade LGPD
 * Exibe termos de privacidade e proteção de dados
 */
const PrivacyPolicyScreen = ({ navigation }: PrivacyPolicyScreenProps) => {
  const { isDarkMode, getString } = useTheme();

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Política de Privacidade" />
        </Appbar.Header>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Política de Privacidade do MyGym</Text>
              <Text style={styles.lastUpdate}>Última atualização: 01 de outubro de 2025</Text>

              <Text style={styles.sectionTitle}>1. Introdução</Text>
              <Text style={styles.paragraph}>
                Esta Política de Privacidade descreve como o MyGym coleta, usa, armazena e protege seus dados
                pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
              </Text>

              <Text style={styles.sectionTitle}>2. Dados Coletados</Text>
              <Text style={styles.paragraph}>
                Coletamos os seguintes tipos de dados pessoais:
              </Text>

              <Text style={styles.subsectionTitle}>2.1. Dados de Cadastro:</Text>
              <Text style={styles.listItem}>• Nome completo</Text>
              <Text style={styles.listItem}>• Email</Text>
              <Text style={styles.listItem}>• Telefone/WhatsApp</Text>
              <Text style={styles.listItem}>• Tipo de usuário (aluno, instrutor, administrador)</Text>

              <Text style={styles.subsectionTitle}>2.2. Dados de Uso:</Text>
              <Text style={styles.listItem}>• Histórico de frequência e check-ins</Text>
              <Text style={styles.listItem}>• Graduações e evoluções</Text>
              <Text style={styles.listItem}>• Turmas matriculadas</Text>
              <Text style={styles.listItem}>• Avaliações físicas</Text>
              <Text style={styles.listItem}>• Histórico de pagamentos</Text>

              <Text style={styles.subsectionTitle}>2.3. Dados Técnicos:</Text>
              <Text style={styles.listItem}>• Endereço IP</Text>
              <Text style={styles.listItem}>• Tipo de dispositivo</Text>
              <Text style={styles.listItem}>• Sistema operacional</Text>
              <Text style={styles.listItem}>• Logs de acesso</Text>

              <Text style={styles.sectionTitle}>3. Finalidade do Tratamento</Text>
              <Text style={styles.paragraph}>
                Utilizamos seus dados pessoais para:
              </Text>
              <Text style={styles.listItem}>• Criar e gerenciar sua conta</Text>
              <Text style={styles.listItem}>• Fornecer os serviços do aplicativo</Text>
              <Text style={styles.listItem}>• Processar pagamentos e mensalidades</Text>
              <Text style={styles.listItem}>• Enviar notificações sobre aulas e eventos</Text>
              <Text style={styles.listItem}>• Melhorar nossos serviços</Text>
              <Text style={styles.listItem}>• Cumprir obrigações legais</Text>
              <Text style={styles.listItem}>• Prevenir fraudes e garantir segurança</Text>

              <Text style={styles.sectionTitle}>4. Base Legal (LGPD)</Text>
              <Text style={styles.paragraph}>
                O tratamento de seus dados pessoais é baseado em:
              </Text>
              <Text style={styles.listItem}>• Consentimento (Art. 7º, I da LGPD)</Text>
              <Text style={styles.listItem}>• Execução de contrato (Art. 7º, V da LGPD)</Text>
              <Text style={styles.listItem}>• Legítimo interesse (Art. 7º, IX da LGPD)</Text>
              <Text style={styles.listItem}>• Cumprimento de obrigação legal (Art. 7º, II da LGPD)</Text>

              <Text style={styles.sectionTitle}>5. Compartilhamento de Dados</Text>
              <Text style={styles.paragraph}>
                Seus dados podem ser compartilhados com:
              </Text>
              <Text style={styles.listItem}>• Academia à qual você está vinculado</Text>
              <Text style={styles.listItem}>• Instrutores das turmas em que está matriculado</Text>
              <Text style={styles.listItem}>• Processadores de pagamento (quando aplicável)</Text>
              <Text style={styles.listItem}>• Autoridades legais (quando exigido por lei)</Text>

              <Text style={styles.paragraph}>
                Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.
              </Text>

              <Text style={styles.sectionTitle}>6. Armazenamento e Segurança</Text>
              <Text style={styles.paragraph}>
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
              </Text>
              <Text style={styles.listItem}>• Criptografia de dados em trânsito e em repouso</Text>
              <Text style={styles.listItem}>• Controles de acesso rigorosos</Text>
              <Text style={styles.listItem}>• Monitoramento contínuo de segurança</Text>
              <Text style={styles.listItem}>• Backups regulares</Text>
              <Text style={styles.listItem}>• Servidores seguros (Firebase/Google Cloud)</Text>

              <Text style={styles.sectionTitle}>7. Retenção de Dados</Text>
              <Text style={styles.paragraph}>
                Mantemos seus dados pessoais pelo tempo necessário para:
              </Text>
              <Text style={styles.listItem}>• Cumprir as finalidades descritas nesta política</Text>
              <Text style={styles.listItem}>• Atender obrigações legais e regulatórias</Text>
              <Text style={styles.listItem}>• Resolver disputas e fazer cumprir acordos</Text>

              <Text style={styles.paragraph}>
                Após esse período, os dados serão excluídos ou anonimizados de forma segura.
              </Text>

              <Text style={styles.sectionTitle}>8. Seus Direitos (LGPD)</Text>
              <Text style={styles.paragraph}>
                De acordo com a LGPD, você tem direito a:
              </Text>
              <Text style={styles.listItem}>• Confirmação da existência de tratamento</Text>
              <Text style={styles.listItem}>• Acesso aos seus dados</Text>
              <Text style={styles.listItem}>• Correção de dados incompletos ou desatualizados</Text>
              <Text style={styles.listItem}>• Anonimização, bloqueio ou eliminação de dados</Text>
              <Text style={styles.listItem}>• Portabilidade dos dados</Text>
              <Text style={styles.listItem}>• Eliminação dos dados tratados com consentimento</Text>
              <Text style={styles.listItem}>• Informação sobre compartilhamento</Text>
              <Text style={styles.listItem}>• Revogação do consentimento</Text>

              <Text style={styles.sectionTitle}>9. Cookies e Tecnologias Similares</Text>
              <Text style={styles.paragraph}>
                Utilizamos cookies e tecnologias similares para:
              </Text>
              <Text style={styles.listItem}>• Manter sua sessão ativa</Text>
              <Text style={styles.listItem}>• Lembrar suas preferências</Text>
              <Text style={styles.listItem}>• Analisar o uso do aplicativo</Text>
              <Text style={styles.listItem}>• Melhorar a experiência do usuário</Text>

              <Text style={styles.sectionTitle}>10. Menores de Idade</Text>
              <Text style={styles.paragraph}>
                O MyGym pode ser usado por menores de 18 anos, desde que com autorização dos pais ou
                responsáveis legais. Os dados de menores recebem proteção especial conforme a LGPD.
              </Text>

              <Text style={styles.sectionTitle}>11. Alterações nesta Política</Text>
              <Text style={styles.paragraph}>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre
                alterações significativas através do aplicativo ou por email.
              </Text>

              <Text style={styles.sectionTitle}>12. Encarregado de Dados (DPO)</Text>
              <Text style={styles.paragraph}>
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
              </Text>
              <Text style={styles.listItem}>• Email: dpo@mygym.com.br</Text>
              <Text style={styles.listItem}>• Email alternativo: privacidade@mygym.com.br</Text>
              <Text style={styles.listItem}>• Telefone: (11) 9999-9999</Text>

              <Text style={styles.sectionTitle}>13. Autoridade Nacional</Text>
              <Text style={styles.paragraph}>
                Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD):
              </Text>
              <Text style={styles.listItem}>• Site: www.gov.br/anpd</Text>
              <Text style={styles.listItem}>• Email: anpd@anpd.gov.br</Text>

              <Text style={styles.footer}>
                Ao usar o MyGym, você confirma que leu, compreendeu e concorda com esta Política de Privacidade
                e com o tratamento de seus dados pessoais conforme descrito.
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
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.black,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  subsectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
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

export default PrivacyPolicyScreen;
