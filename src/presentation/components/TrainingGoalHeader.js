import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TrainingGoalHeader = ({
    checkins = [],
    weeklyGoal = 3,
    theme
}) => {
    const colors = theme?.colors || {};

    const stats = useMemo(() => {
        const now = new Date();
        // Start of week (Sunday)
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekCheckins = checkins.filter(c => {
            const checkinDate = new Date(c.date);
            return checkinDate >= startOfWeek;
        });

        // Count unique days to avoid double counting multiple classes in one day
        const uniqueDays = new Set(thisWeekCheckins.map(c => new Date(c.date).toDateString()));

        return {
            count: uniqueDays.size,
            remaining: Math.max(0, weeklyGoal - uniqueDays.size),
            progress: Math.min(1, uniqueDays.size / weeklyGoal)
        };
    }, [checkins, weeklyGoal]);

    const isGoalMet = stats.count >= weeklyGoal;

    return (
        <Surface style={styles.container} elevation={2}>
            <LinearGradient
                colors={isGoalMet ? [COLORS.success[500], COLORS.success[700]] : [COLORS.primary[500], COLORS.secondary[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>
                            {isGoalMet
                                ? 'Meta Semanal Batida! 🔥'
                                : `Faltam ${stats.remaining} treinos para sua meta`}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isGoalMet
                                ? 'Continue assim na próxima semana!'
                                : `${stats.count} de ${weeklyGoal} treinos realizados nesta semana`}
                        </Text>
                    </View>

                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={isGoalMet ? "trophy" : "fitness"}
                            size={32}
                            color="#FFF"
                        />
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.track}>
                        <View
                            style={[
                                styles.fill,
                                {
                                    width: `${stats.progress * 100}%`,
                                    backgroundColor: isGoalMet ? '#FFF' : COLORS.tertiary
                                }
                            ]}
                        />
                    </View>
                </View>
            </LinearGradient>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: SPACING.md,
        marginBottom: SPACING.xs,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: 'transparent'
    },
    gradient: {
        padding: SPACING.md,
        paddingVertical: SPACING.lg
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md
    },
    textContainer: {
        flex: 1
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: '#FFF',
        marginBottom: 4
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: 'rgba(255,255,255,0.9)'
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        marginLeft: SPACING.md
    },
    progressContainer: {
        marginTop: SPACING.xs
    },
    track: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    fill: {
        height: '100%',
        borderRadius: 3
    }
});

export default TrainingGoalHeader;
