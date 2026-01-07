import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import {
    Card,
    Text,
    Button,
    Chip,
    Portal,
    Modal,
    Divider
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";
import {
    createEmptySchedule,
    DAY_NAMES,
    generateTimeSlots,
    scheduleToDisplayString,
    isValidSchedule
} from '@utils/scheduleUtils';

/**
 * Interface para os horários de cada dia
 */
interface ScheduleHours {
    sunday: string[];
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
}

/**
 * Interface para o cronograma (Schedule)
 */
interface Schedule {
    timezone: string;
    duration: number;
    hours: ScheduleHours;
}

/**
 * Propriedades para o componente ImprovedScheduleSelector
 */
interface ImprovedScheduleSelectorProps {
    /** Valor atual do cronograma */
    value?: Schedule | null;
    /** Callback quando o cronograma muda */
    onScheduleChange: (schedule: Schedule) => void;
    /** Duração de cada aula em minutos */
    duration?: number;
    /** Timezone do cronograma */
    timezone?: string;
    /** Hora de início para geração de slots */
    startHour?: number;
    /** Hora de fim para geração de slots */
    endHour?: number;
    /** Intervalo entre slots em minutos */
    interval?: number;
    /** Estilo adicional para o container */
    style?: StyleProp<ViewStyle>;
    /** Se o seletor está desabilitado */
    disabled?: boolean;
    /** Se o campo é obrigatório */
    required?: boolean;
    /** Rótulo para o campo */
    label?: string;
    /** Habilitar validação de conflitos (não implementado visualmente aqui, mas disponível na prop) */
    enableConflictValidation?: boolean;
    /** ID do instrutor para contexto */
    instructorId?: string;
    /** ID da turma a ser excluída de validações */
    excludeClassId?: string;
}

/**
 * Seletor de horários melhorado com visualização de calendário e seleção por dia
 */
const ImprovedScheduleSelector: React.FC<ImprovedScheduleSelectorProps> = ({
    value = null,
    onScheduleChange,
    duration = 60,
    timezone = getString('timezone'),
    startHour = 6,
    endHour = 22,
    interval = 60,
    style,
    disabled = false,
    required = false,
    label = getString('classSchedules'),
    enableConflictValidation = true,
    instructorId,
    excludeClassId
}) => {
    const { theme: contextTheme } = useTheme() as any;
    const colors = contextTheme?.colors;

    const [schedule, setSchedule] = useState<Schedule>(value || createEmptySchedule() as Schedule);
    const [selectedDay, setSelectedDay] = useState<keyof ScheduleHours | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    // Gerar slots de tempo disponíveis
    const availableSlots = useMemo(() =>
        generateTimeSlots(startHour, endHour, interval),
        [startHour, endHour, interval]
    );

    // Atualizar schedule quando value mudar
    useEffect(() => {
        if (value && isValidSchedule(value) && JSON.stringify(value) !== JSON.stringify(schedule)) {
            setSchedule(value);
        }
    }, [value]);

    // Alternar horário para o dia selecionado
    const toggleTimeSlot = useCallback((time: string) => {
        if (!selectedDay) return;

        const newSchedule = { ...schedule };
        const dayHours = [...newSchedule.hours[selectedDay]];

        const timeIndex = dayHours.indexOf(time);
        if (timeIndex >= 0) {
            dayHours.splice(timeIndex, 1);
        } else {
            dayHours.push(time);
            dayHours.sort();
        }

        newSchedule.hours[selectedDay] = dayHours;

        // Atualizar estado local
        setSchedule(newSchedule);

        // Notificar pai diretamente
        if (onScheduleChange) {
            onScheduleChange({
                ...newSchedule,
                duration,
                timezone
            });
        }
    }, [selectedDay, schedule, onScheduleChange, duration, timezone]);

    // Gerar datas marcadas para preview
    const markedDates = useMemo(() => {
        const marked: any = {};
        const today = new Date();

        // Marcar próximas 4 semanas baseado no schedule
        for (let week = 0; week < 4; week++) {
            Object.entries(schedule.hours).forEach(([dayKey, hours]) => {
                if (hours.length > 0) {
                    const dayIndex = {
                        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                        thursday: 4, friday: 5, saturday: 6
                    }[dayKey as keyof ScheduleHours];

                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() + (week * 7) + (dayIndex - today.getDay()));

                    const dateString = targetDate.toISOString().split('T')[0];
                    marked[dateString] = {
                        marked: true,
                        dotColor: colors?.primary || COLORS.primary[500],
                        selectedColor: colors?.primary || COLORS.primary[500],
                        customStyles: {
                            container: {
                                backgroundColor: hours.length > 1 ? (colors?.primary || COLORS.primary[500]) : (colors?.primaryContainer || COLORS.primary[50]),
                                borderRadius: BORDER_RADIUS.md
                            },
                            text: {
                                color: hours.length > 1 ? (colors?.onPrimary || COLORS.white) : (colors?.onPrimaryContainer || COLORS.primary[700]),
                                fontWeight: FONT_WEIGHT.bold as any
                            }
                        }
                    };
                }
            });
        }

        return marked;
    }, [schedule, colors]);

    // Renderizar card de dia da semana
    const renderDayCard = (dayKey: string) => {
        const typedDayKey = dayKey as keyof ScheduleHours;
        const dayHours = schedule.hours[typedDayKey] || [];
        const hasHours = dayHours.length > 0;

        return (
            <Card
                key={dayKey}
                style={[
                    styles.dayCard,
                    { backgroundColor: colors?.surface || COLORS.white },
                    hasHours && { backgroundColor: (colors?.primary || COLORS.primary[500]) + '20' }
                ]}
                onPress={() => {
                    setSelectedDay(typedDayKey);
                    setModalVisible(true);
                }}
                disabled={disabled}
            >
                <Card.Content style={styles.dayCardContent}>
                    <Text style={[
                        styles.dayName,
                        hasHours && { color: colors?.primary || COLORS.primary[500] }
                    ]}>
                        {(DAY_NAMES as any)[dayKey]}
                    </Text>

                    {hasHours ? (
                        <View style={styles.hoursContainer}>
                            {dayHours.map(hour => (
                                <Chip
                                    key={hour}
                                    compact
                                    style={[styles.hourChip, { backgroundColor: colors?.primary || COLORS.primary[500] }]}
                                    textStyle={{ color: colors?.onPrimary || COLORS.white, fontSize: FONT_SIZE.xs }}
                                >
                                    {hour}
                                </Chip>
                            ))}
                        </View>
                    ) : (
                        <Text style={[
                            styles.noHours,
                            { color: colors?.onSurfaceVariant || COLORS.gray[500] }
                        ]}>
                            Toque para definir
                        </Text>
                    )}
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, { color: colors?.onSurface || COLORS.black }]}>
                {label}
                {required && <Text style={{ color: colors?.error || COLORS.error[500] }}> *</Text>}
            </Text>

            {/* Botões de ação */}
            <View style={styles.actionButtons}>
                <Button
                    mode="outlined"
                    onPress={() => setPreviewVisible(true)}
                    icon="calendar"
                    style={styles.actionButton}
                    disabled={disabled}
                >
                    Visualizar
                </Button>

                <Button
                    mode="contained-tonal"
                    onPress={() => {
                        const hasAnySchedule = Object.values(schedule.hours).some(hours => hours.length > 0);
                        if (hasAnySchedule) {
                            // Mostrar resumo
                            alert(scheduleToDisplayString(schedule));
                        } else {
                            // Abrir primeira configuração
                            setSelectedDay('monday');
                            setModalVisible(true);
                        }
                    }}
                    icon="clock-outline"
                    style={styles.actionButton}
                    disabled={disabled}
                >
                    Resumo
                </Button>
            </View>

            {/* Cards dos dias da semana */}
            <ScrollView style={styles.daysContainer} showsVerticalScrollIndicator={false}>
                {Object.keys(DAY_NAMES).map(renderDayCard)}
            </ScrollView>

            {/* Modal de Preview do Calendário */}
            <Portal>
                <Modal
                    visible={previewVisible}
                    onDismiss={() => setPreviewVisible(false)}
                    contentContainerStyle={[styles.previewModal, { backgroundColor: colors?.surface || COLORS.white }]}
                >
                    <Text style={[styles.modalTitle, { color: colors?.onSurface || COLORS.black }]}>
                        Preview do Cronograma
                    </Text>

                    <Calendar
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: colors?.surface || COLORS.white,
                            calendarBackground: colors?.surface || COLORS.white,
                            textSectionTitleColor: colors?.onSurface || COLORS.black,
                            selectedDayBackgroundColor: colors?.primary || COLORS.primary[500],
                            selectedDayTextColor: colors?.onPrimary || COLORS.white,
                            todayTextColor: colors?.primary || COLORS.primary[500],
                            dayTextColor: colors?.onSurface || COLORS.black,
                            textDisabledColor: colors?.onSurfaceVariant || COLORS.gray[300],
                            arrowColor: colors?.primary || COLORS.primary[500],
                            monthTextColor: colors?.onSurface || COLORS.black
                        }}
                        style={styles.calendar}
                    />

                    <Text style={[styles.previewDescription, { color: colors?.onSurfaceVariant || COLORS.gray[500] }]}>
                        As datas marcadas mostram quando as aulas acontecerão nas próximas 4 semanas
                    </Text>

                    <Button
                        mode="contained"
                        onPress={() => setPreviewVisible(false)}
                        style={styles.closeButton}
                    >{getString('close')}</Button>
                </Modal>
            </Portal>

            {/* Modal de Seleção de Horários */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={[styles.timeModal, { backgroundColor: colors?.surface || COLORS.white }]}
                >
                    <Text style={[styles.modalTitle, { color: colors?.onSurface || COLORS.black }]}>
                        {selectedDay ? (DAY_NAMES as any)[selectedDay] : 'Selecionar Horários'}
                    </Text>

                    <Divider style={{ marginVertical: SPACING.md }} />

                    <ScrollView style={styles.timeSlotsContainer}>
                        <View style={styles.timeSlotsGrid}>
                            {availableSlots.map((time) => {
                                const isSelected = selectedDay && schedule.hours[selectedDay].includes(time);
                                return (
                                    <Chip
                                        key={time}
                                        selected={isSelected || false}
                                        onPress={() => toggleTimeSlot(time)}
                                        style={[
                                            styles.timeSlot,
                                            isSelected && { backgroundColor: (colors?.primary || COLORS.primary[500]) }
                                        ]}
                                        textStyle={{
                                            color: isSelected ? (colors?.onPrimary || COLORS.white) : (colors?.onSurface || COLORS.black)
                                        }}
                                    >
                                        {time}
                                    </Chip>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <Button
                        mode="contained"
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}
                    >{getString('confirm')}</Button>
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.sm
    },
    label: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.medium as any,
        marginBottom: SPACING.md
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md
    },
    actionButton: {
        flex: 1
    },
    daysContainer: {
        maxHeight: 400
    },
    dayCard: {
        marginBottom: SPACING.sm,
        elevation: 2
    },
    dayCardContent: {
        paddingVertical: SPACING.md
    },
    dayName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold as any,
        marginBottom: SPACING.sm
    },
    hoursContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs
    },
    hourChip: {
        height: 28,
        marginBottom: SPACING.xs
    },
    noHours: {
        fontSize: FONT_SIZE.sm,
        fontStyle: 'italic'
    },
    previewModal: {
        margin: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        maxHeight: '80%'
    },
    timeModal: {
        margin: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        maxHeight: '70%'
    },
    modalTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.semibold as any,
        textAlign: 'center',
        marginBottom: SPACING.sm
    },
    calendar: {
        marginVertical: SPACING.md
    },
    previewDescription: {
        fontSize: FONT_SIZE.sm,
        textAlign: 'center',
        marginBottom: SPACING.md,
        fontStyle: 'italic'
    },
    timeSlotsContainer: {
        maxHeight: 300,
        marginBottom: SPACING.md
    },
    timeSlotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm
    },
    timeSlot: {
        marginBottom: SPACING.xs
    },
    closeButton: {
        marginTop: SPACING.sm
    }
});

export default ImprovedScheduleSelector;
