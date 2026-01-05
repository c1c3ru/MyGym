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
exports.sendPaymentReminder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Cloud Function: Send payment reminder notifications
 * Scheduled to run daily at 9 AM (Brazil time)
 */
exports.sendPaymentReminder = functions
    .region('southamerica-east1')
    .pubsub
    .schedule('0 9 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
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
        const notifications = [];
        for (const paymentDoc of paymentsSnapshot.docs) {
            const payment = paymentDoc.data();
            // Get user data
            const userDoc = await admin.firestore()
                .collection('users')
                .doc(payment.userId)
                .get();
            if (!userDoc.exists)
                continue;
            const userData = userDoc.data();
            if (!userData || !userData.fcmToken)
                continue;
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
    }
    catch (error) {
        console.error('Error sending payment reminders:', error);
        return null;
    }
});
//# sourceMappingURL=paymentReminders.js.map