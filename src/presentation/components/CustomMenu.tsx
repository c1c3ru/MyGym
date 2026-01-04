import React from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Propriedades para o componente CustomMenu
 */
interface CustomMenuProps {
    /** Indica se o menu está visível */
    visible: boolean;
    /** Callback para fechar o menu */
    onDismiss: () => void;
    /** Elemento que ancora o menu */
    anchor: React.ReactNode;
    /** Itens do menu */
    children: React.ReactNode;
    /** Estilo adicional para o container do menu */
    style?: StyleProp<ViewStyle>;
}

/**
 * Componente de Menu customizado utilizando Modal
 */
const CustomMenu: React.FC<CustomMenuProps> & { Item: React.FC<MenuItemProps> } = ({
    visible,
    onDismiss,
    anchor,
    children,
    style
}) => {
    return (
        <View>
            {anchor}
            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={onDismiss}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onDismiss}
                >
                    <View style={[styles.menuContainer, style]}>
                        {children}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

/**
 * Propriedades para o item do menu
 */
interface MenuItemProps {
    /** Callback ao pressionar o item */
    onPress: () => void;
    /** Título do item */
    title: string;
    /** Estilo adicional para o texto do título */
    titleStyle?: StyleProp<TextStyle>;
    /** Estilo adicional para o container do item */
    style?: StyleProp<ViewStyle>;
    /** Outras propriedades passadas para o TouchableOpacity */
    [key: string]: any;
}

/**
 * Item individual do menu
 */
const MenuItem: React.FC<MenuItemProps> = ({ onPress, title, titleStyle, style, ...props }) => {
    return (
        <TouchableOpacity
            style={[styles.menuItem, style]}
            onPress={onPress}
            {...props}
        >
            <Text style={[styles.menuItemText, titleStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

CustomMenu.Item = MenuItem;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.black + "80",
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 100,
        paddingRight: 20,
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        minWidth: 150,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.black,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
            web: {
                // @ts-ignore
                boxShadow: `0 2px 4px ${COLORS.black}40`,
            },
        }),
    },
    menuItem: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    menuItemText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.black,
    },
});

export default CustomMenu;
