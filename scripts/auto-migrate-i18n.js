#!/usr/bin/env node

/**
 * Script de Migração Automática de i18n
 * Substitui strings hardcoded por getString()
 */

const fs = require('fs');
const path = require('path');

// Strings comuns que devem ser traduzidas
const COMMON_TRANSLATIONS = {
  // Botões e ações
  'Salvar': 'save',
  'Cancelar': 'cancel',
  'Confirmar': 'confirm',
  'Editar': 'edit',
  'Excluir': 'delete',
  'Adicionar': 'add',
  'Novo': 'new',
  'Voltar': 'back',
  'Próximo': 'next',
  'Anterior': 'previous',
  'Fechar': 'close',
  'Abrir': 'open',
  'Buscar': 'search',
  'Filtrar': 'filter',
  
  // Status
  'Ativo': 'active',
  'Inativo': 'inactive',
  'Pendente': 'pending',
  'Concluído': 'completed',
  'Cancelado': 'cancelled',
  
  // Mensagens
  'Sucesso': 'success',
  'Erro': 'error',
  'Aviso': 'warning',
  'Informação': 'info',
  'Carregando...': 'loading',
  'Processando...': 'processing',
  'Salvando...': 'saving',
  
  // Academia
  'Aluno': 'student',
  'Alunos': 'students',
  'Instrutor': 'instructor',
  'Instrutores': 'instructors',
  'Turma': 'class',
  'Turmas': 'classes',
  'Academia': 'academy',
  'Graduação': 'graduation',
  'Graduações': 'graduations',
  'Modalidade': 'modality',
  'Modalidades': 'modalities',
  'Pagamento': 'payment',
  'Pagamentos': 'payments',
  
  // Campos
  'Nome': 'name',
  'Email': 'email',
  'Telefone': 'phone',
  'Endereço': 'address',
  'Data': 'date',
  'Hora': 'time',
  'Descrição': 'description',
  'Observações': 'notes',
  
  // Navegação
  'Início': 'home',
  'Dashboard': 'dashboard',
  'Perfil': 'profile',
  'Configurações': 'settings',
  'Ajuda': 'help',
  'Sobre': 'about',
  'Sair': 'logout',
  
  // Mensagens comuns
  'Nenhum resultado encontrado': 'noResultsFound',
  'Nenhum aluno encontrado': 'noStudentsFound',
  'Nenhuma turma encontrada': 'noClassesFound',
  'Dados carregados com sucesso': 'dataLoadedSuccessfully',
  'Operação realizada com sucesso': 'operationSuccessful',
  'Erro ao carregar dados': 'errorLoadingData',
  'Erro ao salvar': 'errorSaving',
  'Confirmar exclusão': 'confirmDeletion',
  'Esta ação não pode ser desfeita': 'actionCannotBeUndone',
};

