import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Modal, Switch } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar, ProgressBar, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import GlassCard from '@components/GlassCard';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import certificateService, { CERTIFICATE_TAGS, DEFAULT_CERTIFICATE_TEXT, FONT_FAMILIES, ElementStyle } from '@infrastructure/services/certificateService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import type { NavigationProp } from '@react-navigation/native';
import { TextInput as RNTextInput } from 'react-native';

interface AcademyDocument {
    id: string;
    settings?: {
        certificateTemplateUrl?: string; // Legacy
        certificateTextTemplate?: string; // Legacy
        certificateLocation?: string; // Legacy
        certificateColors?: { // Legacy
            studentName?: string;
            bodyText?: string;
        };
        certificateFontStyle?: 'classic' | 'modern' | 'handwritten'; // Legacy

        // New Unified Config
        certificateConfig?: {
            id: string;
            name: string;
            imageUrl: string;
            textTemplate: string;
            elements: {
                studentName: any; // ElementStyle type
                bodyText: any;
                dateLocation: any;
                instructorName: any;
                graduationName: any;
            };
            createdAt: number;
        };
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
    const [textTemplate, setTextTemplate] = useState<string>(DEFAULT_CERTIFICATE_TEXT);
    const [location, setLocation] = useState<string>('Fortaleza-CE');

    // Novos estados para cores e fontes
    const [nameColor, setNameColor] = useState<string>('#1a1a1a');
    const [bodyColor, setBodyColor] = useState<string>('#2c2c2c');
    const [fontStyle, setFontStyle] = useState<'classic' | 'modern' | 'handwritten' | 'elegant' | 'roboto' | 'openSans'>('classic');

    // Estado para configuração avançada de elementos
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [selectedElementKey, setSelectedElementKey] = useState<string>('studentName');
    const [elementsConfig, setElementsConfig] = useState<Record<string, ElementStyle>>({
        studentName: { visible: true, y: 40, x: 0, fontSize: 52, color: '#1a1a1a', textAlign: 'center', width: 100 },
        bodyText: { visible: true, y: 55, x: 10, width: 80, fontSize: 22, color: '#2c2c2c', textAlign: 'center' },
        dateLocation: { visible: true, y: 80, x: 10, width: 30, fontSize: 18, textAlign: 'left', color: '#333333' },
        instructorName: { visible: true, y: 80, x: 60, width: 30, fontSize: 20, textAlign: 'center', color: '#1a1a1a', fontWeight: 'bold' },
        graduationName: { visible: false, y: 50, x: 0, fontSize: 30, color: '#1a1a1a', textAlign: 'center', width: 100 }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'info'>('info');
    const [showTextEditorModal, setShowTextEditorModal] = useState(false);

    const backgroundGradient = isDarkMode
        ? [COLORS.gray[800], COLORS.gray[900], COLORS.black]
        : [COLORS.gray[100], COLORS.gray[50], COLORS.white];

    const textColor = theme.colors.text;
    const glassVariant = isDarkMode ? 'premium' : 'card';

    const PRESET_COLORS = [
        '#1a1a1a', // Preto Padrão
        '#FFFFFF', // Branco
        COLORS.primary[500], // Vermelho
        COLORS.info[700], // Azul
        COLORS.special.belt.purple, // Roxo
        COLORS.special.champion, // Dourado
    ];

    const FONT_OPTIONS = [
        { id: 'classic', label: 'Clássico', icon: 'book' },
        { id: 'modern', label: 'Moderno', icon: 'laptop-outline' },
        { id: 'handwritten', label: 'Manuscrito', icon: 'create' },
    ];

    useEffect(() => {
        loadCurrentTemplate();
    }, []);

    const loadCurrentTemplate = async () => {
        try {
            setLoading(true);
            const academiaId = userProfile?.academiaId;
            if (!academiaId) {
                setLoading(false);
                return;
            }

            // Buscar configurações da academia
            const academia = await academyFirestoreService.getById('gyms', academiaId) as AcademyDocument | null;

            if (academia?.settings?.certificateTemplateUrl) {
                setCurrentTemplateUrl(academia.settings.certificateTemplateUrl);
                showSnackbar('Template carregado com sucesso', 'success');
            } else {
                showSnackbar('Nenhum template configurado. Adicione um para começar!', 'info');
            }

            // Carregar template de texto e local
            if (academia?.settings?.certificateTextTemplate) {
                setTextTemplate(academia.settings.certificateTextTemplate);
            }
            if (academia?.settings?.certificateLocation) {
                setLocation(academia.settings.certificateLocation);
            }

            // Carregar cores personalizadas
            if (academia?.settings?.certificateColors) {
                if (academia.settings.certificateColors.studentName) {
                    setNameColor(academia.settings.certificateColors.studentName);
                }
                if (academia.settings.certificateColors.bodyText) {
                    setBodyColor(academia.settings.certificateColors.bodyText);
                }
            }

            // Carregar estilo de fonte
            if (academia?.settings?.certificateFontStyle) {
                setFontStyle(academia.settings.certificateFontStyle as any);
            }

            // Carregar configuração avançada se existir
            if (academia?.settings?.certificateConfig?.elements) {
                setElementsConfig(academia.settings.certificateConfig.elements);
                // Sincronizar estados legados para UI consistente
                const config = academia.settings.certificateConfig;
                if (config.elements.studentName?.color) setNameColor(config.elements.studentName.color);
                if (config.elements.bodyText?.color) setBodyColor(config.elements.bodyText.color);

                // Tenta inferir o estilo da fonte baseado no map (simplificado)
                // Se houver config.elements.studentName.fontFamily... mas por enquanto mantemos o fontStyle global como principal seletor de "Tema"
            }
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            showSnackbar('Erro ao carregar template', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setSnackbarVisible(true);
    };

    const updateElement = (key: string, field: string, value: any) => {
        setElementsConfig(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const formatElementLabel = (key: string) => {
        const labels: Record<string, string> = {
            studentName: 'Nome Aluno',
            bodyText: 'Texto Principal',
            dateLocation: 'Data/Local',
            instructorName: 'Instrutor',
            graduationName: 'Graduação'
        };
        return labels[key] || key;
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
                showSnackbar('Imagem selecionada! Clique em "Salvar" para aplicar.', 'success');
            }
        } catch (error) {
            showSnackbar('Erro ao selecionar imagem', 'error');
        }
    };

    const handleSave = async () => {
        if (!selectedImage && !textTemplate && !location) {
            showSnackbar('Nada para salvar', 'info');
            return;
        }

        try {
            setSaving(true);
            setUploading(!!selectedImage);
            setUploadProgress(0);
            showSnackbar('Salvando configurações...', 'info');

            const academiaId = userProfile?.academiaId;
            if (!academiaId) throw new Error('ID da academia não encontrado');

            let downloadUrl = currentTemplateUrl;

            // Upload da imagem se houver
            if (selectedImage) {
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 0.1, 0.9));
                }, 200);

                downloadUrl = await certificateService.uploadTemplate(academiaId, selectedImage);
                clearInterval(progressInterval);
                setUploadProgress(0.95);
            }

            // Atualizar documento da academia com todos os campos
            const updates: any = {
                'settings.certificateTextTemplate': textTemplate,
                'settings.certificateLocation': location,
                'settings.certificateColors': {
                    studentName: elementsConfig.studentName?.color || nameColor,
                    bodyText: elementsConfig.bodyText?.color || bodyColor
                },
                'settings.certificateFontStyle': fontStyle,
                // Salvar Configuração Completa
                'settings.certificateConfig': {
                    id: `cfg_${Date.now()}`,
                    name: 'Custom Template',
                    imageUrl: downloadUrl || currentTemplateUrl || '',
                    textTemplate: textTemplate,
                    elements: {
                        studentName: { ...elementsConfig.studentName, color: nameColor, fontFamily: fontStyle },
                        bodyText: { ...elementsConfig.bodyText, color: bodyColor },
                        // Ensure other required keys exist by merging whatever is in config or defaults
                        dateLocation: elementsConfig.dateLocation || { visible: true },
                        instructorName: elementsConfig.instructorName || { visible: true },
                        graduationName: elementsConfig.graduationName || { visible: false }
                    } as any,
                    createdAt: Date.now()
                },
                'settings.updatedAt': new Date()
            };

            if (downloadUrl) {
                updates['settings.certificateTemplateUrl'] = downloadUrl;
            }

            await academyFirestoreService.update('gyms', academiaId, updates);

            setUploadProgress(1);
            if (downloadUrl) setCurrentTemplateUrl(downloadUrl);
            setSelectedImage(null);
            showSnackbar('Configurações salvas com sucesso! ✓', 'success');

        } catch (error) {
            console.error('Erro ao salvar:', error);
            showSnackbar('Falha ao salvar. Tente novamente.', 'error');
        } finally {
            setSaving(false);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handlePreview = async () => {
        try {
            const bgUrl = selectedImage || currentTemplateUrl;
            if (!bgUrl) {
                showSnackbar('❌ Você precisa fazer upload de uma imagem de fundo primeiro!', 'error');
                return;
            }

            console.log('🎨 Gerando preview com imagem:', bgUrl);
            showSnackbar('Gerando preview do certificado...', 'info');

            const mockData = {
                studentName: 'João da Silva',
                graduationName: 'Faixa Preta - 1º Dan',
                date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
                location: location || 'Fortaleza-CE',
                instructorName: userProfile?.name || 'Mestre Instrutor',
                academyName: 'MyGym Academy',
                customText: textTemplate
            };

            const templateInfo = {
                imageUrl: bgUrl,
                textTemplate: textTemplate,
                customColors: {
                    studentName: nameColor,
                    bodyText: bodyColor
                },
                fontStyle: fontStyle,
                config: {
                    id: 'preview',
                    name: 'Preview',
                    imageUrl: bgUrl,
                    textTemplate: textTemplate,
                    elements: {
                        studentName: { ...elementsConfig.studentName, color: nameColor, fontFamily: fontStyle },
                        bodyText: { ...elementsConfig.bodyText, color: bodyColor },
                        dateLocation: elementsConfig.dateLocation || { visible: true },
                        instructorName: elementsConfig.instructorName || { visible: true },
                        graduationName: elementsConfig.graduationName || { visible: false }
                    } as any,
                    createdAt: Date.now()
                }
            };

            console.log('📄 Dados do certificado:', mockData);
            console.log('🖼️ Template info:', templateInfo);

            const uri = await certificateService.generateCertificatePdf(mockData, templateInfo);

            if (!uri) {
                throw new Error('Falha ao gerar certificado');
            }

            // Na web, o certificado já foi aberto em nova janela
            // No mobile, compartilhar o PDF
            if (uri !== 'web-preview') {
                await certificateService.shareCertificate(uri);
            }

            showSnackbar('✅ Preview gerado! Verifique a nova janela.', 'success');

        } catch (error: any) {
            console.error('❌ Erro no preview:', error);
            showSnackbar(`Erro: ${error?.message || 'Verifique se a imagem foi carregada'}`, 'error');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={backgroundGradient as any}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={COLORS.primary[500]} />
                    <Text style={[styles.loadingText, { color: textColor, marginTop: SPACING.md }]}>
                        Carregando configurações...
                    </Text>
                </SafeAreaView>
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
                                        <Text style={[styles.overlayTextName, { color: nameColor }]}>NOME DO ALUNO</Text>
                                        <Text style={[styles.overlayTextGrad, { color: bodyColor }]}>GRADUAÇÃO</Text>
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

                    {/* Advanced Settings Toggle */}
                    <TouchableOpacity
                        style={styles.advancedToggle}
                        onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    >
                        <Text style={[styles.advancedToggleText, { color: COLORS.primary[500] }]}>
                            {showAdvancedSettings ? 'Ocultar Ajustes Finos (Posição/Tamanho)' : 'Mostrar Ajustes Finos (Posição/Tamanho)'}
                        </Text>
                        <Ionicons name={showAdvancedSettings ? "chevron-up" : "chevron-down"} size={20} color={COLORS.primary[500]} />
                    </TouchableOpacity>

                    {/* Advanced Settings Panel */}
                    {showAdvancedSettings && (
                        <GlassCard style={styles.card} variant={glassVariant}>
                            <Text style={[styles.cardTitle, { color: textColor, marginBottom: 15 }]}>Editor de Layout</Text>

                            {/* Element Selector */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.elementSelector}>
                                {Object.keys(elementsConfig).map(key => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[styles.elementChip, selectedElementKey === key && styles.elementChipSelected]}
                                        onPress={() => setSelectedElementKey(key)}
                                    >
                                        <Text style={[styles.elementChipText, selectedElementKey === key && styles.elementChipTextSelected]}>
                                            {formatElementLabel(key)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Controls for Selected Element */}
                            {elementsConfig[selectedElementKey] && (
                                <View style={styles.controlsContainer}>
                                    <View style={styles.controlRow}>
                                        <Text style={[styles.controlLabel, { color: textColor }]}>Visível</Text>
                                        <Switch
                                            value={elementsConfig[selectedElementKey]?.visible}
                                            onValueChange={(val) => updateElement(selectedElementKey, 'visible', val)}
                                            color={COLORS.primary[500]}
                                        />
                                    </View>

                                    <View style={styles.controlRow}>
                                        <Text style={[styles.controlLabel, { color: textColor }]}>Posição Vertical (Y %)</Text>
                                        <View style={styles.numberControl}>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'y', (elementsConfig[selectedElementKey].y || 0) - 5)}>-5</Button>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'y', (elementsConfig[selectedElementKey].y || 0) - 1)}>-</Button>
                                            <Text style={{ color: textColor, width: 40, textAlign: 'center' }}>{elementsConfig[selectedElementKey].y || 0}%</Text>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'y', (elementsConfig[selectedElementKey].y || 0) + 1)}>+</Button>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'y', (elementsConfig[selectedElementKey].y || 0) + 5)}>+5</Button>
                                        </View>
                                    </View>

                                    <View style={styles.controlRow}>
                                        <Text style={[styles.controlLabel, { color: textColor }]}>Posição Horizontal (X %)</Text>
                                        <View style={styles.numberControl}>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'x', (elementsConfig[selectedElementKey].x || 0) - 5)}>-5</Button>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'x', (elementsConfig[selectedElementKey].x || 0) - 1)}>-</Button>
                                            <Text style={{ color: textColor, width: 40, textAlign: 'center' }}>{elementsConfig[selectedElementKey].x || 0}%</Text>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'x', (elementsConfig[selectedElementKey].x || 0) + 1)}>+</Button>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'x', (elementsConfig[selectedElementKey].x || 0) + 5)}>+5</Button>
                                        </View>
                                    </View>

                                    <View style={styles.controlRow}>
                                        <Text style={[styles.controlLabel, { color: textColor }]}>Tamanho Fonte (px)</Text>
                                        <View style={styles.numberControl}>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'fontSize', (elementsConfig[selectedElementKey].fontSize || 16) - 2)}>-</Button>
                                            <Text style={{ color: textColor, width: 40, textAlign: 'center' }}>{elementsConfig[selectedElementKey].fontSize || 16}</Text>
                                            <Button mode="outlined" compact onPress={() => updateElement(selectedElementKey, 'fontSize', (elementsConfig[selectedElementKey].fontSize || 16) + 2)}>+</Button>
                                        </View>
                                    </View>

                                    {/* Simple Text Align Toggle */}
                                    <View style={styles.controlRow}>
                                        <Text style={[styles.controlLabel, { color: textColor }]}>Alinhamento</Text>
                                        <View style={{ flexDirection: 'row', gap: 5 }}>
                                            {['left', 'center', 'right'].map((align) => (
                                                <TouchableOpacity
                                                    key={align}
                                                    style={[
                                                        styles.alignBtn,
                                                        elementsConfig[selectedElementKey].textAlign === align && { backgroundColor: COLORS.primary[100], borderColor: COLORS.primary[500] }
                                                    ]}
                                                    onPress={() => updateElement(selectedElementKey, 'textAlign', align)}
                                                >
                                                    <Ionicons
                                                        name={align === 'center' ? 'menu' : align === 'right' ? 'menu' : 'menu'} // Placeholder icons
                                                        size={16}
                                                        color={elementsConfig[selectedElementKey].textAlign === align ? COLORS.primary[700] : COLORS.gray[500]}
                                                    />
                                                    <Text style={{ fontSize: 10, color: elementsConfig[selectedElementKey].textAlign === align ? COLORS.primary[700] : COLORS.gray[500] }}>{align}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                </View>
                            )}
                        </GlassCard>
                    )}

                    {/* Botão para Personalizar e Editar Texto */}
                    <Button
                        mode="outlined"
                        onPress={() => setShowTextEditorModal(true)}
                        icon="pencil-ruler"
                        style={styles.editTextButton}
                        textColor={COLORS.primary[500]}
                        contentStyle={{ paddingVertical: SPACING.sm }}
                    >
                        Personalizar Certificado
                    </Button>

                    <View style={styles.miniPreviewInfo}>
                        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: nameColor, borderWidth: 1, borderColor: '#ccc' }} />
                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Cor do Nome</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: bodyColor, borderWidth: 1, borderColor: '#ccc' }} />
                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Cor do Texto</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botão Salvar - Aparece se houver mudanças */}
                    {(selectedImage || textTemplate !== DEFAULT_CERTIFICATE_TEXT || location !== 'Fortaleza-CE') && (
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

                    {/* Progress Bar para Upload */}
                    {uploading && (
                        <View style={styles.progressContainer}>
                            <Text style={[styles.progressText, { color: textColor }]}>
                                Fazendo upload... {Math.round(uploadProgress * 100)}%
                            </Text>
                            <ProgressBar
                                progress={uploadProgress}
                                color={COLORS.primary[500]}
                                style={styles.progressBar}
                            />
                        </View>
                    )}

                </ScrollView>

                {/* modal code follows... needs to be updated too */}

                {/* Snackbar para Feedbacks */}
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{
                        backgroundColor:
                            snackbarType === 'success' ? COLORS.success[500] :
                                snackbarType === 'error' ? COLORS.error[500] :
                                    COLORS.info[500]
                    }}
                    action={{
                        label: 'OK',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>

                {/* Modal do Editor de Texto */}
                <Modal
                    visible={showTextEditorModal}
                    onRequestClose={() => setShowTextEditorModal(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? COLORS.gray[800] : COLORS.white }]}>
                            {/* Header do Modal */}
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: textColor }]}>Editar Texto do Certificado</Text>
                                <TouchableOpacity onPress={() => setShowTextEditorModal(false)}>
                                    <Ionicons name="close" size={28} color={textColor} />
                                </TouchableOpacity>
                            </View>

                            {/* Conteúdo Scrollável */}
                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
                                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 0 }]}>
                                    Conteúdo Dinâmico
                                </Text>
                                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                                    Use as tags abaixo para personalizar o certificado:
                                </Text>

                                {/* Botões de Tags */}
                                <View style={styles.tagsContainer}>
                                    <TouchableOpacity
                                        style={[styles.tagButton, { backgroundColor: hexToRgba(COLORS.primary[500], 0.1), borderColor: COLORS.primary[500] }]}
                                        onPress={() => setTextTemplate(prev => prev + ' ' + CERTIFICATE_TAGS.ACADEMY_NAME)}
                                    >
                                        <Ionicons name="business" size={16} color={COLORS.primary[500]} />
                                        <Text style={[styles.tagButtonText, { color: COLORS.primary[700] }]}>Academia</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.tagButton, { backgroundColor: hexToRgba(COLORS.info[500], 0.1), borderColor: COLORS.info[500] }]}
                                        onPress={() => setTextTemplate(prev => prev + ' ' + CERTIFICATE_TAGS.STUDENT_NAME)}
                                    >
                                        <Ionicons name="person" size={16} color={COLORS.info[500]} />
                                        <Text style={[styles.tagButtonText, { color: COLORS.info[700] }]}>Aluno</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.tagButton, { backgroundColor: hexToRgba(COLORS.warning[500], 0.1), borderColor: COLORS.warning[500] }]}
                                        onPress={() => setTextTemplate(prev => prev + ' ' + CERTIFICATE_TAGS.GRADUATION_TYPE)}
                                    >
                                        <Ionicons name="trophy" size={16} color={COLORS.warning[500]} />
                                        <Text style={[styles.tagButtonText, { color: COLORS.warning[700] }]}>Graduação</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.tagButton, { backgroundColor: hexToRgba(COLORS.success[500], 0.1), borderColor: COLORS.success[500] }]}
                                        onPress={() => setTextTemplate(prev => prev + ' ' + CERTIFICATE_TAGS.DATE_AND_LOCATION)}
                                    >
                                        <Ionicons name="calendar" size={16} color={COLORS.success[500]} />
                                        <Text style={[styles.tagButtonText, { color: COLORS.success[700] }]}>Data/Local</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.tagButton, { backgroundColor: hexToRgba(COLORS.secondary[500], 0.1), borderColor: COLORS.secondary[500] }]}
                                        onPress={() => setTextTemplate(prev => prev + ' ' + CERTIFICATE_TAGS.INSTRUCTOR_DATA)}
                                    >
                                        <Ionicons name="school" size={16} color={COLORS.secondary[500]} />
                                        <Text style={[styles.tagButtonText, { color: COLORS.secondary[700] }]}>Instrutor</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Campo de Texto do Template */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: textColor }]}>Texto do Certificado</Text>
                                    <RNTextInput
                                        style={[
                                            styles.textInput,
                                            {
                                                color: textColor,
                                                backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.02),
                                                borderColor: theme.colors.disabled
                                            }
                                        ]}
                                        value={textTemplate}
                                        onChangeText={setTextTemplate}
                                        multiline
                                        numberOfLines={6}
                                        placeholder="Digite o texto do certificado usando as tags acima..."
                                        placeholderTextColor={theme.colors.disabled}
                                    />
                                </View>

                                {/* Campo de Localização */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: textColor }]}>Cidade/Estado</Text>
                                    <RNTextInput
                                        style={[
                                            styles.locationInput,
                                            {
                                                color: textColor,
                                                backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.02),
                                                borderColor: theme.colors.disabled
                                            }
                                        ]}
                                        value={location}
                                        onChangeText={setLocation}
                                        placeholder="Ex: Fortaleza-CE"
                                        placeholderTextColor={theme.colors.disabled}
                                    />
                                </View>

                                <View style={styles.divider} />

                                <Text style={[styles.sectionTitle, { color: textColor }]}>
                                    Estilo e Cores
                                </Text>

                                <View style={styles.colorSection}>
                                    <Text style={[styles.inputLabel, { color: textColor }]}>Estilo da Fonte</Text>
                                    <View style={styles.tagsContainer}>
                                        {FONT_OPTIONS.map((font) => (
                                            <TouchableOpacity
                                                key={font.id}
                                                style={[
                                                    styles.fontButton,
                                                    fontStyle === font.id && { backgroundColor: hexToRgba(COLORS.primary[500], 0.1), borderColor: COLORS.primary[500] }
                                                ]}
                                                onPress={() => setFontStyle(font.id as any)}
                                            >
                                                <Ionicons name={font.icon as any} size={16} color={fontStyle === font.id ? COLORS.primary[500] : theme.colors.textSecondary} />
                                                <Text style={[
                                                    styles.fontButtonText,
                                                    { color: fontStyle === font.id ? COLORS.primary[500] : theme.colors.textSecondary }
                                                ]}>{font.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.colorSection}>
                                    <Text style={[styles.inputLabel, { color: textColor }]}>Cor do Nome do Aluno</Text>
                                    <View style={styles.colorPalette}>
                                        {PRESET_COLORS.map((color) => (
                                            <TouchableOpacity
                                                key={`name-${color}`}
                                                style={[
                                                    styles.colorOption,
                                                    { backgroundColor: color },
                                                    nameColor === color && styles.selectedColorOption,
                                                    nameColor === color && { borderColor: textColor }
                                                ]}
                                                onPress={() => setNameColor(color)}
                                            >
                                                {nameColor === color && <Ionicons name="checkmark" size={16} color={color === '#FFFFFF' ? '#000' : '#FFF'} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.colorSection}>
                                    <Text style={[styles.inputLabel, { color: textColor }]}>Cor do Texto Principal</Text>
                                    <View style={styles.colorPalette}>
                                        {PRESET_COLORS.map((color) => (
                                            <TouchableOpacity
                                                key={`body-${color}`}
                                                style={[
                                                    styles.colorOption,
                                                    { backgroundColor: color },
                                                    bodyColor === color && styles.selectedColorOption,
                                                    bodyColor === color && { borderColor: textColor }
                                                ]}
                                                onPress={() => setBodyColor(color)}
                                            >
                                                {bodyColor === color && <Ionicons name="checkmark" size={16} color={color === '#FFFFFF' ? '#000' : '#FFF'} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <Text style={[styles.hint, { marginTop: SPACING.md, marginBottom: SPACING.lg }]}>
                                    As tags serão substituídas automaticamente pelos dados reais.
                                </Text>
                            </ScrollView>

                            {/* Footer do Modal com Botões */}
                            <View style={styles.modalFooter}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setShowTextEditorModal(false)}
                                    style={{ flex: 1, marginRight: SPACING.sm }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setShowTextEditorModal(false);
                                        showSnackbar('Texto atualizado! Clique em "Salvar" para aplicar.', 'success');
                                    }}
                                    buttonColor={COLORS.primary[500]}
                                    style={{ flex: 1 }}
                                >
                                    Aplicar
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View >
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
        paddingBottom: SPACING.xxl * 4,
        flexGrow: 1,
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
    },
    loadingText: {
        fontSize: FONT_SIZE.md,
        textAlign: 'center',
    },
    progressContainer: {
        marginTop: SPACING.lg,
        marginHorizontal: SPACING.md,
        padding: SPACING.md,
        backgroundColor: hexToRgba(COLORS.primary[50], 0.5),
        borderRadius: BORDER_RADIUS.md,
    },
    progressText: {
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.sm,
        textAlign: 'center',
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    helperText: {
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    tagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        gap: 4,
    },
    tagButtonText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    inputLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZE.md,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    locationInput: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZE.md,
    },
    editTextButton: {
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.md,
    },
    modalContent: {
        width: '100%',
        maxWidth: 600,
        maxHeight: '90%',
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: hexToRgba(COLORS.gray[300], 0.3),
    },
    modalTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
    },
    modalScroll: {
        padding: SPACING.lg,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: hexToRgba(COLORS.gray[300], 0.3),
    },
    miniPreviewInfo: {
        marginVertical: SPACING.sm,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.2)',
        marginVertical: SPACING.md,
    },
    colorSection: {
        marginBottom: SPACING.md,
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginTop: SPACING.xs,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColorOption: {
        borderWidth: 2,
        transform: [{ scale: 1.1 }],
    },
    fontButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
        gap: 6,
        marginBottom: SPACING.xs,
    },
    fontButtonText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    advancedToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    advancedToggleText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: 'bold',
    },
    elementSelector: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    elementChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: 'rgba(128,128,128,0.1)',
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    elementChipSelected: {
        backgroundColor: hexToRgba(COLORS.primary[500], 0.1),
        borderColor: COLORS.primary[500],
    },
    elementChipText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray[600],
    },
    elementChipTextSelected: {
        fontWeight: 'bold',
        color: COLORS.primary[700],
    },
    controlsContainer: {
        gap: SPACING.md,
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    controlLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
    numberControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    alignBtn: {
        padding: 6,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 4,
        alignItems: 'center',
        minWidth: 40
    }
});

export default CertificateTemplateScreen;
