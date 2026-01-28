import React from 'react';
import { View, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { Portal, Modal, IconButton, Text } from 'react-native-paper';
import { COLORS, SPACING, BORDER_RADIUS, FONT_WEIGHT, FONT_SIZE } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

interface BaseBottomSheetProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    children: React.ReactNode;
    isDarkMode: boolean;
    theme: any;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BaseBottomSheet: React.FC<BaseBottomSheetProps> = ({
    visible,
    onDismiss,
    title,
    children,
    isDarkMode,
    theme
}) => {
    const colors = theme?.colors || COLORS;
    const backgroundColor = isDarkMode ? COLORS.gray[900] : COLORS.white;
    const textColor = isDarkMode ? COLORS.white : COLORS.black;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContainer,
                    {
                        backgroundColor,
                        borderColor: isDarkMode ? COLORS.gray[800] : COLORS.gray[200],
                    }
                ]}
                style={styles.modal}
            >
                <View style={styles.header}>
                    <View style={[styles.handle, { backgroundColor: isDarkMode ? COLORS.gray[700] : COLORS.gray[300] }]} />
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                        <IconButton
                            icon="close"
                            onPress={onDismiss}
                            iconColor={textColor}
                            size={20}
                        />
                    </View>
                </View>
                <View style={styles.content}>
                    {children}
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        ...(Platform.OS === 'web' ? {
            width: '90%',
            maxWidth: 500,
            borderRadius: BORDER_RADIUS.xl,
            borderWidth: 1,
            alignSelf: 'center',
        } : {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: BORDER_RADIUS.xl,
            borderTopRightRadius: BORDER_RADIUS.xl,
            borderTopWidth: 1,
        }),
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: SCREEN_HEIGHT * 0.8,
    },
    header: {
        alignItems: 'center',
        paddingTop: SPACING.sm,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: SPACING.sm,
        ...(Platform.OS === 'web' ? { display: 'none' } : {}), // Hide handle on web/center modal
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
    },
    content: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    modal: {
        justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
        margin: 0,
        ...(Platform.OS === 'web' ? { alignItems: 'center' } : {}),
    },
});

export default BaseBottomSheet;
