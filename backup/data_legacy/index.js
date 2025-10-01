// Domain Layer Exports
// Entities
export { User } from './entities/User.js';
export { Academy } from './entities/Academy.js';
export { AuthCredentials, AuthResult } from './entities/AuthCredentials.js';
export { Student } from './students/entities';

// Repository Interfaces
export { UserRepository } from './repositories/UserRepository.js';
export { AcademyRepository } from './repositories/AcademyRepository.js';

// Use Cases
export { SignInUseCase } from './usecases/SignInUseCase.js';
export { SignUpUseCase } from './usecases/SignUpUseCase.js';
export { SignOutUseCase } from './usecases/SignOutUseCase.js';
export { RefreshTokenUseCase } from './usecases/RefreshTokenUseCase.js';

// Nova arquitetura Clean Architecture (TypeScript)
export { GetUserSessionUseCase } from './auth/usecases/GetUserSession';