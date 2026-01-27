#!/usr/bin/env node

/**
 * Script de Auditoria Final - Força Tarefa de Temas
 * Valida se as correções de usabilidade e acessibilidade foram aplicadas corretamente.
 */

const fs = require('fs');
const path = require('path');

// 1. Definição das Cores Esperadas (Pós-Força Tarefa)
const TARGET_COLORS = {
    background: '#0B0B0B',      // Fundo Preto Premium (Material)
    paper: '#1A1A1A',           // Surface
    textPrimary: '#F2F2F2',     // ✅ Off-White (Anti-Halo para OLED) - Antes era #FFFFFF
    textSecondary: '#E0E0E0',   // ✅ Cinza Acessível

    // Cores de Ação (Ajustadas para Dark Mode)
    studentPrimary: '#FF9800',  // Laranja
    instructorPrimary: '#EF5350', // Vermelho Desaturado (Era #D32F2F)
    adminPrimary: '#42A5F5',    // Azul Desaturado (Era #1976D2)
};

// 2. Utils de Contraste
function getLuminance(hex) {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;

    const [lr, lg, lb] = [r, g, b].map(c =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function calculateContrast(hex1, hex2) {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return ratio.toFixed(2);
}

// 3. Execução da Auditoria
console.log('\n🔍 AUDITORIA DE TEMAS & ACESSIBILIDADE (FINAL CHECK)\n');

// A. Validação de Contraste (WCAG 2.1 AA)
const tests = [
    { name: 'Texto Principal (Off-White) vs Fundo', fg: TARGET_COLORS.textPrimary, bg: TARGET_COLORS.background },
    { name: 'Texto Principal (Off-White) vs Card', fg: TARGET_COLORS.textPrimary, bg: TARGET_COLORS.paper },
    { name: 'Texto Secundário vs Card', fg: TARGET_COLORS.textSecondary, bg: TARGET_COLORS.paper },
    { name: 'Botão Student (Laranja) vs Fundo', fg: TARGET_COLORS.studentPrimary, bg: TARGET_COLORS.background },
    // Nota: Botões sólidos usam texto branco/preto sobre a cor do botão. 
    // Aqui validamos legibilidade do botão em si sobre o fundo (interface)
];

console.log('📊 Testes de Contraste (WCAG AA - Min 4.5:1):');
let contrastFailures = 0;

tests.forEach(t => {
    const ratio = calculateContrast(t.fg, t.bg);
    const pass = ratio >= 4.5;
    if (!pass && ratio < 3.0) contrastFailures++; // Falha crítica < 3.0

    console.log(`${pass ? '✅' : (ratio >= 3.0 ? '⚠️' : '❌')} ${t.name}`);
    console.log(`   Cores: ${t.fg} on ${t.bg} | Ratio: ${ratio}:1`);
});

// B. Verificação de Arquivos (Static Analysis)
console.log('\n📂 Verificação Estática de Código:');

const filesToCheck = [
    'src/presentation/theme/profileThemes.ts',
    'src/presentation/components/FormInput.tsx',
    'src/presentation/components/ActionButton.tsx'
];

let codeFailures = 0;

filesToCheck.forEach(file => {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');

    if (file.includes('profileThemes.ts')) {
        if (content.includes("primary: '#F2F2F2'")) {
            console.log(`✅ ${file}: Texto Primary atualizado para Off-White (#F2F2F2).`);
        } else {
            console.log(`❌ ${file}: Texto Primary ainda é Branco Puro ou incorreto!`);
            codeFailures++;
        }
    }

    if (file.includes('FormInput.tsx')) {
        if (content.includes("backgroundColor: currentTheme.background.paper")) {
            console.log(`✅ ${file}: Input usa fundo dinâmico do tema.`);
        } else {
            console.log(`❌ ${file}: Input pode estar usando fundo estático!`);
            codeFailures++;
        }
    }

    if (file.includes('ActionButton.tsx')) {
        if (content.includes("currentTheme.primary[500]")) {
            console.log(`✅ ${file}: Botões usam cor primária do tema ativo.`);
        } else {
            console.log(`❌ ${file}: Botões podem estar hardcoded!`);
            codeFailures++;
        }
    }
});

// C. Relatório Final
console.log('\n' + '='.repeat(40));
if (contrastFailures === 0 && codeFailures === 0) {
    console.log('🏆 STATUS: APROVADO');
    console.log('A aplicação está em conformidade com as diretrizes de Dark Mode.');
} else {
    console.log('⚠️ STATUS: ATENÇÃO NECESSÁRIA');
    console.log(`Falhas de Contraste Críticas: ${contrastFailures}`);
    console.log(`Falhas de Código: ${codeFailures}`);
}
console.log('='.repeat(40) + '\n');
