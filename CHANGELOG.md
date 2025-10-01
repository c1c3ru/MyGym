# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2025-10-01

### 🎉 Migração Completa para TypeScript e Clean Architecture

Esta é uma release **MAJOR** com mudanças significativas na arquitetura do projeto.

### ✨ Adicionado

#### Arquitetura
- **Clean Architecture** implementada com 4 camadas (Domain, Data, Infrastructure, Presentation)
- **Interfaces TypeScript** para todas as entidades de domínio
- **Use Cases** testáveis e independentes de framework
- **Mappers** para conversão entre camadas
- **Repositórios** com contratos bem definidos

#### Domain Layer
- `User` interface com `id` ao invés de `uid`
- `UserProfile` interface completa com todos os campos
- `AuthSession` interface com `userProfile` incluído
- `Claims` interface para autorização
- `Academia` interface expandida
- 6 use cases de autenticação em TypeScript

#### Design System
- **Design Tokens** centralizados (`/src/presentation/theme/designTokens.js`)
- 100+ cores organizadas em paletas
- 11 níveis de espaçamento
- 10 tamanhos de fonte
- 6 pesos de fonte
- 8 níveis de border radius
- 7 níveis de elevação

#### Componentes UI/UX
- 10 componentes acessíveis (WCAG 2.1 compliant)
- Sistema de Undo/Redo com UndoProvider
- Tours de Onboarding com OnboardingProvider
- Mensagens de erro aprimoradas com 15+ códigos catalogados
- Breadcrumbs para navegação hierárquica

#### Documentação
- `/docs/TYPESCRIPT_MIGRATION_GUIDE.md` - Guia completo de migração
- `/docs/DESIGN_TOKENS_GUIDE.md` - Guia de Design Tokens (400+ linhas)
- `/docs/UI_UX_IMPROVEMENTS.md` - Documentação de melhorias de UI/UX
- `/docs/README.md` - Índice centralizado da documentação
- `CHANGELOG.md` - Este arquivo

#### Scripts e Ferramentas
- `scripts/adapt-to-typescript-interfaces.js` - Adaptação automática de código
- `scripts/migrate-to-design-tokens.js` - Migração para Design Tokens
- `scripts/convert-to-typescript.sh` - Conversão JS → TS
- Regras ESLint para prevenir valores hardcoded

### 🔄 Modificado

#### Arquivos Migrados (36 arquivos)
- **Telas de Instrutor:** InstructorDashboard, CheckIn, InstructorClasses, InstructorStudents, Relatorios, ScheduleClassesScreen
- **Telas de Admin:** AdminDashboard, AdminClasses, AdminStudents, AdminModalities, AddClassScreen, EditClassScreen, AddStudentScreen, EditStudentScreen, InviteManagement
- **Telas de Aluno:** StudentDashboard, CheckInScreen, PaymentManagementScreen, StudentPayments, StudentEvolution
- **Telas Compartilhadas:** ProfileScreen, PhysicalEvaluationScreen, PhysicalEvaluationHistoryScreen, InjuryScreen, InjuryHistoryScreen, AddGraduationScreen, ImprovedCalendarScreen, ClassDetailsScreen, GraduationBoardScreen, StudentDetailsScreen, ReportsScreen
- **Telas de Auth:** RegisterScreen, LoginScreen, AcademiaSelectionScreen, UserTypeSelectionScreen
- **Componentes:** NotificationBell, UniversalHeader, GraduationBoard, GraduationNotificationBell, OptimizedStudentCard, ActionButton, CheckInButton, PaymentDueDateEditor, StudentDisassociationDialog
- **Navegação:** InstructorNavigator

#### Adaptações de Código (33 arquivos)
- `user.uid` → `user.id` (100+ ocorrências)
- Removidos métodos `.isAdmin()`, `.isInstructor()`, `.isStudent()`
- Removidos métodos `.toObject()` e `.toJSON()`
- Uso direto de `userProfile.userType` para verificação de tipo

#### Use Cases Corrigidos (6 arquivos)
- `SignInWithEmail.ts` - Imports corrigidos
- `SignUpWithEmail.ts` - Imports corrigidos
- `GetUserSession.ts` - Imports corrigidos
- `RefreshUserToken.ts` - Imports corrigidos
- `SendPasswordResetEmail.ts` - Imports corrigidos
- `SignOut.ts` - Imports corrigidos

#### README.md
- Adicionada seção de Clean Architecture
- Atualizada estrutura do projeto
- Adicionadas tecnologias (TypeScript, Zod, Jest)
- Adicionada seção sobre interfaces TypeScript
- Expandidas funcionalidades implementadas

### ❌ Removido

#### Classes Legacy (3 arquivos)
- `/src/domain/entities/AuthSession.js` - Substituída por interface TS
- `/src/domain/entities/User.js` - Substituída por interface TS
- `/src/domain/entities/Claims.js` - Substituída por interface TS

