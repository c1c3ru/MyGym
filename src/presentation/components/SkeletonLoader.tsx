import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Propriedades básicas para os componentes Skeleton
 */
interface SkeletonBaseProps {
    /** Largura do esqueleto */
    width: number | string;
    /** Altura do esqueleto */
    height: number | string;
    /** Raio da borda */
    borderRadius?: number;
    /** Estilo adicional */
    style?: StyleProp<ViewStyle>;
}

/**
 * Componente base para esqueletos com animação de brilho (shimmer)
 */
const SkeletonBase = memo(({ width, height, borderRadius = 4, style }: SkeletonBaseProps) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );

        shimmerAnimation.start();

        return () => shimmerAnimation.stop();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-(typeof width === 'number' ? width : screenWidth), (typeof width === 'number' ? width : screenWidth)],
    });

    return (
        <View style={[styles.skeleton, { width, height, borderRadius } as any, style]}>
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
        </View>
    );
});

/**
 * Esqueleto para o card de aluno
 */
export const StudentCardSkeleton = memo(() => (
    <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
            <SkeletonBase width={50} height={50} borderRadius={25} />
            <View style={styles.cardInfo}>
                <SkeletonBase width={150} height={16} style={styles.marginBottom} />
                <SkeletonBase width={200} height={12} style={styles.marginBottom} />
                <SkeletonBase width={120} height={12} />
            </View>
            <SkeletonBase width={24} height={24} borderRadius={12} />
        </View>

        <View style={styles.cardStats}>
            <View style={styles.statItem}>
                <SkeletonBase width={60} height={12} style={styles.marginBottom} />
                <SkeletonBase width={40} height={20} borderRadius={10} />
            </View>
            <View style={styles.statItem}>
                <SkeletonBase width={60} height={12} style={styles.marginBottom} />
                <SkeletonBase width={50} height={14} />
            </View>
            <View style={styles.statItem}>
                <SkeletonBase width={60} height={12} style={styles.marginBottom} />
                <SkeletonBase width={30} height={14} />
            </View>
        </View>

        <View style={styles.cardActions}>
            <SkeletonBase width={80} height={32} borderRadius={16} />
            <SkeletonBase width={60} height={32} borderRadius={16} />
            <SkeletonBase width={90} height={32} borderRadius={16} />
        </View>
    </View>
));

/**
 * Propriedades para StudentListSkeleton
 */
interface StudentListSkeletonProps {
    /** Quantidade de itens a serem exibidos na lista */
    itemCount?: number;
}

/**
 * Esqueleto de lista de alunos
 */
export const StudentListSkeleton = memo(({ itemCount = 5 }: StudentListSkeletonProps) => (
    <View style={styles.listContainer}>
        {Array.from({ length: itemCount }, (_, index) => (
            <StudentCardSkeleton key={index} />
        ))}
    </View>
));

/**
 * Esqueleto para o cabeçalho
 */
export const HeaderSkeleton = memo(() => (
    <View style={styles.headerContainer}>
        <SkeletonBase width={200} height={20} style={styles.marginBottom} />
        <SkeletonBase width={screenWidth - 32} height={40} borderRadius={20} />
    </View>
));

/**
 * Esqueleto para estatísticas do dashboard
 */
export const DashboardStatsSkeleton = memo(() => (
    <View style={styles.statsContainer}>
        <View style={styles.statCard}>
            <SkeletonBase width={40} height={40} borderRadius={20} style={styles.marginBottom} />
            <SkeletonBase width={60} height={24} style={styles.marginBottom} />
            <SkeletonBase width={80} height={12} />
        </View>
        <View style={styles.statCard}>
            <SkeletonBase width={40} height={40} borderRadius={20} style={styles.marginBottom} />
            <SkeletonBase width={60} height={24} style={styles.marginBottom} />
            <SkeletonBase width={80} height={12} />
        </View>
        <View style={styles.statCard}>
            <SkeletonBase width={40} height={40} borderRadius={20} style={styles.marginBottom} />
            <SkeletonBase width={60} height={24} style={styles.marginBottom} />
            <SkeletonBase width={80} height={12} />
        </View>
    </View>
));

/**
 * Esqueleto para agenda de aulas
 */
export const ClassScheduleSkeleton = memo(() => (
    <View style={styles.scheduleContainer}>
        {Array.from({ length: 3 }, (_, index) => (
            <View key={index} style={styles.scheduleItem}>
                <SkeletonBase width={60} height={60} borderRadius={8} />
                <View style={styles.scheduleInfo}>
                    <SkeletonBase width={120} height={16} style={styles.marginBottom} />
                    <SkeletonBase width={80} height={12} style={styles.marginBottom} />
                    <SkeletonBase width={100} height={12} />
                </View>
                <SkeletonBase width={24} height={24} borderRadius={12} />
            </View>
        ))}
    </View>
));

/**
 * Propriedades para ContentSkeleton
 */
interface ContentSkeletonProps {
    /** Quantidade de linhas */
    lines?: number;
    /** Largura total */
    width?: number | string;
}

/**
 * Esqueleto para conteúdo de texto genérico
 */
export const ContentSkeleton = memo(({ lines = 3, width = '100%' }: ContentSkeletonProps) => (
    <View style={styles.contentContainer}>
        {Array.from({ length: lines }, (_, index) => (
            <SkeletonBase
                key={index}
                width={typeof width === 'string' ? screenWidth - 32 : (width as number)}
                height={16}
                style={[styles.marginBottom, index === lines - 1 && { width: '60%' }]}
            />
        ))}
    </View>
));

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E1E9EE',
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    cardContainer: {
        backgroundColor: COLORS.white,
        marginVertical: 8,
        marginHorizontal: 16,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    cardInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.md,
    },
    statItem: {
        alignItems: 'center',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    listContainer: {
        flex: 1,
    },
    headerContainer: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        elevation: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: SPACING.md,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        minWidth: 100,
    },
    scheduleContainer: {
        padding: SPACING.md,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        elevation: 1,
    },
    scheduleInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    contentContainer: {
        padding: SPACING.md,
    },
    marginBottom: {
        marginBottom: SPACING.sm,
    },
});

export default SkeletonBase;
