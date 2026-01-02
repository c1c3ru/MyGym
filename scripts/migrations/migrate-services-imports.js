#!/usr/bin/env node

/**
 * Script para migrar imports de @services/ para @infrastructure/services/
 * Fase 1: Consolidação de Serviços
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para processar um arquivo
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Padrões de import a serem substituídos
        const patterns = [
            // import { x } from '@services/...'
            {
                regex: /from\s+['"]@services\//g,
                replacement: "from '@infrastructure/services/"
            },
            // import x from '@services/...'
            {
                regex: /import\s+.*\s+from\s+['"]@services\//g,
                replacement: (match) => match.replace('@services/', '@infrastructure/services/')
            },
            // require('@services/...')
            {
                regex: /require\(['"]@services\//g,
                replacement: "require('@infrastructure/services/"
            },
            // jest.mock('@services/...')
            {
                regex: /jest\.mock\(['"]@services\//g,
                replacement: "jest.mock('@infrastructure/services/"
            }
        ];

        let newContent = content;
        let hasChanges = false;

        patterns.forEach(({ regex, replacement }) => {
            if (regex.test(newContent)) {
                hasChanges = true;
                newContent = newContent.replace(regex, replacement);
            }
        });

        if (hasChanges) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            return true;
        }

        return false;
    } catch (error) {
        log(`Erro ao processar ${filePath}: ${error.message}`, 'red');
        return false;
    }
}

// Função para percorrer diretórios recursivamente
function walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Ignorar node_modules, .git, etc
            if (!['node_modules', '.git', '.expo', 'dist', 'build'].includes(file)) {
                walkDirectory(filePath, callback);
            }
        } else if (stat.isFile()) {
            // Processar apenas arquivos JS/TS/JSX/TSX
            if (/\.(js|jsx|ts|tsx)$/.test(file)) {
                callback(filePath);
            }
        }
    });
}

// Main
function main() {
    log('\n🔄 Iniciando migração de imports @services/ → @infrastructure/services/\n', 'blue');

    const srcDir = path.join(process.cwd(), 'src');
    let filesProcessed = 0;
    let filesChanged = 0;

    walkDirectory(srcDir, (filePath) => {
        filesProcessed++;
        const changed = processFile(filePath);

        if (changed) {
            filesChanged++;
            const relativePath = path.relative(process.cwd(), filePath);
            log(`✓ ${relativePath}`, 'green');
        }
    });

    log(`\n📊 Resumo:`, 'blue');
    log(`   Arquivos processados: ${filesProcessed}`, 'yellow');
    log(`   Arquivos modificados: ${filesChanged}`, 'green');

    if (filesChanged > 0) {
        log('\n✅ Migração concluída com sucesso!', 'green');
        log('   Próximos passos:', 'blue');
        log('   1. Revisar as mudanças com git diff', 'yellow');
        log('   2. Atualizar tsconfig.json e babel.config.js', 'yellow');
        log('   3. Remover diretório src/services/', 'yellow');
        log('   4. Testar a aplicação\n', 'yellow');
    } else {
        log('\n⚠️  Nenhum arquivo foi modificado', 'yellow');
    }
}

main();
