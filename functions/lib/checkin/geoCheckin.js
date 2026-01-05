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
exports.checkInGeo = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}
/**
 * Cloud Function: Validate check-in with geolocation
 * Callable function that verifies user location before allowing check-in
 */
exports.checkInGeo = functions
    .region('southamerica-east1')
    .https
    .onCall(async (data, context) => {
    try {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to check in');
        }
        const { userLat, userLng, classId, academiaId, userId } = data;
        // Validate input
        if (!userLat || !userLng || !classId || !academiaId || !userId) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
        }
        // Verify user is checking in for themselves
        if (context.auth.uid !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Users can only check in for themselves');
        }
        // Get gym location
        const gymDoc = await admin.firestore()
            .collection('gyms')
            .doc(academiaId)
            .get();
        if (!gymDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Gym not found');
        }
        const gymData = gymDoc.data();
        if (!gymData || !gymData.location) {
            throw new functions.https.HttpsError('failed-precondition', 'Gym location not configured');
        }
        // Get class data
        const classDoc = await admin.firestore()
            .collection('gyms')
            .doc(academiaId)
            .collection('classes')
            .doc(classId)
            .get();
        if (!classDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Class not found');
        }
        const classData = classDoc.data();
        // Calculate distance between user and gym
        const distance = calculateDistance(userLat, userLng, gymData.location.latitude, gymData.location.longitude);
        // Maximum allowed distance: 100 meters (configurable)
        const maxDistance = gymData.checkInRadius || 100;
        if (distance > maxDistance) {
            return {
                success: false,
                message: `Você está muito longe da academia. Distância: ${Math.round(distance)}m (máximo: ${maxDistance}m)`,
                distance: Math.round(distance),
            };
        }
        // Check if user is already checked in
        const existingCheckIn = await admin.firestore()
            .collection('gyms')
            .doc(academiaId)
            .collection('checkIns')
            .where('userId', '==', userId)
            .where('classId', '==', classId)
            .where('date', '==', admin.firestore.Timestamp.now())
            .limit(1)
            .get();
        if (!existingCheckIn.empty) {
            return {
                success: false,
                message: 'Você já fez check-in nesta aula hoje',
            };
        }
        // Create check-in record
        const checkInRef = await admin.firestore()
            .collection('gyms')
            .doc(academiaId)
            .collection('checkIns')
            .add({
            userId: userId,
            classId: classId,
            className: (classData === null || classData === void 0 ? void 0 : classData.name) || 'Unknown',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            date: admin.firestore.Timestamp.now(),
            location: new admin.firestore.GeoPoint(userLat, userLng),
            distance: Math.round(distance),
            verified: true,
        });
        // Update class attendance count
        await classDoc.ref.update({
            attendanceCount: admin.firestore.FieldValue.increment(1),
        });
        console.log(`Check-in successful for user ${userId} at class ${classId}`);
        return {
            success: true,
            message: 'Check-in realizado com sucesso!',
            distance: Math.round(distance),
            checkInId: checkInRef.id,
        };
    }
    catch (error) {
        console.error('Error during check-in:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An error occurred during check-in');
    }
});
//# sourceMappingURL=geoCheckin.js.map