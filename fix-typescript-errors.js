#!/usr/bin/env node
/**
 * Script de Correção Automática de Erros TypeScript
 * Corrige erros sistemáticos em massa com segurança
 */

const fs = require('fs');
const path = require('path');

// Arquivos a processar
const FILES = [
    'src/presentation/screens/examples/LightThemeExampleScreen.tsx',
    'src/presentation/screens/auth/AcademiaSelectionScreen.tsx',
    'src/presentation/screens/student/PaymentManagementScreen.tsx',
    'src/presentation/screens/shared/StudentProfileScreen.tsx',
    'src/presentation/screens/shared/StudentDetailsScreen.tsx',
    'src/presentation/screens/shared/ProfileScreen.tsx',
    'src/presentation/screens/admin/EditStudentScreen.tsx',
    'src/presentation/screens/admin/AddStudentScreen.tsx',
    'src/presentation/screens/student/CheckInScreen.tsx',
    'src/presentation/screens/examples/UIUXExampleScreen.tsx',
    'src/presentation/screens/shared/AddGraduationScreen.tsx',
    'src/presentation/screens/admin/EditClassScreen.tsx',
    'src/presentation/screens/admin/AddClassScreen.tsx',
    'src/presentation/screens/instructor/ScheduleClassesScreen.tsx',
    'src/presentation/screens/admin/ReportsScreen.tsx',
    'src/presentation/screens/shared/GraduationBoardScreen.tsx',
    'src/presentation/screens/shared/ImprovedCalendarScreen.tsx',
    'src/presentation/screens/shared/PhysicalEvaluationHistoryScreen.tsx',
    'src/presentation/screens/shared/PhysicalEvaluationScreen.tsx',
    'src/presentation/screens/shared/InjuryHistoryScreen.tsx',
    'src/presentation/screens/shared/InjuryScreen.tsx',
    'src/presentation/screens/shared/ClassDetailsScreen.tsx',
    'src/presentation/screens/shared/SettingsScreen.tsx',
];

// Padrões de correção
const CORRECTIONS = [
    // 1. FontWeight - FONT_WEIGHT.bold → '700' as const
    {
        name: 'FontWeight.bold',
        pattern: /fontWeight:\s*FONT_WEIGHT\.bold/g,
        replacement: "fontWeight: '700' as const"
    },
    {
        name: 'FontWeight.semibold',
        pattern: /fontWeight:\s*FONT_WEIGHT\.semibold/g,
        replacement: "fontWeight: '600' as const"
    },
    {
        name: 'FontWeight.medium',
        pattern: /fontWeight:\s*FONT_WEIGHT\.medium/g,
        replacement: "fontWeight: '500' as const"
    },
    {
        name: 'FontWeight.regular',
        pattern: /fontWeight:\s*FONT_WEIGHT\.regular/g,
        replacement: "fontWeight: '400' as const"
    },

    // 2. SPACING.xs0 → SPACING.xs
    {
        name: 'SPACING.xs0',
        pattern: /SPACING\.xs0/g,
        replacement: 'SPACING.xs'
    },
    {
        name: 'SPACING.xxs4',
        pattern: /SPACING\.xxs4/g,
        replacement: 'SPACING.xxs'
    },

    // 3. buttoncolor → buttonColor
    {
        name: 'buttoncolor',
        pattern: /buttoncolor=/g,
        replacement: 'buttonColor='
    },

    // 4. Arrays never[] → any[]
    {
        name: 'useState([])',
        pattern: /useState\(\[\]\)/g,
        replacement: 'useState<any[]>([])'
    },

    // 5. Parâmetros sem tipagem (casos comuns)
    {
        name: 'param: message',
        pattern: /\(message\)\s*=>/g,
        replacement: '(message: string) =>'
    },
    {
        name: 'param: status',
        pattern: /\(status\)\s*=>/g,
        replacement: '(status: string) =>'
    },
    {
        name: 'param: date',
        pattern: /\(date\)\s*=>/g,
        replacement: '(date: any) =>'
    },
    {
        name: 'param: value',
        pattern: /\(value\)\s*=>/g,
        replacement: '(value: any) =>'
    },
];

function processFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Pulando ${filePath} (não encontrado)`);
        return { processed: false, changes: 0 };
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let totalChanges = 0;

    // Aplicar todas as correções
    CORRECTIONS.forEach(({ name, pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, replacement);
            const count = matches.length;
            totalChanges += count;
            console.log(`  ✓ ${name}: ${count} correções`);
        }
    });

    // Salvar se houve mudanças
    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        return { processed: true, changes: totalChanges };
    }

    return { processed: false, changes: 0 };
}

// Executar
console.log('🚀 Iniciando correção automática de erros TypeScript...\n');

let totalFiles = 0;
let totalChanges = 0;

FILES.forEach(file => {
    console.log(`📝 Processando: ${file}`);
    const result = processFile(file);

    if (result.processed) {
        totalFiles++;
        totalChanges += result.changes;
        console.log(`  ✅ ${result.changes} correções aplicadas\n`);
    } else {
        console.log(`  ⏭️  Nenhuma correção necessária\n`);
    }
});

console.log('═'.repeat(50));
console.log(`\n✨ Concluído!`);
console.log(`📊 Arquivos processados: ${totalFiles}`);
console.log(`🔧 Total de correções: ${totalChanges}\n`);
