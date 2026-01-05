import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Send notification when a new class is created
 * Triggered when a new document is created in gyms/{academiaId}/classes/{classId}
 */
export const sendNewClassNotification = functions
    .region('southamerica-east1') // Use the same region as Firestore
    .firestore
    .document('gyms/{academiaId}/classes/{classId}')
    .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
        try {
            const newClass = snap.data();
            const academiaId = context.params.academiaId;

            console.log(`New class created: ${newClass.name} in gym: ${academiaId}`);

            // Get FCM tokens of users who should receive the notification
            // Query users belonging to this gym
            const usersSnapshot = await admin.firestore()
                .collection('users')
                .where('academiaId', '==', academiaId)
                .where('role', 'in', ['student', 'instructor'])
                .get();

            if (usersSnapshot.empty) {
                console.log('No users found for this gym');
                return null;
            }

            // Collect FCM tokens
            const tokens: string[] = [];
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.fcmToken) {
                    tokens.push(userData.fcmToken);
                }
            });

            if (tokens.length === 0) {
                console.log('No FCM tokens found');
                return null;
            }

            // Prepare notification message
            const message = {
                notification: {
                    title: '🏋️ Nova Aula Adicionada!',
                    body: `Uma nova aula de ${newClass.name} foi adicionada. Confira os horários!`,
                },
                data: {
                    type: 'new_class',
                    classId: context.params.classId,
                    academiaId: academiaId,
                    className: newClass.name,
                },
                tokens: tokens,
            };

            // Send multicast message
            const response = await admin.messaging().sendEachForMulticast(message);

            console.log(`Successfully sent ${response.successCount} messages`);
            console.log(`Failed to send ${response.failureCount} messages`);

            // Remove invalid tokens
            if (response.failureCount > 0) {
                const tokensToRemove: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        tokensToRemove.push(tokens[idx]);
                        console.error(`Error sending to token ${tokens[idx]}:`, resp.error);
                    }
                });

                // Update users to remove invalid tokens
                const batch = admin.firestore().batch();
                for (const token of tokensToRemove) {
                    const userQuery = await admin.firestore()
                        .collection('users')
                        .where('fcmToken', '==', token)
                        .limit(1)
                        .get();

                    if (!userQuery.empty) {
                        batch.update(userQuery.docs[0].ref, { fcmToken: admin.firestore.FieldValue.delete() });
                    }
                }
                await batch.commit();
            }

            return null;
        } catch (error) {
            console.error('Error sending notification:', error);
            return null;
        }
    });
