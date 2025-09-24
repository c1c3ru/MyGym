/**
 * DIContainer - Infrastructure Layer
 * Container de Injeção de Dependências para Clean Architecture
 */
export class DIContainer {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
  }

  /**
   * Registra um serviço
   */
  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      singleton: options.singleton !== false, // Default é singleton
      dependencies: options.dependencies || []
    });
    
    console.log(`🔧 DIContainer: Serviço '${name}' registrado`);
  }

  /**
   * Resolve uma dependência
   */
  resolve(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Serviço '${name}' não encontrado no container`);
    }

    // Se é singleton e já existe uma instância, retornar
    if (service.singleton && this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Resolver dependências
    const dependencies = service.dependencies.map(dep => this.resolve(dep));

    // Criar nova instância
    const instance = service.factory(...dependencies);

    // Armazenar se for singleton
    if (service.singleton) {
      this.instances.set(name, instance);
    }

    console.log(`✅ DIContainer: Serviço '${name}' resolvido`);
    return instance;
  }

  /**
   * Verifica se um serviço está registrado
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Remove um serviço do container
   */
  unregister(name) {
    this.services.delete(name);
    this.instances.delete(name);
    console.log(`🗑️ DIContainer: Serviço '${name}' removido`);
  }

  /**
   * Limpa todas as instâncias singleton (mantém registros)
   */
  clearInstances() {
    this.instances.clear();
    console.log('🧹 DIContainer: Instâncias singleton limpas');
  }

  /**
   * Limpa todo o container
   */
  clear() {
    this.services.clear();
    this.instances.clear();
    console.log('🧹 DIContainer: Container completamente limpo');
  }

  /**
   * Lista todos os serviços registrados
   */
  listServices() {
    const serviceList = Array.from(this.services.keys());
    console.log('📋 DIContainer: Serviços registrados:', serviceList);
    return serviceList;
  }

  /**
   * Debug do estado do container
   */
  debug() {
    const services = Array.from(this.services.keys());
    const instances = Array.from(this.instances.keys());
    
    console.log('🔧 DIContainer Debug:', {
      totalServices: services.length,
      services,
      totalInstances: instances.length,
      instances
    });
    
    return { services, instances };
  }
}

// Instância global do container
export const container = new DIContainer();