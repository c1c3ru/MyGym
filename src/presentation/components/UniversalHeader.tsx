import React, { useEffect, memo, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import {
import { getString } from '@utils/theme';
    Appbar,
    Avatar,
    Menu,
    Divider,
    Modal,
    Button,
    Text
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { ResponsiveUtils } from '@utils/animations';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

/**
 * Propriedades para o componente UniversalHeader
 */
interface UniversalHeaderProps {
    /** Título do cabeçalho */
    title?: string;
    /** Subtítulo do cabeçalho */
    subtitle?: string;
    /** Objeto de navegação */
    navigation?: any;
    /** Indica se deve exibir o botão de voltar */
    showBack?: boolean;
    /** Indica se deve exibir o menu do usuário */
    showMenu?: boolean;
    /** Cor de fundo personalizada */
    backgroundColor?: string;
}

/**
 * Cabeçalho universal do aplicativo com suporte a navegação, menu de usuário e tema responsivo
 */
const UniversalHeader: React.FC<UniversalHeaderProps> = ({
    title,
    subtitle,
    navigation,
    showBack = false,
    showMenu = true,
    backgroundColor = COLORS.primary[500]
}) => {
    const { currentTheme } = useThemeToggle();

    const { user, userProfile, signOut } = useAuthFacade();
    const { getString, theme, updateUserTheme } = useTheme() as any;
    const { role, getUserTypeColor: getClaimsTypeColor, getUserTypeText: getClaimsTypeText } = useCustomClaims();
    const [menuVisible, setMenuVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    // Sincronizar tema quando o cargo do usuário mudar
    useEffect(() => {
        if (role && updateUserTheme) {
            updateUserTheme(role);
        }
    }, [role, updateUserTheme]);

    const openMenu = () => {
        setMenuVisible(true);
    };
    const closeMenu = () => {
        setMenuVisible(false);
    };

    const handleLogout = () => {
        if (!signOut) {
            Alert.alert(getString('error'), getString('logoutNotAvailable'));
            return;
        }

        if (Platform.OS === 'web') {
            setLogoutModalVisible(true);
        } else {
            Alert.alert(
                getString('confirmExit'),
                getString('sureToLogout'),
                [
                    {
                        text: getString('cancel'),
                        style: 'cancel',
                    },
                    {
                        text: getString('exit'),
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                closeMenu();
                                await signOut();
                            } catch (error) {
                                Alert.alert(getString('error'), getString('cannotLogout'));
                            }
                        },
                    },
                ]
            );
        }
    };

    const confirmLogout = async () => {
        try {
            setLogoutModalVisible(false);
            closeMenu();
            if (signOut) await signOut();
        } catch (error) {
            Alert.alert(getString('error'), getString('cannotLogout'));
        }
    };

    const cancelLogout = () => {
        setLogoutModalVisible(false);
    };

    const handleProfile = () => {
        closeMenu();
        navigation?.navigate(getString('profile'));
    };

    const getUserTypeColor = () => {
        return getClaimsTypeColor() || COLORS.primary[500];
    };

    const getUserTypeLabel = () => {
        return getClaimsTypeText();
    };

    return (
        <>
            <View style={[styles.container, { backgroundColor }]}>
                <Appbar.Header style={[styles.header, styles.transparentHeader]}>
                    {showBack && (
                        <Appbar.BackAction
                            onPress={() => navigation?.goBack()}
                            color={COLORS.white}
                        />
                    )}

                    <Appbar.Content
                        title={title || "🥋 MyGym"}
                        subtitle={subtitle}
                        titleStyle={styles.appName}
                        subtitleStyle={styles.subtitle}
                    />

                    {showMenu && (
                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            anchor={
                                <TouchableOpacity
                                    style={styles.menuAnchor}
                                    onPress={openMenu}
                                    activeOpacity={0.7}
                                >
                                    <Avatar.Text
                                        size={ResponsiveUtils?.isTablet?.() ? 40 : 36}
                                        label={userProfile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                        style={[styles.avatar, { backgroundColor: COLORS.white + '33' }]}
                                        labelStyle={styles.avatarLabel}
                                    />
                                </TouchableOpacity>
                            }
                            contentStyle={styles.menuContent}
                        >
                            <View style={styles.menuHeader}>
                                <Avatar.Text
                                    size={48}
                                    label={userProfile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    style={[styles.menuAvatar, { backgroundColor: getUserTypeColor() }]}
                                    labelStyle={styles.menuAvatarLabel}
                                />
                                <View style={styles.menuUserInfo}>
                                    <Menu.Item
                                        title={userProfile?.name || user?.email || getString('user')}
                                        titleStyle={styles.menuUserName}
                                        disabled
                                    />
                                    <Menu.Item
                                        title={getUserTypeLabel()}
                                        titleStyle={styles.menuUserType}
                                        disabled
                                    />
                                </View>
                            </View>

                            <Divider style={styles.menuDivider} />

                            <Menu.Item
                                onPress={handleProfile}
                                title="Meu Perfil"
                                leadingIcon={() => (
                                    <MaterialCommunityIcons name="account" size={20} color={COLORS.text.secondary} />
                                )}
                                titleStyle={styles.menuItemTitle}
                            />

                            <Menu.Item
                                onPress={() => {
                                    closeMenu();
                                    navigation?.navigate('Settings');
                                }}
                                title={getString('settings')}
                                leadingIcon={() => (
                                    <MaterialCommunityIcons name="cog" size={20} color={COLORS.text.secondary} />
                                )}
                                titleStyle={styles.menuItemTitle}
                            />

                            <Divider style={styles.menuDivider} />

                            <Menu.Item
                                onPress={() => {
                                    closeMenu();
                                    handleLogout();
                                }}
                                title={getString('logout')}
                                leadingIcon={() => (
                                    <MaterialCommunityIcons name="logout" size={20} color={COLORS.error[500]} />
                                )}
                                titleStyle={[styles.menuItemTitle, { color: COLORS.error[500] }]}
                            />
                        </Menu>
                    )}
                </Appbar.Header>
            </View>

            <Modal
                visible={logoutModalVisible}
                onDismiss={cancelLogout}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Confirmar Saída</Text>
                    <Text style={styles.modalMessage}>
                        Tem certeza que deseja sair da sua conta?
                    </Text>
                    <View style={styles.modalButtons}>
                        <Button
                            mode="outlined"
                            onPress={cancelLogout}
                            style={styles.modalButton}
                        >{getString('cancel')}</Button>
                        <Button
                            mode="contained"
                            onPress={confirmLogout}
                            style={[styles.modalButton, styles.logoutButton]}
                            buttonColor={COLORS.error[500]}
                            textColor={COLORS.white}
                        >{getString('logout')}</Button>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        // Adicionado para suportar sombra sem que o Appbar a corte
        zIndex: 10,
    },
    header: {
        ...Platform.select({
            web: {
                // @ts-ignore
                boxShadow: `0 2px 3.84px ${COLORS.black}40`
            },
            default: {
                elevation: 4,
                shadowColor: COLORS.black,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            }
        }),
        paddingHorizontal: ResponsiveUtils?.spacing?.xs || 4,
        minHeight: ResponsiveUtils?.isTablet?.() ? 64 : 56,
    },
    appName: {
        color: COLORS.white,
        fontSize: ResponsiveUtils?.fontSize?.large || 20,
        fontWeight: FONT_WEIGHT.bold as any,
    },
    subtitle: {
        color: COLORS.white + 'E6',
        fontSize: ResponsiveUtils?.fontSize?.small || 12,
    },
    menuAnchor: {
        paddingRight: ResponsiveUtils?.spacing?.sm || 8,
        paddingVertical: ResponsiveUtils?.spacing?.xs || 4,
    },
    avatar: {
        borderWidth: 2,
        borderColor: COLORS.white + '4D',
    },
    avatarLabel: {
        color: COLORS.white,
        fontSize: ResponsiveUtils?.fontSize?.medium || 16,
        fontWeight: FONT_WEIGHT.bold as any,
    },
    menuContent: {
        backgroundColor: COLORS.white,
        borderRadius: ResponsiveUtils?.borderRadius?.medium || 8,
        minWidth: 280,
        marginTop: SPACING.sm,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: ResponsiveUtils?.spacing?.md || 16,
        backgroundColor: COLORS.background.light,
    },
    menuAvatar: {
        marginRight: ResponsiveUtils?.spacing?.md || 16,
    },
    menuAvatarLabel: {
        color: COLORS.white,
        fontSize: ResponsiveUtils?.fontSize?.medium || 16,
        fontWeight: FONT_WEIGHT.bold as any,
    },
    menuUserInfo: {
        flex: 1,
    },
    menuUserName: {
        fontSize: ResponsiveUtils?.fontSize?.medium || 16,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.text.primary,
    },
    menuUserType: {
        fontSize: ResponsiveUtils?.fontSize?.small || 12,
        color: COLORS.text.secondary,
    },
    menuDivider: {
        marginVertical: 4,
    },
    menuItemTitle: {
        fontSize: ResponsiveUtils?.fontSize?.medium || 16,
        color: COLORS.text.primary,
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        marginHorizontal: 20,
        borderRadius: BORDER_RADIUS.md,
        elevation: 8,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        maxWidth: 400,
        alignSelf: 'center',
        width: '90%',
    },
    modalContent: {
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold as any,
        marginBottom: SPACING.base,
        color: COLORS.text.primary,
    },
    modalMessage: {
        fontSize: FONT_SIZE.md,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        color: COLORS.text.secondary,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: SPACING.sm,
        gap: SPACING.md,
    },
    modalButton: {
        flex: 1,
        borderRadius: BORDER_RADIUS.md,
    },
    logoutButton: {
        backgroundColor: COLORS.error[500],
    },
    transparentHeader: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
});

const MemoizedUniversalHeader = memo(UniversalHeader);
export default MemoizedUniversalHeader;
