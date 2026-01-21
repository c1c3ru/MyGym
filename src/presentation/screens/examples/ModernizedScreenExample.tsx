import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@presentation/contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import AnimatedScreen from '@presentation/components/AnimatedScreen';
import AnimatedList from '@presentation/components/AnimatedList';
import GlassCard from '@presentation/components/GlassCard';
import StatusBadge from '@presentation/components/StatusBadge';
import SectionHeader from '@presentation/components/SectionHeader';
import IconContainer from '@presentation/components/IconContainer';

/**
 * Example Modernized Screen
 * Demonstrates the new glassmorphism design with animations
 * This serves as a template for updating other screens
 */

interface StatCardProps {
    icon: string;
    value: string | number;
    label: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
    const { isDarkMode } = useTheme();

    return (
        <GlassCard
            variant="card"
            padding={SPACING.base}
            style={styles.statCard}
            pressable
            animated
        >
            <IconContainer
                icon={icon}
                family="MaterialCommunityIcons"
                color={color}
                size={24}
                containerSize={48}
            />
            <Text style={[
                styles.statValue,
                { color: isDarkMode ? COLORS.white : COLORS.text.primary }
            ]}>
                {value}
            </Text>
            <Text style={[
                styles.statLabel,
                { color: isDarkMode ? COLORS.gray[300] : COLORS.text.secondary }
            ]}>
                {label}
            </Text>
        </GlassCard>
    );
};

interface ListItemProps {
    title: string;
    subtitle: string;
    status: 'active' | 'inactive' | 'pending';
    statusLabel: string;
    onPress: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ title, subtitle, status, statusLabel, onPress }) => {
    const { isDarkMode } = useTheme();

    return (
        <GlassCard
            variant="card"
            padding={SPACING.base}
            marginBottom={SPACING.md}
            pressable
            onPress={onPress}
        >
            <View style={styles.listItemHeader}>
                <View style={styles.listItemInfo}>
                    <Text style={[
                        styles.listItemTitle,
                        { color: isDarkMode ? COLORS.white : COLORS.text.primary }
                    ]}>
                        {title}
                    </Text>
                    <Text style={[
                        styles.listItemSubtitle,
                        { color: isDarkMode ? COLORS.gray[300] : COLORS.text.secondary }
                    ]}>
                        {subtitle}
                    </Text>
                </View>
                <StatusBadge status={status} label={statusLabel} size="small" />
            </View>
        </GlassCard>
    );
};

const ModernizedScreenExample: React.FC = () => {
    const { isDarkMode, getString } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        stats: [
            { icon: 'account-group', value: 156, label: 'Total Students', color: COLORS.primary[500] },
            { icon: 'school', value: 12, label: 'Classes', color: COLORS.info[500] },
            { icon: 'calendar-check', value: 8, label: 'Today', color: COLORS.warning[500] },
            { icon: 'trophy', value: 23, label: 'Graduations', color: COLORS.success[500] },
        ],
        items: [
            { id: 1, title: 'Maria Pereira de Sousa', subtitle: 'maria.p.sousa@email.com', status: 'active' as const, statusLabel: 'ATIVO' },
            { id: 2, title: 'João Silva Santos', subtitle: 'joao.silva@email.com', status: 'active' as const, statusLabel: 'ATIVO' },
            { id: 3, title: 'Ana Costa Lima', subtitle: 'ana.costa@email.com', status: 'pending' as const, statusLabel: 'PENDENTE' },
            { id: 4, title: 'Pedro Oliveira', subtitle: 'pedro.oliveira@email.com', status: 'inactive' as const, statusLabel: 'INATIVO' },
        ],
    });

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleItemPress = (id: number) => {
        console.log('Item pressed:', id);
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? COLORS.background.default : COLORS.background.default }
            ]}
        >
            <AnimatedScreen animationType="fadeSlide" duration={300}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary[500]}
                            colors={[COLORS.primary[500]]}
                        />
                    }
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View>
                            <Text style={[
                                styles.headerTitle,
                                { color: isDarkMode ? COLORS.white : COLORS.text.primary }
                            ]}>
                                Dashboard
                            </Text>
                            <Text style={[
                                styles.headerSubtitle,
                                { color: isDarkMode ? COLORS.gray[300] : COLORS.text.secondary }
                            ]}>
                                Welcome back! 👋
                            </Text>
                        </View>
                        <IconContainer
                            icon="bell-outline"
                            family="MaterialCommunityIcons"
                            color={COLORS.primary[500]}
                            size={24}
                            containerSize={40}
                        />
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {data.stats.map((stat, index) => (
                            <View key={index} style={styles.statCardWrapper}>
                                <StatCard {...stat} />
                            </View>
                        ))}
                    </View>

                    {/* Recent Items Section */}
                    <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.lg}>
                        <SectionHeader
                            emoji="📋"
                            title="Recent Activity"
                            subtitle={`${data.items.length} items`}
                            textColor={isDarkMode ? COLORS.white : COLORS.text.primary}
                            subtitleColor={isDarkMode ? COLORS.gray[300] : COLORS.text.secondary}
                        />

                        <AnimatedList staggerDelay={50} animationType="fadeSlide">
                            {data.items.map(item => (
                                <ListItem
                                    key={item.id}
                                    {...item}
                                    onPress={() => handleItemPress(item.id)}
                                />
                            ))}
                        </AnimatedList>
                    </GlassCard>

                    {/* Action Card */}
                    <GlassCard
                        variant="card"
                        padding={SPACING.lg}
                        pressable
                        onPress={() => console.log('Action pressed')}
                    >
                        <View style={styles.actionCard}>
                            <IconContainer
                                icon="plus-circle"
                                family="MaterialCommunityIcons"
                                color={COLORS.primary[500]}
                                size={32}
                                containerSize={56}
                            />
                            <View style={styles.actionContent}>
                                <Text style={[
                                    styles.actionTitle,
                                    { color: isDarkMode ? COLORS.white : COLORS.text.primary }
                                ]}>
                                    Add New Item
                                </Text>
                                <Text style={[
                                    styles.actionSubtitle,
                                    { color: isDarkMode ? COLORS.gray[300] : COLORS.text.secondary }
                                ]}>
                                    Tap to create a new entry
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]}
                            />
                        </View>
                    </GlassCard>
                </ScrollView>
            </AnimatedScreen>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.base,
        paddingBottom: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.regular,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SPACING.xs,
        marginBottom: SPACING.lg,
    },
    statCardWrapper: {
        width: '50%',
        padding: SPACING.xs,
    },
    statCard: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        marginTop: SPACING.sm,
    },
    statLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.medium,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listItemInfo: {
        flex: 1,
        marginRight: SPACING.md,
    },
    listItemTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.semibold,
        marginBottom: SPACING.xs,
    },
    listItemSubtitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.regular,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
        marginLeft: SPACING.base,
    },
    actionTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.semibold,
        marginBottom: SPACING.xs,
    },
    actionSubtitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.regular,
    },
});

export default ModernizedScreenExample;
