#!/usr/bin/env node

/**
 * Script de Migração Automática de Design Tokens
 * Aplica correções automáticas baseadas no audit
 */

const fs = require('fs');
const path = require('path');

// Mapeamentos para migração automática
const TOKEN_REPLACEMENTS = {
  // Spacing
  'margin: 0': 'margin: SPACING.none',
  'padding: 0': 'padding: SPACING.none',
  'gap: 2': 'gap: SPACING.xxs',
  'gap: 4': 'gap: SPACING.xs',
  'gap: 8': 'gap: SPACING.sm',
  'gap: 12': 'gap: SPACING.md',
  'gap: 16': 'gap: SPACING.base',
  'gap: 24': 'gap: SPACING.lg',
  'gap: 32': 'gap: SPACING.xl',
  
  'marginTop: 4': 'marginTop: SPACING.xs',
  'marginTop: 8': 'marginTop: SPACING.sm',
  'marginTop: 12': 'marginTop: SPACING.md',
  'marginTop: 16': 'marginTop: SPACING.base',
  'marginTop: 24': 'marginTop: SPACING.lg',
  'marginTop: 32': 'marginTop: SPACING.xl',
  
  'marginBottom: 4': 'marginBottom: SPACING.xs',
  'marginBottom: 8': 'marginBottom: SPACING.sm',
  'marginBottom: 12': 'marginBottom: SPACING.md',
  'marginBottom: 16': 'marginBottom: SPACING.base',
  'marginBottom: 24': 'marginBottom: SPACING.lg',
  'marginBottom: 32': 'marginBottom: SPACING.xl',
  
  'marginLeft: 4': 'marginLeft: SPACING.xs',
  'marginLeft: 8': 'marginLeft: SPACING.sm',
  'marginLeft: 12': 'marginLeft: SPACING.md',
  'marginLeft: 16': 'marginLeft: SPACING.base',
  'marginLeft: 24': 'marginLeft: SPACING.lg',
  
  'marginRight: 4': 'marginRight: SPACING.xs',
  'marginRight: 8': 'marginRight: SPACING.sm',
  'marginRight: 12': 'marginRight: SPACING.md',
  'marginRight: 16': 'marginRight: SPACING.base',
  'marginRight: 24': 'marginRight: SPACING.lg',
  
  'paddingTop: 4': 'paddingTop: SPACING.xs',
  'paddingTop: 8': 'paddingTop: SPACING.sm',
  'paddingTop: 12': 'paddingTop: SPACING.md',
  'paddingTop: 16': 'paddingTop: SPACING.base',
  'paddingTop: 24': 'paddingTop: SPACING.lg',
  'paddingTop: 32': 'paddingTop: SPACING.xl',
  
  'paddingBottom: 4': 'paddingBottom: SPACING.xs',
  'paddingBottom: 8': 'paddingBottom: SPACING.sm',
  'paddingBottom: 12': 'paddingBottom: SPACING.md',
  'paddingBottom: 16': 'paddingBottom: SPACING.base',
  'paddingBottom: 24': 'paddingBottom: SPACING.lg',
  'paddingBottom: 32': 'paddingBottom: SPACING.xl',
  
  'paddingLeft: 4': 'paddingLeft: SPACING.xs',
  'paddingLeft: 8': 'paddingLeft: SPACING.sm',
  'paddingLeft: 12': 'paddingLeft: SPACING.md',
  'paddingLeft: 16': 'paddingLeft: SPACING.base',
  'paddingLeft: 24': 'paddingLeft: SPACING.lg',
  
  'paddingRight: 4': 'paddingRight: SPACING.xs',
  'paddingRight: 8': 'paddingRight: SPACING.sm',
  'paddingRight: 12': 'paddingRight: SPACING.md',
  'paddingRight: 16': 'paddingRight: SPACING.base',
  'paddingRight: 24': 'paddingRight: SPACING.lg',
  
  'paddingHorizontal: 4': 'paddingHorizontal: SPACING.xs',
  'paddingHorizontal: 8': 'paddingHorizontal: SPACING.sm',
  'paddingHorizontal: 12': 'paddingHorizontal: SPACING.md',
  'paddingHorizontal: 16': 'paddingHorizontal: SPACING.base',
  'paddingHorizontal: 24': 'paddingHorizontal: SPACING.lg',
  
  'paddingVertical: 4': 'paddingVertical: SPACING.xs',
  'paddingVertical: 8': 'paddingVertical: SPACING.sm',
  'paddingVertical: 12': 'paddingVertical: SPACING.md',
  'paddingVertical: 16': 'paddingVertical: SPACING.base',
  'paddingVertical: 24': 'paddingVertical: SPACING.lg',
  
  // Font Size
  'fontSize: 10': 'fontSize: FONT_SIZE.xxs',
  'fontSize: 12': 'fontSize: FONT_SIZE.xs',
  'fontSize: 14': 'fontSize: FONT_SIZE.sm',
  'fontSize: 16': 'fontSize: FONT_SIZE.base',
  'fontSize: 18': 'fontSize: FONT_SIZE.md',
  'fontSize: 20': 'fontSize: FONT_SIZE.lg',
  'fontSize: 24': 'fontSize: FONT_SIZE.xl',
  'fontSize: 28': 'fontSize: FONT_SIZE.xxl',
  'fontSize: 32': 'fontSize: FONT_SIZE.xxxl',
  'fontSize: 40': 'fontSize: FONT_SIZE.huge',
  'fontSize: 48': 'fontSize: FONT_SIZE.display',
  
  // Font Weight
  "fontWeight: '300'": 'fontWeight: FONT_WEIGHT.light',
  "fontWeight: '400'": 'fontWeight: FONT_WEIGHT.regular',
  "fontWeight: '500'": 'fontWeight: FONT_WEIGHT.medium',
  "fontWeight: '600'": 'fontWeight: FONT_WEIGHT.semibold',
  "fontWeight: '700'": 'fontWeight: FONT_WEIGHT.bold',
  "fontWeight: '800'": 'fontWeight: FONT_WEIGHT.extrabold',
  
  // Border Radius
  'borderRadius: 0': 'borderRadius: BORDER_RADIUS.none',
  'borderRadius: 2': 'borderRadius: BORDER_RADIUS.xs',
  'borderRadius: 4': 'borderRadius: BORDER_RADIUS.sm',
  'borderRadius: 8': 'borderRadius: BORDER_RADIUS.base',
  'borderRadius: 12': 'borderRadius: BORDER_RADIUS.md',
  'borderRadius: 16': 'borderRadius: BORDER_RADIUS.lg',
  'borderRadius: 20': 'borderRadius: BORDER_RADIUS.xl',
  'borderRadius: 24': 'borderRadius: BORDER_RADIUS.xxl',
  'borderRadius: 9999': 'borderRadius: BORDER_RADIUS.full',
  
  // Elevation
  'elevation: 1': 'elevation: 1', // Manter valores baixos
  'elevation: 2': 'elevation: 2',
  'elevation: 4': 'elevation: 4',
  'elevation: 8': 'elevation: 8',
};

