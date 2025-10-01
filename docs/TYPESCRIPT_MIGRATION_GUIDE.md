# Guia de Migração para Interfaces TypeScript

## 📋 Visão Geral

Este documento descreve a migração completa das **classes JavaScript legacy** para **interfaces TypeScript** no projeto MyGym, seguindo os princípios da Clean Architecture.

## ✅ Status da Migração

### FASE 1: Remoção de Classes Legacy ✅ COMPLETO

**Arquivos Removidos:**
- ❌ `/src/domain/entities/AuthSession.js` (classe sem `userProfile`)
- ❌ `/src/domain/entities/User.js` (classe com `uid` ao invés de `id`)
- ❌ `/src/domain/entities/Claims.js` (classe ao invés de interface)

**Arquivos Movidos para Backup:**
- ✅ Use cases legacy (4 arquivos) → `/backup/domain_usecases_legacy/`
- ✅ Data sources legacy (2 arquivos) → `/backup/data_legacy/`
- ✅ DI Container legacy (1 arquivo) → `/backup/data_legacy/`
- ✅ Hooks legacy (1 arquivo) → `/backup/data_legacy/`

### FASE 2: Correção de Imports ✅ COMPLETO

**Use Cases Corrigidos (6 arquivos):**
1. ✅ `SignInWithEmail.ts` - AuthSession de `@domain/entities` → `../entities`
2. ✅ `SignUpWithEmail.ts` - AuthSession e UserType de `@domain/entities` → `../entities`
3. ✅ `GetUserSession.ts` - AuthSession e User de `@domain/entities` → `../entities`
4. ✅ `RefreshUserToken.ts` - User e Claims de `@domain/entities` → `../entities`
5. ✅ `SendPasswordResetEmail.ts` - AuthRepository de `@domain/repositories` → `../repositories`
6. ✅ `SignOut.ts` - AuthRepository de `@domain/repositories` → `../repositories`

**Arquivos de Índice Atualizados:**
- ✅ `/src/domain/entities/index.ts` - Removidas exportações de User, AuthSession, Claims

### FASE 3: Adaptação de Código JavaScript ✅ COMPLETO

**Script Criado:**
- ✅ `/scripts/adapt-to-typescript-interfaces.js`

**Adaptações Automáticas Aplicadas (33 arquivos):**

| Padrão Legacy | Padrão TypeScript | Arquivos Afetados |
|---------------|-------------------|-------------------|
| `user.uid` | `user.id` | 33 arquivos |
| `.isAdmin()` | `.userType === 'admin'` | 0 (não usado) |
| `.isInstructor()` | `.userType === 'instructor'` | 0 (não usado) |
| `.isStudent()` | `.userType === 'student'` | 0 (não usado) |
| `.toObject()` | (removido) | 0 (não usado) |
| `.toJSON()` | (removido) | 0 (não usado) |

**Arquivos Adaptados:**
- ✅ CheckInButton.js (2 mudanças)
- ✅ PaymentDueDateEditor.js (2 mudanças)
- ✅ StudentDisassociationDialog.js (5 mudanças)
- ✅ AuthContext.js (3 mudanças)
- ✅ NotificationContext.js (7 mudanças)
- ✅ useAnalytics.js (1 mudança)
- ✅ useAuthMigration.js (3 mudanças)
- ✅ CheckIn.js (14 mudanças)
- ✅ InstructorClasses.js (10 mudanças)
- ✅ InstructorDashboard.js (4 mudanças)
- ✅ InstructorStudents.js (9 mudanças)
- ✅ Relatorios.js (6 mudanças)
- ✅ ScheduleClassesScreen.js (3 mudanças)
- ✅ StudentDashboard.js (8 mudanças)
- ✅ E mais 19 arquivos...

## 📚 Interfaces TypeScript Corretas

### User (Interface)

