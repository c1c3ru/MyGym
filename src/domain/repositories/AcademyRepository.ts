import { Academy } from '../entities/Academy';

/**
 * AcademyRepository Interface - Domain Layer
 * Define o contrato para operações com academias
 */
export interface AcademyRepository {
    /**
     * Busca uma academia por ID
     */
    getAcademyById(academyId: string): Promise<Academy | null>;

    /**
     * Busca academias por filtros
     */
    getAcademies(filters?: Record<string, any>): Promise<Academy[]>;

    /**
     * Cria ou atualiza uma academia
     */
    saveAcademy(academy: Academy): Promise<Academy>;

    /**
     * Atualiza parcialmente uma academia
     */
    updateAcademy(academyId: string, updates: Partial<Academy>): Promise<Academy>;

    /**
     * Remove uma academia
     */
    deleteAcademy(academyId: string): Promise<void>;
}
