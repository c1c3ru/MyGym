import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Send class reminder notifications
 * Scheduled to run every hour to check for upcoming classes
 */
export const sendClassReminder = functions
    .region('southamerica-east1')
    .pubsub
    .schedule('0 * * * *') // Every hour
    .timeZone('America/Sao_Paulo')
    .onRun(async (context: functions.EventContext) => {
        try {
            console.log('Running class reminder job...');

            const now = new Date();
            const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            // Find classes starting in the next 2 hours
            const classesSnapshot = await admin.firestore()
                .collectionGroup('classes')
                .where('startTime', '>=', now)
                .where('startTime', '<=', twoHoursFromNow)
                .get();

            if (classesSnapshot.empty) {
                console.log('No upcoming classes found');
                return null;
            }

            const notifications: Promise<any>[] = [];

            for (const classDoc of classesSnapshot.docs) {
                const classData = classDoc.data();

                // Get enrolled students
                if (!classData.enrolledStudents || classData.enrolledStudents.length === 0) {
                    continue;
                }

                for (const studentId of classData.enrolledStudents) {
                    const userDoc = await admin.firestore()
                        .collection('users')
                        .doc(studentId)
                        .get();

                    if (!userDoc.exists) continue;

                    const userData = userDoc.data();
                    if (!userData || !userData.fcmToken) continue;

                    const timeUntilClass = Math.round((classData.startTime.toDate().getTime() - now.getTime()) / (1000 * 60));

                    const message = {
                        notification: {
                            title: '⏰ Lembrete de Aula',
                            body: `Sua aula de ${classData.name} começa em ${timeUntilClass} minutos!`,
                        },
                        data: {
                            type: 'class_reminder',
                            classId: classDoc.id,
                            className: classData.name,
                            startTime: classData.startTime.toDate().toISOString(),
                        },
                        token: userData.fcmToken,
                    };

                    notifications.push(admin.messaging().send(message));
                }
            }

            const results = await Promise.allSettled(notifications);
            const successCount = results.filter(r => r.status === 'fulfilled').length;

            console.log(`Sent ${successCount} class reminders out of ${notifications.length}`);

            return null;
        } catch (error) {
            console.error('Error sending class reminders:', error);
            return null;
        }
    });
