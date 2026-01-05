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
exports.sendClassReminder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Cloud Function: Send class reminder notifications
 * Scheduled to run every hour to check for upcoming classes
 */
exports.sendClassReminder = functions
    .region('southamerica-east1')
    .pubsub
    .schedule('0 * * * *') // Every hour
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
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
        const notifications = [];
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
                if (!userDoc.exists)
                    continue;
                const userData = userDoc.data();
                if (!userData || !userData.fcmToken)
                    continue;
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
    }
    catch (error) {
        console.error('Error sending class reminders:', error);
        return null;
    }
});
//# sourceMappingURL=classReminders.js.map