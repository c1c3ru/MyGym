import { ZodError } from 'zod';

/**
 * ValidationHelpers - Validation Layer
 * Utilitários para integrar Zod com a UI e simplificar validações
 */

/**
 * Converte erros do Zod para formato amigável à UI
 */
export const formatZodErrors = (error) => {
  if (!(error instanceof ZodError)) {
    return { general: error.message || 'Erro de validação' };
  }

  const formattedErrors = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      formattedErrors[path] = err.message;
    } else {
      formattedErrors.general = err.message;
    }
  });

  return formattedErrors;
};

/**
 * Valida dados usando um schema Zod e retorna resultado formatado
 */
export const validateWithSchema = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: {}
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: formatZodErrors(error)
    };
  }
};

/**
 * Valida dados de forma síncrona e lança exceção em caso de erro
 */
export const validateOrThrow = (schema, data) => {
  try {
    return schema.parse(data);
  } catch (error) {
    const formattedErrors = formatZodErrors(error);
    const errorMessage = Object.values(formattedErrors).join(', ');
    throw new Error(`Dados inválidos: ${errorMessage}`);
  }
};

/**
 * Valida campo individual e retorna apenas o erro do campo
 */
export const validateField = (schema, fieldName, value) => {
  try {
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) {
      return null;
    }
    
    fieldSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      return error.errors[0]?.message || 'Valor inválido';
    }
    return 'Erro de validação';
  }
};

/**
 * Valida dados parciais (útil para validação durante digitação)
 */
export const validatePartial = (schema, data) => {
  try {
    const partialSchema = schema.partial();
    const validatedData = partialSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: {}
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: formatZodErrors(error)
    };
  }
};

/**
 * Cria um validador personalizado para um schema específico
 */
export const createValidator = (schema) => {
  return {
    validate: (data) => validateWithSchema(schema, data),
    validateOrThrow: (data) => validateOrThrow(schema, data),
    validateField: (fieldName, value) => validateField(schema, fieldName, value),
    validatePartial: (data) => validatePartial(schema, data)
  };
};

/**
 * Cria um hook de validação para React (factory function)
 */
export const createValidationHook = (schema) => {
  return (initialData = {}) => {
    const [data, setData] = React.useState(initialData);
    const [errors, setErrors] = React.useState({});
    const [isValid, setIsValid] = React.useState(false);

    const validateData = React.useCallback((newData = data) => {
      const result = validateWithSchema(schema, newData);
      setErrors(result.errors);
      setIsValid(result.success);
      return result;
    }, [data]);

    const validateFieldChange = React.useCallback((fieldName, value) => {
      const newData = { ...data, [fieldName]: value };
      setData(newData);
      
      const fieldError = validateField(schema, fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));
      
      // Validar dados completos para atualizar isValid
      const result = validateWithSchema(schema, newData);
      setIsValid(result.success);
      
      return !fieldError;
    }, [data]);

    const clearErrors = React.useCallback(() => {
      setErrors({});
    }, []);

    const clearFieldError = React.useCallback((fieldName) => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }, []);

    return {
      data,
      setData,
      errors,
      isValid,
      validateData,
      validateFieldChange,
      clearErrors,
      clearFieldError,
      hasErrors: Object.keys(errors).length > 0,
      getFieldError: (fieldName) => errors[fieldName] || null
    };
  };
};

/**
 * Sanitiza dados removendo campos undefined/null desnecessários
 */
export const sanitizeData = (data) => {
  const cleaned = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const cleanedObject = sanitizeData(value);
        if (Object.keys(cleanedObject).length > 0) {
          cleaned[key] = cleanedObject;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};

/**
 * Converte string para formato apropriado para validação
 */
export const normalizeStringForValidation = (value) => {
  if (typeof value !== 'string') return value;
  
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos para comparações
};

/**
 * Valida CPF (Brazilian tax ID)
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove formatting
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

/**
 * Valida CNPJ (Brazilian company tax ID)
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  // Remove formatting
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit2 !== parseInt(cnpj.charAt(13))) return false;
  
  return true;
};