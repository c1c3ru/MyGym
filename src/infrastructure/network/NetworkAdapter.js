/**
 * NetworkAdapter - Infrastructure Layer
 * Adaptador para operações de rede, HTTP requests, etc.
 */
export class NetworkAdapter {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  /**
   * Realiza uma requisição HTTP genérica
   */
  async request(method, url, options = {}) {
    try {
      const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      const config = {
        method: method.toUpperCase(),
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options
      };

      // Adicionar body se não for GET ou HEAD
      if (config.method !== 'GET' && config.method !== 'HEAD' && options.data) {
        config.body = typeof options.data === 'string' 
          ? options.data 
          : JSON.stringify(options.data);
      }

      console.log(`🌐 NetworkAdapter.${method.toUpperCase()}:`, fullURL);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      const response = await fetch(fullURL, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Tentar fazer parse do JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ NetworkAdapter: Resposta recebida para ${fullURL}`);
        return data;
      }

      const text = await response.text();
      console.log(`✅ NetworkAdapter: Resposta de texto recebida para ${fullURL}`);
      return text;

    } catch (error) {
      console.error(`❌ NetworkAdapter.${method.toUpperCase()}:`, url, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout da requisição');
      }
      
      throw error;
    }
  }

  /**
   * Requisição GET
   */
  async get(url, options = {}) {
    return this.request('GET', url, options);
  }

  /**
   * Requisição POST
   */
  async post(url, data, options = {}) {
    return this.request('POST', url, { ...options, data });
  }

  /**
   * Requisição PUT
   */
  async put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, data });
  }

  /**
   * Requisição PATCH
   */
  async patch(url, data, options = {}) {
    return this.request('PATCH', url, { ...options, data });
  }

  /**
   * Requisição DELETE
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }

  /**
   * Verifica se há conexão com a internet
   */
  async checkConnection() {
    try {
      // Tentar fazer uma requisição simples para verificar conectividade
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      console.log('🌐 NetworkAdapter: Conexão verificada');
      return true;
    } catch (error) {
      console.log('❌ NetworkAdapter: Sem conexão com a internet');
      return false;
    }
  }

  /**
   * Adiciona header de autenticação
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('🔑 NetworkAdapter: Token de autenticação configurado');
  }

  /**
   * Remove header de autenticação
   */
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
    console.log('🔑 NetworkAdapter: Token de autenticação removido');
  }

  /**
   * Configura timeout padrão
   */
  setTimeout(timeout) {
    this.timeout = timeout;
    console.log(`⏱️ NetworkAdapter: Timeout configurado para ${timeout}ms`);
  }

  /**
   * Adiciona header personalizado
   */
  setHeader(key, value) {
    this.defaultHeaders[key] = value;
    console.log(`📋 NetworkAdapter: Header ${key} configurado`);
  }

  /**
   * Remove header personalizado
   */
  removeHeader(key) {
    delete this.defaultHeaders[key];
    console.log(`📋 NetworkAdapter: Header ${key} removido`);
  }

  /**
   * Debug das configurações atuais
   */
  debugConfig() {
    console.log('🌐 NetworkAdapter Debug:', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      defaultHeaders: this.defaultHeaders
    });
  }
}