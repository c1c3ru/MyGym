import { useState, useCallback, useEffect, useRef } from 'react';
import formValidator from '@utils/formValidation';

/**
 * Hook personalizado para validação de formulários
 * Fornece validação em tempo real, debouncing e estado de loading
 */
export const useFormValidation = (initialData = {}, validationSchema = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    showErrorsOnMount = false
  } = options;

  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const debounceTimeouts = useRef({});
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Limpar timeouts pendentes
      Object.values(debounceTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Validar campo específico
  const validateField = useCallback(async (fieldName, value = data[fieldName]) => {
    if (!validationSchema[fieldName]) return [];

    try {
      const fieldErrors = await formValidator.validateField(
        value,
        validationSchema[fieldName],
        { ...data, [fieldName]: value },
        fieldName
      );

      if (isMounted.current) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldErrors
        }));
      }

      return fieldErrors;
    } catch (error) {
      console.error(`Erro ao validar campo ${fieldName}:`, error);
      return [`Erro de validação: ${error.message}`];
    }
  }, [data, validationSchema]);

  // Validar campo com debounce
  const validateFieldDebounced = useCallback((fieldName, value) => {
    // Limpar timeout anterior
    if (debounceTimeouts.current[fieldName]) {
      clearTimeout(debounceTimeouts.current[fieldName]);
    }

    // Criar novo timeout
    debounceTimeouts.current[fieldName] = setTimeout(() => {
      validateField(fieldName, value);
    }, debounceMs);
  }, [validateField, debounceMs]);

  // Validar formulário completo
  const validateForm = useCallback(async () => {
    setIsValidating(true);

    try {
      const result = await formValidator.validateForm(data, validationSchema);
      
      if (isMounted.current) {
        setErrors(result.errors);
        setIsValid(result.isValid);
      }

      return result;
    } catch (error) {
      console.error('Erro ao validar formulário:', error);
      return { isValid: false, errors: { _form: ['Erro de validação'] } };
    } finally {
      if (isMounted.current) {
        setIsValidating(false);
      }
    }
  }, [data, validationSchema]);

  // Definir valor de campo
  const setFieldValue = useCallback((fieldName, value) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validar em tempo real se habilitado
    if (validateOnChange && (touched[fieldName] || showErrorsOnMount)) {
      validateFieldDebounced(fieldName, value);
    }
  }, [validateOnChange, validateFieldDebounced, touched, showErrorsOnMount]);

  // Marcar campo como tocado
  const setFieldTouched = useCallback((fieldName, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: isTouched
    }));

    // Validar no blur se habilitado
    if (validateOnBlur && isTouched) {
      validateField(fieldName);
    }
  }, [validateOnBlur, validateField]);

  // Definir erro customizado
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: Array.isArray(error) ? error : [error]
    }));
  }, []);

  // Limpar erros
  const clearErrors = useCallback((fieldNames = null) => {
    if (fieldNames) {
      const fieldsArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      setErrors(prev => {
        const newErrors = { ...prev };
        fieldsArray.forEach(fieldName => {
          delete newErrors[fieldName];
        });
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  // Resetar formulário
  const resetForm = useCallback((newData = initialData) => {
    setData(newData);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [initialData]);

  // Definir dados completos
  const setFormData = useCallback((newData) => {
    setData(newData);
    
    // Validar todos os campos se necessário
    if (showErrorsOnMount) {
      setTimeout(() => validateForm(), 0);
    }
  }, [validateForm, showErrorsOnMount]);

  // Helpers para obter informações do campo
  const getFieldProps = useCallback((fieldName) => ({
    value: data[fieldName] || '',
    onChangeText: (value) => setFieldValue(fieldName, value),
    onBlur: () => setFieldTouched(fieldName, true),
    error: touched[fieldName] && errors[fieldName]?.[0],
    hasError: touched[fieldName] && errors[fieldName]?.length > 0
  }), [data, errors, touched, setFieldValue, setFieldTouched]);

  const getFieldError = useCallback((fieldName) => {
    return (touched[fieldName] || showErrorsOnMount) ? errors[fieldName]?.[0] : '';
  }, [errors, touched, showErrorsOnMount]);

  const hasFieldError = useCallback((fieldName) => {
    return (touched[fieldName] || showErrorsOnMount) && errors[fieldName]?.length > 0;
  }, [errors, touched, showErrorsOnMount]);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).some(key => 
      errors[key] && errors[key].length > 0 && (touched[key] || showErrorsOnMount)
    );
  }, [errors, touched, showErrorsOnMount]);

  // Submeter formulário
  const handleSubmit = useCallback(async (onSubmit) => {
    // Marcar todos os campos como tocados
    const allFields = Object.keys(validationSchema);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    // Validar formulário
    const validation = await validateForm();
    
    if (validation.isValid) {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error('Erro no submit:', error);
        setFieldError('_form', error.message || 'Erro ao enviar formulário');
      }
    }

    return validation;
  }, [data, validationSchema, validateForm, setFieldError]);

  // Efeito para validação inicial
  useEffect(() => {
    if (showErrorsOnMount) {
      validateForm();
    }
  }, [showErrorsOnMount]); // Não incluir validateForm para evitar loop

  return {
    // Estado
    data,
    formData: data, // Alias para compatibilidade
    errors,
    touched,
    isValidating,
    isValid,

    // Ações
    setFieldValue,
    setFieldTouched,
    setFieldError,
    setFormData,
    updateFormData: setFieldValue, // Alias para compatibilidade
    validateField,
    validateForm,
    clearErrors,
    resetForm,
    handleSubmit,

    // Helpers
    getFieldProps,
    getFieldError,
    hasFieldError,
    hasErrors
  };
};

export default useFormValidation;
