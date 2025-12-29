// Utilitários de validação para formulários
import { useState } from 'react';

export const validators = {
  // Validação de email
  email: (email: string | null | undefined): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email é obrigatório';
    if (!emailRegex.test(email)) return 'Email inválido';
    return null;
  },

  // Validação de senha
  password: (password: string | null | undefined, minLength: number = 6): string | null => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < minLength) return `Senha deve ter pelo menos ${minLength} caracteres`;
    return null;
  },

  // Validação de confirmação de senha
  confirmPassword: (password: string | null | undefined, confirmPassword: string | null | undefined): string | null => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (password !== confirmPassword) return 'Senhas não coincidem';
    return null;
  },

  // Validação de nome
  name: (name: string | null | undefined): string | null => {
    if (!name || !name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    return null;
  },

  // Validação de telefone
  phone: (phone: string | null | undefined): string | null => {
    if (!phone) return null; // Telefone é opcional na maioria dos casos
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phone)) return 'Formato: (11) 99999-9999';
    return null;
  },

  // Validação de CPF
  cpf: (cpf: string | null | undefined): string | null => {
    if (!cpf) return 'CPF é obrigatório';
    
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) return 'CPF deve ter 11 dígitos';
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return 'CPF inválido';
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return 'CPF inválido';
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return 'CPF inválido';
    
    return null;
  },

  // Validação de data de nascimento
  birthDate: (date: string | Date | null | undefined): string | null => {
    if (!date) return 'Data de nascimento é obrigatória';
    
    const birthDate = new Date(date as any);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) return 'Data de nascimento não pode ser futura';
    if (age < 5) return 'Idade mínima é 5 anos';
    if (age > 120) return 'Data de nascimento inválida';
    
    return null;
  },

  // Validação de valor monetário
  money: (value: string | number | null | undefined): string | null => {
    if (!value) return 'Valor é obrigatório';
    const numValue = parseFloat(value.toString().replace(',', '.'));
    if (isNaN(numValue) || numValue < 0) return 'Valor inválido';
    return null;
  },

  // Validação de horário
  time: (hour: number | null | undefined, minute: number = 0): string | null => {
    if (hour === null || hour === undefined) return 'Hora é obrigatória';
    if (hour < 0 || hour > 23) return 'Hora deve estar entre 0 e 23';
    if (minute < 0 || minute > 59) return 'Minuto deve estar entre 0 e 59';
    return null;
  },

  // Validação de dia da semana
  dayOfWeek: (day: number | null | undefined): string | null => {
    if (day === null || day === undefined) return 'Dia da semana é obrigatório';
    if (day < 0 || day > 6) return 'Dia da semana inválido';
    return null;
  },

  // Validação de texto obrigatório
  required: (value: any, fieldName: string = 'Campo'): string | null => {
    if (!value || !value.toString().trim()) return `${fieldName} é obrigatório`;
    return null;
  },

  // Validação de seleção obrigatória
  requiredSelect: (value: any, fieldName: string = 'Campo'): string | null => {
    if (!value || value === '') return `${fieldName} deve ser selecionado`;
    return null;
  }
};

// Formatadores de entrada
export const formatters = {
  // Formatar telefone
  phone: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  },

  // Formatar CPF
  cpf: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Formatar valor monetário
  money: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },

  // Formatar apenas números
  numbersOnly: (value: string): string => {
    return value.replace(/\D/g, '');
  }
};

// Hook personalizado para validação de formulários
export const useFormValidation = (
  initialValues: Record<string, any>,
  validationRules: Record<string, (value: any, values: Record<string, any>) => string | null>
) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: any): string | null => {
    if (validationRules[name]) {
      const error = validationRules[name](value, values);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return error;
    }
    return null;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field], values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>));

    return isValid;
  };

  const setValue = (name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const setTouchedField = (name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, values[name]);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({} as Record<string, string | null>);
    setTouched({} as Record<string, boolean>);
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Validações específicas para o domínio da academia
export const academyValidators = {
  // Validação de graduação
  graduation: (graduation: string | null | undefined): string | null => {
    const validGraduations = [
      'Iniciante', 'Branca', 'Azul', 'Roxa', 'Marrom', 'Preta',
      'Coral', 'Vermelha', 'Vermelha e Preta'
    ];
    if (!graduation) return 'Graduação é obrigatória';
    if (!validGraduations.includes(graduation)) return 'Graduação inválida';
    return null;
  },

  // Validação de modalidade
  modality: (modality: string | null | undefined): string | null => {
    const validModalities = [
      'Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe', 'Wrestling', 'Judo'
    ];
    if (!modality) return 'Modalidade é obrigatória';
    if (!validModalities.includes(modality)) return 'Modalidade inválida';
    return null;
  },

  // Validação de plano
  plan: (plan: string | null | undefined): string | null => {
    if (!plan) return 'Plano é obrigatório';
    return null;
  },

  // Validação de capacidade de turma
  classCapacity: (capacity: string | number | null | undefined): string | null => {
    const num = parseInt(String(capacity));
    if (!capacity) return 'Capacidade é obrigatória';
    if (isNaN(num) || num < 1) return 'Capacidade deve ser maior que 0';
    if (num > 50) return 'Capacidade máxima é 50 alunos';
    return null;
  }
};

export default {
  validators,
  formatters,
  useFormValidation,
  academyValidators
};
