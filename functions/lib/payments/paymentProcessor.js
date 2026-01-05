"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Cloud Function: Process payment transactions
 * This is a template - integrate with your payment provider (Stripe, Mercado Pago, etc.)
 */
exports.processPayment = functions
    .region('southamerica-east1')
    .https
    .onCall(async (data, context) => {
    var _a;
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to process payment');
        }
        const { paymentMethodId, amount, currency, studentId, academiaId, description, planId } = data;
        // Validate input
        if (!paymentMethodId || !amount || !currency || !studentId || !academiaId) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required payment parameters');
        }
        // Verify user permissions (admin or the student themselves)
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(context.auth.uid)
            .get();
        const userData = userDoc.data();
        const isAdmin = (userData === null || userData === void 0 ? void 0 : userData.role) === 'admin';
        const isOwnPayment = context.auth.uid === studentId;
        if (!isAdmin && !isOwnPayment) {
            throw new functions.https.HttpsError('permission-denied', 'You do not have permission to process this payment');
        }
        // Get student data
        const studentDoc = await admin.firestore()
            .collection('users')
            .doc(studentId)
            .get();
        if (!studentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Student not found');
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
            studentName: (studentData === null || studentData === void 0 ? void 0 : studentData.name) || 'Unknown',
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
                ipAddress: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown',
            }
        });
        // Update student's payment history
        await studentDoc.ref.update({
            lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
            totalPaid: admin.firestore.FieldValue.increment(amount),
        });
        // Send confirmation notification
        if (studentData === null || studentData === void 0 ? void 0 : studentData.fcmToken) {
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
    }
    catch (error) {
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
        throw new functions.https.HttpsError('internal', 'Error processing payment');
    }
});
//# sourceMappingURL=paymentProcessor.js.map