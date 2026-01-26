import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    SafeAreaView,
    Image,
    Linking,
    Alert,
} from 'react-native';
import {
    IconButton,
    Searchbar,
    Chip,
    ActivityIndicator,
    Menu,
    Snackbar,
} from 'react-native-paper';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@infrastructure/services/firebase';
import { CertificateDeliveryService } from '@infrastructure/services/certificateDeliveryService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp } from '@react-navigation/native';

interface Certificate {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    graduationName: string;
    modality: string;
    date: Date;
    certificateUrl: string;
    instructorName: string;
    createdAt: Date;
}

interface CertificateGalleryScreenProps {
    navigation: NavigationProp<any>;
    route?: any;
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const cardWidth = isTablet ? (width - 80) / 3 : (width - 60) / 2;

const CertificateGalleryScreen = ({ navigation, route }: CertificateGalleryScreenProps) => {
    const { userProfile, academia } = useAuth();
    const { getString, isDarkMode } = useTheme();

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModality, setSelectedModality] = useState<string | null>(null);
    const [modalities, setModalities] = useState<string[]>([]);
    const [menuVisible, setMenuVisible] = useState<string | null>(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        loadCertificates();
    }, []);

    useEffect(() => {
        filterCertificates();
    }, [searchQuery, selectedModality, certificates]);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            const academiaId = userProfile?.academiaId || academia?.id;

            if (!academiaId) {
                console.error('Academia ID não encontrado');
                return;
            }

            // Query para buscar todas as graduações com certificados
            const studentsRef = collection(db, 'academies', academiaId, 'students');
            const studentsSnapshot = await getDocs(studentsRef);

            const allCertificates: Certificate[] = [];
            const modalitySet = new Set<string>();

            for (const studentDoc of studentsSnapshot.docs) {
                const studentData = studentDoc.data();
                const graduationsRef = collection(db, 'academies', academiaId, 'students', studentDoc.id, 'graduations');
                const graduationsQuery = query(
                    graduationsRef,
                    where('certificateUrl', '!=', null),
                    orderBy('certificateUrl'),
                    orderBy('date', 'desc')
                );

                const graduationsSnapshot = await getDocs(graduationsQuery);

                graduationsSnapshot.forEach((gradDoc) => {
                    const gradData = gradDoc.data();

                    if (gradData.certificateUrl) {
                        allCertificates.push({
                            id: gradDoc.id,
                            studentId: studentDoc.id,
                            studentName: studentData.name || 'Aluno',
                            studentEmail: studentData.email,
                            studentPhone: studentData.phone,
                            graduationName: gradData.graduation || 'Graduação',
                            modality: gradData.modality || 'Sem modalidade',
                            date: gradData.date?.toDate ? gradData.date.toDate() : new Date(),
                            certificateUrl: gradData.certificateUrl,
                            instructorName: gradData.instructor || 'Instrutor',
                            createdAt: gradData.createdAt?.toDate ? gradData.createdAt.toDate() : new Date(),
                        });

                        if (gradData.modality) {
                            modalitySet.add(gradData.modality);
                        }
                    }
                });
            }

            // Ordenar por data mais recente
            allCertificates.sort((a, b) => b.date.getTime() - a.date.getTime());

            setCertificates(allCertificates);
            setModalities(Array.from(modalitySet).sort());
        } catch (error) {
            console.error('Erro ao carregar certificados:', error);
            showSnackbar('Erro ao carregar certificados');
        } finally {
            setLoading(false);
        }
    };

    const filterCertificates = () => {
        let filtered = [...certificates];

        // Filtrar por busca
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (cert) =>
                    cert.studentName.toLowerCase().includes(query) ||
                    cert.graduationName.toLowerCase().includes(query) ||
                    cert.modality.toLowerCase().includes(query)
            );
        }

        // Filtrar por modalidade
        if (selectedModality) {
            filtered = filtered.filter((cert) => cert.modality === selectedModality);
        }

        setFilteredCertificates(filtered);
    };

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const handleOpenCertificate = async (certificateUrl: string) => {
        try {
            const canOpen = await Linking.canOpenURL(certificateUrl);
            if (canOpen) {
                await Linking.openURL(certificateUrl);
            } else {
                showSnackbar('Não foi possível abrir o certificado');
            }
        } catch (error) {
            console.error('Erro ao abrir certificado:', error);
            showSnackbar('Erro ao abrir certificado');
        }
    };

    const handleShareEmail = async (cert: Certificate) => {
        try {
            const result = await CertificateDeliveryService.sendCertificateByEmail({
                studentName: cert.studentName,
                studentEmail: cert.studentEmail,
                graduationName: cert.graduationName,
                academyName: academia?.name || 'MyGym Academy',
                certificateUrl: cert.certificateUrl,
                date: cert.date.toLocaleDateString('pt-BR'),
            });

            if (result) {
                showSnackbar('✅ Certificado enviado por email!');
            } else {
                showSnackbar('❌ Erro ao enviar email');
            }
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            showSnackbar('Erro ao enviar email');
        }
        setMenuVisible(null);
    };

    const handleShareWhatsApp = async (cert: Certificate) => {
        try {
            const result = await CertificateDeliveryService.sendCertificateByWhatsApp({
                studentName: cert.studentName,
                studentPhone: cert.studentPhone,
                graduationName: cert.graduationName,
                academyName: academia?.name || 'MyGym Academy',
                certificateUrl: cert.certificateUrl,
                date: cert.date.toLocaleDateString('pt-BR'),
            });

            if (result) {
                showSnackbar('✅ WhatsApp aberto!');
            } else {
                showSnackbar('❌ Erro ao abrir WhatsApp');
            }
        } catch (error) {
            console.error('Erro ao compartilhar via WhatsApp:', error);
            showSnackbar('Erro ao compartilhar via WhatsApp');
        }
        setMenuVisible(null);
    };

    const renderCertificateCard = (cert: Certificate) => (
        <TouchableOpacity
            key={cert.id}
            style={styles.certificateCard}
            onPress={() => handleOpenCertificate(cert.certificateUrl)}
            activeOpacity={0.8}
        >
            <View style={styles.certificateThumbnail}>
                <Image
                    source={{ uri: cert.certificateUrl }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                />
                <View style={styles.thumbnailOverlay}>
                    <IconButton icon="file-pdf-box" size={40} iconColor={COLORS.white} />
                </View>
            </View>

            <View style={styles.certificateInfo}>
                <Text style={styles.studentName} numberOfLines={1}>
                    {cert.studentName}
                </Text>
                <Text style={styles.graduationName} numberOfLines={1}>
                    {cert.graduationName}
                </Text>
                <Text style={styles.modalityName} numberOfLines={1}>
                    {cert.modality}
                </Text>
                <Text style={styles.certificateDate}>
                    {cert.date.toLocaleDateString('pt-BR')}
                </Text>
            </View>

            <View style={styles.certificateActions}>
                <Menu
                    visible={menuVisible === cert.id}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                        <IconButton
                            icon="dots-vertical"
                            size={20}
                            iconColor={COLORS.gray[600]}
                            onPress={() => setMenuVisible(cert.id)}
                        />
                    }
                >
                    <Menu.Item
                        onPress={() => handleOpenCertificate(cert.certificateUrl)}
                        title="Abrir PDF"
                        leadingIcon="file-pdf-box"
                    />
                    {cert.studentEmail && (
                        <Menu.Item
                            onPress={() => handleShareEmail(cert)}
                            title="Enviar por Email"
                            leadingIcon="email"
                        />
                    )}
                    {cert.studentPhone && Platform.OS !== 'web' && (
                        <Menu.Item
                            onPress={() => handleShareWhatsApp(cert)}
                            title="Compartilhar WhatsApp"
                            leadingIcon="whatsapp"
                        />
                    )}
                </Menu>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={getAuthGradient(isDarkMode) as any}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <IconButton
                            icon="arrow-left"
                            iconColor={COLORS.white}
                            size={24}
                            onPress={() => navigation.goBack()}
                        />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Galeria de Certificados</Text>
                            <Text style={styles.headerSubtitle}>
                                {filteredCertificates.length} certificado(s) emitido(s)
                            </Text>
                        </View>
                        <IconButton
                            icon="refresh"
                            iconColor={COLORS.white}
                            size={24}
                            onPress={loadCertificates}
                        />
                    </View>
                </View>

                {/* Search and Filters */}
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Buscar por aluno, graduação..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        iconColor={COLORS.info[700]}
                        inputStyle={styles.searchInput}
                    />

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterContent}
                    >
                        <Chip
                            selected={selectedModality === null}
                            onPress={() => setSelectedModality(null)}
                            style={styles.filterChip}
                            textStyle={styles.filterChipText}
                        >
                            Todas
                        </Chip>
                        {modalities.map((modality) => (
                            <Chip
                                key={modality}
                                selected={selectedModality === modality}
                                onPress={() => setSelectedModality(modality)}
                                style={styles.filterChip}
                                textStyle={styles.filterChipText}
                            >
                                {modality}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>

                {/* Certificates Grid */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.info[700]} />
                        <Text style={styles.loadingText}>Carregando certificados...</Text>
                    </View>
                ) : filteredCertificates.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <IconButton icon="certificate-outline" size={80} iconColor={COLORS.gray[400]} />
                        <Text style={styles.emptyTitle}>Nenhum certificado encontrado</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery || selectedModality
                                ? 'Tente ajustar os filtros de busca'
                                : 'Certificados emitidos aparecerão aqui'}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.gridContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredCertificates.map(renderCertificateCard)}
                    </ScrollView>
                )}

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{ backgroundColor: COLORS.info[700] }}
                >
                    {snackbarMessage}
                </Snackbar>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        paddingHorizontal: SPACING.md,
        backgroundColor: 'transparent',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.white + 'CC',
        marginTop: 2,
    },
    searchContainer: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    searchBar: {
        backgroundColor: hexToRgba(COLORS.white, 0.95),
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
    },
    searchInput: {
        fontSize: FONT_SIZE.base,
    },
    filterScroll: {
        marginTop: SPACING.sm,
    },
    filterContent: {
        gap: SPACING.sm,
    },
    filterChip: {
        backgroundColor: hexToRgba(COLORS.white, 0.9),
    },
    filterChipText: {
        fontSize: FONT_SIZE.sm,
    },
    scrollContainer: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING.md,
        gap: SPACING.md,
    },
    certificateCard: {
        width: cardWidth,
        backgroundColor: hexToRgba(COLORS.white, 0.95),
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0 4px 12px ${hexToRgba(COLORS.black, 0.1)}`,
            },
        }),
    },
    certificateThumbnail: {
        width: '100%',
        height: cardWidth * 0.7,
        backgroundColor: COLORS.gray[200],
        position: 'relative',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: hexToRgba(COLORS.black, 0.3),
        justifyContent: 'center',
        alignItems: 'center',
    },
    certificateInfo: {
        padding: SPACING.sm,
    },
    studentName: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    graduationName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
        color: COLORS.info[700],
        marginBottom: 2,
    },
    modalityName: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray[600],
        marginBottom: 4,
    },
    certificateDate: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray[500],
    },
    certificateActions: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: hexToRgba(COLORS.white, 0.9),
        borderRadius: BORDER_RADIUS.full,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[600],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.gray[700],
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[500],
        textAlign: 'center',
    },
});

export default CertificateGalleryScreen;
