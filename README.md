# Academia App

Um aplicativo completo para gerenciamento de academias de artes marciais, desenvolvido com React Native e Expo.

## 📱 Funcionalidades

### Para Alunos
- ✅ Dashboard personalizado com próximas aulas e avisos
- ✅ Calendário de aulas com check-in
- ✅ Acompanhamento de pagamentos e histórico
- ✅ Evolução e graduações
- ✅ Perfil completo com informações pessoais

### Para Instrutores
- ✅ Dashboard com estatísticas das turmas
- ✅ Gerenciamento de alunos e turmas
- ✅ Controle de presenças e graduações
- ✅ Visualização de horários e calendário

### Para Administradores
- ✅ Dashboard administrativo completo
- ✅ Gerenciamento de alunos, instrutores e turmas
- ✅ Controle financeiro e pagamentos
- ✅ Gerenciamento de modalidades e planos
- ✅ Sistema de avisos e comunicação

### Funcionalidades Gerais
- ✅ Autenticação segura com Firebase
- ✅ Login com Google (configurável)
- ✅ Sistema de notificações
- ✅ Interface moderna com React Native Paper
- ✅ Validação completa de formulários
- ✅ Tratamento de erros com ErrorBoundary
- ✅ Responsivo para diferentes tamanhos de tela

## 🛠 Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Type safety e melhor DX
- **Firebase** - Backend as a Service
  - Authentication (autenticação)
  - Firestore (banco de dados)
  - Storage (armazenamento de arquivos)
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes de UI
- **Context API** - Gerenciamento de estado
- **React Native Calendars** - Componente de calendário
- **Zod** - Validação de schemas
- **Jest** - Testes unitários

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Expo CLI (`npm install -g @expo/cli`)
- Conta no Firebase

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd academia-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication, Firestore e Storage
   - Baixe as credenciais e configure em `src/services/firebase.js`
   - Implemente as regras de segurança do arquivo `firestore.rules`

4. **Execute o projeto**
   ```bash
   expo start
   ```

## 🏗 Estrutura do Projeto (Clean Architecture)

```
src/
├── domain/                    # Camada de Domínio (Regras de Negócio)
│   ├── auth/
│   │   ├── entities.ts        # Interfaces TypeScript (User, UserProfile, AuthSession)
│   │   ├── repositories.ts    # Contratos de repositórios
│   │   ├── usecases/          # Casos de uso (SignIn, SignUp, etc)
│   │   └── errors/            # Erros de domínio
│   ├── students/              # Domínio de alunos
│   └── graduation/            # Domínio de graduações
│
├── data/                      # Camada de Dados (Implementações)
│   ├── auth/
│   │   ├── FirebaseAuthRepository.ts  # Implementação Firebase
│   │   ├── mappers.ts                 # Conversão Firebase ↔ Domain
│   │   └── validators.ts              # Validações de dados
│   └── models/                # Modelos de dados
│
├── infrastructure/            # Camada de Infraestrutura
│   ├── services/              # Serviços externos
│   │   ├── firebase.js        # Configuração Firebase
│   │   ├── firestoreService.js
│   │   ├── cacheService.js
│   │   └── notificationService.js
│   └── firebase/              # Configurações Firebase
│
├── presentation/              # Camada de Apresentação (UI)
│   ├── components/            # Componentes reutilizáveis
│   │   ├── AccessibleComponents.js  # Componentes acessíveis
│   │   ├── EnhancedErrorMessage.js  # Mensagens de erro
│   │   └── OnboardingTour.js        # Tours guiados
│   ├── contexts/              # Contextos React
│   │   ├── AuthContext.js
│   │   └── NotificationContext.js
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuthClean.js
│   │   └── useFormValidation.js
│   ├── navigation/            # Navegação
│   │   ├── AppNavigator.js
│   │   ├── AdminNavigator.js
│   │   ├── InstructorNavigator.js
│   │   └── StudentNavigator.js
│   ├── screens/               # Telas da aplicação
│   │   ├── admin/             # Telas do administrador
│   │   ├── auth/              # Telas de autenticação
│   │   ├── instructor/        # Telas do instrutor
│   │   ├── shared/            # Telas compartilhadas
│   │   └── student/           # Telas do aluno
│   ├── theme/                 # Sistema de Design
│   │   ├── designTokens.js    # Design Tokens centralizados
│   │   └── adminTheme.js      # Tema administrativo
│   └── auth/
│       └── AuthFacade.ts      # Facade de autenticação
│
├── shared/                    # Código compartilhado
│   └── utils/                 # Utilitários
│       ├── scheduleUtils.js
│       └── customClaimsHelper.js
│
└── utils/                     # Utilitários globais
    ├── constants.js
    └── validation.js
```

### 📐 Arquitetura

