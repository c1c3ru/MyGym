/**
 * 🎨 PALETAS DE CORES PROFISSIONAIS POR PERFIL - MyGym
 * 
 * Paletas modernas e comerciais baseadas em:
 * - Psicologia das cores para fitness/academia
 * - Tendências de design 2024-2026
 * - WCAG AA compliance para acessibilidade
 * - Diferenciação clara entre perfis
 */

// ============================================
// 🏃 PERFIL ALUNO - Energia & Motivação
// Paleta: Laranja Vibrante + Azul Confiança
// ============================================
export const STUDENT_THEME = {
    name: 'Student - Energia & Motivação',

    primary: {
        50: '#FFF3E0',   // Laranja muito claro
        100: '#FFE0B2',  // Laranja claro
        200: '#FFCC80',  // Laranja suave
        300: '#FFB74D',  // Laranja médio
        400: '#FFA726',  // Laranja vibrante
        500: '#FF9800',  // 🎯 PRINCIPAL - Laranja energia
        600: '#FB8C00',  // Laranja escuro
        700: '#F57C00',  // Laranja intenso
        800: '#EF6C00',  // Laranja profundo
        900: '#E65100',  // Laranja muito escuro
    },

    secondary: {
        50: '#E3F2FD',   // Azul muito claro
        100: '#BBDEFB',  // Azul claro
        200: '#90CAF9',  // Azul suave
        300: '#64B5F6',  // Azul médio
        400: '#42A5F5',  // Azul vibrante
        500: '#2196F3',  // 🎯 SECUNDÁRIA - Azul confiança
        600: '#1E88E5',  // Azul escuro
        700: '#1976D2',  // Azul intenso
        800: '#1565C0',  // Azul profundo
        900: '#0D47A1',  // Azul muito escuro
    },

    accent: '#FF6F00',      // Laranja intenso para CTAs
    success: '#66BB6A',     // Verde fresco
    warning: '#FFA726',     // Laranja aviso
    error: '#EF5350',       // Vermelho suave
    info: '#42A5F5',        // Azul informação

    background: {
        default: '#FAFAFA',     // Branco quente
        paper: '#FFFFFF',       // Branco puro
        elevated: '#F5F5F5',    // Cinza muito claro
    },

    text: {
        primary: '#111827',     // Preto profundo
        secondary: '#374151',   // Cinza escuro
        disabled: '#9CA3AF',    // Cinza visível
        hint: '#6B7280',        // Cinza hint
    },

    gradients: {
        primary: ['#FF9800', '#FF6F00'],           // Laranja energia
        secondary: ['#2196F3', '#1565C0'],         // Azul confiança
        hero: ['#FF9800', '#FF6F00', '#E65100'],   // Gradiente hero
        card: ['#FFF3E0', '#FFFFFF'],              // Card suave
    },

    description: 'Paleta energética e motivadora. Laranja transmite energia, entusiasmo e ação. Azul traz confiança e estabilidade.',
};

