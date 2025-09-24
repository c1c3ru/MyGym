/**
 * Sistema de validação robusta para formulários
 * Suporta validação síncrona e assíncrona, regras customizadas e mensagens personalizadas
 */

class FormValidator {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.messages = new Map();
    this.setupDefaultRules();
    this.setupDefaultMessages();
  }

  /**
   * Configura regras de validação padrão
   */
  setupDefaultRules() {
    // Regras básicas
    this.addRule('required', (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined && value !== '';
    });

    this.addRule('email', (value) => {
      if (!value) return true; // Opcional se não for required
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    this.addRule('phone', (value) => {
      if (!value) return true;
      // Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
      const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    });

    this.addRule('cpf', (value) => {
      if (!value) return true;
      return this.validateCPF(value);
    });

    this.addRule('cnpj', (value) => {
      if (!value) return true;
      return this.validateCNPJ(value);
    });

    this.addRule('minLength', (value, min) => {
      if (!value) return true;
      return value.toString().length >= min;
    });

    this.addRule('maxLength', (value, max) => {
      if (!value) return true;
      return value.toString().length <= max;
    });

    this.addRule('min', (value, min) => {
      if (!value) return true;
      return Number(value) >= min;
    });

    this.addRule('max', (value, max) => {
      if (!value) return true;
      return Number(value) <= max;
    });

    this.addRule('numeric', (value) => {
      if (!value) return true;
      return !isNaN(Number(value));
    });

    this.addRule('alpha', (value) => {
      if (!value) return true;
      return /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
    });

    this.addRule('alphanumeric', (value) => {
      if (!value) return true;
      return /^[a-zA-Z0-9À-ÿ\s]+$/.test(value);
    });

    this.addRule('url', (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    this.addRule('date', (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date instanceof Date && !isNaN(date);
    });

    this.addRule('dateAfter', (value, afterDate) => {
      if (!value) return true;
      const date = new Date(value);
      const after = new Date(afterDate);
      return date > after;
    });

    this.addRule('dateBefore', (value, beforeDate) => {
      if (!value) return true;
      const date = new Date(value);
      const before = new Date(beforeDate);
      return date < before;
    });

    this.addRule('password', (value) => {
      if (!value) return true;
      // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(value);
    });

    this.addRule('strongPassword', (value) => {
      if (!value) return true;
      // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 especial
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
    });

    this.addRule('confirmed', (value, confirmField, formData) => {
      return value === formData[confirmField];
    });

    this.addRule('unique', async (value, collection, field = 'email') => {
      if (!value) return true;
      // Esta regra precisa ser implementada com acesso ao Firestore
      // Retorna true por enquanto, deve ser sobrescrita
      return true;
    });
  }

  /**
   * Configura mensagens de erro padrão
   */
  setupDefaultMessages() {
    this.messages.set('required', 'Este campo é obrigatório');
    this.messages.set('email', 'Digite um email válido');
    this.messages.set('phone', 'Digite um telefone válido');
    this.messages.set('cpf', 'Digite um CPF válido');
    this.messages.set('cnpj', 'Digite um CNPJ válido');
    this.messages.set('minLength', 'Deve ter pelo menos {min} caracteres');
    this.messages.set('maxLength', 'Deve ter no máximo {max} caracteres');
    this.messages.set('min', 'Deve ser maior ou igual a {min}');
    this.messages.set('max', 'Deve ser menor ou igual a {max}');
    this.messages.set('numeric', 'Deve ser um número');
    this.messages.set('alpha', 'Deve conter apenas letras');
    this.messages.set('alphanumeric', 'Deve conter apenas letras e números');
    this.messages.set('url', 'Digite uma URL válida');
    this.messages.set('date', 'Digite uma data válida');
    this.messages.set('dateAfter', 'Deve ser posterior a {afterDate}');
    this.messages.set('dateBefore', 'Deve ser anterior a {beforeDate}');
    this.messages.set('password', 'Deve ter pelo menos 8 caracteres, 1 letra e 1 número');
    this.messages.set('strongPassword', 'Deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial');
    this.messages.set('confirmed', 'Os campos não coincidem');
    this.messages.set('unique', 'Este valor já está em uso');
  }

  /**
   * Adiciona uma regra de validação customizada
   */
  addRule(name, validator) {
    this.rules.set(name, validator);
  }

  /**
   * Adiciona uma mensagem de erro customizada
   */
  addMessage(rule, message) {
    this.messages.set(rule, message);
  }

  /**
   * Valida um campo específico
   */
  async validateField(value, rules, formData = {}, fieldName = '') {
    const errors = [];

    for (const rule of rules) {
      let ruleName, ruleParams = [];

      if (typeof rule === 'string') {
        ruleName = rule;
      } else if (typeof rule === 'object') {
        ruleName = rule.rule;
        ruleParams = rule.params || [];
      }

      const validator = this.rules.get(ruleName);
      if (!validator) {
        console.warn(`Regra de validação '${ruleName}' não encontrada`);
        continue;
      }

      try {
        const isValid = await validator(value, ...ruleParams, formData);
        
        if (!isValid) {
          const message = this.getErrorMessage(ruleName, ruleParams, fieldName);
          errors.push(message);
        }
      } catch (error) {
        console.error(`Erro ao validar regra '${ruleName}':`, error);
        errors.push(`Erro de validação: ${error.message}`);
      }
    }

    return errors;
  }

  /**
   * Valida um formulário completo
   */
  async validateForm(formData, validationSchema) {
    const errors = {};
    const validationPromises = [];

    for (const [fieldName, fieldRules] of Object.entries(validationSchema)) {
      const fieldValue = formData[fieldName];
      
      const validationPromise = this.validateField(
        fieldValue, 
        fieldRules, 
        formData, 
        fieldName
      ).then(fieldErrors => {
        if (fieldErrors.length > 0) {
          errors[fieldName] = fieldErrors;
        }
      });

      validationPromises.push(validationPromise);
    }

    await Promise.all(validationPromises);

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Obtém mensagem de erro formatada
   */
  getErrorMessage(ruleName, params = [], fieldName = '') {
    let message = this.messages.get(ruleName) || `Erro de validação: ${ruleName}`;
    
    // Substituir placeholders na mensagem
    params.forEach((param, index) => {
      const placeholder = `{${Object.keys(params)[index] || index}}`;
      message = message.replace(placeholder, param);
    });

    return message;
  }

  /**
   * Valida CPF
   */
  validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    return remainder === parseInt(cpf.charAt(10));
  }

  /**
   * Valida CNPJ
   */
  validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

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
    
    return digit2 === parseInt(cnpj.charAt(13));
  }

  /**
   * Cria um hook para validação em tempo real
   */
  createValidationHook(initialData = {}, validationSchema = {}) {
    return {
      data: initialData,
      errors: {},
      isValidating: false,
      
      async validateField(fieldName, value) {
        if (!validationSchema[fieldName]) return [];
        
        const fieldErrors = await this.validateField(
          value, 
          validationSchema[fieldName], 
          this.data, 
          fieldName
        );
        
        this.errors[fieldName] = fieldErrors;
        return fieldErrors;
      },
      
      async validateAll() {
        this.isValidating = true;
        const result = await this.validateForm(this.data, validationSchema);
        this.errors = result.errors;
        this.isValidating = false;
        return result;
      },
      
      setFieldValue(fieldName, value) {
        this.data[fieldName] = value;
        // Validar campo em tempo real (debounced)
        this.validateField(fieldName, value);
      },
      
      getFieldError(fieldName) {
        return this.errors[fieldName]?.[0] || '';
      },
      
      hasErrors() {
        return Object.keys(this.errors).some(key => 
          this.errors[key] && this.errors[key].length > 0
        );
      },
      
      clearErrors() {
        this.errors = {};
      }
    };
  }
}

// Instância singleton
const formValidator = new FormValidator();

// Schemas de validação comuns
export const commonSchemas = {
  user: {
    name: ['required', { rule: 'minLength', params: [2] }],
    email: ['required', 'email'],
    phone: ['phone'],
    cpf: ['cpf']
  },
  
  student: {
    name: ['required', { rule: 'minLength', params: [2] }],
    email: ['required', 'email'],
    phone: ['required', 'phone'],
    birthDate: ['required', 'date'],
    emergencyContact: ['required', 'phone']
  },
  
  class: {
    name: ['required', { rule: 'minLength', params: [3] }],
    instructorId: ['required'],
    modality: ['required'],
    startTime: ['required'],
    endTime: ['required'],
    maxStudents: ['required', 'numeric', { rule: 'min', params: [1] }]
  },
  
  payment: {
    studentId: ['required'],
    amount: ['required', 'numeric', { rule: 'min', params: [0.01] }],
    dueDate: ['required', 'date'],
    method: ['required']
  },
  
  login: {
    email: ['required', 'email'],
    password: ['required', { rule: 'minLength', params: [6] }]
  },
  
  register: {
    name: ['required', { rule: 'minLength', params: [2] }],
    email: ['required', 'email'],
    password: ['required', 'password'],
    confirmPassword: ['required', { rule: 'confirmed', params: ['password'] }]
  },
  
  academy: {
    name: ['required', { rule: 'minLength', params: [3] }],
    cnpj: ['cnpj'],
    phone: ['required', 'phone'],
    email: ['required', 'email'],
    address: ['required', { rule: 'minLength', params: [10] }]
  }
};

export default formValidator;