O projeto segue os princípios da **Clean Architecture**:

1. **Domain Layer** - Regras de negócio puras (TypeScript)
2. **Data Layer** - Implementações de repositórios e fontes de dados
3. **Infrastructure Layer** - Serviços externos (Firebase, APIs)
4. **Presentation Layer** - UI e lógica de apresentação (React Native)

## 🔧 Configuração Detalhada

### Firebase Setup
1. Substitua as credenciais em `src/services/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "sua-api-key",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto-id",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "sua-app-id"
   };
   ```

2. Configure as regras de segurança no Firestore usando o arquivo `firestore.rules`

### Tipos de Usuário
O sistema suporta três tipos de usuário:
- `student` - Aluno
- `instructor` - Instrutor/Professor
- `admin` - Administrador

### TypeScript e Interfaces

O projeto utiliza **interfaces TypeScript** para garantir type safety:

```typescript
// Interfaces principais (src/domain/auth/entities.ts)
interface User {
  id: string;              // ✅ Usar user.id (não user.uid)
  email: string;
  emailVerified: boolean;
  // ...
}

interface UserProfile {
  id: string;
  name: string;
  userType: 'student' | 'instructor' | 'admin';  // ✅ Tipado
  academiaId?: string;
  // ...
}

interface AuthSession {
  user: User;
  userProfile: UserProfile;  // ✅ Sempre presente
  claims: Claims;
  academia?: Academia;
}
```

**Documentação completa:** Ver `/docs/TYPESCRIPT_MIGRATION_GUIDE.md`

## 📱 Deploy

Para instruções detalhadas de deploy, consulte o arquivo [DEPLOYMENT.md](./DEPLOYMENT.md).

### Deploy Rápido
```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios

# Ou usando EAS Build (recomendado)
eas build --platform all
```

## 📋 Funcionalidades Implementadas

### Core Features
- [x] Sistema de autenticação completo (Clean Architecture + TypeScript)
- [x] Dashboard para todos os tipos de usuário
- [x] Gerenciamento de alunos e instrutores
- [x] Sistema de pagamentos
- [x] Calendário de aulas
- [x] Acompanhamento de evolução
- [x] Sistema de notificações
- [x] Validação de formulários com Zod
- [x] Tratamento de erros com ErrorBoundary
- [x] Interface responsiva

### Design System
- [x] Design Tokens centralizados (85% do app migrado)
- [x] Componentes acessíveis (WCAG 2.1)
- [x] Sistema de Undo/Redo
- [x] Tours de Onboarding
- [x] Mensagens de erro aprimoradas

### Arquitetura
- [x] Clean Architecture implementada
- [x] TypeScript em camada de domínio
- [x] Interfaces ao invés de classes
- [x] Mappers para conversão de dados
- [x] Use Cases testáveis

## 🚀 Próximas Funcionalidades

- [ ] Sistema de check-in com geolocalização
- [ ] Notificações push
- [ ] Chat entre usuários
- [ ] Relatórios avançados
- [ ] Integração com pagamentos online
- [ ] Sistema de avaliações
- [ ] Backup automático de dados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📊 Análise do Projeto

Para uma análise completa e detalhada do estado atual do projeto:

- **[📋 Resumo Executivo](docs/RESUMO_EXECUTIVO.md)** - Visão geral rápida do projeto
- **[📊 Análise Completa](docs/ANALISE_COMPLETA_PROJETO.md)** - Análise detalhada de arquitetura, funcionalidades, testes e melhorias sugeridas
- **[🚀 Implementação de Prioridades](docs/IMPLEMENTACAO_PRIORIDADES.md)** - Status das melhorias críticas implementadas

### Principais Métricas

- **Nota Geral:** 7.5/10
- **Arquitetura:** 9/10 ✅
- **Funcionalidades:** 8/10 ✅
- **Testes:** 2/10 → 3/10 ⚠️ (em melhoria)
- **TypeScript:** ~15% → ~16% ⚠️ (em migração)

### ✅ Melhorias Recentes

- ✅ **CI/CD Configurado** - Pipeline GitHub Actions com testes automatizados
- ✅ **Sistema de Logging Centralizado** - Logger TypeScript com histórico e contexto
- ✅ **Error Boundaries** - Tratamento de erros melhorado na raiz da aplicação
- ✅ **Testes Adicionados** - Testes para use cases e serviços
- ✅ **Cobertura Configurada** - Jest com thresholds e relatórios

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação do [Expo](https://docs.expo.dev/)
2. Verifique os logs no [Firebase Console](https://console.firebase.google.com)
3. Abra uma issue neste repositório

## 👥 Autores

- Desenvolvido com ❤️ para academias de artes marciais

---

**Academia App** - Transformando o gerenciamento de academias com tecnologia moderna e interface intuitiva.
