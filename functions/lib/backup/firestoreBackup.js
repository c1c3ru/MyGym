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
exports.scheduledFirestoreExport = void 0;
const functions = __importStar(require("firebase-functions"));
const googleapis_1 = require("googleapis");
/**
 * Cloud Function: Scheduled Firestore backup
 * Runs daily at 2 AM (Brazil time) to export Firestore data to Cloud Storage
 *
 * IMPORTANT: This requires the following setup:
 * 1. Enable Cloud Firestore API
 * 2. Create a Cloud Storage bucket for backups
 * 3. Grant necessary permissions to the service account
 *
 * Setup commands:
 * gcloud services enable firestore.googleapis.com
 * gsutil mb -l southamerica-east1 gs://mygym-backups
 * gcloud projects add-iam-policy-binding PROJECT_ID \
 *   --member serviceAccount:PROJECT_ID@appspot.gserviceaccount.com \
 *   --role roles/datastore.importExportAdmin
 */
exports.scheduledFirestoreExport = functions
    .region('southamerica-east1')
    .pubsub
    .schedule('0 2 * * *') // Every day at 2 AM
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
    try {
        console.log('Starting scheduled Firestore export...');
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        if (!projectId) {
            throw new Error('Project ID not found');
        }
        // Initialize Google Auth
        const auth = new googleapis_1.google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/datastore',
                'https://www.googleapis.com/auth/cloud-platform',
            ],
        });
        const client = await auth.getClient();
        const firestore = googleapis_1.google.firestore({
            version: 'v1beta2',
            auth: client,
        });
        // Database path
        const databaseName = `projects/${projectId}/databases/(default)`;
        // Cloud Storage bucket for backups
        // IMPORTANT: Replace with your actual bucket name
        const bucketName = `gs://${projectId}-backups`;
        // Create timestamped folder for this backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputUriPrefix = `${bucketName}/firestore-backups/${timestamp}`;
        console.log(`Exporting to: ${outputUriPrefix}`);
        // Start the export
        const response = await firestore.projects.databases.exportDocuments({
            name: databaseName,
            requestBody: {
                outputUriPrefix: outputUriPrefix,
                // Optional: specify collections to export
                // collectionIds: ['users', 'gyms', 'classes', 'payments', 'evaluations'],
            },
        });
        console.log(`Export operation started: ${response.data.name}`);
        console.log(`Firestore backup completed successfully to: ${outputUriPrefix}`);
        // Optional: Clean up old backups (keep last 30 days)
        await cleanupOldBackups(projectId, 30);
        return {
            success: true,
            outputUri: outputUriPrefix,
            timestamp: timestamp,
        };
    }
    catch (error) {
        console.error('Error during Firestore export:', error);
        // Send alert notification to admins
        await notifyAdminsOfBackupFailure(error);
        throw error;
    }
});
/**
 * Clean up backups older than specified days
 */
async function cleanupOldBackups(projectId, daysToKeep) {
    try {
        const { Storage } = require('@google-cloud/storage');
        const storage = new Storage();
        const bucketName = `${projectId}-backups`;
        const bucket = storage.bucket(bucketName);
        const [files] = await bucket.getFiles({
            prefix: 'firestore-backups/',
        });
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        let deletedCount = 0;
        for (const file of files) {
            const [metadata] = await file.getMetadata();
            const fileDate = new Date(metadata.timeCreated);
            if (fileDate < cutoffDate) {
                await file.delete();
                deletedCount++;
                console.log(`Deleted old backup: ${file.name}`);
            }
        }
        console.log(`Cleanup completed: ${deletedCount} old backups deleted`);
    }
    catch (error) {
        console.error('Error cleaning up old backups:', error);
        // Don't throw - cleanup failure shouldn't fail the backup
    }
}
/**
 * Notify administrators of backup failure
 */
async function notifyAdminsOfBackupFailure(error) {
    try {
        const admin = require('firebase-admin');
        // Get all admin users
        const adminsSnapshot = await admin.firestore()
            .collection('users')
            .where('role', '==', 'admin')
            .get();
        if (adminsSnapshot.empty) {
            console.log('No admin users found to notify');
            return;
        }
        const notifications = [];
        adminsSnapshot.forEach((doc) => {
            const adminData = doc.data();
            if (adminData.fcmToken) {
                const message = {
                    notification: {
                        title: '⚠️ Falha no Backup Automático',
                        body: 'O backup automático do Firestore falhou. Verifique os logs.',
                    },
                    data: {
                        type: 'backup_failure',
                        error: error.message || 'Unknown error',
                        timestamp: new Date().toISOString(),
                    },
                    token: adminData.fcmToken,
                };
                notifications.push(admin.messaging().send(message));
            }
        });
        await Promise.allSettled(notifications);
        console.log(`Sent backup failure notifications to ${notifications.length} admins`);
    }
    catch (notifyError) {
        console.error('Error notifying admins:', notifyError);
    }
}
//# sourceMappingURL=firestoreBackup.js.map