// ============================================
// 🥋 PERFIL INSTRUTOR - Autoridade & Expertise
// Paleta: Roxo Profissional + Verde Crescimento
// ============================================
export const INSTRUCTOR_THEME = {
    name: 'Instructor - Autoridade & Expertise',

    primary: {
        50: '#F3E5F5',   // Roxo muito claro
        100: '#E1BEE7',  // Roxo claro
        200: '#CE93D8',  // Roxo suave
        300: '#BA68C8',  // Roxo médio
        400: '#AB47BC',  // Roxo vibrante
        500: '#9C27B0',  // 🎯 PRINCIPAL - Roxo autoridade
        600: '#8E24AA',  // Roxo escuro
        700: '#7B1FA2',  // Roxo intenso
        800: '#6A1B9A',  // Roxo profundo
        900: '#4A148C',  // Roxo muito escuro
    },

    secondary: {
        50: '#E8F5E9',   // Verde muito claro
        100: '#C8E6C9',  // Verde claro
        200: '#A5D6A7',  // Verde suave
        300: '#81C784',  // Verde médio
        400: '#66BB6A',  // Verde vibrante
        500: '#4CAF50',  // 🎯 SECUNDÁRIA - Verde crescimento
        600: '#43A047',  // Verde escuro
        700: '#388E3C',  // Verde intenso
        800: '#2E7D32',  // Verde profundo
        900: '#1B5E20',  // Verde muito escuro
    },

    accent: '#7B1FA2',      // Roxo intenso para CTAs
    success: '#66BB6A',     // Verde crescimento
    warning: '#FFA726',     // Laranja aviso
    error: '#EF5350',       // Vermelho suave
    info: '#42A5F5',        // Azul informação

    background: {
        default: '#FAFAFA',     // Branco neutro
        paper: '#FFFFFF',       // Branco puro
        elevated: '#F5F5F5',    // Cinza muito claro
    },

    text: {
        primary: '#212121',     // Preto suave
        secondary: '#757575',   // Cinza médio
        disabled: '#BDBDBD',    // Cinza claro
        hint: '#9E9E9E',        // Cinza hint
    },

    gradients: {
        primary: ['#9C27B0', '#7B1FA2'],           // Roxo autoridade
        secondary: ['#4CAF50', '#2E7D32'],         // Verde crescimento
        hero: ['#9C27B0', '#7B1FA2', '#4A148C'],   // Gradiente hero
        card: ['#F3E5F5', '#FFFFFF'],              // Card suave
    },

    description: 'Paleta profissional e confiável. Roxo transmite sabedoria, autoridade e expertise. Verde representa crescimento e desenvolvimento.',
};

// ============================================
// 👔 PERFIL ADMIN - Poder & Controle
// Paleta: Azul Escuro Corporativo + Vermelho Ação
// ============================================
export const ADMIN_THEME = {
    name: 'Admin - Poder & Controle',

    primary: {
        50: '#E3F2FD',   // Azul muito claro
        100: '#BBDEFB',  // Azul claro
        200: '#90CAF9',  // Azul suave
        300: '#64B5F6',  // Azul médio
        400: '#42A5F5',  // Azul vibrante
        500: '#1976D2',  // 🎯 PRINCIPAL - Azul corporativo
        600: '#1565C0',  // Azul escuro
        700: '#0D47A1',  // Azul intenso
        800: '#0A3D91',  // Azul profundo
        900: '#063381',  // Azul muito escuro
    },

    secondary: {
        50: '#FFEBEE',   // Vermelho muito claro
        100: '#FFCDD2',  // Vermelho claro
        200: '#EF9A9A',  // Vermelho suave
        300: '#E57373',  // Vermelho médio
        400: '#EF5350',  // Vermelho vibrante
        500: '#F44336',  // 🎯 SECUNDÁRIA - Vermelho ação
        600: '#E53935',  // Vermelho escuro
        700: '#D32F2F',  // Vermelho intenso
        800: '#C62828',  // Vermelho profundo
        900: '#B71C1C',  // Vermelho muito escuro
    },

    accent: '#0D47A1',      // Azul intenso para CTAs
    success: '#66BB6A',     // Verde sucesso
    warning: '#FFA726',     // Laranja aviso
    error: '#F44336',       // Vermelho erro
    info: '#42A5F5',        // Azul informação

    background: {
        default: '#FAFAFA',     // Branco corporativo
        paper: '#FFFFFF',       // Branco puro
        elevated: '#F5F5F5',    // Cinza muito claro
    },

    text: {
        primary: '#212121',     // Preto corporativo
        secondary: '#757575',   // Cinza médio
        disabled: '#BDBDBD',    // Cinza claro
        hint: '#9E9E9E',        // Cinza hint
    },

    gradients: {
        primary: ['#1976D2', '#0D47A1'],           // Azul corporativo
        secondary: ['#F44336', '#D32F2F'],         // Vermelho ação
        hero: ['#1976D2', '#0D47A1', '#063381'],   // Gradiente hero
        card: ['#E3F2FD', '#FFFFFF'],              // Card suave
    },

    description: 'Paleta corporativa e poderosa. Azul escuro transmite confiança, profissionalismo e controle. Vermelho traz urgência e ação.',
};

// ============================================
// 🌓 DARK MODE - Versões Escuras Premium
// ============================================

