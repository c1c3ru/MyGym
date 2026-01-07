import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { sendNewClassNotification } from './notifications/classNotifications';
export { checkInGeo } from './checkin/geoCheckin';
export { processPayment } from './payments/paymentProcessor';
export { onEvaluationUpdate } from './evaluations/evaluationProcessor';
export { scheduledFirestoreExport } from './backup/firestoreBackup';
export { sendPaymentReminder } from './notifications/paymentReminders';
export { sendClassReminder } from './notifications/classReminders';
export { sendInviteEmail } from './invites/sendInviteEmail';
export { useInvite } from './invites/useInvite';