```typescript
// Localização: /src/domain/auth/entities.ts
export interface User {
  readonly id: string;                    // ✅ id (não uid)
  readonly email: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly phoneNumber?: string;
  readonly providerId?: string;
  readonly isAnonymous?: boolean;
  readonly metadata?: {
    readonly creationTime?: string;
    readonly lastSignInTime?: string;
  };
  readonly providerData?: ReadonlyArray<{
    readonly uid: string;
    readonly email?: string;
    readonly displayName?: string;
    readonly photoURL?: string;
    readonly providerId: string;
    readonly phoneNumber?: string;
  }>;
  readonly refreshToken?: string;
  readonly tenantId?: string;
  readonly createdAt: Date;
  readonly lastSignInAt?: Date;
  readonly updatedAt?: Date;
}
```

### UserProfile (Interface)

```typescript
// Localização: /src/domain/auth/entities.ts
export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly userType: UserType;            // ✅ 'student' | 'instructor' | 'admin'
  readonly academiaId?: string;
  readonly isActive: boolean;
  readonly profileCompleted: boolean;
  readonly photoURL?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  readonly address?: {
    readonly street?: string;
    readonly city?: string;
    readonly state?: string;
    readonly zipCode?: string;
    readonly country?: string;
  };
  readonly emergencyContact?: {
    readonly name: string;
    readonly phone: string;
    readonly relationship: string;
  };
  readonly medicalInfo?: {
    readonly allergies?: string[];
    readonly medications?: string[];
    readonly conditions?: string[];
    readonly notes?: string;
  };
  readonly currentGraduation?: string;
  readonly graduations: string[];
  readonly classIds: string[];
  readonly instructorIds?: string[];
  readonly preferences?: {
    readonly notifications: {
      readonly email: boolean;
      readonly push: boolean;
      readonly sms: boolean;
    };
    readonly language: string;
    readonly timezone: string;
  };
  readonly stats?: {
    readonly totalClasses: number;
    readonly totalHours: number;
    readonly streak: number;
    readonly lastActivity?: Date;
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt?: Date;
}
```

### AuthSession (Interface)

```typescript
// Localização: /src/domain/auth/entities.ts
export interface AuthSession {
  readonly user: User;
  readonly userProfile: UserProfile;      // ✅ Inclui userProfile
  readonly claims: Claims;
  readonly academia?: Academia;
}
```

### Claims (Interface)

```typescript
// Localização: /src/domain/auth/entities.ts
export interface Claims {
  readonly role: string;
  readonly academiaId?: string;
  readonly permissions?: string[];
  readonly customClaims?: Record<string, any>;
  readonly issuedAt?: Date;
  readonly expiresAt?: Date;
  readonly issuer?: string;
  readonly audience?: string;
  readonly subject?: string;
  readonly scopes?: string[];
  readonly metadata?: Record<string, any>;
}
```

## 🔄 Como Usar as Interfaces

### ✅ CORRETO - Criar objetos com interfaces

```typescript
// Criar User
const user: User = {
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  emailVerified: firebaseUser.emailVerified,
  createdAt: new Date(),
  lastSignInAt: new Date()
};

// Criar UserProfile
const userProfile: UserProfile = {
  id: userId,
  name: 'João Silva',
  email: 'joao@example.com',
  userType: 'student',
  isActive: true,
  profileCompleted: true,
  graduations: [],
  classIds: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Criar AuthSession
const session: AuthSession = {
  user,
  userProfile,
  claims: {
    role: 'student',
    academiaId: 'abc123'
  },
  academia: {
    id: 'abc123',
    name: 'Academia XYZ',
    isActive: true
  }
};
```

### ❌ INCORRETO - Usar classes legacy

```javascript
// ❌ NÃO FAZER ISSO
const user = new User(uid, email, name, ...);
const session = new AuthSession({ user, token, ... });

// ❌ NÃO FAZER ISSO
if (user.isAdmin()) { ... }
if (user.isInstructor()) { ... }

// ❌ NÃO FAZER ISSO
const obj = user.toObject();
const json = user.toJSON();
```

### ✅ CORRETO - Verificar tipo de usuário

