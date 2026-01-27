#!/usr/bin/env node

/**
 * Script de Preparação para Google Play Store
 * 
 * Este script realiza limpeza segura do código:
 * 1. Remove console.logs (exceto console.error e console.warn)
 * 2. Remove comentários desnecessários
 * 3. Remove código comentado
 * 4. Gera relatório de mudanças
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

const stats = {
    filesProcessed: 0,
    consolesRemoved: 0,
    commentsRemoved: 0,
    linesRemoved: 0,
    errors: []
};

const EXCLUDED_DIRS = [
    'node_modules',
    '.git',
    '.expo',
    'dist',
    'build',
    '.agent',
    'tests',
    '__tests__'
];

const EXCLUDED_FILES = [
    'logger.js',
    'logger.ts',
    'debug.js',
    'debug.ts'
];

function shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return false;

    const fileName = path.basename(filePath);
    if (EXCLUDED_FILES.includes(fileName)) return false;

    const parts = filePath.split(path.sep);
    return !EXCLUDED_DIRS.some(dir => parts.includes(dir));
}

function cleanConsoleStatements(content, filePath) {
    let cleaned = content;
    let removed = 0;

    // Padrões de console.log para remover (mas manter console.error e console.warn)
    const patterns = [
        /console\.log\([^)]*\);?\s*/g,
        /console\.debug\([^)]*\);?\s*/g,
        /console\.info\([^)]*\);?\s*/g,
        /console\.table\([^)]*\);?\s*/g,
        /console\.time\([^)]*\);?\s*/g,
        /console\.timeEnd\([^)]*\);?\s*/g,
    ];

    patterns.forEach(pattern => {
        const matches = cleaned.match(pattern);
        if (matches) {
            removed += matches.length;
            cleaned = cleaned.replace(pattern, '');
        }
    });

    // Remover linhas vazias consecutivas (máximo 2)
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    return { content: cleaned, removed };
}

function cleanComments(content) {
    let cleaned = content;
    let removed = 0;

    // Remover comentários de linha única que são apenas separadores ou vazios
    const emptyCommentPattern = /^\s*\/\/\s*[-=*]{3,}\s*$/gm;
    const matches = cleaned.match(emptyCommentPattern);
    if (matches) {
        removed += matches.length;
        cleaned = cleaned.replace(emptyCommentPattern, '');
    }

    // Remover blocos de código comentado (heurística: 3+ linhas consecutivas comentadas)
    const commentedCodePattern = /(^\s*\/\/.*\n){3,}/gm;
    const codeMatches = cleaned.match(commentedCodePattern);
    if (codeMatches) {
        // Verificar se não são comentários de documentação
        codeMatches.forEach(match => {
            if (!match.includes('@') && !match.includes('TODO') && !match.includes('FIXME')) {
                removed++;
                cleaned = cleaned.replace(match, '');
            }
        });
    }

    return { content: cleaned, removed };
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalLines = content.split('\n').length;

        // Limpar console statements
        const { content: afterConsole, removed: consolesRemoved } = cleanConsoleStatements(content, filePath);

        // Limpar comentários
        const { content: afterComments, removed: commentsRemoved } = cleanComments(afterConsole);

        const finalLines = afterComments.split('\n').length;
        const linesRemoved = originalLines - finalLines;

        if (consolesRemoved > 0 || commentsRemoved > 0) {
            if (VERBOSE) {
                console.log(`\n📄 ${filePath}`);
                console.log(`   Console.logs removidos: ${consolesRemoved}`);
                console.log(`   Comentários removidos: ${commentsRemoved}`);
                console.log(`   Linhas removidas: ${linesRemoved}`);
            }

            if (!DRY_RUN) {
                fs.writeFileSync(filePath, afterComments, 'utf8');
            }

            stats.consolesRemoved += consolesRemoved;
            stats.commentsRemoved += commentsRemoved;
            stats.linesRemoved += linesRemoved;
        }

        stats.filesProcessed++;
    } catch (error) {
        stats.errors.push({ file: filePath, error: error.message });
    }
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                walkDirectory(filePath);
            }
        } else if (shouldProcessFile(filePath)) {
            processFile(filePath);
        }
    });
}

// Main execution
console.log('🧹 Iniciando limpeza de código para Google Play Store...\n');
console.log(`Modo: ${DRY_RUN ? 'DRY RUN (sem modificar arquivos)' : 'PRODUÇÃO (modificando arquivos)'}\n`);

const srcDir = path.join(process.cwd(), 'src');
walkDirectory(srcDir);

// Relatório final
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO FINAL');
console.log('='.repeat(60));
console.log(`Arquivos processados: ${stats.filesProcessed}`);
console.log(`Console.logs removidos: ${stats.consolesRemoved}`);
console.log(`Comentários removidos: ${stats.commentsRemoved}`);
console.log(`Total de linhas removidas: ${stats.linesRemoved}`);

if (stats.errors.length > 0) {
    console.log(`\n⚠️  Erros encontrados: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
    });
}

console.log('\n' + '='.repeat(60));

if (DRY_RUN) {
    console.log('\n💡 Execute sem --dry-run para aplicar as mudanças');
} else {
    console.log('\n✅ Limpeza concluída!');
    console.log('\n⚠️  IMPORTANTE: Teste o aplicativo antes de fazer commit!');
}

// Salvar relatório
const report = {
    timestamp: new Date().toISOString(),
    mode: DRY_RUN ? 'dry-run' : 'production',
    stats,
    recommendations: [
        'Executar testes: npm test',
        'Verificar build: npm run build',
        'Testar no emulador Android',
        'Revisar mudanças com git diff'
    ]
};

const reportPath = path.join(process.cwd(), '.agent', 'reports', 'cleanup-report.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Relatório salvo em: ${reportPath}`);
