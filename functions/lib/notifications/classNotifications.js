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
exports.sendNewClassNotification = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Cloud Function: Send notification when a new class is created
 * Triggered when a new document is created in gyms/{academiaId}/classes/{classId}
 */
exports.sendNewClassNotification = functions
    .region('southamerica-east1') // Use the same region as Firestore
    .firestore
    .document('gyms/{academiaId}/classes/{classId}')
    .onCreate(async (snap, context) => {
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
        const tokens = [];
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
            const tokensToRemove = [];
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
    }
    catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
});
//# sourceMappingURL=classNotifications.js.map