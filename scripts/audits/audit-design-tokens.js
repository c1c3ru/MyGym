#!/usr/bin/env node

/**
 * Script de Auditoria de Design Tokens
 * Encontra valores hardcoded que devem ser substituídos por tokens
 */

const fs = require('fs');
const path = require('path');

// Padrões para detectar valores hardcoded
const PATTERNS = {
  // Spacing hardcoded (números que deveriam usar SPACING)
  spacing: /(?:margin|padding|gap|top|bottom|left|right|width|height):\s*(\d+)/g,
  
  // Font sizes hardcoded
  fontSize: /fontSize:\s*(\d+)/g,
  
  // Font weights hardcoded
  fontWeight: /fontWeight:\s*['"`](\d+)['"`]/g,
  
  // Border radius hardcoded
  borderRadius: /borderRadius:\s*(\d+)/g,
  
  // Colors hardcoded (hex, rgb, rgba)
  colors: /#[0-9A-Fa-f]{3,6}|rgba?\([^)]+\)/g,
  
  // Elevation/shadow hardcoded
  elevation: /elevation:\s*(\d+)/g,
  shadowRadius: /shadowRadius:\s*(\d+)/g,
};

// Mapeamento de valores para tokens
const TOKEN_MAPPING = {
  spacing: {
    0: 'SPACING.none',
    2: 'SPACING.xxs',
    4: 'SPACING.xs',
    8: 'SPACING.sm',
    12: 'SPACING.md',
    16: 'SPACING.base',
    24: 'SPACING.lg',
    32: 'SPACING.xl',
    40: 'SPACING.xxl',
    48: 'SPACING.xxxl',
    64: 'SPACING.huge',
  },
  fontSize: {
    10: 'FONT_SIZE.xxs',
    12: 'FONT_SIZE.xs',
    14: 'FONT_SIZE.sm',
    16: 'FONT_SIZE.base',
    18: 'FONT_SIZE.md',
    20: 'FONT_SIZE.lg',
    24: 'FONT_SIZE.xl',
    28: 'FONT_SIZE.xxl',
    32: 'FONT_SIZE.xxxl',
    40: 'FONT_SIZE.huge',
    48: 'FONT_SIZE.display',
  },
  fontWeight: {
    '300': 'FONT_WEIGHT.light',
    '400': 'FONT_WEIGHT.regular',
    '500': 'FONT_WEIGHT.medium',
    '600': 'FONT_WEIGHT.semibold',
    '700': 'FONT_WEIGHT.bold',
    '800': 'FONT_WEIGHT.extrabold',
  },
  borderRadius: {
    0: 'BORDER_RADIUS.none',
    2: 'BORDER_RADIUS.xs',
    4: 'BORDER_RADIUS.sm',
    8: 'BORDER_RADIUS.base',
    12: 'BORDER_RADIUS.md',
    16: 'BORDER_RADIUS.lg',
    20: 'BORDER_RADIUS.xl',
    24: 'BORDER_RADIUS.xxl',
    9999: 'BORDER_RADIUS.full',
  }
};

class DesignTokenAuditor {
  constructor() {
    this.issues = [];
    this.fileCount = 0;
    this.issueCount = 0;
  }

  scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Pular node_modules e outras pastas irrelevantes
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          this.scanDirectory(filePath);
        }
      } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
        this.scanFile(filePath);
      }
    }
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.fileCount++;
      
      // Verificar se já importa design tokens
      const hasTokenImport = content.includes('designTokens') || 
                           content.includes('SPACING') || 
                           content.includes('FONT_SIZE');
      
      const fileIssues = [];
      
      // Verificar cada padrão
      Object.entries(PATTERNS).forEach(([type, pattern]) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const value = match[1] || match[0];
          const line = content.substring(0, match.index).split('\n').length;
          
          let suggestion = '';
          if (TOKEN_MAPPING[type] && TOKEN_MAPPING[type][value]) {
            suggestion = TOKEN_MAPPING[type][value];
          }
          
          fileIssues.push({
            type,
            value,
            line,
            match: match[0],
            suggestion
          });
          
          this.issueCount++;
        }
      });
      
      if (fileIssues.length > 0) {
        this.issues.push({
          file: filePath,
          hasTokenImport,
          issues: fileIssues
        });
      }
      
    } catch (error) {
      console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
    }
  }

  generateReport() {
    console.log('\n🎨 RELATÓRIO DE AUDITORIA - DESIGN TOKENS\n');
    console.log('='.repeat(60));
    
    console.log(`📊 Estatísticas:`);
    console.log(`   • Arquivos escaneados: ${this.fileCount}`);
    console.log(`   • Arquivos com problemas: ${this.issues.length}`);
    console.log(`   • Total de problemas: ${this.issueCount}`);
    
    const coverage = Math.max(0, 100 - (this.issueCount / this.fileCount * 10));
    console.log(`   • Cobertura estimada: ${coverage.toFixed(1)}%`);
    
    console.log('\n🔍 Arquivos Prioritários para Migração:\n');
    
    // Ordenar por número de problemas
    const sortedIssues = this.issues
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 10);
    
    sortedIssues.forEach((fileData, index) => {
      const relativePath = fileData.file.replace(process.cwd(), '');
      console.log(`${index + 1}. ${relativePath}`);
      console.log(`   • ${fileData.issues.length} problemas encontrados`);
      console.log(`   • Importa tokens: ${fileData.hasTokenImport ? '✅' : '❌'}`);
      
      // Mostrar alguns exemplos
      const examples = fileData.issues.slice(0, 3);
      examples.forEach(issue => {
        console.log(`   • Linha ${issue.line}: ${issue.match}${issue.suggestion ? ` → ${issue.suggestion}` : ''}`);
      });
      
      if (fileData.issues.length > 3) {
        console.log(`   • ... e mais ${fileData.issues.length - 3} problemas`);
      }
      console.log('');
    });
    
    console.log('\n📋 Tipos de Problemas Encontrados:\n');
    
    const problemTypes = {};
    this.issues.forEach(fileData => {
      fileData.issues.forEach(issue => {
        problemTypes[issue.type] = (problemTypes[issue.type] || 0) + 1;
      });
    });
    
    Object.entries(problemTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   • ${type}: ${count} ocorrências`);
      });
    
    console.log('\n🎯 Próximos Passos:\n');
    console.log('1. Execute: npm run migrate-tokens para migração automática');
    console.log('2. Configure ESLint rules para prevenir novos problemas');
    console.log('3. Revise manualmente os arquivos prioritários');
    console.log('4. Execute testes após cada migração');
    
    return {
      fileCount: this.fileCount,
      issueCount: this.issueCount,
      coverage: coverage,
      priorityFiles: sortedIssues.map(f => f.file)
    };
  }

  generateFixScript() {
    const scriptPath = path.join(process.cwd(), 'scripts', 'auto-fix-tokens.js');
    
    let script = `#!/usr/bin/env node
/**
 * Script de Correção Automática de Design Tokens
 * Gerado automaticamente pelo audit-design-tokens.js
 */

const fs = require('fs');

const fixes = [
`;

    this.issues.forEach(fileData => {
      fileData.issues.forEach(issue => {
        if (issue.suggestion) {
          script += `  {
    file: '${fileData.file}',
    find: /${issue.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/g,
    replace: '${issue.match.replace(issue.value, issue.suggestion)}',
    type: '${issue.type}'
  },
`;
        }
      });
    });

    script += `];

console.log('🔧 Aplicando correções automáticas...');

fixes.forEach(fix => {
  try {
    const content = fs.readFileSync(fix.file, 'utf8');
    const newContent = content.replace(fix.find, fix.replace);
    
    if (content !== newContent) {
      fs.writeFileSync(fix.file, newContent);
      console.log(\`✅ \${fix.file} - \${fix.type} corrigido\`);
    }
  } catch (error) {
    console.error(\`❌ Erro em \${fix.file}:\`, error.message);
  }
});

console.log('🎉 Correções aplicadas! Execute os testes para verificar.');
`;

    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');
    
    console.log(`\n🔧 Script de correção gerado: ${scriptPath}`);
  }
}

// Executar auditoria
if (require.main === module) {
  const auditor = new DesignTokenAuditor();
  const srcPath = path.join(process.cwd(), 'src');
  
  console.log('🔍 Iniciando auditoria de Design Tokens...');
  console.log(`📁 Escaneando: ${srcPath}`);
  
  auditor.scanDirectory(srcPath);
  const report = auditor.generateReport();
  auditor.generateFixScript();
  
  // Salvar relatório em JSON para outras ferramentas
  const reportPath = path.join(process.cwd(), 'design-tokens-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  
  // Exit code baseado na cobertura
  process.exit(report.coverage < 90 ? 1 : 0);
}

module.exports = DesignTokenAuditor;
