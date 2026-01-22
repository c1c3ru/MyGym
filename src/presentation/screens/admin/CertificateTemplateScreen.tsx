import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import GlassCard from '@components/GlassCard';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import certificateService from '@infrastructure/services/certificateService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import type { NavigationProp } from '@react-navigation/native';

interface AcademyDocument {
    id: string;
    settings?: {
        certificateTemplateUrl?: string;
        updatedAt?: Date;
    };
    [key: string]: any;
}

interface CertificateTemplateScreenProps {
    navigation: NavigationProp<any>;
}

const CertificateTemplateScreen: React.FC<CertificateTemplateScreenProps> = ({ navigation }) => {
    const { userProfile } = useAuthFacade();
    const { getString, isDarkMode, theme } = useTheme();

    const [currentTemplateUrl, setCurrentTemplateUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const backgroundGradient = isDarkMode
        ? [COLORS.gray[800], COLORS.gray[900], COLORS.black]
        : [COLORS.gray[100], COLORS.gray[50], COLORS.white];

    const textColor = theme.colors.text;
    const glassVariant = isDarkMode ? 'premium' : 'card';

    useEffect(() => {
        loadCurrentTemplate();
    }, []);

    const loadCurrentTemplate = async () => {
        try {
            setLoading(true);
            const academiaId = userProfile?.academiaId;
            if (!academiaId) return;

            // Buscar configurações da academia
            const academia = await academyFirestoreService.getById('academies', academiaId) as AcademyDocument | null;

            if (academia?.settings?.certificateTemplateUrl) {
                setCurrentTemplateUrl(academia.settings.certificateTemplateUrl);
            }
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            Alert.alert('Erro', 'Não foi possível carregar o template atual.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [297, 210], // A4 Landscape ratio (approx 1.414)
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const handleSave = async () => {
        if (!selectedImage) return;

        try {
            setSaving(true);
            const academiaId = userProfile?.academiaId;
            if (!academiaId) throw new Error('ID da academia não encontrado');

            // 1. Upload da imagem
            const downloadUrl = await certificateService.uploadTemplate(academiaId, selectedImage);

            // 2. Atualizar documento da academia
            // Precisamos garantir que o objeto settings existe ou atualizá-lo com merge
            await academyFirestoreService.update('academies', academiaId, {
                'settings.certificateTemplateUrl': downloadUrl,
                'settings.updatedAt': new Date()
            });

            setCurrentTemplateUrl(downloadUrl);
            setSelectedImage(null);
            Alert.alert('Sucesso', 'Template de certificado atualizado com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar template:', error);
            Alert.alert('Erro', 'Falha ao salvar o template. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = async () => {
        // Gerar um PDF de teste com dados fictícios
        try {
            const bgUrl = selectedImage || currentTemplateUrl;
            if (!bgUrl) {
                Alert.alert('Aviso', 'Selecione uma imagem ou tenha um template salvo para visualizar.');
                return;
            }

            const mockData = {
                studentName: 'João da Silva',
                graduationName: 'Faixa Preta - 1º Dan',
                date: new Date().toLocaleDateString('pt-BR'),
                instructorName: userProfile?.name || 'Mestre Instrutor',
                academyName: 'MyGym Academy'
            };

            // Se for selectedImage (local), precisamos tratar diferente ou o expo-print aceita file://?
            // expo-print aceita file:// URI para imagens

            // Simular info do template
            const templateInfo = { imageUrl: bgUrl };

            const uri = await certificateService.generateCertificatePdf(mockData, templateInfo);

            // Compartilhar para visualizar
            await certificateService.shareCertificate(uri);

        } catch (error) {
            console.error('Erro no preview:', error);
            Alert.alert('Erro', 'Não foi possível gerar a pré-visualização.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary[500]} />
            </View>
        );
    }

    const activeImage = selectedImage || currentTemplateUrl;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={backgroundGradient as any}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <Text style={[styles.pageTitle, { color: textColor }]}>Modelo de Certificado</Text>
                        <Text style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}>
                            Configure o visual dos certificados emitidos pela sua academia.
                        </Text>
                    </View>

                    <GlassCard style={styles.card} variant={glassVariant}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: textColor }]}>Template Atual</Text>
                        </View>

                        <View style={styles.previewContainer}>
                            {activeImage ? (
                                <View style={styles.imageWrapper}>
                                    <Image source={{ uri: activeImage }} style={styles.templateImage} resizeMode="contain" />
                                    {/* Overlay simulando texto para dar ideia de como fica */}
                                    <View style={styles.overlay}>
                                        <Text style={styles.overlayTextName}>NOME DO ALUNO</Text>
                                        <Text style={styles.overlayTextGrad}>GRADUAÇÃO</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={[styles.placeholder, { borderColor: theme.colors.disabled }]}>
                                    <Ionicons name="image-outline" size={48} color={theme.colors.disabled} />
                                    <Text style={{ color: theme.colors.disabled, marginTop: 10 }}>Nenhum template selecionado</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.actions}>
                            <Button
                                mode="outlined"
                                onPress={pickImage}
                                icon="upload"
                                style={styles.button}
                                textColor={COLORS.primary[500]}
                            >
                                Selecionar Imagem
                            </Button>

                            <Button
                                mode="outlined"
                                onPress={handlePreview}
                                icon="eye"
                                style={styles.button}
                                disabled={!activeImage}
                                textColor={COLORS.info[500]}
                            >
                                Visualizar PDF
                            </Button>
                        </View>

                        <Text style={styles.hint}>
                            Recomendado: Imagem JPG/PNG em formato A4 Paisagem (297mm x 210mm).
                            Deixe espaço livre no centro para o nome do aluno.
                        </Text>
                    </GlassCard>

                    {selectedImage && (
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={saving}
                            disabled={saving}
                            style={styles.saveButton}
                            buttonColor={COLORS.success[500]}
                        >
                            Salvar Alterações
                        </Button>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    pageTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
    },
    pageSubtitle: {
        fontSize: FONT_SIZE.md,
        marginTop: SPACING.xs,
    },
    card: {
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    cardHeader: {
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: SPACING.sm,
    },
    cardTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
    },
    previewContainer: {
        alignItems: 'center',
        marginVertical: SPACING.md,
        height: 220,
        justifyContent: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        backgroundColor: '#fff', // Fundo branco pra imagem
    },
    templateImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)', // Leve escurecida para ver texto branco se precisar
    },
    overlayTextName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: '40%',
    },
    overlayTextGrad: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: '55%',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    button: {
        flex: 1,
    },
    hint: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray[500],
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    saveButton: {
        marginTop: SPACING.sm,
        paddingVertical: 4,
    }
});

export default CertificateTemplateScreen;
