import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

interface CheckInData {
    userLat: number;
    userLng: number;
    classId: string;
    academiaId: string;
    userId: string;
}

interface CheckInResult {
    success: boolean;
    message: string;
    distance?: number;
    checkInId?: string;
}

/**
 * Cloud Function: Validate check-in with geolocation
 * Callable function that verifies user location before allowing check-in
 */
export const checkInGeo = functions
    .region('southamerica-east1')
    .https
    .onCall(async (data: CheckInData, context: functions.https.CallableContext): Promise<CheckInResult> => {
        try {
            // Verify authentication
            if (!context.auth) {
                throw new functions.https.HttpsError(
                    'unauthenticated',
                    'User must be authenticated to check in'
                );
            }

            const { userLat, userLng, classId, academiaId, userId } = data;

            // Validate input
            if (!userLat || !userLng || !classId || !academiaId || !userId) {
                throw new functions.https.HttpsError(
                    'invalid-argument',
                    'Missing required parameters'
                );
            }

            // Verify user is checking in for themselves
            if (context.auth.uid !== userId) {
                throw new functions.https.HttpsError(
                    'permission-denied',
                    'Users can only check in for themselves'
                );
            }

            // Get gym location
            const gymDoc = await admin.firestore()
                .collection('gyms')
                .doc(academiaId)
                .get();

            if (!gymDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Gym not found'
                );
            }

            const gymData = gymDoc.data();
            if (!gymData || !gymData.location) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Gym location not configured'
                );
            }

            // Get class data
            const classDoc = await admin.firestore()
                .collection('gyms')
                .doc(academiaId)
                .collection('classes')
                .doc(classId)
                .get();

            if (!classDoc.exists) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'Class not found'
                );
            }

            const classData = classDoc.data();

            // Calculate distance between user and gym
            const distance = calculateDistance(
                userLat,
                userLng,
                gymData.location.latitude,
                gymData.location.longitude
            );

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
                    className: classData?.name || 'Unknown',
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

        } catch (error) {
            console.error('Error during check-in:', error);

            if (error instanceof functions.https.HttpsError) {
                throw error;
            }

            throw new functions.https.HttpsError(
                'internal',
                'An error occurred during check-in'
            );
        }
    });
