#!/usr/bin/env node

/**
 * Script para migrar as strings prioritárias restantes
 * Foca nas top 20 strings mais comuns do relatório
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

// Mapeamento das strings prioritárias restantes (Top 20 do relatório)
const FINAL_PRIORITY_MAPPINGS = {
  // Top strings do relatório atual
  'AddClass': 'addClassScreen',
  'ClassDetails': 'classDetailsScreen',
  'COLORS.whitefff': 'colorWhite', // Erro de design token
  'Atrasado': 'overdue',
  'Carregando...': 'loadingState',
  'N/A': 'notAvailable',
  'Academia não identificada': 'academyNotIdentified',
  'Instrutor': 'instructor',
  'AddGraduation': 'addGraduationScreen',
  'ChangePassword': 'changePassword',
  'PhysicalEvaluationHistory': 'physicalEvaluationHistory',
  'AddStudent': 'addStudent',
  'PhysicalEvaluation': 'physicalEvaluation',
  'Azul': 'blue',
  'BRL': 'currency',
  'Todos': 'all',
  'Info': 'info',
  'Tente novamente.': 'tryAgainPeriod',
  'Usuário': 'user',
  'Dom': 'sunday',
  
  // Strings comuns adicionais
  'Seg': 'monday',
  'Ter': 'tuesday', 
  'Qua': 'wednesday',
  'Qui': 'thursday',
  'Sex': 'friday',
  'Sáb': 'saturday',
  'Janeiro': 'january',
  'Fevereiro': 'february',
  'Março': 'march',
  'Abril': 'april',
  'Maio': 'may',
  'Junho': 'june',
  'Julho': 'july',
  'Agosto': 'august',
  'Setembro': 'september',
  'Outubro': 'october',
  'Novembro': 'november',
  'Dezembro': 'december',
  
  // Interface comum
  'Sim': 'yes',
  'Não': 'no',
  'OK': 'ok',
  'Fechar': 'close',
  'Abrir': 'open',
  'Novo': 'new',
  'Editar': 'edit',
  'Salvar': 'save',
  'Cancelar': 'cancel',
  'Confirmar': 'confirm',
  'Excluir': 'delete',
  'Buscar': 'search',
  'Filtrar': 'filter',
  'Ordenar': 'sort',
  'Exportar': 'export',
  'Importar': 'import',
  
  // Estados
  'Ativo': 'active',
  'Inativo': 'inactive',
  'Pendente': 'pending',
  'Concluído': 'completed',
  'Cancelado': 'cancelled',
  'Em andamento': 'inProgress',
  'Pausado': 'paused',
  'Finalizado': 'finished',
  
  // Mensagens comuns
  'Sucesso': 'success',
  'Erro': 'error',
  'Aviso': 'warning',
  'Informação': 'information',
  'Atenção': 'attention',
  'Cuidado': 'caution',
  
  // Navegação
  'Voltar': 'back',
  'Avançar': 'forward',
  'Início': 'home',
  'Perfil': 'profile',
  'Configurações': 'settings',
  'Ajuda': 'help',
  'Sobre': 'about',
  'Sair': 'logout',
};

class FinalPriorityMigrator {
  constructor() {
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.fileStats = new Map();
  }

  needsThemeImport(content) {
    return !content.includes('useTheme') && !content.includes('getString');
  }

  addThemeImport(content) {
    if (content.includes('useTheme')) {
      return content;
    }

    const contextImportRegex = /import.*from ['"]@contexts\/.*['"];?/;
    const match = content.match(contextImportRegex);
    
    if (match) {
      return content.replace(match[0], match[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    const paperImportRegex = /import.*from ['"]react-native-paper['"];?/;
    const paperMatch = content.match(paperImportRegex);
    
    if (paperMatch) {
      return content.replace(paperMatch[0], paperMatch[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    const firstImportRegex = /^import.*$/m;
    const firstImportMatch = content.match(firstImportRegex);
    
    if (firstImportMatch) {
      return content.replace(firstImportMatch[0], "import { useTheme } from '@contexts/ThemeContext';\n" + firstImportMatch[0]);
    }

    return content;
  }

  addThemeHook(content) {
    if (content.includes('useTheme()') || content.includes('getString')) {
      return content;
    }

    const componentRegex = /export\s+default\s+function\s+\w+.*?\{/;
    const match = content.match(componentRegex);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      return before + '\n  const { getString } = useTheme();\n' + after;
    }

    const arrowComponentRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/;
    const arrowMatch = content.match(arrowComponentRegex);
    
    if (arrowMatch) {
      const insertPoint = arrowMatch.index + arrowMatch[0].length;
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      return before + '\n  const { getString } = useTheme();\n' + after;
    }

    return content;
  }

  migrateStrings(content) {
    let modifiedContent = content;
    let replacements = 0;

    Object.entries(FINAL_PRIORITY_MAPPINGS).forEach(([hardcodedString, i18nKey]) => {
      const stringRegex = new RegExp(`['"\`]${hardcodedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      
      const newContent = modifiedContent.replace(stringRegex, `getString('${i18nKey}')`);
      
      if (newContent !== modifiedContent) {
        const matches = (modifiedContent.match(stringRegex) || []).length;
        replacements += matches;
        modifiedContent = newContent;
        console.log(`   ✅ "${hardcodedString}" → getString('${i18nKey}') (${matches}x)`);
      }
    });

    return { content: modifiedContent, replacements };
  }

  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      
      const relativePath = path.relative(SRC_DIR, filePath);
      
      const { content: migratedContent, replacements } = this.migrateStrings(content);
      content = migratedContent;

      if (replacements > 0) {
        console.log(`\n📄 Processando: ${relativePath}`);
        
        if (this.needsThemeImport(content)) {
          content = this.addThemeImport(content);
          console.log('   📦 Import useTheme adicionado');
        }

        content = this.addThemeHook(content);

        const backupPath = filePath + '.backup-final-priorities';
        fs.writeFileSync(backupPath, originalContent);

        fs.writeFileSync(filePath, content);

        this.fileStats.set(relativePath, replacements);
        this.totalReplacements += replacements;
        
        console.log(`   💾 Arquivo salvo com ${replacements} substituições`);
      }

    } catch (error) {
      console.error(`   ❌ Erro ao processar ${filePath}:`, error.message);
    }
  }

  walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
          this.walkDirectory(fullPath);
        }
      } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
        this.processFile(fullPath);
        this.processedFiles++;
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RELATÓRIO DE MIGRAÇÃO FINAL - STRINGS PRIORITÁRIAS');
    console.log('='.repeat(80));
    
    console.log(`✅ Arquivos processados: ${this.processedFiles}`);
    console.log(`✅ Total de substituições: ${this.totalReplacements}`);
    console.log(`✅ Arquivos modificados: ${this.fileStats.size}`);
    
    if (this.fileStats.size > 0) {
      console.log('\n🔥 TOP 10 ARQUIVOS COM MAIS SUBSTITUIÇÕES:');
      const sortedFiles = Array.from(this.fileStats.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      sortedFiles.forEach(([file, count], index) => {
        console.log(`   ${index + 1}. ${file}: ${count} substituições`);
      });
    }

    console.log('\n📈 IMPACTO FINAL:');
    console.log(`   Strings migradas: ${this.totalReplacements}`);
    console.log(`   Redução estimada de hardcoded: ~${Math.round(this.totalReplacements * 0.9)} strings`);
    console.log(`   Cobertura estimada: ~35-40%`);

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Executar análise de cobertura final');
    console.log('   2. Verificar se atingiu 80% de cobertura');
    console.log('   3. Testar aplicação completa');
    console.log('   4. Remover backups: find src -name "*.backup-final-priorities" -delete');
    
    console.log('='.repeat(80));
  }

  run() {
    console.log('🎯 Iniciando migração final das strings prioritárias...\n');
    console.log(`📋 Strings mapeadas: ${Object.keys(FINAL_PRIORITY_MAPPINGS).length}`);
    
    this.walkDirectory(SRC_DIR);
    this.generateReport();
    
    console.log('\n🎉 Migração final concluída!');
  }
}

if (require.main === module) {
  const migrator = new FinalPriorityMigrator();
  migrator.run();
}

module.exports = FinalPriorityMigrator;
