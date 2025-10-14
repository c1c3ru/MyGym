#!/usr/bin/env node

/**
 * Script para substituir componentes deprecados Title e Paragraph por Text
 */

const fs = require('fs');
const { execSync } = require('child_process');

class DeprecatedComponentsFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalReplacements = 0;
    this.errors = [];
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let replacements = 0;
      
      // Substituir <Title> por <Text> com estilo de título
      const titleRegex = /<Title(\s[^>]*)?>([^<]*)<\/Title>/g;
      content = content.replace(titleRegex, (match, props, text) => {
        replacements++;
        const cleanProps = props ? props.trim() : '';
        const styleProps = cleanProps ? ` ${cleanProps}` : '';
        return `<Text${styleProps} style={[styles.title, ${styleProps.includes('style') ? 'props.style' : 'null'}]}>${text}</Text>`;
      });
      
      // Substituir <Paragraph> por <Text> com estilo de parágrafo
      const paragraphRegex = /<Paragraph(\s[^>]*)?>([^<]*)<\/Paragraph>/g;
      content = content.replace(paragraphRegex, (match, props, text) => {
        replacements++;
        const cleanProps = props ? props.trim() : '';
        const styleProps = cleanProps ? ` ${cleanProps}` : '';
        return `<Text${styleProps} style={[styles.paragraph, ${styleProps.includes('style') ? 'props.style' : 'null'}]}>${text}</Text>`;
      });
      
      // Adicionar estilos básicos se não existirem
      if (replacements > 0 && !content.includes('styles.title') && !content.includes('styles.paragraph')) {
        const stylesRegex = /(const styles = StyleSheet\.create\({[^}]*)\}/;
        if (stylesRegex.test(content)) {
          content = content.replace(stylesRegex, (match, stylesContent) => {
            return `${stylesContent},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
}`;
          });
        }
      }
      
      if (replacements > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath}: ${replacements} componentes substituídos`);
        this.fixedFiles++;
        this.totalReplacements += replacements;
      }
      
    } catch (error) {
      console.error(`❌ Erro em ${filePath}: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  async fixAllFiles() {
    console.log('🔧 Substituindo componentes deprecados Title e Paragraph...\n');
    
    try {
      // Encontrar todos os arquivos com <Title> ou <Paragraph>
      const result = execSync(
        `grep -r "<Title\\|<Paragraph" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -l`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      const files = result.trim().split('\n').filter(f => f);
      
      console.log(`📁 Encontrados ${files.length} arquivos para corrigir\n`);
      
      for (const file of files) {
        this.fixFile(file);
      }
      
    } catch (error) {
      console.log('ℹ️  Nenhum arquivo encontrado com componentes deprecados');
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 RESUMO DA CORREÇÃO DE COMPONENTES');
    console.log('='.repeat(50));
    console.log(`✅ Arquivos corrigidos: ${this.fixedFiles}`);
    console.log(`🔄 Total de substituições: ${this.totalReplacements}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Arquivos com erro:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Verificar se o app compila: npx expo start --clear');
    console.log('2. Ajustar estilos se necessário');
    console.log('3. Testar funcionalidade');
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new DeprecatedComponentsFixer();
  fixer.fixAllFiles().catch(console.error);
}

module.exports = DeprecatedComponentsFixer;
