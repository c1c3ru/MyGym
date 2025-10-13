#!/usr/bin/env node

/**
 * Script para migrar strings hardcoded para usar getString()
 * Foca nas strings mais comuns identificadas no relatório
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Mapeamento das strings hardcoded mais comuns para suas chaves no i18n
const STRING_MAPPINGS = {
  // Erros mais comuns
  'Erro': 'error',
  'Academia ID não encontrado': 'academyIdNotFound',
  'Não foi possível carregar os dados. Tente novamente.': 'dataLoadError',
  'Erro de conexão. Verifique sua internet e tente novamente.': 'networkError',
  'Usuário não associado a uma academia': 'userNotAssociated',
  
  // Ações mais comuns
  'Cancelar': 'cancel',
  'Excluir': 'delete',
  'Atualizar': 'update',
  'Salvar': 'save',
  'Confirmar': 'confirm',
  'Editar': 'edit',
  
  // Status mais comuns
  'Sucesso': 'success',
  'Ativo': 'active',
  'Inativo': 'inactive',
  'Pendente': 'pending',
  
  // Academia mais comuns
  'Aluno': 'student',
  'Alunos': 'students',
  'Turma': 'class',
  'Turmas': 'classes',
  'Karatê': 'karate',
  'Jiu-Jitsu': 'jiujitsu',
  'Muay Thai': 'muayThai',
  'Boxe': 'boxing',
  
  // Confirmações
  'Tem certeza que deseja excluir?': 'confirmDelete',
  'Tem certeza que deseja cancelar?': 'confirmCancel',
  
  // Placeholders e mensagens
  'Buscar aluno...': 'searchStudent',
  'Buscar turma...': 'searchClass',
  'Nome não informado': 'nameNotInformed',
  'Email não informado': 'emailNotInformed',
  'Nenhum aluno encontrado': 'noStudentsFound',
  'Nenhuma turma encontrada': 'noClassesFound',
  'Nenhum dado disponível': 'noDataAvailable',
  
  // Check-in específico
  'Check-in iniciado para': 'checkInStarted',
  'Sessão de check-in finalizada': 'checkInStopped',
  'Check-in realizado com sucesso!': 'checkInSuccess',
  'Selecione pelo menos um aluno': 'selectStudentsFirst',
  'Confirmar Check-in': 'confirmCheckIn',
  'Check-in Manual': 'manualCheckIn',
  
  // Tempo
  'Agora': 'now',
  'Hoje': 'today',
  'Esta semana': 'thisWeek',
  'Iniciado às': 'startedAt',
  
  // Graduação
  'Graduação Atual': 'currentGraduation',
  'Iniciante': 'beginner',
  'Adicionar Graduação': 'addGraduation',
  
  // Pagamentos
  'Em dia': 'paymentUpToDate',
  'Pendente': 'paymentPending',
  'Em atraso': 'paymentOverdue',
  
  // Modalidades
  'Modalidade não informada': 'modalityNotInformed',
  'Horário não definido': 'scheduleNotDefined',
  
  // Mensagens de sistema
  'Carregando dados...': 'loadingData',
  'Salvando dados...': 'savingData',
  'Processando solicitação...': 'processingRequest',
  'Operação concluída': 'operationCompleted',
  
  // Validações
  'Selecione pelo menos um item': 'selectAtLeastOne',
  'Preencha todos os campos obrigatórios': 'fillAllRequiredFields',
  'Dados inválidos': 'invalidData',
  
  // Ações específicas
  'Iniciar Check-in': 'startCheckIn',
  'Parar Check-in': 'stopCheckIn',
  'Ver Detalhes': 'viewDetails',
  'Editar Informações': 'editInfo',
  'Gerenciar Alunos': 'manageStudents',
  'Gerenciar Turmas': 'manageClasses',
  
  // Navegação comum
  'Detalhes da Turma': 'classDetails',
  'Adicionar Turma': 'addClass',
};

class StringMigrator {
  constructor() {
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.fileStats = new Map();
  }

  // Verifica se arquivo precisa de import do useTheme
  needsThemeImport(content) {
    return !content.includes('useTheme') && !content.includes('getString');
  }

  // Adiciona import do useTheme se necessário
  addThemeImport(content) {
    // Verifica se já tem import do useTheme
    if (content.includes('useTheme')) {
      return content;
    }

    // Procura por outros imports de contextos
    const contextImportRegex = /import.*from ['"]@contexts\/.*['"];?/;
    const match = content.match(contextImportRegex);
    
    if (match) {
      // Adiciona após o último import de contexto
      return content.replace(match[0], match[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    // Procura por imports do react-native-paper
    const paperImportRegex = /import.*from ['"]react-native-paper['"];?/;
    const paperMatch = content.match(paperImportRegex);
    
    if (paperMatch) {
      return content.replace(paperMatch[0], paperMatch[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    // Se não encontrou lugar específico, adiciona no início dos imports
    const firstImportRegex = /^import.*$/m;
    const firstImportMatch = content.match(firstImportRegex);
    
    if (firstImportMatch) {
      return content.replace(firstImportMatch[0], "import { useTheme } from '@contexts/ThemeContext';\n" + firstImportMatch[0]);
    }

    return content;
  }

  // Adiciona hook useTheme no componente
  addThemeHook(content) {
    // Verifica se já tem o hook
    if (content.includes('useTheme()') || content.includes('getString')) {
      return content;
    }

    // Procura pelo início do componente funcional
    const componentRegex = /export\s+default\s+function\s+\w+.*?\{/;
    const match = content.match(componentRegex);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      return before + '\n  const { getString } = useTheme();\n' + after;
    }

    // Tenta encontrar arrow function component
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

  // Migra strings hardcoded para getString()
  migrateStrings(content) {
    let modifiedContent = content;
    let replacements = 0;

    Object.entries(STRING_MAPPINGS).forEach(([hardcodedString, i18nKey]) => {
      // Regex para encontrar a string hardcoded (com aspas simples ou duplas)
      const stringRegex = new RegExp(`['"\`]${hardcodedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      
      // Substitui por getString()
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

  // Processa um arquivo
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(`\n📄 Processando: ${relativePath}`);

      // Migra strings
      const { content: migratedContent, replacements } = this.migrateStrings(content);
      content = migratedContent;

      if (replacements > 0) {
        // Adiciona import se necessário
        if (this.needsThemeImport(content)) {
          content = this.addThemeImport(content);
          console.log('   📦 Import useTheme adicionado');
        }

        // Adiciona hook se necessário
        content = this.addThemeHook(content);

        // Cria backup
        const backupPath = filePath + '.backup-string-migration';
        fs.writeFileSync(backupPath, originalContent);

        // Salva arquivo modificado
        fs.writeFileSync(filePath, content);

        this.fileStats.set(relativePath, replacements);
        this.totalReplacements += replacements;
        
        console.log(`   💾 Arquivo salvo com ${replacements} substituições`);
      } else {
        console.log('   ⏭️  Nenhuma string para migrar');
      }

    } catch (error) {
      console.error(`   ❌ Erro ao processar ${filePath}:`, error.message);
    }
  }

  // Percorre diretórios recursivamente
  walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pula diretórios de teste e node_modules
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
          this.walkDirectory(fullPath);
        }
      } else if (EXTENSIONS.includes(path.extname(file))) {
        this.processFile(fullPath);
        this.processedFiles++;
      }
    }
  }

  // Gera relatório final
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE MIGRAÇÃO DE STRINGS');
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

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Testar a aplicação para verificar se tudo funciona');
    console.log('   2. Executar análise de cobertura novamente');
    console.log('   3. Remover backups se tudo estiver OK:');
    console.log('      find src -name "*.backup-string-migration" -delete');
    console.log('   4. Continuar migrando strings menos comuns');
    
    console.log('='.repeat(80));
  }

  // Executa migração completa
  run() {
    console.log('🚀 Iniciando migração de strings hardcoded...\n');
    console.log(`📋 Strings mapeadas: ${Object.keys(STRING_MAPPINGS).length}`);
    
    this.walkDirectory(SRC_DIR);
    this.generateReport();
    
    console.log('\n🎉 Migração concluída!');
  }
}

// Executa o script
if (require.main === module) {
  const migrator = new StringMigrator();
  migrator.run();
}

module.exports = StringMigrator;
