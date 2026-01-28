import { db } from '@infrastructure/services/firebase';
import { collection, doc, addDoc, getDocs, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';
import notificationService from './notificationService';
import { academyFirestoreService } from './academyFirestoreService';

/**
 * Unified Check-In Service
 * 
 * Centraliza toda a lógica de check-in em uma única localização:
 * /gyms/{academiaId}/checkIns
 * 
 * Suporta dual-write durante migração (Fase 1-2)
 * Remove dual-write após Fase 5
 */

// Feature flag para controlar dual-write
// FASE 5: Dual-write DESABILITADO - Escrever apenas na localização global
const ENABLE_DUAL_WRITE = false; // Mudado de true para false na Fase 5

class CheckInService {
    /**
     * Criar check-in
     * @param {Object} checkInData - Dados do check-in
     * @param {string} academiaId - ID da academia
     * @returns {Promise<string>} ID do check-in criado
     */
    async create(checkInData, academiaId) {
        try {
            const startTime = Date.now();

            // Validações
            if (!academiaId) {
                throw new Error('academiaId é obrigatório');
            }
            if (!checkInData.studentId) {
                throw new Error('studentId é obrigatório');
            }
            if (!checkInData.classId) {
                throw new Error('classId é obrigatório');
            }

            // Preparar dados completos
            const completeData = {
                ...checkInData,
                academiaId,
                date: checkInData.date || new Date().toISOString().split('T')[0],
                timestamp: new Date(),
                verified: checkInData.verified ?? true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            let checkInId;

            if (ENABLE_DUAL_WRITE) {
                // FASE 1-4: Dual-write (escrever em ambas localizações)
                // ⚠️ DESABILITADO NA FASE 5
                checkInId = await this._dualWrite(completeData, academiaId);
            } else {
                // FASE 5+: Single-write (apenas localização global) ✅ ATIVO
                checkInId = await this._singleWrite(completeData, academiaId);
            }

            // Enviar notificação push (Fase 4)
            // Nota: Check-ins manuais do instrutor não geram notificação
            if (checkInData.type !== 'manual' && checkInData.instructorId) {
                await this._sendCheckInNotification(completeData, checkInId);
            }

            // Log de performance
            const duration = Date.now() - startTime;
            console.log(`✅ Check-in criado em ${duration}ms:`, checkInId);

            return checkInId;
        } catch (error) {
            console.error('❌ Erro ao criar check-in:', error);
            throw error;
        }
    }

    /**
     * Dual-write: Escrever em ambas localizações (Fase 1-4)
     * @private
     */
    async _dualWrite(checkInData, academiaId) {
        const batch = writeBatch(db);

        // Write 1: Nova localização (global)
        const globalRef = doc(collection(db, 'gyms', academiaId, 'checkIns'));
        batch.set(globalRef, checkInData);

        // Write 2: Localização legada (subcoleção) - apenas se tiver classId
        if (checkInData.classId) {
            const legacyRef = doc(
                collection(db, 'gyms', academiaId, 'classes', checkInData.classId, 'checkIns'),
                globalRef.id // Usar mesmo ID para facilitar deduplicação
            );
            batch.set(legacyRef, {
                ...checkInData,
                _migratedFrom: 'dual-write' // Flag para identificar origem
            });
        }

        await batch.commit();
        console.log('📝 Dual-write executado:', globalRef.id);

        return globalRef.id;
    }

    /**
     * Single-write: Escrever apenas na localização global (Fase 5+)
     * @private
     */
    async _singleWrite(checkInData, academiaId) {
        const collectionRef = collection(db, 'gyms', academiaId, 'checkIns');
        const docRef = await addDoc(collectionRef, checkInData);

        console.log('📝 Single-write executado:', docRef.id);
        return docRef.id;
    }

    /**
     * Enviar notificação push para instrutor
     * @private
     */
    async _sendCheckInNotification(checkInData, checkInId) {
        try {
            console.log('🔔 [Fase 4] Preparando notificação de check-in...');

            // Buscar preferências de notificação do instrutor
            const instructorPrefs = await this._getNotificationPreferences(checkInData.instructorId);

            // Verificar se notificações de check-in estão habilitadas
            if (!instructorPrefs?.checkInNotifications || !instructorPrefs?.studentCheckInAlert) {
                console.log('🔕 [Fase 4] Instrutor desabilitou notificações de check-in de aluno');
                return;
            }

            // Enviar notificação push
            await notificationService.sendLocalNotification(
                '✅ Novo Check-in',
                `${checkInData.studentName} fez check-in em ${checkInData.className}`,
                {
                    type: 'checkin',
                    userId: checkInData.instructorId,
                    classId: checkInData.classId,
                    studentId: checkInData.studentId,
                    checkInId: checkInId,
                    screen: 'CheckIn'
                }
            );

            // Salvar notificação no Firestore
            await notificationService.saveNotificationToFirestore({
                userId: checkInData.instructorId,
                title: '✅ Novo Check-in',
                message: `${checkInData.studentName} fez check-in em ${checkInData.className}`,
                type: 'checkin',
                data: {
                    classId: checkInData.classId,
                    studentId: checkInData.studentId,
                    checkInId: checkInId
                },
                isRead: false,
                createdAt: new Date()
            });

            console.log('✅ [Fase 4] Notificação enviada para instrutor:', checkInData.instructorId);
        } catch (error) {
            console.error('❌ [Fase 4] Erro ao enviar notificação:', error);
            // Não propagar erro - notificação é não-crítica
        }
    }

    /**
     * Buscar preferências de notificação do usuário
     * @private
     */
    async _getNotificationPreferences(userId) {
        try {
            console.log('🔍 [Fase 4] Buscando preferências de notificação:', userId);

            // Buscar perfil do usuário no Firestore
            const userDoc = await academyFirestoreService.getDocument('users', userId);

            if (!userDoc || !userDoc.notificationSettings) {
                console.log('⚠️ [Fase 4] Preferências não encontradas, usando padrão');
                return {
                    checkInNotifications: true,
                    studentCheckInAlert: true,
                    checkInConfirmation: true,
                    dailyCheckInSummary: false
                };
            }

            const settings = userDoc.notificationSettings;

            // Verificar se notificações de check-in estão habilitadas
            if (!settings.checkInNotifications) {
                console.log('🔕 [Fase 4] Notificações de check-in desabilitadas');
                return {
                    checkInNotifications: false,
                    studentCheckInAlert: false,
                    checkInConfirmation: false,
                    dailyCheckInSummary: false
                };
            }

            console.log('✅ [Fase 4] Preferências carregadas:', {
                checkInNotifications: settings.checkInNotifications,
                studentCheckInAlert: settings.studentCheckInAlert,
                checkInConfirmation: settings.checkInConfirmation,
                dailyCheckInSummary: settings.dailyCheckInSummary
            });

            return {
                checkInNotifications: settings.checkInNotifications ?? true,
                studentCheckInAlert: settings.studentCheckInAlert ?? true,
                checkInConfirmation: settings.checkInConfirmation ?? true,
                dailyCheckInSummary: settings.dailyCheckInSummary ?? false
            };
        } catch (error) {
            console.error('❌ [Fase 4] Erro ao buscar preferências:', error);
            // Em caso de erro, retornar padrão habilitado
            return {
                checkInNotifications: true,
                studentCheckInAlert: true,
                checkInConfirmation: true,
                dailyCheckInSummary: false
            };
        }
    }

    /**
     * Buscar check-ins por turma
     * @param {string} classId - ID da turma
     * @param {string} academiaId - ID da academia
     * @param {string} date - Data no formato YYYY-MM-DD (opcional)
     * @returns {Promise<Array>} Lista de check-ins
     */
    async getByClass(classId, academiaId, date = null) {
        try {
            const collectionRef = collection(db, 'gyms', academiaId, 'checkIns');

            let q = query(
                collectionRef,
                where('classId', '==', classId),
                orderBy('timestamp', 'desc')
            );

            // Filtrar por data se fornecida
            if (date) {
                q = query(q, where('date', '==', date));
            }

            const snapshot = await getDocs(q);

            const checkIns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`📊 ${checkIns.length} check-ins encontrados para turma ${classId}`);
            return checkIns;
        } catch (error) {
            console.error('❌ Erro ao buscar check-ins por turma:', error);
            throw error;
        }
    }

    /**
     * Buscar check-ins por aluno
     * @param {string} studentId - ID do aluno
     * @param {string} academiaId - ID da academia
     * @param {number} limitCount - Limite de resultados
     * @returns {Promise<Array>} Lista de check-ins
     */
    async getByStudent(studentId, academiaId, limitCount = 10) {
        try {
            const collectionRef = collection(db, 'gyms', academiaId, 'checkIns');

            const q = query(
                collectionRef,
                where('studentId', '==', studentId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            const checkIns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`📊 ${checkIns.length} check-ins encontrados para aluno ${studentId}`);
            return checkIns;
        } catch (error) {
            console.error('❌ Erro ao buscar check-ins por aluno:', error);
            throw error;
        }
    }

    /**
     * Buscar check-ins por instrutor
     * @param {string} instructorId - ID do instrutor
     * @param {string} academiaId - ID da academia
     * @param {string} date - Data no formato YYYY-MM-DD (opcional)
     * @returns {Promise<Array>} Lista de check-ins
     */
    async getByInstructor(instructorId, academiaId, date = null) {
        try {
            const collectionRef = collection(db, 'gyms', academiaId, 'checkIns');

            let q = query(
                collectionRef,
                where('instructorId', '==', instructorId),
                orderBy('timestamp', 'desc')
            );

            if (date) {
                q = query(q, where('date', '==', date));
            }

            const snapshot = await getDocs(q);

            const checkIns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`📊 ${checkIns.length} check-ins encontrados para instrutor ${instructorId}`);
            return checkIns;
        } catch (error) {
            console.error('❌ Erro ao buscar check-ins por instrutor:', error);
            throw error;
        }
    }

    /**
     * Verificar se aluno já fez check-in hoje
     * @param {string} studentId - ID do aluno
     * @param {string} classId - ID da turma
     * @param {string} academiaId - ID da academia
     * @returns {Promise<boolean>} True se já fez check-in
     */
    async hasCheckedInToday(studentId, classId, academiaId) {
        try {
            const today = new Date().toISOString().split('T')[0];

            const collectionRef = collection(db, 'gyms', academiaId, 'checkIns');

            const q = query(
                collectionRef,
                where('studentId', '==', studentId),
                where('classId', '==', classId),
                where('date', '==', today),
                limit(1)
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('❌ Erro ao verificar check-in:', error);
            return false;
        }
    }

    /**
     * Buscar estatísticas de check-in
     * @param {string} academiaId - ID da academia
     * @param {string} startDate - Data inicial (YYYY-MM-DD)
     * @param {string} endDate - Data final (YYYY-MM-DD)
     * @returns {Promise<Object>} Estatísticas
     */
    async getStatistics(academiaId, startDate, endDate) {
        try {
            const collectionRef = collection(db, 'gyms', academiaId, 'checkIns');

            const q = query(
                collectionRef,
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'desc')
            );

            const snapshot = await getDocs(q);
            const checkIns = snapshot.docs.map(doc => doc.data());

            // Calcular estatísticas
            const stats = {
                total: checkIns.length,
                byType: {},
                byClass: {},
                byDay: {},
                uniqueStudents: new Set(checkIns.map(c => c.studentId)).size
            };

            checkIns.forEach(checkIn => {
                // Por tipo
                stats.byType[checkIn.type] = (stats.byType[checkIn.type] || 0) + 1;

                // Por turma
                stats.byClass[checkIn.className] = (stats.byClass[checkIn.className] || 0) + 1;

                // Por dia
                stats.byDay[checkIn.date] = (stats.byDay[checkIn.date] || 0) + 1;
            });

            console.log('📊 Estatísticas calculadas:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas:', error);
            throw error;
        }
    }
}

export const checkInService = new CheckInService();
export default checkInService;
