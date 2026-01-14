
// Sistema de formatação internacionalizada para datas, números e moedas
// Centraliza formatação por idioma escolhido pelo usuário

/**
 * Mapeia idiomas da aplicação para códigos de localização
 */
export type Language = 'pt' | 'en' | 'es';
const LOCALE_MAP: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES'
};

/**
 * Configuração de moedas por localização
 */
const CURRENCY_MAP: Record<'pt-BR' | 'en-US' | 'es-ES', string> = {
  'pt-BR': 'BRL',
  'en-US': 'USD',
  'es-ES': 'EUR'
};

/**
 * Formatador de datas por idioma
 * @param {Date|string} date - Data a ser formatada
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @param {object} options - Opções do Intl.DateTimeFormat
 * @returns {string} Data formatada
 */
export const formatDate = (
  date: Date | string,
  language: Language = 'pt',
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options } as Intl.DateTimeFormatOptions);
};

/**
 * Formatador de data/hora completa
 * @param {Date|string} date - Data a ser formatada
 * @param {string} language - Idioma ('pt', 'en', 'es')  
 * @returns {string} Data e hora formatadas
 */
export const formatDateTime = (date: Date | string, language: Language = 'pt'): string => {
  if (!date) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatador de apenas a hora
 * @param {Date|string} date - Data a ser formatada
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @returns {string} Hora formatada
 */
export const formatTime = (date: Date | string, language: Language = 'pt'): string => {
  if (!date) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatador de moeda por idioma
 * @param {number} amount - Valor a ser formatado
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @param {string} currency - Código da moeda (opcional, detecta por idioma)
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (amount: number, language: Language = 'pt', currency: string | null = null): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';
  const currencyCode = currency || CURRENCY_MAP[locale as keyof typeof CURRENCY_MAP] || 'BRL';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

/**
 * Formatador de números por idioma
 * @param {number} number - Número a ser formatado
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @param {object} options - Opções do Intl.NumberFormat
 * @returns {string} Número formatado
 */
export const formatNumber = (number: number, language: Language = 'pt', options: Intl.NumberFormatOptions = {}): string => {
  if (number === null || number === undefined || isNaN(number)) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';

  return new Intl.NumberFormat(locale, options).format(number);
};

/**
 * Formatador de porcentagem por idioma
 * @param {number} decimal - Valor decimal (0.15 para 15%)
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @returns {string} Porcentagem formatada
 */
export const formatPercentage = (decimal: number, language: Language = 'pt'): string => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(decimal);
};

/**
 * Formatador de data relativa (ex: "há 2 dias")
 * @param {Date|string} date - Data para comparação
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @returns {string} Data relativa formatada
 */
export const formatRelativeDate = (date: Date | string, language: Language = 'pt'): string => {
  if (!date) return '';

  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  try {
    // Use Intl.RelativeTimeFormat quando disponível
    if (typeof Intl.RelativeTimeFormat !== 'undefined') {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (Math.abs(diffDays) < 1) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        return rtf.format(diffHours, 'hour');
      }

      return rtf.format(diffDays, 'day');
    }
  } catch (e) {
    console.warn('Intl.RelativeTimeFormat não disponível, usando formatação simples');
  }

  // Fallback para formatação simples
  return formatDate(date, language);
};

/**
 * Obtém configuração regional baseada no idioma
 * @param {string} language - Idioma ('pt', 'en', 'es')  
 * @returns {object} Configurações regionais
 */
export const getLocaleSettings = (language: Language = 'pt') => {
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const currency = CURRENCY_MAP[locale as keyof typeof CURRENCY_MAP] || 'BRL';

  return {
    locale,
    currency,
    language,
    dateFormat: language === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
    decimalSeparator: language === 'en' ? '.' : ',',
    thousandSeparator: language === 'en' ? ',' : '.'
  };
};

/**
 * Hook-like function para uso em componentes React
 * Requer o contexto de tema para obter o idioma atual
 */
export const createI18nFormatters = (getString: (key: string) => string) => {
  // Detecta idioma atual baseado no contexto
  const currentLanguage = getString('language') || 'pt';

  return {
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => formatDate(date, currentLanguage as Language, options),
    formatDateTime: (date: Date | string) => formatDateTime(date, currentLanguage as Language),
    formatTime: (date: Date | string) => formatTime(date, currentLanguage as Language),
    formatCurrency: (amount: number, currency?: string | null) => formatCurrency(amount, currentLanguage as Language, currency ?? null),
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => formatNumber(number, currentLanguage as Language, options),
    formatPercentage: (decimal: number) => formatPercentage(decimal, currentLanguage as Language),
    formatRelativeDate: (date: Date | string) => formatRelativeDate(date, currentLanguage as Language),
    getLocaleSettings: () => getLocaleSettings(currentLanguage as Language)
  };
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatRelativeDate,
  getLocaleSettings,
  createI18nFormatters
};