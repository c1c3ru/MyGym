import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Modal } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar, ProgressBar, Portal, Switch, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import GlassCard from '@components/GlassCard';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import academyCollectionsService from '@infrastructure/services/academyCollectionsService';
import certificateService, { CERTIFICATE_TAGS, DEFAULT_CERTIFICATE_TEXT, FONT_FAMILIES, ElementStyle } from '@infrastructure/services/certificateService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import type { NavigationProp } from '@react-navigation/native';
import { TextInput as RNTextInput } from 'react-native';

interface Modality {
    id: string;
    name: string;
}

interface CertificateTemplateConfig {
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
}

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
        certificateConfig?: CertificateTemplateConfig;

        // Modality Specific Configs
        modalityTemplates?: Record<string, CertificateTemplateConfig>;

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

    // Estado para configuração avançada de elementos e múltiplas modalidades
    const [modalities, setModalities] = useState<Modality[]>([]);
    const [selectedModalityId, setSelectedModalityId] = useState<string | null>(null); // null = Padrão
    const [configCache, setConfigCache] = useState<Record<string, any>>({});

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
        if (userProfile?.academiaId) {
            loadInitialData();
        }
    }, [userProfile?.academiaId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const academiaId = userProfile?.academiaId;
            if (!academiaId) return;

            // 1. Carregar Modalidades
            try {
                // @ts-ignore
                const mods = await academyCollectionsService.getModalities(academiaId);
                const uniqueModalities = (mods as Modality[]).filter((modality, index, self) =>
                    index === self.findIndex(m => m.id === modality.id)
                );
                setModalities(uniqueModalities);
            } catch (e) {
                console.log('Erro ao carregar modalidades:', e);
            }

            // 2. Buscar configurações da academia
            const academia = await academyFirestoreService.getById('gyms', academiaId) as AcademyDocument | null;

            if (!academia?.settings) return;

            // Pre-popular cache com configurações salvas
            const newCache: Record<string, any> = {};

            // Config Padrão (Default)
            if (academia.settings.certificateConfig) {
                newCache['default'] = academia.settings.certificateConfig;
            } else {
                // Tentar migrar legacy para config object
                newCache['default'] = {
                    imageUrl: academia.settings.certificateTemplateUrl,
                    textTemplate: academia.settings.certificateTextTemplate,
                    elements: academia.settings.certificateColors ? {
                        studentName: {
                            visible: true, y: 40, x: 0, fontSize: 52,
                            color: academia.settings.certificateColors.studentName || nameColor,
                            fontFamily: academia.settings.certificateFontStyle
                        },
                        bodyText: {
                            visible: true, y: 55, x: 10, width: 80, fontSize: 22,
                            color: academia.settings.certificateColors.bodyText || bodyColor
                        }
                    } : null
                };
            }

            // Configs por Modalidade
            if (academia.settings.modalityTemplates) {
                Object.entries(academia.settings.modalityTemplates).forEach(([modId, config]) => {
                    newCache[modId] = config;
                });
            }

            setConfigCache(newCache);

            // 3. Aplicar Config atual (Default)
            if (newCache['default']) {
                applyConfigToState(newCache['default']);
                if (newCache['default'].elements) {
                    showSnackbar('Template carregado com sucesso', 'success');
                } else {
                    showSnackbar('Nenhum template configurado. Adicione um para começar!', 'info');
                }
            }

            // Carregar Location (ainda global)
            if (academia?.settings?.certificateLocation) {
                setLocation(academia.settings.certificateLocation);
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

    const handleColorChange = (type: 'studentName' | 'bodyText', color: string) => {
        if (type === 'studentName') {
            setNameColor(color);
            updateElement('studentName', 'color', color);
        } else {
            setBodyColor(color);
            updateElement('bodyText', 'color', color);
        }
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

    const applyConfigToState = (config: any) => {
        setCurrentTemplateUrl(config.imageUrl || null);
        setTextTemplate(config.textTemplate || DEFAULT_CERTIFICATE_TEXT);

        // Se houver config de elementos completa
        if (config.elements) {
            setElementsConfig(prev => ({
                ...prev,
                ...config.elements
            }));

            // Sincronizar legacy states para UI
            if (config.elements.studentName?.color) setNameColor(config.elements.studentName.color);
            if (config.elements.bodyText?.color) setBodyColor(config.elements.bodyText.color);
            if (config.elements.studentName?.fontFamily) setFontStyle(config.elements.studentName.fontFamily);
        }
    };

    // Função para trocar de contexto (Modality Switch)
    const handleModalityChange = (modalityId: string | null) => {
        // 1. Salvar estado atual no cache antes de trocar
        const currentKey = selectedModalityId || 'default';
        const currentState = {
            imageUrl: selectedImage || currentTemplateUrl,
            textTemplate,
            elements: { ...elementsConfig, studentName: { ...elementsConfig.studentName, color: nameColor, fontFamily: fontStyle }, bodyText: { ...elementsConfig.bodyText, color: bodyColor } },
        };

        setConfigCache(prev => ({ ...prev, [currentKey]: currentState }));

        // 2. Trocar ID
        setSelectedModalityId(modalityId);

        // 3. Carregar novo estado do cache (ou vazio se nunca editado)
        const nextKey = modalityId || 'default';
        // Se a chave existir no cache (editado recentemente), use-a.
        // Se NÃO existir no cache, precisamos ver se existe no carregamento inicial (que eu ainda não implementei o loadInitialData completo, mas vamos assumir que configCache será populado no load)
        const nextConfig = configCache[nextKey] || {};

        setSelectedImage(null);
        applyConfigToState(nextConfig);
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

            const configToSave: CertificateTemplateConfig = {
                id: `cfg_${Date.now()}`,
                name: selectedModalityId ? `Template ${selectedModalityId}` : 'Custom Template',
                imageUrl: downloadUrl || currentTemplateUrl || '',
                textTemplate: textTemplate,
                elements: {
                    studentName: { ...elementsConfig.studentName, color: nameColor, fontFamily: fontStyle },
                    bodyText: { ...elementsConfig.bodyText, color: bodyColor },
                    dateLocation: elementsConfig.dateLocation || { visible: true },
                    instructorName: elementsConfig.instructorName || { visible: true },
                    graduationName: elementsConfig.graduationName || { visible: false }
                },
                createdAt: Date.now()
            };

            const updates: any = {
                'settings.updatedAt': new Date()
            };

            if (!selectedModalityId) {
                // Padrão: Atualiza legado e config unificada
                updates['settings.certificateTextTemplate'] = textTemplate;
                updates['settings.certificateLocation'] = location; // Location ainda é global, mas salvamos aqui
                updates['settings.certificateColors'] = {
                    studentName: nameColor,
                    bodyText: bodyColor
                };
                updates['settings.certificateFontStyle'] = fontStyle;
                updates['settings.certificateConfig'] = configToSave;

                if (downloadUrl) {
                    updates['settings.certificateTemplateUrl'] = downloadUrl;
                }
            } else {
                // Modalidade específica
                updates[`settings.modalityTemplates.${selectedModalityId}`] = configToSave;

                // Location ainda é global, então salvamos se for editado
                updates['settings.certificateLocation'] = location;
            }

            // Precisamos atualizar o cache local para refletir a mudança sem reload
            setConfigCache(prev => ({
                ...prev,
                [selectedModalityId || 'default']: configToSave
            }));

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

                    {/* Seletor de Modalidade */}
                    <View style={{ marginBottom: SPACING.md }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingHorizontal: 4, paddingBottom: 4 }}
                            style={{ flexGrow: 0 }} /* Important for horizontal scroll in nested views */
                        >
                            <Chip
                                mode={selectedModalityId === null ? 'flat' : 'outlined'}
                                selected={selectedModalityId === null}
                                onPress={() => handleModalityChange(null)}
                                style={{ backgroundColor: selectedModalityId === null ? COLORS.primary[500] : undefined }}
                                textStyle={{ color: selectedModalityId === null ? COLORS.white : (isDarkMode ? COLORS.white : COLORS.black) }}
                            >
                                Padrão Geral
                            </Chip>

                            {modalities.map(mod => (
                                <Chip
                                    key={mod.id}
                                    mode={selectedModalityId === mod.id ? 'flat' : 'outlined'}
                                    selected={selectedModalityId === mod.id}
                                    onPress={() => handleModalityChange(mod.id)}
                                    style={{ backgroundColor: selectedModalityId === mod.id ? COLORS.primary[500] : undefined }}
                                    textStyle={{ color: selectedModalityId === mod.id ? COLORS.white : (isDarkMode ? COLORS.white : COLORS.black) }}
                                >
                                    {mod.name}
                                </Chip>
                            ))}
                        </ScrollView>
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, marginLeft: 4 }}>
                            {selectedModalityId
                                ? `Editando template exclusivo para ${modalities.find(m => m.id === selectedModalityId)?.name}`
                                : "Editando template padrão para todas as modalidades"}
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
                                        {elementsConfig.studentName?.visible && (
                                            <Text style={[
                                                styles.overlayTextName,
                                                {
                                                    color: nameColor,
                                                    top: `${elementsConfig.studentName.y || 40}%`,
                                                    left: `${elementsConfig.studentName.x || 0}%`,
                                                    fontSize: (elementsConfig.studentName.fontSize || 20) * 0.4, // Scale down for preview
                                                    width: `${elementsConfig.studentName.width || 100}%`,
                                                    textAlign: elementsConfig.studentName.textAlign || 'center'
                                                } as any
                                            ]}>NOME DO ALUNO</Text>
                                        )}

                                        {elementsConfig.graduationName?.visible && (
                                            <Text style={[
                                                styles.overlayTextGrad,
                                                {
                                                    color: bodyColor,
                                                    top: `${elementsConfig.graduationName.y || 50}%`,
                                                    left: `${elementsConfig.graduationName.x || 0}%`,
                                                    fontSize: (elementsConfig.graduationName.fontSize || 14) * 0.4,
                                                    width: `${elementsConfig.graduationName.width || 100}%`,
                                                    textAlign: elementsConfig.graduationName.textAlign || 'center'
                                                } as any
                                            ]}>GRADUAÇÃO</Text>
                                        )}

                                        {elementsConfig.bodyText?.visible && (
                                            <Text
                                                style={[
                                                    styles.overlayTextBody,
                                                    {
                                                        color: bodyColor,
                                                        top: `${elementsConfig.bodyText.y || 55}%`,
                                                        left: `${elementsConfig.bodyText.x || 10}%`,
                                                        width: `${elementsConfig.bodyText.width || 80}%`,
                                                        fontSize: (elementsConfig.bodyText.fontSize || 10) * 0.4,
                                                        textAlign: elementsConfig.bodyText.textAlign || 'center'
                                                    } as any
                                                ]}
                                                numberOfLines={3}
                                                ellipsizeMode="tail"
                                            >
                                                {textTemplate.replace(/\$tag\w+/g, '...')}
                                            </Text>
                                        )}
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

                    {/* Advanced Settings Toggle Button */}
                    <TouchableOpacity
                        style={styles.advancedToggle}
                        onPress={() => setShowAdvancedSettings(true)}
                    >
                        <Text style={[styles.advancedToggleText, { color: COLORS.primary[500] }]}>
                            Abrir Editor de Layout (Posição/Tamanho)
                        </Text>
                        <Ionicons name="options" size={20} color={COLORS.primary[500]} />
                    </TouchableOpacity>

                    {/* Modal de Editor de Layout */}
                    <Modal
                        visible={showAdvancedSettings}
                        onRequestClose={() => setShowAdvancedSettings(false)}
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: isDarkMode ? COLORS.gray[800] : COLORS.white }]}>
                                {/* Header do Modal */}
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={[styles.modalTitle, { color: textColor }]}>Editor de Layout</Text>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Ajuste fino de posições e tamanhos</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowAdvancedSettings(false)}>
                                        <Ionicons name="close" size={28} color={textColor} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalScroll}>
                                    {/* Element Selector */}
                                    <Text style={[styles.sectionTitle, { color: textColor, marginTop: 0 }]}>Selecionar Elemento</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={{ flexGrow: 0, marginBottom: SPACING.lg }}
                                        contentContainerStyle={{ paddingRight: SPACING.md, paddingHorizontal: 4 }}
                                    >
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

                                    <View style={styles.divider} />

                                    <View style={styles.minipreview}>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
                                            As alterações são refletidas em tempo real no preview abaixo do header.
                                        </Text>
                                    </View>

                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <Button mode="contained" onPress={() => setShowAdvancedSettings(false)} style={{ flex: 1 }} buttonColor={COLORS.primary[500]}>
                                        Concluir Edição
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </Modal>

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
                                        style={[styles.tagButton, {
                                            backgroundColor: isDarkMode ? hexToRgba('#FFFFFF', 0.1) : hexToRgba(COLORS.secondary[500], 0.1),
                                            borderColor: isDarkMode ? '#FFFFFF' : COLORS.secondary[500]
                                        }]}
                                        onPress={() => setTextTemplate(prev => prev + ' ' + CERTIFICATE_TAGS.INSTRUCTOR_DATA)}
                                    >
                                        <Ionicons name="school" size={16} color={isDarkMode ? '#FFFFFF' : COLORS.secondary[500]} />
                                        <Text style={[styles.tagButtonText, { color: isDarkMode ? '#FFFFFF' : COLORS.secondary[700] }]}>Instrutor</Text>
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
                                                onPress={() => {
                                                    setFontStyle(font.id as any);
                                                    updateElement('studentName', 'fontFamily', font.id);
                                                }}
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
                                                onPress={() => handleColorChange('studentName', color)}
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
                                                onPress={() => handleColorChange('bodyText', color)}
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
    overlayTextBody: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: '65%',
        width: '80%',
        textAlign: 'center',
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
        width: '90%',
        maxWidth: 500,
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
        flex: 1,
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
    minipreview: { // Added alias to fix lint error if used
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
