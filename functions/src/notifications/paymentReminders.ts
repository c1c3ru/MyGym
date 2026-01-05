import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Send payment reminder notifications
 * Scheduled to run daily at 9 AM (Brazil time)
 */
export const sendPaymentReminder = functions
    .region('southamerica-east1')
    .pubsub
    .schedule('0 9 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async (context: functions.EventContext) => {
        try {
            console.log('Running payment reminder job...');

            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            // Find payments due in the next 3 days
            const paymentsSnapshot = await admin.firestore()
                .collectionGroup('payments')
                .where('status', '==', 'pending')
                .where('dueDate', '<=', threeDaysFromNow)
                .where('dueDate', '>=', now)
                .get();

            if (paymentsSnapshot.empty) {
                console.log('No pending payments found');
                return null;
            }

            const notifications: Promise<any>[] = [];

            for (const paymentDoc of paymentsSnapshot.docs) {
                const payment = paymentDoc.data();

                // Get user data
                const userDoc = await admin.firestore()
                    .collection('users')
                    .doc(payment.userId)
                    .get();

                if (!userDoc.exists) continue;

                const userData = userDoc.data();
                if (!userData || !userData.fcmToken) continue;

                const daysUntilDue = Math.ceil((payment.dueDate.toDate().getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                const message = {
                    notification: {
                        title: '💳 Lembrete de Pagamento',
                        body: `Seu pagamento de R$ ${payment.amount.toFixed(2)} vence em ${daysUntilDue} dia(s)!`,
                    },
                    data: {
                        type: 'payment_reminder',
                        paymentId: paymentDoc.id,
                        amount: payment.amount.toString(),
                        dueDate: payment.dueDate.toDate().toISOString(),
                    },
                    token: userData.fcmToken,
                };

                notifications.push(admin.messaging().send(message));
            }

            const results = await Promise.allSettled(notifications);
            const successCount = results.filter(r => r.status === 'fulfilled').length;

            console.log(`Sent ${successCount} payment reminders out of ${notifications.length}`);

            return null;
        } catch (error) {
            console.error('Error sending payment reminders:', error);
            return null;
        }
    });
