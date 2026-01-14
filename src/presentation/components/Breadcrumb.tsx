/**
 * Breadcrumb - Componente de navegação breadcrumb
 * 
 * Fornece orientação visual da localização do usuário na hierarquia de navegação.
 * Melhora a UX permitindo navegação rápida entre níveis.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";

// ============================================
// BREADCRUMB ITEM
// ============================================

interface BreadcrumbItemProps {
    label: string;
    onPress?: () => void;
    isLast: boolean;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    accessibilityLabel?: string;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
    label,
    onPress,
    isLast,
    icon,
    accessibilityLabel
}) => {
    const isClickable = !isLast && onPress;

    return (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={isClickable ? onPress : undefined}
                disabled={!isClickable}
                style={[
                    styles.item,
                    isLast && styles.itemLast,
                    !isClickable && styles.itemDisabled,
                ]}
                accessible={true}
                accessibilityRole={isClickable ? 'button' : 'text'}
                accessibilityLabel={accessibilityLabel || label}
                accessibilityHint={isClickable ? `Navegar para ${label}` : undefined}
                accessibilityState={{ disabled: !isClickable }}
            >
                {icon && (
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={16}
                        color={isLast ? COLORS.primary[600] : COLORS.gray[500]}
                        style={styles.icon}
                    />
                )}
                <Text
                    style={[
                        styles.label,
                        isLast && styles.labelLast,
                        !isClickable && styles.labelDisabled,
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </TouchableOpacity>

            {!isLast && (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={COLORS.gray[300]}
                    style={styles.separator}
                />
            )}
        </View>
    );
};

// ============================================
// BREADCRUMB PRINCIPAL
// ============================================

export interface BreadcrumbData {
    label: string;
    onPress?: () => void;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    accessibilityLabel?: string;
    disabled?: boolean;
}

interface BreadcrumbProps {
    items?: BreadcrumbData[];
    maxItems?: number;
    showHome?: boolean;
    onHomePress?: () => void;
    style?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items = [],
    maxItems = 4,
    showHome = true,
    onHomePress,
    style,
    containerStyle,
}) => {
    const { getString } = useTheme();
    // Adiciona item Home se configurado
    const allItems: BreadcrumbData[] = showHome
        ? [{ label: getString('home'), icon: 'home', onPress: onHomePress }, ...items]
        : items;

    // Trunca itens se exceder maxItems
    const displayItems: BreadcrumbData[] = allItems.length > maxItems
        ? [
            allItems[0],
            { label: '...', disabled: true },
            ...allItems.slice(-(maxItems - 2)),
        ]
        : allItems;

    if (displayItems.length === 0) {
        return null;
    }

    return (
        <View
            style={[styles.container, containerStyle]}
            accessible={true}
            accessibilityLabel="Navegação breadcrumb"
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, style]}
            >
                {displayItems.map((item, index) => (
                    <BreadcrumbItem
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        onPress={item.onPress}
                        isLast={index === displayItems.length - 1}
                        accessibilityLabel={item.accessibilityLabel}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

// ============================================
// BREADCRUMB COMPACTO
// ============================================

interface CompactBreadcrumbProps {
    currentPage: string;
    parentPage?: string;
    onParentPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const CompactBreadcrumb: React.FC<CompactBreadcrumbProps> = ({
    currentPage,
    parentPage,
    onParentPress,
    style,
}) => {
    return (
        <View style={[styles.compactContainer, style]}>
            {parentPage && (
                <>
                    <TouchableOpacity
                        onPress={onParentPress}
                        style={styles.compactItem}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Voltar para ${parentPage}`}
                        accessibilityHint="Navegar para página anterior"
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={20}
                            color={COLORS.primary[600]}
                        />
                        <Text style={styles.compactLabel}>{parentPage}</Text>
                    </TouchableOpacity>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={16}
                        color={COLORS.gray[300]}
                        style={styles.separator}
                    />
                </>
            )}
            <Text style={styles.compactCurrentPage}>{currentPage}</Text>
        </View>
    );
};

// ============================================
// HOOK PERSONALIZADO
// ============================================
export const useBreadcrumb = () => {
    const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbData[]>([]);

    const addBreadcrumb = (label: string, onPress?: () => void, icon?: keyof typeof MaterialCommunityIcons.glyphMap) => {
        setBreadcrumbItems(prev => [...prev, { label, onPress, icon }]);
    };

    const removeBreadcrumb = () => {
        setBreadcrumbItems(prev => prev.slice(0, -1));
    };

    const clearBreadcrumbs = () => {
        setBreadcrumbItems([]);
    };

    const setBreadcrumbs = (items: BreadcrumbData[]) => {
        setBreadcrumbItems(items);
    };

    return {
        breadcrumbItems,
        addBreadcrumb,
        removeBreadcrumb,
        clearBreadcrumbs,
        setBreadcrumbs,
    };
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.light,
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
    },
    itemLast: {
        backgroundColor: COLORS.primary[50],
    },
    itemDisabled: {
        opacity: 0.6,
    },
    icon: {
        marginRight: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[500],
        maxWidth: 150,
    },
    labelLast: {
        color: COLORS.primary[600],
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    labelDisabled: {
        color: COLORS.gray[300],
    },
    separator: {
        marginHorizontal: SPACING.xs,
    },

    // Compact mode
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
    },
    compactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary[600],
        marginLeft: SPACING.xs,
    },
    compactCurrentPage: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.black,
        fontWeight: FONT_WEIGHT.semibold as any,
    },
});

export default Breadcrumb;
