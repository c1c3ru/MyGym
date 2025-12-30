/**
 * Interface representando um estudante no sistema
 */
export interface Student {
    /** ID único do estudante */
    id: string;
    /** Nome completo */
    name: string;
    /** E-mail de contato */
    email: string;
    /** Telefone de contato (opcional) */
    phone?: string;
    /** Indica se o estudante está ativo */
    isActive?: boolean;
    /** Status do pagamento atual */
    paymentStatus?: 'paid' | 'pending' | 'overdue' | string;
    /** Graduação atual (ex: faixa branca, azul) */
    currentGraduation?: string;
    /** Plano atual (ex: mensal, anual) */
    currentPlan?: string;
    /** Total de pagamentos realizados */
    totalPayments?: number;
    /** Data do último pagamento (formato Firestore) */
    lastPaymentDate?: {
        seconds: number;
        nanoseconds: number;
    };
    /** Lista de modalidades que o aluno pratica */
    modalities?: string[];
    /** Tipo de usuário (opcional) */
    userType?: string;
}