```typescript
// ✅ Usar userProfile.userType
if (userProfile.userType === 'admin') {
  // Lógica de admin
}

if (userProfile.userType === 'instructor') {
  // Lógica de instrutor
}

if (userProfile.userType === 'student') {
  // Lógica de aluno
}
```

### ✅ CORRETO - Acessar propriedades

```typescript
// ✅ user.id (não user.uid)
const userId = user.id;

// ✅ Acessar diretamente (não precisa de .toObject())
const userData = {
  id: user.id,
  email: user.email,
  name: userProfile.name
};
```

## 🛠️ Mappers (Data Layer)

Os mappers convertem dados do Firebase para as interfaces TypeScript:

```typescript
// /src/data/auth/mappers.ts
export class AuthMappers {
  static toDomainUser(firebaseUser: FirebaseUserData): User {
    return {
      id: firebaseUser.uid,              // ✅ Firebase uid → Domain id
      email: firebaseUser.email || '',
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(firebaseUser.metadata?.creationTime || Date.now()),
      lastSignInAt: firebaseUser.metadata?.lastSignInTime 
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : undefined
    };
  }

  static toDomainUserProfile(firestoreData: FirestoreUserProfileData): UserProfile {
    return {
      id: firestoreData.id,
      name: firestoreData.name,
      email: firestoreData.email,
      phone: firestoreData.phone,
      userType: firestoreData.userType,
      academiaId: firestoreData.academiaId,
      isActive: firestoreData.isActive,
      profileCompleted: firestoreData.profileCompleted ?? false,
      currentGraduation: firestoreData.currentGraduation,
      graduations: firestoreData.graduations || [],
      classIds: firestoreData.classIds || [],
      createdAt: this.toDate(firestoreData.createdAt),
      updatedAt: this.toDate(firestoreData.updatedAt)
    };
  }
}
```

## 📝 Checklist de Migração

### Para Novos Arquivos TypeScript

- [ ] Importar interfaces de `@domain/auth/entities`
- [ ] Usar `user.id` ao invés de `user.uid`
- [ ] Usar `userProfile.userType` ao invés de métodos `.isAdmin()`
- [ ] Criar objetos literais ao invés de `new Class()`
- [ ] Não usar `.toObject()` ou `.toJSON()`

### Para Arquivos JavaScript Existentes

- [ ] Executar script de adaptação: `node scripts/adapt-to-typescript-interfaces.js`
- [ ] Verificar se `user.uid` foi substituído por `user.id`
- [ ] Testar funcionalidades afetadas
- [ ] Remover imports de classes legacy

## 🔍 Verificação

### Verificar se há classes legacy sendo usadas:

```bash
# Procurar por imports incorretos
grep -r "from '@domain/entities'" src/

# Procurar por uso de .uid
grep -r "\.uid" src/presentation/

# Procurar por métodos legacy
grep -r "\.isAdmin()\|\.isInstructor()\|\.isStudent()" src/
```

### Executar testes:

```bash
# Testes TypeScript
npx tsc --noEmit

# Testes Jest
npm test
```

## 📊 Benefícios da Migração

✅ **Type Safety**: TypeScript garante tipos corretos em tempo de compilação
✅ **Imutabilidade**: Interfaces com `readonly` previnem mutações acidentais
✅ **Clean Architecture**: Separação clara entre domain, data e presentation
✅ **Manutenibilidade**: Código mais limpo e fácil de entender
✅ **Escalabilidade**: Interfaces podem ser estendidas facilmente
✅ **Performance**: Objetos literais são mais leves que instâncias de classes
✅ **Consistência**: Uma única fonte de verdade para tipos

## 🚀 Próximos Passos

1. ✅ Remover classes legacy
2. ✅ Corrigir imports nos use cases
3. ✅ Adaptar código JavaScript
4. ⏳ Converter arquivos JavaScript para TypeScript (opcional)
5. ⏳ Adicionar testes unitários para interfaces
6. ⏳ Documentar padrões de uso

## 📚 Referências

- [TypeScript Handbook - Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**Última atualização:** 2025-10-01
**Status:** ✅ Migração Completa
