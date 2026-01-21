import React from 'react';
import { View, StyleSheet } from 'react-native';
import StudentDetailsModal from '@components/StudentDetailsModal';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

type StudentDetailsRouteParams = {
    StudentDetails: {
        studentId: string;
        studentData?: any | null;
    };
};

interface StudentDetailsScreenWrapperProps {
    navigation: NavigationProp<any>;
    route: RouteProp<StudentDetailsRouteParams, 'StudentDetails'>;
}

/**
 * Wrapper para StudentDetailsModal que funciona como tela de navegação
 */
const StudentDetailsScreenWrapper: React.FC<StudentDetailsScreenWrapperProps> = ({ route, navigation }) => {
    const { studentId, studentData } = route.params;

    const handleClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <StudentDetailsModal
                studentId={studentId}
                studentData={studentData}
                onClose={handleClose}
                navigation={navigation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default StudentDetailsScreenWrapper;
