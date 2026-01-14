import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Linking, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  List,
  Divider,
  ActivityIndicator,
  Chip,
  FAB,
  Modal,
  Portal,
  Snackbar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@infrastructure/services/firebase';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { initializeAcademySubcollections } from '@infrastructure/services/academyInitializationService';
import { InviteService } from '@infrastructure/services/inviteService';
import { isAdmin, getCanonicalUserType } from '@utils/userTypeHelpers';
import QRCodeScanner from '@components/QRCodeScanner';
import CountryStatePicker from '@components/CountryStatePicker';
import PhonePicker from '@components/PhonePicker';
import ModalityPicker from '@components/ModalityPicker';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface AcademiaSelectionScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const AcademiaSelectionScreen: React.FC<AcademiaSelectionScreenProps> = ({ navigation, route }) => {
  const { user, userProfile, updateUserProfile, updateAcademiaAssociation, logout: signOut } = useAuthFacade();
  const { getString, isDarkMode } = useTheme();
  const { role, isAdmin } = useCustomClaims();
  const forceCreate = route?.params?.forceCreate || false;
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [academias, setGyms] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAcademiaData, setNewAcademiaData] = useState({
    nome: '',
    email: '',
    plano: 'free',
    // Endereço completo
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      estadoNome: '',
      pais: 'BR',
      paisNome: 'Brasil'
    },
    // Telefone com código internacional
    telefone: {
      codigoPais: 'BR',
      numero: ''
    },
    // Modalidades oferecidas
    modalidades: []
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);

  // Estados para feedback visual
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' // 'success', 'error', 'info'
  });

  // Funções para controlar o Snackbar
  const showSnackbar = (message: string, type = 'success') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    // O AppNavigator irá gerenciar o redirecionamento automaticamente
    // quando o usuário tiver academiaId
    console.log('🏢 AcademiaSelection: userProfile.academiaId:', userProfile?.academiaId);

    // Se forceCreate é true (admin), abrir automaticamente o formulário de criação
    if (forceCreate) {
      console.log('🏢 AcademiaSelection: Admin deve criar academia, abrindo formulário');
      setShowCreateForm(true);
    }
  }, [userProfile, forceCreate]);

  const searchAcademiaByCode = async () => {
    if (!searchCode.trim()) {
      showSnackbar(getString('enterAcademyCode'), 'error');
      return;
    }

    setSearchLoading(true);
    try {
      // Buscar por campo 'codigo' em vez de usar como ID do documento
      const q = query(
        collection(db, 'gyms'),
        where('codigo', '==', searchCode.trim().toUpperCase())
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const academiaDoc = querySnapshot.docs[0];
        const academiaData = academiaDoc.data();
        setGyms([{
          id: academiaDoc.id,
          ...academiaData
        }]);
        showSnackbar(getString('academyFoundSuccess'), 'success');
      } else {
        showSnackbar(getString('academyNotFound'), 'error');
        setGyms([]);
      }
    } catch (error) {
      console.error(getString('logoutError'), error);
      showSnackbar(getString('errorSearchingAcademy'), 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const joinAcademia = async (academiaId: string, tipo: string = 'aluno') => {
    setLoading(true);
    try {
      await updateAcademiaAssociation(academiaId);
      showSnackbar(getString('associatedSuccessfully'), 'success');
      // O AppNavigator irá detectar a mudança e redirecionar automaticamente
      console.log('✅ AcademiaSelection: Usuário associado, AppNavigator irá redirecionar');
    } catch (error) {
      console.error(getString('logoutError'), error);
      showSnackbar(getString('errorAssociating'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScan = async (data: string) => {
    try {
      const urlInfo: any = InviteService.parseInviteUrl(data);

      if (!urlInfo) {
        Alert.alert(getString('error'), getString('invalidQRCode'));
        return;
      }

      if (urlInfo.type === 'join') {
        // Link direto de associação
        await joinAcademia(urlInfo.academiaId);
      } else if (urlInfo.type === 'invite') {
        // Link de convite
        await processInviteLink(urlInfo.token);
      }
    } catch (error) {
      console.error(getString('logoutError'), error);
      Alert.alert(getString('error'), getString('errorProcessingQR'));
    } finally {
      setShowQRScanner(false);
    }
  };

  const processInviteLink = async (token: string) => {
    setLoading(true);
    try {
      // Usar busca global temporariamente para compatibilidade com links antigos
      const invite: any = await InviteService.findInviteByTokenGlobally(token);

      if (!invite) {
        Alert.alert(getString('error'), getString('invalidOrExpiredInvite'));
        return;
      }

      if (!user) throw new Error('User not authenticated');
      const result: any = await InviteService.acceptInvite(invite.academiaId, invite.id, user.id);
      await joinAcademia(result.academiaId, result.tipo);
    } catch (error) {
      console.error(getString('logoutError'), error);
      Alert.alert(getString('error'), getString('errorProcessingInvite'));
    } finally {
      setLoading(false);
    }
  };

  const handleInviteLinkSubmit = async () => {
    const input = inviteLink.trim();
    if (!input) {
      Alert.alert(getString('error'), getString('enterInviteLink'));
      return;
    }

    try {
      // Tentar processar como URL primeiro
      const urlInfo: any = InviteService.parseInviteUrl(input);

      if (urlInfo) {
        if (urlInfo.type === 'join') {
          await joinAcademia(urlInfo.academiaId);
        } else if (urlInfo.type === 'invite') {
          await processInviteLink(urlInfo.token);
        }
      } else {
        // Se não for URL, tentar processar como código direto (token)
        // Códigos curtos geralmente têm 6 caracteres
        if (input.length >= 6) {
          await processInviteLink(input);
        } else {
          Alert.alert(getString('error'), getString('invalidLinkOrCode'));
        }
      }
    } catch (error) {
      console.error(getString('logoutError'), error);
      Alert.alert(getString('error'), getString('errorProcessingInviteLink'));
    } finally {
      setShowInviteLinkModal(false);
      setInviteLink('');
    }
  };

  const createNewAcademia = async () => {
    // Debug: verificar dados do usuário
    console.log('🔍 Debug - userProfile:', userProfile);
    const userIsAdmin = isAdmin() ||
      userProfile?.userType === 'admin';

    if (!userIsAdmin) {
      Alert.alert(
        getString('permissionDenied'),
        `${getString('onlyAdminsCanCreate')}\n\n${getString('currentProfile')}: ${role || userProfile?.userType || getString('notDefined')}`
      );
      return;
    }

    const createAcademia = async () => {
      // Validações obrigatórias
      if (!newAcademiaData.nome.trim()) {
        showSnackbar(getString('academyNameRequired'), 'error');
        return;
      }

      if (!newAcademiaData.email.trim()) {
        showSnackbar(getString('emailRequired'), 'error');
        return;
      }

      if (!newAcademiaData.endereco.cidade.trim()) {
        showSnackbar(getString('cityRequired'), 'error');
        return;
      }

      if (!newAcademiaData.endereco.rua.trim()) {
        showSnackbar(getString('streetRequired'), 'error');
        return;
      }

      if (!newAcademiaData.telefone.numero.trim()) {
        showSnackbar(getString('phoneRequired'), 'error');
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAcademiaData.email.trim())) {
        showSnackbar(getString('invalidEmail'), 'error');
        return;
      }

      setLoading(true);
      try {
        // Gerar código único para a academia
        const codigoGerado = Math.random().toString(36).substr(2, 8).toUpperCase();

        // Criar nova academia no Firestore com estrutura completa
        const academiaRef = await addDoc(collection(db, 'gyms'), {
          nome: newAcademiaData.nome.trim(),
          email: newAcademiaData.email.trim(),
          endereco: {
            cep: newAcademiaData.endereco.cep.trim(),
            rua: newAcademiaData.endereco.rua.trim(),
            numero: newAcademiaData.endereco.numero.trim(),
            complemento: newAcademiaData.endereco.complemento.trim(),
            bairro: newAcademiaData.endereco.bairro.trim(),
            cidade: newAcademiaData.endereco.cidade.trim(),
            estado: newAcademiaData.endereco.estado,
            estadoNome: newAcademiaData.endereco.estadoNome,
            pais: newAcademiaData.endereco.pais,
            paisNome: newAcademiaData.endereco.paisNome
          },
          telefone: {
            codigoPais: newAcademiaData.telefone.codigoPais,
            numero: newAcademiaData.telefone.numero.trim()
          },
          modalidades: newAcademiaData.modalidades,
          plano: newAcademiaData.plano,
          adminId: user?.id,
          criadoEm: new Date(),
          ativo: true,
          codigo: codigoGerado
        });

        // Associar usuário à academia criada
        await updateAcademiaAssociation(academiaRef.id);

        // Inicializar subcoleções básicas da academia
        console.log('🚀 Inicializando subcoleções da academia...');
        await initializeAcademySubcollections(academiaRef.id);

        // Mostrar o código da academia criada
        Alert.alert(
          getString('academyCreatedSuccess'),
          getString('academyCreatedMessage').replace('{code}', codigoGerado),
          [
            {
              text: getString('copyCode'),
              onPress: () => {
                // Para React Native, seria necessário usar Clipboard
                // Por enquanto, apenas mostra o código
                showSnackbar(`Código copiado: ${codigoGerado}`, 'success');
              }
            },
            {
              text: getString('ok'),
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            }
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.error(getString('logoutError'), error);
        showSnackbar(getString('cannotCreateAcademy'), 'error');
      } finally {
        setLoading(false);
      }
    };

    createAcademia();
  };

  const renderAcademiaCard = (academia: any) => (
    <Card key={academia.id} style={styles.academiaCard}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.academiaName}>
          {academia.nome}
        </Text>
        <Text variant="bodyMedium" style={styles.academiaAddress}>
          📍 {typeof academia.endereco === 'object'
            ? `${academia.endereco.rua}${academia.endereco.numero ? ', ' + academia.endereco.numero : ''}, ${academia.endereco.cidade} - ${academia.endereco.estadoNome || academia.endereco.estado}, ${academia.endereco.paisNome || academia.endereco.pais}`
            : academia.endereco || getString('addressNotInformed')
          }
        </Text>
        {academia.telefone && (
          <Text variant="bodySmall" style={styles.academiaContact}>
            📞 {typeof academia.telefone === 'object'
              ? `${academia.telefone.codigoPais === 'BR' ? '+55' : academia.telefone.codigoPais} ${academia.telefone.numero}`
              : academia.telefone
            }
          </Text>
        )}
        {academia.email && (
          <Text variant="bodySmall" style={styles.academiaContact}>
            ✉️ {academia.email}
          </Text>
        )}
        <View style={styles.planoContainer}>
          <Chip
            mode="outlined"
            style={[styles.planoChip as any, { backgroundColor: getPlanoColor(academia.plano) }] as any}
          >
            Plano {academia.plano?.toUpperCase()}
          </Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => joinAcademia(academia.id)}
          disabled={loading}
          style={styles.joinButton as any}
        >
          Entrar nesta Academia
        </Button>
      </Card.Actions>
    </Card>
  );

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case 'free': return COLORS.success[50];
      case 'premium': return COLORS.warning[50];
      case 'enterprise': return COLORS.info[50];
      default: return COLORS.gray[100];
    }
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer as any}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={styles.loadingText as any}>{getString('processing')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header as any}>
        <View style={styles.headerContent as any}>
          <Button
            mode="text"
            onPress={async () => {
              try {
                console.log('🔙 Voltando para seleção de tipo de usuário...');
                // Resetar o tipo de usuário para voltar à tela anterior
                await updateUserProfile({
                  // tipo: null, // Removing 'tipo' as it is not in UserProfile
                  userType: null as any,
                  profileCompleted: false,
                  updatedAt: new Date()
                });
              } catch (error) {
                console.error('Erro ao voltar:', error);
                showSnackbar('Erro ao voltar', 'error');
              }
            }}
            icon="arrow-left"
            textColor={COLORS.white}
            style={styles.backButton}
          >{getString('back')}</Button>
          <View style={styles.headerTextContainer as any}>
            <Text variant="headlineMedium" style={styles.title as any}>
              {forceCreate ? getString('createAcademy') : getString('selectAcademy')}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle as any}>
              {forceCreate
                ? getString('adminMustCreate')
                : getString('mustAssociate')
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Opções de Associação - ocultar para todos os admins */}
      {!forceCreate && !isAdmin() && (
        <Card style={styles.optionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Como você quer se associar?
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Escolha uma das opções abaixo
            </Text>

            <View style={styles.optionButtons as any}>
              <Button
                mode="contained"
                onPress={() => setShowQRScanner(true)}
                icon="qrcode-scan"
                style={styles.optionButton}
              >
                Escanear QR Code
              </Button>

              <Button
                mode="outlined"
                onPress={() => setShowInviteLinkModal(true)}
                icon="link"
                style={styles.optionButton}
              >
                Link ou Código de Convite
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Buscar Academia por Código - ocultar para todos os admins */}
      {!forceCreate && !isAdmin() && (
        <Card style={styles.searchCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Buscar por Código
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Digite o código fornecido pela academia
            </Text>

            <TextInput
              label={getString('academyCode')}
              value={searchCode}
              onChangeText={setSearchCode}
              mode="outlined"
              style={styles.input}
              placeholder={getString('academyCodePlaceholder')}
            />

            <Button
              mode="contained"
              onPress={searchAcademiaByCode}
              loading={searchLoading}
              disabled={searchLoading || !searchCode.trim()}
              style={styles.searchButton}
              icon={searchLoading ? undefined : "magnify"}
            >
              {searchLoading ? 'Buscando...' : 'Buscar Academia'}
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Resultados da Busca - ocultar para admins */}
      {!forceCreate && academias.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text variant="titleMedium" style={styles.resultsTitle}>
            Academia Encontrada
          </Text>
          {academias.map(renderAcademiaCard)}
        </View>
      )}

      {!forceCreate && <Divider style={styles.divider} />}

      {/* Criar Nova Academia - Sempre visível para admins, ou quando solicitado */}
      {(isAdmin() || forceCreate) && (
        <Card style={styles.createCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Criar Nova Academia
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Como administrador, você pode criar sua própria academia
            </Text>

            {!showCreateForm ? (
              <Button
                mode="outlined"
                onPress={() => setShowCreateForm(true)}
                style={styles.showFormButton}
              >
                Criar Minha Academia
              </Button>
            ) : (
              <View style={styles.createForm}>
                <TextInput
                  label="Nome da Academia *"
                  value={newAcademiaData.nome}
                  onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, nome: text }))}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Email *"
                  value={newAcademiaData.email}
                  onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, email: text }))}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                />

                {/* Seleção de País e Estado */}
                <CountryStatePicker
                  selectedCountry={newAcademiaData.endereco.pais}
                  selectedState={newAcademiaData.endereco.estado}
                  onCountryChange={(code, name) =>
                    setNewAcademiaData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, pais: code, paisNome: name, estado: '', estadoNome: '' }
                    }))
                  }
                  onStateChange={(code, name) =>
                    setNewAcademiaData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, estado: code, estadoNome: name }
                    }))
                  }
                />

                {/* Campos de Endereço */}
                <View style={styles.addressRow as any}>
                  <TextInput
                    label="CEP/Código Postal"
                    value={newAcademiaData.endereco.cep}
                    onChangeText={(text) => setNewAcademiaData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, cep: text }
                    }))}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                    keyboardType="numeric"
                  />

                  <TextInput
                    label="Cidade *"
                    value={newAcademiaData.endereco.cidade}
                    onChangeText={(text) => setNewAcademiaData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, cidade: text }
                    }))}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                  />
                </View>

                <TextInput
                  label="Rua/Avenida *"
                  value={newAcademiaData.endereco.rua}
                  onChangeText={(text) => setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, rua: text }
                  }))}
                  mode="outlined"
                  style={styles.input}
                />

                <View style={styles.addressRow as any}>
                  <TextInput
                    label="Número"
                    value={newAcademiaData.endereco.numero}
                    onChangeText={(text) => setNewAcademiaData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, numero: text }
                    }))}
                    mode="outlined"
                    style={[styles.input, styles.quarterInput]}
                    keyboardType="numeric"
                  />

                  <TextInput
                    label="Complemento"
                    value={newAcademiaData.endereco.complemento}
                    onChangeText={(text) => setNewAcademiaData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, complemento: text }
                    }))}
                    mode="outlined"
                    style={[styles.input, styles.threeQuarterInput]}
                  />
                </View>

                <TextInput
                  label="Bairro"
                  value={newAcademiaData.endereco.bairro}
                  onChangeText={(text) => setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, bairro: text }
                  }))}
                  mode="outlined"
                  style={styles.input}
                />

                {/* Campo de Telefone */}
                <PhonePicker
                  selectedCountry={newAcademiaData.telefone.codigoPais}
                  phoneNumber={newAcademiaData.telefone.numero}
                  onPhoneChange={(countryCode, number) =>
                    setNewAcademiaData(prev => ({
                      ...prev,
                      telefone: { codigoPais: countryCode, numero: number }
                    }))
                  }
                  label="Telefone *"
                  placeholder="Digite o número"
                />

                {/* Campo de Modalidades */}
                <ModalityPicker
                  selectedModalities={newAcademiaData.modalidades}
                  onModalitiesChange={(modalidades) =>
                    setNewAcademiaData(prev => ({
                      ...prev,
                      modalidades: modalidades as never[]
                    }))
                  }
                  label="Modalidades Oferecidas"
                />

                <View style={styles.buttonRow as any}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowCreateForm(false)}
                    style={styles.cancelButton}
                  >{getString('cancel')}</Button>
                  <Button
                    mode="contained"
                    onPress={createNewAcademia}
                    style={styles.createButton}
                  >
                    Criar Academia
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Mensagem para usuários não-admin */}
      {!isAdmin() && (
        <Card style={styles.createCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Criar Nova Academia
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Apenas usuários com perfil de administrador podem criar uma nova academia.
            </Text>
            <Text variant="bodySmall" style={[styles.sectionDescription, { marginTop: SPACING.sm, fontStyle: 'italic' }]}>
              Entre em contato com um administrador para obter acesso ou solicite que criem uma academia para você.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Modal QR Scanner */}
      <Portal>
        <Modal
          visible={showQRScanner}
          onDismiss={() => setShowQRScanner(false)}
          contentContainerStyle={styles.qrModalWrapper as any}
        >
          <View style={styles.qrModal as any}>
            <QRCodeScanner
              onScan={handleQRCodeScan}
              onCancel={() => setShowQRScanner(false)}
            />
          </View>
        </Modal>
      </Portal>

      {/* Modal Link de Convite */}
      <Portal>
        <Modal
          visible={showInviteLinkModal}
          onDismiss={() => setShowInviteLinkModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle as any}>
            Link ou Código de Convite
          </Text>

          <Text variant="bodyMedium" style={styles.modalDescription as any}>
            Cole aqui o link ou digite o código de convite que você recebeu
          </Text>

          <TextInput
            label="Link ou Código do Convite"
            value={inviteLink}
            onChangeText={setInviteLink}
            mode="outlined"
            style={styles.input}
            placeholder="https://academia-app.com/invite/..."
            multiline
          />

          <View style={styles.modalActions as any}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowInviteLinkModal(false);
                setInviteLink('');
              }}
              style={styles.modalButton}
            >{getString('cancel')}</Button>
            <Button
              mode="contained"
              onPress={handleInviteLinkSubmit}
              style={styles.modalButton}
            >{getString('confirm')}</Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar para feedback visual */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={4000}
        style={[
          styles.snackbar,
          snackbar.type === 'success' && styles.snackbarSuccess,
          snackbar.type === 'error' && styles.snackbarError,
          snackbar.type === 'info' && styles.snackbarInfo
        ]}
        action={{
          label: getString('close'),
          onPress: hideSnackbar,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.primary[500],
  },
  headerContent: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: -16,
    top: -8,
    zIndex: 1,
  } as any,
  headerTextContainer: {
    alignItems: 'center', // FlexAlignType
  } as any,
  title: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.9,
  },
  optionsCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  createCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
  },
  addressRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  quarterInput: {
    flex: 0.3,
    marginBottom: 0,
  },
  threeQuarterInput: {
    flex: 0.7,
    marginBottom: 0,
  },
  searchButton: {
    marginTop: SPACING.sm,
  },
  showFormButton: {
    marginTop: SPACING.sm,
  },
  createForm: {
    marginTop: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 0.45,
  },
  createButton: {
    flex: 0.45,
  },
  resultsContainer: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
  },
  resultsTitle: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  academiaCard: {
    marginBottom: SPACING.md,
  },
  academiaName: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },
  academiaAddress: {
    marginBottom: SPACING.xs,
  },
  academiaContact: {
    marginBottom: SPACING.xs,
    opacity: 0.8,
  },
  planoContainer: {
    marginTop: SPACING.md,
  },
  planoChip: {
    alignSelf: 'flex-start',
  },
  joinButton: {
    marginLeft: 'auto',
  },
  divider: {
    marginVertical: 16,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  optionButton: {
    flex: 1,
  },
  modal: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  qrModalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay.dark,
    zIndex: 9999,
  },
  qrModal: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    elevation: 10,
    minWidth: 300,
    maxWidth: '90%',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  modalDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
  snackbar: {
    marginBottom: SPACING.md,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.primary[500],
  },
  snackbarError: {
    backgroundColor: COLORS.error[500],
  },
  snackbarInfo: {
    backgroundColor: COLORS.info[500],
  },
});

export default AcademiaSelectionScreen;
