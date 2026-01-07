import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function para validar e usar um código de convite
 * 
 * Esta função:
 * 1. Busca o convite pelo código (token) em todas as academias
 * 2. Verifica se o convite é válido e não expirou
 * 3. Associa o usuário à academia com o papel (role) especificado no convite
 * 4. Marca o convite como aceito
 */
export const useInvite = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário deve estar autenticado para usar um convite'
        );
    }

    const { inviteCode } = data;
    const userId = context.auth.uid;

    if (!inviteCode) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Código de convite é obrigatório'
        );
    }

    try {
        const db = admin.firestore();

        // 1. Buscar o convite globalmente
        // Como os convites estão em subcoleções gyms/{gymId}/invites, 
        // precisamos usar uma collection group query ou buscar em todas as academias.
        // Para performance, vamos usar collectionGroup.

        const invitesSnapshot = await db.collectionGroup('invites')
            .where('inviteToken', '==', inviteCode)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (invitesSnapshot.empty) {
            // Tentar buscar por ID do documento como fallback (caso o token seja o ID)
            // Mas como é collectionGroup, não podemos buscar por ID facilmente sem o path.
            throw new functions.https.HttpsError(
                'not-found',
                'Código de convite inválido ou já utilizado'
            );
        }

        const inviteDoc = invitesSnapshot.docs[0];
        const inviteData = inviteDoc.data();
        const academiaId = inviteData.academiaId;

        // 2. Verificar expiração
        if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
            await inviteDoc.ref.update({ status: 'expired' });
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Este convite expirou'
            );
        }

        // 3. Associar usuário à academia
        // Atualizar o perfil do usuário
        await db.collection('users').doc(userId).update({
            academiaId: academiaId,
            userType: inviteData.tipo || 'aluno',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 4. Marcar convite como aceito
        await inviteDoc.ref.update({
            status: 'accepted',
            acceptedBy: userId,
            acceptedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 5. Opcional: Adicionar usuário à lista de membros da academia se houver uma

        return {
            success: true,
            academiaId: academiaId,
            inviteId: inviteDoc.id,
            role: inviteData.tipo || 'aluno',
            message: 'Convite aceito com sucesso'
        };

    } catch (error) {
        console.error('Erro ao processar convite:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError(
            'internal',
            'Erro ao processar o convite: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
        );
    }
});
