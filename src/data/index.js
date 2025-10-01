// Data Layer Exports

// Repository Implementations (Clean Architecture)
export { FirebaseAuthRepository } from './auth/FirebaseAuthRepository';
export { AuthMappers } from './auth/mappers';
export { AuthValidators } from './auth/validators';

// Legacy exports (deprecated - use Clean Architecture above)
// Note: FirestoreUserDataSource and UserModel were moved to backup
// Use FirebaseAuthRepository instead