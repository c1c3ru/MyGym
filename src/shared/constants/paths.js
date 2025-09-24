/**
 * Mapeamento de Caminhos - Clean Architecture
 * Academia App - Constantes para imports
 */

// Caminhos base das camadas
export const PATHS = {
  // Camada de Aplicação
  APP: '../app',
  
  // Camada de Domínio
  DOMAIN: '../domain',
  DOMAIN_ENTITIES: '../domain/entities',
  DOMAIN_USECASES: '../domain/usecases',
  DOMAIN_REPOSITORIES: '../domain/repositories',
  DOMAIN_ERRORS: '../domain/errors',
  
  // Camada de Dados
  DATA: '../data',
  DATA_REPOSITORIES: '../data/repositories',
  DATA_DATASOURCES: '../data/datasources',
  DATA_MODELS: '../data/models',
  DATA_MAPPERS: '../data/mappers',
  
  // Camada de Apresentação
  PRESENTATION: '../presentation',
  PRESENTATION_SCREENS: '../presentation/screens',
  PRESENTATION_COMPONENTS: '../presentation/components',
  PRESENTATION_NAVIGATION: '../presentation/navigation',
  PRESENTATION_HOOKS: '../presentation/hooks',
  PRESENTATION_CONTEXTS: '../presentation/contexts',
  PRESENTATION_THEME: '../presentation/theme',
  
  // Camada de Infraestrutura
  INFRASTRUCTURE: '../infrastructure',
  INFRASTRUCTURE_SERVICES: '../infrastructure/services',
  INFRASTRUCTURE_STORAGE: '../infrastructure/storage',
  INFRASTRUCTURE_NETWORK: '../infrastructure/network',
  INFRASTRUCTURE_ANALYTICS: '../infrastructure/analytics',
  
  // Código Compartilhado
  SHARED: '../shared',
  SHARED_UTILS: '../shared/utils',
  SHARED_CONSTANTS: '../shared/constants',
  SHARED_TYPES: '../shared/types',
  SHARED_VALIDATION: '../shared/validation',
};

// Aliases para imports mais limpos
export const ALIASES = {
  '@app': PATHS.APP,
  '@domain': PATHS.DOMAIN,
  '@data': PATHS.DATA,
  '@presentation': PATHS.PRESENTATION,
  '@infrastructure': PATHS.INFRASTRUCTURE,
  '@shared': PATHS.SHARED,
  '@components': PATHS.PRESENTATION_COMPONENTS,
  '@screens': PATHS.PRESENTATION_SCREENS,
  '@hooks': PATHS.PRESENTATION_HOOKS,
  '@contexts': PATHS.PRESENTATION_CONTEXTS,
  '@services': PATHS.INFRASTRUCTURE_SERVICES,
  '@utils': PATHS.SHARED_UTILS,
};

export default PATHS;