// Imports necessários
const REQUIRED_IMPORTS = {
  designTokens: "import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ELEVATION } from '@presentation/theme/designTokens';",
  getString: "import { getString } from '@utils/theme';"
};

class TokenMigrator {
  constructor() {
    this.migratedFiles = [];
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      replacementsMade: 0,
      importsAdded: 0
    };
  }

  async migrateFile(filePath) {
    try {
      console.log(`🔧 Migrando: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo não encontrado');
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Aplicar substituições de tokens
      let replacements = 0;
      for (const [oldValue, newValue] of Object.entries(TOKEN_REPLACEMENTS)) {
        const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newValue);
          replacements += matches.length;
        }
      }
      
      // Adicionar imports se necessário
      let importsAdded = 0;
      if (replacements > 0) {
        importsAdded = this.addRequiredImports(content, filePath);
        if (importsAdded > 0) {
          // Re-ler o arquivo após adicionar imports
          content = fs.readFileSync(filePath, 'utf8');
        }
      }
      
      // Salvar apenas se houve mudanças
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        
        this.migratedFiles.push({
          file: filePath,
          replacements,
          importsAdded
        });
        
        console.log(`  ✅ ${replacements} substituições, ${importsAdded} imports adicionados`);
      } else {
        console.log(`  ℹ️  Nenhuma alteração necessária`);
      }
      
      this.stats.filesProcessed++;
      this.stats.replacementsMade += replacements;
      this.stats.importsAdded += importsAdded;
      
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  addRequiredImports(content, filePath) {
    let importsAdded = 0;
    
    // Verificar se precisa de design tokens
    const needsDesignTokens = content.includes('SPACING.') || 
                             content.includes('FONT_SIZE.') || 
                             content.includes('FONT_WEIGHT.') || 
                             content.includes('BORDER_RADIUS.') ||
                             content.includes('COLORS.');
    
    if (needsDesignTokens && !content.includes('@presentation/theme/designTokens')) {
      content = this.addImport(content, REQUIRED_IMPORTS.designTokens);
      importsAdded++;
    }
    
    // Verificar se precisa de getString
    const needsGetString = content.includes('getString(');
    
    if (needsGetString && !content.includes('@utils/theme')) {
      content = this.addImport(content, REQUIRED_IMPORTS.getString);
      importsAdded++;
    }
    
    if (importsAdded > 0) {
      fs.writeFileSync(filePath, content);
    }
    
    return importsAdded;
  }

  addImport(content, importStatement) {
    const lines = content.split('\n');
    
    // Encontrar onde inserir o import (após outros imports)
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('const ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        // Linha vazia após imports
        insertIndex = i;
        break;
      } else if (!lines[i].startsWith('import ') && !lines[i].startsWith('const ') && lines[i].trim() !== '') {
        // Primeira linha que não é import
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    return lines.join('\n');
  }

  async migrateDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    const files = this.getAllFiles(dirPath, extensions);
    
    console.log(`📁 Encontrados ${files.length} arquivos para migração`);
    
    for (const file of files) {
      await this.migrateFile(file);
    }
    
    this.printSummary();
  }

  getAllFiles(dirPath, extensions) {
    let files = [];
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pular pastas irrelevantes
        if (!['node_modules', '.git', 'dist', 'build', '__tests__'].includes(item)) {
          files = files.concat(this.getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  printSummary() {
    console.log('\n📊 RESUMO DA MIGRAÇÃO\n');
    console.log('='.repeat(40));
    console.log(`📁 Arquivos processados: ${this.stats.filesProcessed}`);
    console.log(`🔄 Substituições feitas: ${this.stats.replacementsMade}`);
    console.log(`📦 Imports adicionados: ${this.stats.importsAdded}`);
    console.log(`✅ Arquivos migrados: ${this.migratedFiles.length}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.migratedFiles.length > 0) {
      console.log('\n✅ Arquivos migrados com sucesso:');
      this.migratedFiles.forEach(({ file, replacements, importsAdded }) => {
        const relativePath = file.replace(process.cwd(), '');
        console.log(`   ${relativePath} (${replacements} substituições, ${importsAdded} imports)`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Erros encontrados:');
      this.errors.forEach(({ file, error }) => {
        const relativePath = file.replace(process.cwd(), '');
        console.log(`   ${relativePath}: ${error}`);
      });
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Execute: npm run lint para verificar sintaxe');
    console.log('2. Execute: npm test para verificar funcionalidade');
    console.log('3. Revise manualmente os arquivos migrados');
    console.log('4. Execute: node scripts/audit-design-tokens.js para verificar progresso');
  }
}

// Executar migração
if (require.main === module) {
  const migrator = new TokenMigrator();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Migrar diretório src inteiro
    const srcPath = path.join(process.cwd(), 'src');
    console.log('🚀 Iniciando migração automática de Design Tokens...');
    console.log(`📁 Diretório: ${srcPath}`);
    migrator.migrateDirectory(srcPath);
  } else {
    // Migrar arquivos específicos
    console.log('🚀 Migrando arquivos específicos...');
    args.forEach(async (file) => {
      const fullPath = path.resolve(file);
      await migrator.migrateFile(fullPath);
    });
    migrator.printSummary();
  }
}

module.exports = TokenMigrator;