export const STUDENT_THEME_DARK = {
    ...STUDENT_THEME,
    name: 'Student Dark - Energia Noturna',

    background: {
        default: '#121212',     // Preto premium
        paper: '#1E1E1E',       // Cinza escuro
        elevated: '#2A2A2A',    // Cinza elevado
    },

    text: {
        primary: '#FFFFFF',     // Branco puro
        secondary: '#F5F5F5',   // Branco suave
        disabled: '#9E9E9E',    // Cinza claro
        hint: '#BDBDBD',        // Cinza hint
    },

    gradients: {
        primary: ['#FF9800', '#E65100'],           // Laranja escuro
        secondary: ['#1976D2', '#0D47A1'],         // Azul escuro
        hero: ['#121212', '#FF9800', '#E65100'],   // Hero dark
        card: ['#1E1E1E', '#2A2A2A'],              // Card dark
    },
};

export const INSTRUCTOR_THEME_DARK = {
    ...INSTRUCTOR_THEME,
    name: 'Instructor Dark - Autoridade Noturna',

    background: {
        default: '#121212',     // Preto premium
        paper: '#1E1E1E',       // Cinza escuro
        elevated: '#2A2A2A',    // Cinza elevado
    },

    text: {
        primary: '#FFFFFF',     // Branco puro
        secondary: '#B0B0B0',   // Cinza claro
        disabled: '#6B6B6B',    // Cinza escuro
        hint: '#8B8B8B',        // Cinza hint
    },

    gradients: {
        primary: ['#9C27B0', '#4A148C'],           // Roxo escuro
        secondary: ['#388E3C', '#1B5E20'],         // Verde escuro
        hero: ['#121212', '#9C27B0', '#4A148C'],   // Hero dark
        card: ['#1E1E1E', '#2A2A2A'],              // Card dark
    },
};

export const ADMIN_THEME_DARK = {
    ...ADMIN_THEME,
    name: 'Admin Dark - Poder Noturno',

    background: {
        default: '#121212',     // Preto premium
        paper: '#1E1E1E',       // Cinza escuro
        elevated: '#2A2A2A',    // Cinza elevado
    },

    text: {
        primary: '#FFFFFF',     // Branco puro
        secondary: '#B0B0B0',   // Cinza claro
        disabled: '#6B6B6B',    // Cinza escuro
        hint: '#8B8B8B',        // Cinza hint
    },

    gradients: {
        primary: ['#1976D2', '#063381'],           // Azul muito escuro
        secondary: ['#D32F2F', '#B71C1C'],         // Vermelho escuro
        hero: ['#121212', '#1976D2', '#063381'],   // Hero dark
        card: ['#1E1E1E', '#2A2A2A'],              // Card dark
    },
};

// ============================================
// 🎯 FUNÇÃO HELPER - Obter tema por perfil
// ============================================
export const getThemeByUserType = (userType: 'student' | 'instructor' | 'admin', isDark = false) => {
    const themes = {
        student: isDark ? STUDENT_THEME_DARK : STUDENT_THEME,
        instructor: isDark ? INSTRUCTOR_THEME_DARK : INSTRUCTOR_THEME,
        admin: isDark ? ADMIN_THEME_DARK : ADMIN_THEME,
    };

    return themes[userType] || themes.student;
};

// ============================================
// 📊 COMPARAÇÃO DE PALETAS
// ============================================
export const THEME_COMPARISON = {
    student: {
        emotion: 'Energia, Motivação, Ação',
        colors: 'Laranja + Azul',
        personality: 'Jovem, Dinâmico, Entusiasmado',
        use_case: 'Alunos que buscam motivação e energia para treinar',
    },
    instructor: {
        emotion: 'Autoridade, Expertise, Crescimento',
        colors: 'Roxo + Verde',
        personality: 'Profissional, Confiável, Mentor',
        use_case: 'Instrutores que precisam transmitir conhecimento e autoridade',
    },
    admin: {
        emotion: 'Poder, Controle, Eficiência',
        colors: 'Azul Escuro + Vermelho',
        personality: 'Corporativo, Sério, Decisivo',
        use_case: 'Administradores que gerenciam e tomam decisões críticas',
    },
};

export default {
    STUDENT_THEME,
    INSTRUCTOR_THEME,
    ADMIN_THEME,
    STUDENT_THEME_DARK,
    INSTRUCTOR_THEME_DARK,
    ADMIN_THEME_DARK,
    getThemeByUserType,
    THEME_COMPARISON,
};
