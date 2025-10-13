#!/usr/bin/env node

/**
 * Script de Auditoria de Internacionalização (i18n)
 * Encontra strings hardcoded que devem ser internacionalizadas
 */

const fs = require('fs');
const path = require('path');

// Padrões para detectar strings hardcoded
const PATTERNS = {
  // Strings em JSX (entre aspas dentro de tags)
  jsxStrings: />([^<>{}\s][^<>{}]*[a-zA-ZÀ-ÿ][^<>{}]*)</g,
  
  // Strings em propriedades (title, placeholder, etc.)
  propStrings: /(?:title|placeholder|label|text|message|description|hint|error)=['"`]([^'"`]*[a-zA-ZÀ-ÿ][^'"`]*)['"`]/g,
  
  // Strings em Alert.alert
  alertStrings: /Alert\.alert\s*\(\s*['"`]([^'"`]*[a-zA-ZÀ-ÿ][^'"`]*)['"`]/g,
  
  // Strings em console.log/error (para debug)
  consoleStrings: /console\.(log|error|warn)\s*\(\s*['"`]([^'"`]*[a-zA-ZÀ-ÿ][^'"`]*)['"`]/g,
  
  // Strings em objetos de configuração
  configStrings: /(?:name|label|title|description):\s*['"`]([^'"`]*[a-zA-ZÀ-ÿ][^'"`]*)['"`]/g,
};

// Strings que devem ser ignoradas (técnicas, não visíveis ao usuário)
const IGNORE_PATTERNS = [
  /^[A-Z_]+$/, // Constantes (ex: USER_TYPE)
  /^[a-z]+[A-Z]/, // camelCase técnico (ex: firstName)
  /^\d+$/, // Apenas números
  /^[a-z-]+$/, // IDs técnicos (ex: user-id)
  /^https?:\/\//, // URLs
  /^\/[a-zA-Z]/, // Paths
  /^[A-Za-z0-9+/=]+$/, // Base64
  /^#[0-9A-Fa-f]{3,6}$/, // Cores hex
  /^rgba?\(/, // Cores RGB
  /^[0-9.]+px$/, // Valores CSS
  /^[0-9.]+%$/, // Percentuais
  /^(true|false|null|undefined)$/, // Valores booleanos/null
];

// Strings em português que claramente precisam de tradução
const PORTUGUESE_INDICATORS = [
  /\b(o|a|os|as|um|uma|de|da|do|das|dos|em|na|no|nas|nos|para|por|com|sem|sobre|entre)\b/i,
  /\b(é|são|foi|foram|será|serão|tem|têm|está|estão|pode|podem)\b/i,
  /\b(não|sim|muito|mais|menos|bem|mal|grande|pequeno|novo|velho)\b/i,
  /[àáâãäèéêëìíîïòóôõöùúûüç]/i,
];

class I18nAuditor {
  constructor() {
    this.issues = [];
    this.fileCount = 0;
    this.stringCount = 0;
    this.translationKeys = new Set();
    
    // Carregar chaves existentes
    this.loadExistingKeys();
  }

  loadExistingKeys() {
    try {
      const themePath = path.join(process.cwd(), 'src', 'shared', 'utils', 'theme.js');
      if (fs.existsSync(themePath)) {
        const content = fs.readFileSync(themePath, 'utf8');
        
        // Extrair chaves das traduções
        const keyMatches = content.match(/(\w+):\s*['"`][^'"`]*['"`]/g);
        if (keyMatches) {
          keyMatches.forEach(match => {
            const key = match.split(':')[0].trim();
            this.translationKeys.add(key);
          });
        }
      }
    } catch (error) {
      console.warn('Aviso: Não foi possível carregar chaves existentes:', error.message);
    }
  }

  scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
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
      
      // Verificar se já usa i18n
      const hasI18nImport = content.includes('getString') || 
                          content.includes('useTheme') ||
                          content.includes('i18n');
      
      const fileIssues = [];
      
      // Verificar cada padrão
      Object.entries(PATTERNS).forEach(([type, pattern]) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const text = match[1] || match[2]; // Dependendo do grupo de captura
          
          if (this.shouldTranslate(text)) {
            const line = content.substring(0, match.index).split('\n').length;
            const suggestedKey = this.generateKey(text);
            
            fileIssues.push({
              type,
              text,
              line,
              match: match[0],
              suggestedKey,
              isPortuguese: this.isPortuguese(text)
            });
            
            this.stringCount++;
          }
        }
      });
      
      if (fileIssues.length > 0) {
        this.issues.push({
          file: filePath,
          hasI18nImport,
          issues: fileIssues
        });
      }
      
    } catch (error) {
      console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
    }
  }

  shouldTranslate(text) {
    if (!text || text.length < 2) return false;
    
    // Verificar padrões de ignore
    for (const pattern of IGNORE_PATTERNS) {
      if (pattern.test(text)) return false;
    }
    
    // Verificar se contém letras (não apenas números/símbolos)
    if (!/[a-zA-ZÀ-ÿ]/.test(text)) return false;
    
    // Verificar se já é uma chave de tradução
    if (this.translationKeys.has(text)) return false;
    
    return true;
  }

  isPortuguese(text) {
    return PORTUGUESE_INDICATORS.some(pattern => pattern.test(text));
  }

  generateKey(text) {
    // Converter texto para chave camelCase
    return text
      .toLowerCase()
      .replace(/[àáâãä]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
      .substring(0, 30); // Limitar tamanho
  }

  generateReport() {
    console.log('\n🌍 RELATÓRIO DE AUDITORIA - INTERNACIONALIZAÇÃO\n');
    console.log('='.repeat(60));
    
    console.log(`📊 Estatísticas:`);
    console.log(`   • Arquivos escaneados: ${this.fileCount}`);
    console.log(`   • Arquivos com problemas: ${this.issues.length}`);
    console.log(`   • Strings não traduzidas: ${this.stringCount}`);
    console.log(`   • Chaves existentes: ${this.translationKeys.size}`);
    
    const coverage = Math.max(0, 100 - (this.stringCount / this.fileCount * 5));
    console.log(`   • Cobertura estimada: ${coverage.toFixed(1)}%`);
    
    console.log('\n🔍 Arquivos Prioritários para Tradução:\n');
    
    // Ordenar por número de strings não traduzidas
    const sortedIssues = this.issues
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 10);
    
    sortedIssues.forEach((fileData, index) => {
      const relativePath = fileData.file.replace(process.cwd(), '');
      const portugueseCount = fileData.issues.filter(i => i.isPortuguese).length;
      
      console.log(`${index + 1}. ${relativePath}`);
      console.log(`   • ${fileData.issues.length} strings não traduzidas`);
      console.log(`   • ${portugueseCount} claramente em português`);
      console.log(`   • Usa i18n: ${fileData.hasI18nImport ? '✅' : '❌'}`);
      
      // Mostrar alguns exemplos
      const examples = fileData.issues.slice(0, 3);
      examples.forEach(issue => {
        const indicator = issue.isPortuguese ? '🇧🇷' : '❓';
        console.log(`   ${indicator} Linha ${issue.line}: "${issue.text}" → ${issue.suggestedKey}`);
      });
      
      if (fileData.issues.length > 3) {
        console.log(`   • ... e mais ${fileData.issues.length - 3} strings`);
      }
      console.log('');
    });
    
    console.log('\n📝 Novas Chaves Sugeridas:\n');
    
    // Coletar todas as chaves sugeridas
    const suggestedKeys = new Map();
    this.issues.forEach(fileData => {
      fileData.issues.forEach(issue => {
        if (!suggestedKeys.has(issue.suggestedKey)) {
          suggestedKeys.set(issue.suggestedKey, issue.text);
        }
      });
    });
    
    // Mostrar as 20 mais comuns
    Array.from(suggestedKeys.entries())
      .slice(0, 20)
      .forEach(([key, text]) => {
        console.log(`   ${key}: '${text}',`);
      });
    
    if (suggestedKeys.size > 20) {
      console.log(`   ... e mais ${suggestedKeys.size - 20} chaves`);
    }
    
    console.log('\n🎯 Próximos Passos:\n');
    console.log('1. Adicione as chaves sugeridas ao arquivo theme.js');
    console.log('2. Execute: npm run migrate-i18n para migração automática');
    console.log('3. Configure ESLint rules para prevenir strings hardcoded');
    console.log('4. Teste cada idioma (pt, en, es)');
    
    return {
      fileCount: this.fileCount,
      stringCount: this.stringCount,
      coverage: coverage,
      priorityFiles: sortedIssues.map(f => f.file),
      suggestedKeys: Object.fromEntries(suggestedKeys)
    };
  }

  generateTranslationFile() {
    // Gerar arquivo com novas traduções
    const translationsPath = path.join(process.cwd(), 'new-translations.js');
    
    const suggestedKeys = new Map();
    this.issues.forEach(fileData => {
      fileData.issues.forEach(issue => {
        if (!suggestedKeys.has(issue.suggestedKey)) {
          suggestedKeys.set(issue.suggestedKey, issue.text);
        }
      });
    });
    
    let content = `// Novas traduções sugeridas
// Adicione estas chaves ao arquivo src/shared/utils/theme.js

const newTranslations = {
  pt: {
`;

    suggestedKeys.forEach((text, key) => {
      content += `    ${key}: '${text.replace(/'/g, "\\'")}',\n`;
    });

    content += `  },
  en: {
    // TODO: Traduzir para inglês
`;

    suggestedKeys.forEach((text, key) => {
      content += `    ${key}: '${text.replace(/'/g, "\\'")}', // TODO: Translate\n`;
    });

    content += `  },
  es: {
    // TODO: Traduzir para espanhol
`;

    suggestedKeys.forEach((text, key) => {
      content += `    ${key}: '${text.replace(/'/g, "\\'")}', // TODO: Traducir\n`;
    });

    content += `  }
};

module.exports = newTranslations;`;

    fs.writeFileSync(translationsPath, content);
    console.log(`\n📝 Arquivo de traduções gerado: ${translationsPath}`);
  }
}

// Executar auditoria
if (require.main === module) {
  const auditor = new I18nAuditor();
  const srcPath = path.join(process.cwd(), 'src');
  
  console.log('🔍 Iniciando auditoria de Internacionalização...');
  console.log(`📁 Escaneando: ${srcPath}`);
  
  auditor.scanDirectory(srcPath);
  const report = auditor.generateReport();
  auditor.generateTranslationFile();
  
  // Salvar relatório em JSON
  const reportPath = path.join(process.cwd(), 'i18n-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  
  // Exit code baseado na cobertura
  process.exit(report.coverage < 80 ? 1 : 0);
}

module.exports = I18nAuditor;
