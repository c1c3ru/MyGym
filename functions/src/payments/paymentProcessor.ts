import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface PaymentData {
    paymentMethodId: string;
    amount: number;
    currency: string;
    studentId: string;
    academiaId: string;
    description?: string;
    planId?: string;
}

interface PaymentResult {
    success: boolean;
    message: string;
    transactionId?: string;
    paymentId?: string;
    error?: string;
}

/**
 * Cloud Function: Process payment transactions
 * This is a template - integrate with your payment provider (Stripe, Mercado Pago, etc.)
 */
export const processPayment = functions
    .region('southamerica-east1')
    .https
    .onCall(async (data: PaymentData, context: functions.https.CallableContext): Promise<PaymentResult> => {
        try {
            // Verify authentication
            if (!context.auth) {
                throw new functions.https.HttpsError(
                    'unauthenticated',
                    'User must be authenticated to process payment'
                );
            }

            const { paymentMethodId, amount, currency, studentId, academiaId, description, planId } = data;

            // Validate input
            if (!paymentMethodId || !amount || !currency || !studentId || !academiaId) {
                throw new functions.https.HttpsError(
                    'invalid-argument',
                    'Missing required payment parameters'
                );
            }

            // Verify user permissions (admin or the student themselves)
            const userDoc = await admin.firestore()
                .collection('users')
                .doc(context.auth.uid)
                .get();

            const userData = userDoc.data();
            const isAdmin = userData?.role === 'admin';
            const isOwnPayment = context.auth.uid === studentId;

            if (!isAdmin && !isOwnPayment) {
                throw new functions.https.HttpsError(
                    'permission-denied',
                    'You do not have permission to process this payment'
                );
            }

            // Get student data
            const studentDoc = await admin.firestore()
                .collection('users')
                .doc(studentId)
                .get();

            if (!studentDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Student not found'
                );
            }

            const studentData = studentDoc.data();

            // TODO: Integrate with payment provider
            // Example for Mercado Pago:
            /*
            const mercadopago = require('mercadopago');
            mercadopago.configure({
              access_token: functions.config().mercadopago.access_token
            });
      
            const payment = await mercadopago.payment.create({
              transaction_amount: amount,
              description: description || 'Pagamento MyGym',
              payment_method_id: paymentMethodId,
              payer: {
                email: studentData.email,
                first_name: studentData.name,
              }
            });
            */

            // For now, simulate payment processing
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create payment record in Firestore
            const paymentRef = await admin.firestore()
                .collection('gyms')
                .doc(academiaId)
                .collection('payments')
                .add({
                    studentId: studentId,
                    studentName: studentData?.name || 'Unknown',
                    amount: amount,
                    currency: currency,
                    description: description || 'Pagamento de mensalidade',
                    planId: planId || null,
                    paymentMethodId: paymentMethodId,
                    transactionId: transactionId,
                    status: 'completed', // In production: 'pending', 'completed', 'failed'
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    createdBy: context.auth.uid,
                    metadata: {
                        processedAt: new Date().toISOString(),
                        ipAddress: context.rawRequest?.ip || 'unknown',
                    }
                });

            // Update student's payment history
            await studentDoc.ref.update({
                lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
                totalPaid: admin.firestore.FieldValue.increment(amount),
            });

            // Send confirmation notification
            if (studentData?.fcmToken) {
                await admin.messaging().send({
                    notification: {
                        title: '✅ Pagamento Confirmado',
                        body: `Seu pagamento de ${currency} ${amount.toFixed(2)} foi processado com sucesso!`,
                    },
                    data: {
                        type: 'payment_confirmed',
                        paymentId: paymentRef.id,
                        amount: amount.toString(),
                    },
                    token: studentData.fcmToken,
                }).catch(error => {
                    console.error('Error sending payment confirmation:', error);
                });
            }

            console.log(`Payment processed successfully: ${transactionId}`);

            return {
                success: true,
                message: 'Pagamento processado com sucesso',
                transactionId: transactionId,
                paymentId: paymentRef.id,
            };

        } catch (error) {
            console.error('Error processing payment:', error);

            if (error instanceof functions.https.HttpsError) {
                throw error;
            }

            // Log failed payment attempt
            if (data.academiaId && data.studentId) {
                await admin.firestore()
                    .collection('gyms')
                    .doc(data.academiaId)
                    .collection('payments')
                    .add({
                        studentId: data.studentId,
                        amount: data.amount,
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    }).catch(e => console.error('Error logging failed payment:', e));
            }

            throw new functions.https.HttpsError(
                'internal',
                'Error processing payment'
            );
        }
    });