#### Arquivos Movidos para Backup (12 arquivos)
- Use cases legacy (4 arquivos) → `/backup/domain_usecases_legacy/`
- Data sources legacy (2 arquivos) → `/backup/data_legacy/`
- DI Container legacy (1 arquivo) → `/backup/data_legacy/`
- Hooks legacy (1 arquivo) → `/backup/data_legacy/`
- Domain index legacy (1 arquivo) → `/backup/data_legacy/`
- Entities legacy (7 arquivos) → `/backup/domain_entities_legacy/`

#### Backups de Adaptação
- 33 arquivos `.backup-adapt` removidos após validação

### 🐛 Corrigido

- Erro "Property 'userProfile' does not exist on type 'AuthSession'"
- Erro "Property 'getUserClaims' does not exist on type 'AuthRepository'"
- Erro "Argument of type 'User' is not assignable to parameter of type 'User'"
- Conflitos entre classes JavaScript e interfaces TypeScript
- Imports incorretos usando `@domain/entities` ao invés de `../entities`
- Uso de `user.uid` em código que deveria usar `user.id`

### 📊 Estatísticas

#### Migração TypeScript
- 3 classes legacy removidas
- 12 arquivos movidos para backup
- 6 use cases corrigidos
- 33 arquivos JavaScript adaptados
- 100+ ocorrências de `user.uid` → `user.id`

#### Design Tokens
- 36 arquivos migrados
- 1.700+ substituições realizadas
- 85% de cobertura nas telas principais
- 100+ cores centralizadas
- 11 níveis de espaçamento
- 36 backups criados

#### Documentação
- 5 documentos principais criados
- 2.000+ linhas de documentação
- 100+ exemplos de código
- 3 scripts de automação

### 🔒 Segurança

- Type safety completo com TypeScript em camada de domínio
- Validação de schemas com Zod
- Interfaces imutáveis com `readonly`
- Separação clara de responsabilidades

### ⚡ Performance

- Objetos literais ao invés de instâncias de classes (mais leves)
- Cache otimizado com funções específicas
- Mappers eficientes para conversão de dados

### ♿ Acessibilidade

- 10 componentes com suporte WCAG 2.1
- `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- `accessibilityState` para estados disabled/selected/busy
- `testID` para testes automatizados

### 📝 Notas de Migração

#### Breaking Changes

⚠️ **IMPORTANTE:** Esta versão contém mudanças que quebram compatibilidade:

1. **`user.uid` → `user.id`**
   ```javascript
   // ❌ ANTES
   const userId = user.uid;
   
   // ✅ DEPOIS
   const userId = user.id;
   ```

2. **Métodos de classe removidos**
   ```javascript
   // ❌ ANTES
   if (user.isAdmin()) { ... }
   
   // ✅ DEPOIS
   if (userProfile.userType === 'admin') { ... }
   ```

3. **Imports de entidades**
   ```typescript
   // ❌ ANTES
   import { User } from '@domain/entities';
   
   // ✅ DEPOIS
   import { User } from '@domain/auth/entities';
   ```

#### Guia de Atualização

Para atualizar código existente:

1. Execute o script de adaptação:
   ```bash
   node scripts/adapt-to-typescript-interfaces.js src/
   ```

2. Atualize imports de entidades:
   - `@domain/entities` → `@domain/auth/entities`

3. Substitua métodos de classe:
   - `.isAdmin()` → `.userType === 'admin'`
   - `.toObject()` → (remover, usar objeto diretamente)

4. Verifique tipos TypeScript:
   ```bash
   npx tsc --noEmit
   ```

5. Execute testes:
   ```bash
   npm test
   ```

### 🎯 Próximos Passos

#### v2.1.0 (Planejado)
- [ ] Converter mais arquivos JavaScript para TypeScript
- [ ] Adicionar testes unitários para use cases
- [ ] Implementar dark mode usando Design Tokens
- [ ] Expandir catálogo de erros
- [ ] Adicionar mais tours de onboarding

#### v2.2.0 (Planejado)
- [ ] Sistema de check-in com geolocalização
- [ ] Notificações push
- [ ] Chat entre usuários
- [ ] Relatórios avançados

## [1.0.0] - 2024-XX-XX

### Adicionado
- Sistema de autenticação com Firebase
- Dashboards para alunos, instrutores e administradores
- Gerenciamento de turmas e alunos
- Sistema de pagamentos
- Calendário de aulas
- Sistema de graduações
- Notificações
- Interface com React Native Paper

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades corrigidas

## Links

- [Documentação](./docs/README.md)
- [Guia de Migração TypeScript](./docs/TYPESCRIPT_MIGRATION_GUIDE.md)
- [Guia de Design Tokens](./docs/DESIGN_TOKENS_GUIDE.md)
