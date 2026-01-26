import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  Button,
  List,
  Switch,
  Portal,
  Modal,
  Paragraph
} from 'react-native-paper';
import ModernCard from '@components/modern/ModernCard';
import ChangePasswordForm from './ChangePasswordScreen';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import ThemeToggleSwitch from '@components/ThemeToggleSwitch';
import { useTheme } from '@contexts/ThemeContext';
import AppearanceModal from '@components/modals/AppearanceModal';
import PreferencesModal from '@components/modals/PreferencesModal';
import type { NavigationProp } from '@react-navigation/native';

interface SettingsScreenProps {
  navigation: NavigationProp<any>;
}

/**
 * Tela de configurações modernizada com glassmorphism
 * Permite ao usuário gerenciar preferências, conta e privacidade
 */
const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { user, userProfile, logout } = useAuthFacade();
  const { isDarkMode, getString, theme } = useTheme();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoBackup, setAutoBackup] = useState<boolean>(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const handleLogout = (): void => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await logout();
    } catch (error) {
      Alert.alert(getString('error'), getString('logoutError'));
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleDataExport = () => {
    Alert.alert(getString('inDevelopment'), getString('exportDataDevelopment'));
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountDialog(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteAccountDialog(false);
    Alert.alert(getString('inDevelopment'), getString('deleteAccountDevelopment'));
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={[
        styles.gradient,
        {
          minHeight: 0,
          height: Platform.OS === 'web' ? '100vh' : '100%',
          overflow: 'hidden'
        } as any
      ]}
    >
      <SafeAreaView style={[styles.container, { minHeight: 0 }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          alwaysBounceVertical={true}
        >
          {/* Informações da Conta */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={24} color={COLORS.info[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {getString('account')}
                </Text>
              </View>

              <List.Item
                title={getString('name')}
                description={userProfile?.name || getString('notInformed')}
                left={() => <Ionicons name="person" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
                descriptionStyle={{ color: theme.colors.textSecondary }}
              />

              <List.Item
                title={getString('email')}
                description={user?.email}
                left={() => <Ionicons name="mail" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
                descriptionStyle={{ color: theme.colors.textSecondary }}
              />

              <List.Item
                title={getString('editProfile')}
                left={() => <Ionicons name="create" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={() => navigation.navigate('Profile')}
                titleStyle={{ color: theme.colors.text }}
              />

              <List.Item
                title={getString('changePassword')}
                left={() => <Ionicons name="lock-closed" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={handleChangePassword}
                titleStyle={{ color: theme.colors.text }}
              />
            </View>
          </ModernCard>

          {/* Aparência */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="color-palette" size={24} color={COLORS.primary[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {getString('appearance')}
                </Text>
              </View>

              <List.Item
                title={getString('theme')}
                description={isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
                left={() => <Ionicons name="color-palette" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={() => setShowAppearanceModal(true)}
                titleStyle={{ color: theme.colors.text }}
                descriptionStyle={{ color: theme.colors.textSecondary }}
              />
            </View>
          </ModernCard>



          {/* Preferências */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="settings" size={24} color={COLORS.primary[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {getString('preferences')}
                </Text>
              </View>

              <List.Item
                title={getString('managePreferences')}
                description={getString('notificationsAndBackup')}
                left={() => <Ionicons name="options" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={() => setShowPreferencesModal(true)}
                titleStyle={{ color: theme.colors.text }}
                descriptionStyle={{ color: theme.colors.textSecondary }}
              />
            </View>
          </ModernCard>

          {/* Dados e Privacidade */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.warning[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {getString('dataAndPrivacy')}
                </Text>
              </View>

              <List.Item
                title={getString('exportData')}
                description={getString('downloadDataCopy')}
                left={() => <Ionicons name="download" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={handleDataExport}
                titleStyle={{ color: theme.colors.text }}
                descriptionStyle={{ color: theme.colors.textSecondary }}
              />

              <List.Item
                title={getString('privacyPolicy')}
                left={() => <Ionicons name="document-text" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
              />

              <List.Item
                title={getString('termsOfUse')}
                left={() => <Ionicons name="library" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
              />
            </View>
          </ModernCard>

          {/* Sobre */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={24} color={COLORS.secondary[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {getString('about')}
                </Text>
              </View>

              <List.Item
                title={getString('appVersion')}
                description="1.0.0"
                left={() => <Ionicons name="apps" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
                descriptionStyle={{ color: theme.colors.textSecondary }}
              />

              <List.Item
                title={getString('helpCenter')}
                left={() => <Ionicons name="help-circle" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
              />

              <List.Item
                title={getString('sendFeedback')}
                left={() => <Ionicons name="chatbubble-ellipses" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: theme.colors.text }}
              />
            </View>
          </ModernCard>

          {/* Ações Perigosas */}
          <ModernCard variant="card" style={styles.dangerCard}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color={COLORS.error[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, styles.dangerTitle]}>
                  {getString('dangerZone')}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleLogout}
                buttonColor={COLORS.warning[500]}
                textColor={COLORS.white}
                icon={() => <Ionicons name="log-out" size={20} color={COLORS.white} />}
                style={styles.dangerButton}
              >
                {getString('signOut')}
              </Button>

              <Button
                mode="contained"
                onPress={handleDeleteAccount}
                buttonColor={COLORS.error[500]}
                textColor={COLORS.white}
                icon={() => <Ionicons name="trash" size={20} color={COLORS.white} />}
                style={[styles.dangerButton, { marginTop: SPACING.md }]}
              >
                {getString('deleteAccount')}
              </Button>
            </View>
          </ModernCard>
        </ScrollView>

        {/* Modal de Alterar Senha */}
        <Portal>
          <Modal
            visible={showChangePasswordModal}
            onDismiss={() => setShowChangePasswordModal(false)}
            contentContainerStyle={{
              backgroundColor: theme.colors.background,
              margin: '2%',
              maxHeight: '96%',
              borderRadius: 12,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <ChangePasswordForm
              onClose={() => setShowChangePasswordModal(false)}
              onSuccess={() => {
                setShowChangePasswordModal(false);
              }}
            />
          </Modal>
        </Portal>

        {/* Dialog de Confirmação de Logout */}
        <Portal>
          <Modal
            visible={showLogoutDialog}
            onDismiss={() => setShowLogoutDialog(false)}
            contentContainerStyle={{
              backgroundColor: theme.colors.background,
              margin: 20,
              padding: 20,
              borderRadius: 12,
              maxWidth: 400,
              alignSelf: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: theme.colors.text, marginBottom: SPACING.md }}>
              {getString('logout')}
            </Text>
            <Paragraph style={{ color: theme.colors.text, marginBottom: SPACING.lg }}>
              {getString('confirmLogoutMessage')}
            </Paragraph>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm }}>
              <Button
                onPress={() => setShowLogoutDialog(false)}
                textColor={theme.colors.text}
              >
                {getString('cancel')}
              </Button>
              <Button
                onPress={confirmLogout}
                textColor={COLORS.white}
                mode="contained"
                buttonColor={COLORS.error[500]}
              >
                {getString('logout')}
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Dialog de Confirmação de Exclusão de Conta */}
        <Portal>
          <Modal
            visible={showDeleteAccountDialog}
            onDismiss={() => setShowDeleteAccountDialog(false)}
            contentContainerStyle={{
              backgroundColor: theme.colors.background,
              margin: 20,
              padding: 20,
              borderRadius: 12,
              maxWidth: 400,
              alignSelf: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.error[500], marginBottom: SPACING.md }}>
              {getString('deleteAccount')}
            </Text>
            <Paragraph style={{ color: theme.colors.text, marginBottom: SPACING.lg }}>
              {getString('deleteAccountWarning')}
            </Paragraph>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm }}>
              <Button
                onPress={() => setShowDeleteAccountDialog(false)}
                textColor={theme.colors.text}
              >
                {getString('cancel')}
              </Button>
              <Button
                onPress={confirmDeleteAccount}
                textColor={COLORS.white}
                mode="contained"
                buttonColor={COLORS.error[500]}
              >
                {getString('delete')}
              </Button>
            </View>
          </Modal>
        </Portal>

        <AppearanceModal
          visible={showAppearanceModal}
          onDismiss={() => setShowAppearanceModal(false)}
        />

        <PreferencesModal
          visible={showPreferencesModal}
          onDismiss={() => setShowPreferencesModal(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 3,
    paddingHorizontal: SPACING.md,
    flexGrow: 1,
  },
  card: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dangerCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error[500],
    marginBottom: SPACING.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold as any,
  },
  dangerTitle: {
    color: COLORS.error[500],
  },
  dangerButton: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
});

export default SettingsScreen;
