import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AddClassForm from './AddClassScreen';

/**
 * Wrapper para AddClassForm que funciona como tela de navegação
 * Fornece as props necessárias (onClose, onSuccess) automaticamente
 */
const AddClassScreenWrapper = () => {
    const navigation = useNavigation();

    const handleClose = () => {
        navigation.goBack();
    };

    const handleSuccess = () => {
        // Voltar para a tela anterior e atualizar
        navigation.goBack();
    };

    return (
        <AddClassForm
            onClose={handleClose}
            onSuccess={handleSuccess}
        />
    );
};

export default AddClassScreenWrapper;
