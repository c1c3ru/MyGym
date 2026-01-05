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
exports.onEvaluationUpdate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Cloud Function: Process evaluation updates
 * Triggered when an evaluation is created or updated
 * Calculates averages and updates student/instructor profiles
 */
exports.onEvaluationUpdate = functions
    .region('southamerica-east1')
    .firestore
    .document('gyms/{academiaId}/evaluations/{evaluationId}')
    .onWrite(async (change, context) => {
    try {
        const academiaId = context.params.academiaId;
        const evaluationId = context.params.evaluationId;
        // If document was deleted, skip processing
        if (!change.after.exists) {
            console.log(`Evaluation ${evaluationId} was deleted`);
            return null;
        }
        const evaluation = change.after.data();
        if (!evaluation) {
            console.log('No evaluation data found');
            return null;
        }
        console.log(`Processing evaluation ${evaluationId} for student ${evaluation.studentId}`);
        // Calculate average scores if evaluation has multiple metrics
        if (evaluation.scores && typeof evaluation.scores === 'object') {
            const scores = Object.values(evaluation.scores);
            const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            // Update evaluation with calculated average
            await change.after.ref.update({
                averageScore: average,
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // Update student's evaluation summary
        if (evaluation.studentId) {
            await updateStudentEvaluationSummary(academiaId, evaluation.studentId);
        }
        // Update instructor's evaluation summary if present
        if (evaluation.instructorId) {
            await updateInstructorEvaluationSummary(academiaId, evaluation.instructorId);
        }
        // Send notification to student
        if (evaluation.studentId) {
            const studentDoc = await admin.firestore()
                .collection('users')
                .doc(evaluation.studentId)
                .get();
            const studentData = studentDoc.data();
            if (studentData === null || studentData === void 0 ? void 0 : studentData.fcmToken) {
                await admin.messaging().send({
                    notification: {
                        title: '📊 Nova Avaliação Disponível',
                        body: `Sua avaliação de ${evaluation.type || 'desempenho'} foi atualizada!`,
                    },
                    data: {
                        type: 'evaluation_updated',
                        evaluationId: evaluationId,
                        academiaId: academiaId,
                    },
                    token: studentData.fcmToken,
                }).catch(error => {
                    console.error('Error sending evaluation notification:', error);
                });
            }
        }
        return null;
    }
    catch (error) {
        console.error('Error processing evaluation:', error);
        return null;
    }
});
/**
 * Update student's evaluation summary with latest averages
 */
async function updateStudentEvaluationSummary(academiaId, studentId) {
    try {
        // Get all evaluations for this student
        const evaluationsSnapshot = await admin.firestore()
            .collection('gyms')
            .doc(academiaId)
            .collection('evaluations')
            .where('studentId', '==', studentId)
            .get();
        if (evaluationsSnapshot.empty) {
            console.log(`No evaluations found for student ${studentId}`);
            return;
        }
        let totalScore = 0;
        let count = 0;
        const scoresByType = {};
        evaluationsSnapshot.forEach(doc => {
            const evaluation = doc.data();
            if (evaluation.averageScore) {
                totalScore += evaluation.averageScore;
                count++;
            }
            // Group scores by evaluation type
            if (evaluation.type) {
                if (!scoresByType[evaluation.type]) {
                    scoresByType[evaluation.type] = [];
                }
                if (evaluation.averageScore) {
                    scoresByType[evaluation.type].push(evaluation.averageScore);
                }
            }
        });
        const overallAverage = count > 0 ? totalScore / count : 0;
        // Calculate averages by type
        const averagesByType = {};
        for (const [type, scores] of Object.entries(scoresByType)) {
            averagesByType[type] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        }
        // Update student document
        await admin.firestore()
            .collection('users')
            .doc(studentId)
            .update({
            'evaluationSummary.overallAverage': overallAverage,
            'evaluationSummary.averagesByType': averagesByType,
            'evaluationSummary.totalEvaluations': count,
            'evaluationSummary.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Updated evaluation summary for student ${studentId}: ${overallAverage.toFixed(2)}`);
    }
    catch (error) {
        console.error('Error updating student evaluation summary:', error);
    }
}
/**
 * Update instructor's evaluation summary
 */
async function updateInstructorEvaluationSummary(academiaId, instructorId) {
    try {
        // Get all evaluations conducted by this instructor
        const evaluationsSnapshot = await admin.firestore()
            .collection('gyms')
            .doc(academiaId)
            .collection('evaluations')
            .where('instructorId', '==', instructorId)
            .get();
        if (evaluationsSnapshot.empty) {
            console.log(`No evaluations found for instructor ${instructorId}`);
            return;
        }
        const totalEvaluations = evaluationsSnapshot.size;
        // Update instructor document
        await admin.firestore()
            .collection('users')
            .doc(instructorId)
            .update({
            'instructorStats.totalEvaluationsConducted': totalEvaluations,
            'instructorStats.lastEvaluationDate': admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Updated evaluation stats for instructor ${instructorId}: ${totalEvaluations} evaluations`);
    }
    catch (error) {
        console.error('Error updating instructor evaluation summary:', error);
    }
}
//# sourceMappingURL=evaluationProcessor.js.map