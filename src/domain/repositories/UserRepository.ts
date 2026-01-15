import { UserProfile } from '../../types';

/**
 * UserRepository Interface - Domain Layer
 * Define o contrato para operações com usuários
 */
export interface UserRepository {
    /**
     * Busca um usuário por ID
     */
    getUserById(userId: string): Promise<UserProfile | null>;

    /**
     * Cria ou atualiza um usuário
     */
    saveUser(user: UserProfile): Promise<UserProfile>;

    /**
     * Atualiza parcialmente um usuário
     */
    updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;

    /**
     * Remove um usuário
     */
    deleteUser(userId: string): Promise<void>;
}
