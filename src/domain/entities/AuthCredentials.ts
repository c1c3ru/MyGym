/**
 * AuthCredentials Entity - Domain Model
 * Representa as credenciais de autenticação
 */
export interface AuthCredentialsProps {
    email: string;
    password?: string;
}

export class AuthCredentials {
    email: string;
    password?: string;

    constructor({ email, password }: AuthCredentialsProps) {
        this.email = email;
        this.password = password;
    }

    /**
     * Valida se as credenciais são válidas
     */
    isValid(): boolean {
        return !!(this.email && this.password && this.email.includes('@'));
    }

    /**
     * Converte para objeto plain JavaScript
     */
    toJSON(): AuthCredentialsProps {
        return {
            email: this.email,
            password: this.password
        };
    }
}

/**
 * AuthResult Entity - Domain Model
 * Representa o resultado de uma operação de autenticação
 */
export interface AuthResultProps {
    user: any; // Ideally this should be User entity
    success: boolean;
    error?: any;
    customClaims?: Record<string, any>;
}

export class AuthResult {
    user: any;
    success: boolean;
    error?: any;
    customClaims?: Record<string, any>;

    constructor({ user, success, error, customClaims }: AuthResultProps) {
        this.user = user;
        this.success = success;
        this.error = error;
        this.customClaims = customClaims;
    }

    /**
     * Verifica se a autenticação foi bem-sucedida
     */
    isSuccess(): boolean {
        return !!(this.success && this.user && !this.error);
    }

    /**
     * Converte para objeto plain JavaScript
     */
    toJSON(): AuthResultProps {
        return {
            user: this.user,
            success: this.success,
            error: this.error,
            customClaims: this.customClaims
        };
    }
}
