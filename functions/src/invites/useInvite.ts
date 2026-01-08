import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Tipos para o sistema de convites
 */
interface InviteData {
    inviteToken: string;
    status: 'pending' | 'accepted' | 'expired';
    academiaId: string;
    tipo: string;
    expiresAt?: admin.firestore.Timestamp;
    createdAt: admin.firestore.Timestamp;
    createdBy: string;
}

interface UseInviteRequest {
    inviteCode: string;
}

interface UseInviteResponse {
    success: boolean;
    academiaId: string;
    inviteId: string;
    role: string;
    message: string;
}

/**
 * Mensagens de erro internacionalizadas
 * TODO: Integrar com o sistema de i18n quando disponível no backend
 */
const ERROR_MESSAGES = {
    pt: {
        unauthenticated: 'Usuário deve estar autenticado para usar um convite',
        inviteRequired: 'Código de convite é obrigatório',
        inviteInvalid: 'Código de convite inválido ou já utilizado',
        inviteExpired: 'Este convite expirou',
        inviteAccepted: 'Convite aceito com sucesso',
        processingError: 'Erro ao processar o convite',
    },
    en: {
        unauthenticated: 'User must be authenticated to use an invite',
        inviteRequired: 'Invite code is required',
        inviteInvalid: 'Invalid or already used invite code',
        inviteExpired: 'This invite has expired',
        inviteAccepted: 'Invite accepted successfully',
        processingError: 'Error processing invite',
    },
    es: {
        unauthenticated: 'El usuario debe estar autenticado para usar una invitación',
        inviteRequired: 'El código de invitación es obligatorio',
        inviteInvalid: 'Código de invitación inválido o ya utilizado',
        inviteExpired: 'Esta invitación ha expirado',
        inviteAccepted: 'Invitación aceptada con éxito',
        processingError: 'Error al procesar la invitación',
    },
};

/**
 * Obtém mensagens de erro no idioma apropriado
 * @param language - Código do idioma ('pt', 'en', 'es')
 */
const getMessages = (language: 'pt' | 'en' | 'es' = 'pt') => {
    return ERROR_MESSAGES[language] || ERROR_MESSAGES.pt;
};

/**
 * Cloud Function para validar e usar um código de convite
 * 
 * Esta função:
 * 1. Valida a autenticação do usuário
 * 2. Busca o convite pelo código (token) em todas as academias
 * 3. Verifica se o convite é válido e não expirou
 * 4. Associa o usuário à academia com o papel (role) especificado no convite
 * 5. Marca o convite como aceito
 * 
 * @param data - Dados da requisição contendo o código do convite
 * @param context - Contexto da função incluindo informações de autenticação
 * @returns Objeto com informações sobre o sucesso da operação
 */
export const useInvite = functions.https.onCall(
    async (data: UseInviteRequest, context): Promise<UseInviteResponse> => {
        // Detectar idioma do usuário (pode ser expandido futuramente)
        const language: 'pt' | 'en' | 'es' = 'pt';
        const messages = getMessages(language);

        // 1. Verificar autenticação
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                messages.unauthenticated
            );
        }

        const { inviteCode } = data;
        const userId = context.auth.uid;

        // 2. Validar dados de entrada
        if (!inviteCode || inviteCode.trim() === '') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                messages.inviteRequired
            );
        }

        try {
            const db = admin.firestore();

            // 3. Buscar o convite globalmente usando collectionGroup
            // Os convites estão em subcoleções: gyms/{gymId}/invites
            const invitesSnapshot = await db
                .collectionGroup('invites')
                .where('inviteToken', '==', inviteCode.trim())
                .where('status', '==', 'pending')
                .limit(1)
                .get();

            // 4. Verificar se o convite existe
            if (invitesSnapshot.empty) {
                throw new functions.https.HttpsError(
                    'not-found',
                    messages.inviteInvalid
                );
            }

            const inviteDoc = invitesSnapshot.docs[0];
            const inviteData = inviteDoc.data() as InviteData;
            const academiaId = inviteData.academiaId;

            // 5. Verificar expiração do convite
            if (inviteData.expiresAt) {
                const now = new Date();
                const expirationDate = inviteData.expiresAt.toDate();

                if (expirationDate < now) {
                    // Marcar convite como expirado
                    await inviteDoc.ref.update({
                        status: 'expired',
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    throw new functions.https.HttpsError(
                        'failed-precondition',
                        messages.inviteExpired
                    );
                }
            }

            // 6. Associar usuário à academia
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                academiaId: academiaId,
                userType: inviteData.tipo || 'aluno',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 7. Marcar convite como aceito
            await inviteDoc.ref.update({
                status: 'accepted',
                acceptedBy: userId,
                acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 8. Log da operação para auditoria
            console.log(`Convite aceito com sucesso`, {
                userId,
                inviteId: inviteDoc.id,
                academiaId,
                role: inviteData.tipo || 'aluno',
                timestamp: new Date().toISOString(),
            });

            // 9. Retornar sucesso
            return {
                success: true,
                academiaId: academiaId,
                inviteId: inviteDoc.id,
                role: inviteData.tipo || 'aluno',
                message: messages.inviteAccepted,
            };
        } catch (error) {
            // Log detalhado do erro para debugging
            console.error('Erro ao processar convite:', {
                error,
                userId: context.auth?.uid,
                inviteCode: inviteCode.substring(0, 8) + '...', // Log parcial por segurança
                timestamp: new Date().toISOString(),
            });

            // Re-lançar erros HttpsError
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }

            // Tratar outros erros
            const errorMessage =
                error instanceof Error ? error.message : messages.processingError;

            throw new functions.https.HttpsError(
                'internal',
                `${messages.processingError}: ${errorMessage}`
            );
        }
    }
);
