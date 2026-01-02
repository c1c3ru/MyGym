#!/usr/bin/env node
/**
 * Script de Correção Complementar - Erros Restantes
 * Foca em erros mais complexos que o primeiro script não pegou
 */

const fs = require('fs');
const path = require('path');

// Arquivos específicos com erros críticos
const CRITICAL_FILES = {
    'src/presentation/screens/shared/ProfileScreen.tsx': [
        // Adicionar academia do useAuth
        {
            pattern: /const { user, userProfile, signOut, updateProfile } = useAuth\(\);/,
            replacement: 'const { user, userProfile, signOut, updateProfile, academia } = useAuth();'
        },
        // Adicionar setLoading
        {
            pattern: /const \[showPaymentEditor, setShowPaymentEditor\] = useState\(false\);/,
            replacement: 'const [showPaymentEditor, setShowPaymentEditor] = useState(false);\n  const [loading, setLoading] = useState(false);'
        },
        // Tipar parâmetros
        {
            pattern: /\(trainingHistory\) =>/g,
            replacement: '(trainingHistory: any) =>'
        },
        {
            pattern: /\(training\) =>/g,
            replacement: '(training: any) =>'
        },
        {
            pattern: /\(monthIndex, monthData\) =>/g,
            replacement: '(monthIndex: number, monthData: any) =>'
        },
        {
            pattern: /\(userType\) =>/g,
            replacement: '(userType: string) =>'
        },
        // Adicionar logout
        {
            pattern: /const handleLogout = async \(\) => {/,
            replacement: 'const logout = async () => {\n    await signOut();\n    navigation.navigate(\'Login\' as never);\n  };\n\n  const handleLogout = async () => {'
        },
    ],

    'src/presentation/screens/admin/EditStudentScreen.tsx': [
        // Adicionar studentId de route.params
        {
            pattern: /const { user, userProfile, academia } = useAuth\(\);/,
            replacement: 'const { user, userProfile, academia } = useAuth();\n  const { studentId } = route.params as any;'
        },
    ],
};

// Correções globais para todos os arquivos
const GLOBAL_CORRECTIONS = [
    // Propriedades inexistentes - usar type assertion
    {
        pattern: /\.classIds/g,
        replacement: '?.classIds'
    },
    {
        pattern: /\.userId/g,
        replacement: '?.userId'
    },
    {
        pattern: /\.studentId/g,
        replacement: '?.studentId'
    },
];

function applyCorrections(filePath, corrections) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Pulando ${filePath} (não encontrado)`);
        return 0;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let changes = 0;

    corrections.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, replacement);
            changes += matches.length;
        }
    });

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
    }

    return changes;
}

console.log('🔧 Aplicando correções complementares...\n');

let totalChanges = 0;

// Processar arquivos críticos
Object.entries(CRITICAL_FILES).forEach(([file, corrections]) => {
    console.log(`📝 ${file}`);
    const changes = applyCorrections(file, corrections);
    if (changes > 0) {
        console.log(`  ✅ ${changes} correções aplicadas\n`);
        totalChanges += changes;
    } else {
        console.log(`  ⏭️  Nenhuma correção necessária\n`);
    }
});

console.log('═'.repeat(50));
console.log(`\n✨ Total de correções complementares: ${totalChanges}\n`);