class I18nMigrator {
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
      console.log(`🌍 Migrando i18n: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo não encontrado');
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Aplicar substituições de strings
      let replacements = 0;
      for (const [portugueseText, key] of Object.entries(COMMON_TRANSLATIONS)) {
        // Substituir em JSX (entre tags)
        const jsxRegex = new RegExp(`>\\s*${this.escapeRegex(portugueseText)}\\s*<`, 'g');
        const jsxMatches = content.match(jsxRegex);
        if (jsxMatches) {
          content = content.replace(jsxRegex, `>{getString('${key}')}<`);
          replacements += jsxMatches.length;
        }
        
        // Substituir em propriedades (title, placeholder, etc.)
        const propRegex = new RegExp(`(title|placeholder|label|text)=['"\`]${this.escapeRegex(portugueseText)}['"\`]`, 'g');
        const propMatches = content.match(propRegex);
        if (propMatches) {
          content = content.replace(propRegex, `$1={getString('${key}')}`);
          replacements += propMatches.length;
        }
        
        // Substituir em strings literais
        const stringRegex = new RegExp(`['"\`]${this.escapeRegex(portugueseText)}['"\`]`, 'g');
        const stringMatches = content.match(stringRegex);
        if (stringMatches) {
          content = content.replace(stringRegex, `getString('${key}')`);
          replacements += stringMatches.length;
        }
      }
      
      // Adicionar import se necessário
      let importsAdded = 0;
      if (replacements > 0) {
        importsAdded = this.addGetStringImport(content, filePath);
        if (importsAdded > 0) {
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
        
        console.log(`  ✅ ${replacements} strings traduzidas, ${importsAdded} imports adicionados`);
      } else {
        console.log(`  ℹ️  Nenhuma string para traduzir`);
      }
      
      this.stats.filesProcessed++;
      this.stats.replacementsMade += replacements;
      this.stats.importsAdded += importsAdded;
      
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  addGetStringImport(content, filePath) {
    // Verificar se já tem o import
    if (content.includes("getString") && content.includes("@utils/theme")) {
      return 0;
    }
    
    const importStatement = "import { getString } from '@utils/theme';";
    
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Encontrar onde inserir o import
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('const ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        insertIndex = i;
        break;
      } else if (!lines[i].startsWith('import ') && !lines[i].startsWith('const ') && lines[i].trim() !== '') {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    const newContent = lines.join('\n');
    
    fs.writeFileSync(filePath, newContent);
    return 1;
  }

  async migrateDirectory(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    const files = this.getAllFiles(dirPath, extensions);
    
    console.log(`📁 Encontrados ${files.length} arquivos para migração i18n`);
    
    for (const file of files) {
      // Pular arquivos de configuração e testes
      if (this.shouldSkipFile(file)) {
        continue;
      }
      
      await this.migrateFile(file);
    }
    
    this.printSummary();
  }

  shouldSkipFile(filePath) {
    const skipPatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '__tests__',
      '.test.',
      '.spec.',
      'designTokens.js',
      'theme.js',
      'constants',
      '.d.ts'
    ];
    
    return skipPatterns.some(pattern => filePath.includes(pattern));
  }

  getAllFiles(dirPath, extensions) {
    let files = [];
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          files = files.concat(this.getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  printSummary() {
    console.log('\n🌍 RESUMO DA MIGRAÇÃO I18N\n');
    console.log('='.repeat(40));
    console.log(`📁 Arquivos processados: ${this.stats.filesProcessed}`);
    console.log(`🔄 Strings traduzidas: ${this.stats.replacementsMade}`);
    console.log(`📦 Imports adicionados: ${this.stats.importsAdded}`);
    console.log(`✅ Arquivos migrados: ${this.migratedFiles.length}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.migratedFiles.length > 0) {
      console.log('\n✅ Arquivos migrados com sucesso:');
      this.migratedFiles.forEach(({ file, replacements, importsAdded }) => {
        const relativePath = file.replace(process.cwd(), '');
        console.log(`   ${relativePath} (${replacements} strings, ${importsAdded} imports)`);
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
    console.log('1. Revise as traduções aplicadas');
    console.log('2. Adicione chaves faltantes ao arquivo theme.js');
    console.log('3. Execute: npm test para verificar funcionalidade');
    console.log('4. Execute: node scripts/audit-i18n.js para verificar progresso');
  }

  generateMissingKeys() {
    // Analisar arquivos e gerar chaves faltantes
    console.log('\n📝 Gerando chaves de tradução faltantes...');
    
    const missingKeys = new Set();
    
    // Aqui você pode implementar lógica para detectar strings
    // que ainda precisam de tradução
    
    if (missingKeys.size > 0) {
      console.log('\n🔑 Chaves faltantes encontradas:');
      missingKeys.forEach(key => {
        console.log(`   ${key}: '',`);
      });
    }
  }
}

// Executar migração
if (require.main === module) {
  const migrator = new I18nMigrator();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Migrar diretório src inteiro
    const srcPath = path.join(process.cwd(), 'src');
    console.log('🚀 Iniciando migração automática de i18n...');
    console.log(`📁 Diretório: ${srcPath}`);
    migrator.migrateDirectory(srcPath);
  } else {
    // Migrar arquivos específicos
    console.log('🚀 Migrando i18n em arquivos específicos...');
    args.forEach(async (file) => {
      const fullPath = path.resolve(file);
      await migrator.migrateFile(fullPath);
    });
    migrator.printSummary();
  }
}

module.exports = I18nMigrator;
