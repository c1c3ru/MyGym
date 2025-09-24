import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Serviço de Analytics e Monitoramento
 * Coleta métricas de performance, uso e erros
 */
class AnalyticsService {
  constructor() {
    this.isEnabled = true;
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.events = [];
    this.metrics = new Map();
    this.userProperties = {};
    this.deviceInfo = this.getDeviceInfo();
    this.batchSize = 50;
    this.flushInterval = 30000; // 30 segundos
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
    
    this.startSession();
    this.setupPerformanceMonitoring();
  }

  /**
   * Gera ID único para a sessão
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém informações do dispositivo
   */
  getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isTablet: Platform.isTablet || false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Inicia sessão de analytics
   */
  async startSession() {
    try {
      // Carregar propriedades do usuário salvas
      const savedProperties = await AsyncStorage.getItem('analytics_user_properties');
      if (savedProperties) {
        this.userProperties = JSON.parse(savedProperties);
      }

      this.trackEvent('session_start', {
        sessionId: this.sessionId,
        deviceInfo: this.deviceInfo
      });

      // Configurar flush automático
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.flushInterval);

    } catch (error) {
      console.error('Erro ao iniciar sessão de analytics:', error);
    }
  }

  /**
   * Configura monitoramento de performance
   */
  setupPerformanceMonitoring() {
    // Monitorar uso de memória (se disponível)
    if (global.performance && global.performance.memory) {
      setInterval(() => {
        this.trackMetric('memory_usage', {
          used: global.performance.memory.usedJSHeapSize,
          total: global.performance.memory.totalJSHeapSize,
          limit: global.performance.memory.jsHeapSizeLimit
        });
      }, 60000); // A cada minuto
    }

    // Monitorar erros globais
    if (global.ErrorUtils) {
      const originalHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.trackError(error, { isFatal, source: 'global_handler' });
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }

  /**
   * Rastreia um evento
   */
  trackEvent(eventName, properties = {}, options = {}) {
    if (!this.isEnabled) return;

    const event = {
      id: this.generateEventId(),
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        platform: this.deviceInfo.platform,
        ...this.userProperties
      },
      options
    };

    this.events.push(event);
    console.log(`📊 Analytics Event: ${eventName}`, properties);

    // Flush se atingiu o tamanho do batch
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Rastreia uma métrica de performance
   */
  trackMetric(metricName, value, tags = {}) {
    if (!this.isEnabled) return;

    const metric = {
      name: metricName,
      value,
      tags: {
        ...tags,
        sessionId: this.sessionId,
        platform: this.deviceInfo.platform
      },
      timestamp: Date.now()
    };

    // Armazenar métricas em memória para agregação
    const key = `${metricName}_${JSON.stringify(tags)}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key).push(metric);

    console.log(`📈 Analytics Metric: ${metricName}`, value, tags);
  }

  /**
   * Rastreia um erro
   */
  trackError(error, context = {}) {
    if (!this.isEnabled) return;

    const errorEvent = {
      name: 'error',
      properties: {
        message: error.message || 'Unknown error',
        stack: error.stack || '',
        name: error.name || 'Error',
        ...context,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        platform: this.deviceInfo.platform,
        ...this.userProperties
      }
    };

    this.events.push(errorEvent);
    console.error('🚨 Analytics Error:', error, context);

    // Flush imediatamente para erros críticos
    if (context.isFatal || context.critical) {
      this.flush();
    }
  }

  /**
   * Rastreia tempo de carregamento de tela
   */
  trackScreenLoad(screenName, loadTime, additionalData = {}) {
    this.trackEvent('screen_load', {
      screen: screenName,
      loadTime,
      ...additionalData
    });

    this.trackMetric('screen_load_time', loadTime, {
      screen: screenName
    });
  }

  /**
   * Rastreia interação do usuário
   */
  trackUserInteraction(action, element, properties = {}) {
    this.trackEvent('user_interaction', {
      action,
      element,
      ...properties
    });
  }

  /**
   * Rastreia performance de API
   */
  trackApiCall(endpoint, method, duration, status, error = null) {
    const properties = {
      endpoint,
      method,
      duration,
      status,
      success: status >= 200 && status < 300
    };

    if (error) {
      properties.error = error.message || 'Unknown error';
    }

    this.trackEvent('api_call', properties);
    this.trackMetric('api_response_time', duration, {
      endpoint,
      method,
      status: status.toString()
    });
  }

  /**
   * Define propriedades do usuário
   */
  async setUserProperties(properties) {
    this.userProperties = { ...this.userProperties, ...properties };
    
    try {
      await AsyncStorage.setItem(
        'analytics_user_properties', 
        JSON.stringify(this.userProperties)
      );
    } catch (error) {
      console.error('Erro ao salvar propriedades do usuário:', error);
    }
  }

  /**
   * Define ID do usuário
   */
  async setUserId(userId) {
    await this.setUserProperties({ userId });
  }

  /**
   * Rastreia conversão/objetivo
   */
  trackConversion(conversionName, value = null, properties = {}) {
    this.trackEvent('conversion', {
      conversion: conversionName,
      value,
      ...properties
    });
  }

  /**
   * Inicia rastreamento de tempo
   */
  startTiming(timerName) {
    const timer = {
      name: timerName,
      startTime: Date.now(),
      id: this.generateEventId()
    };

    if (!this.timers) {
      this.timers = new Map();
    }
    
    this.timers.set(timerName, timer);
    return timer.id;
  }

  /**
   * Para rastreamento de tempo
   */
  endTiming(timerName, properties = {}) {
    if (!this.timers || !this.timers.has(timerName)) {
      console.warn(`Timer ${timerName} não encontrado`);
      return;
    }

    const timer = this.timers.get(timerName);
    const duration = Date.now() - timer.startTime;

    this.trackEvent('timing', {
      timer: timerName,
      duration,
      ...properties
    });

    this.trackMetric('timing', duration, {
      timer: timerName,
      ...properties
    });

    this.timers.delete(timerName);
    return duration;
  }

  /**
   * Gera ID único para evento
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Envia eventos para o servidor (mock)
   */
  async flush(force = false) {
    if (!this.isEnabled || (this.events.length === 0 && this.metrics.size === 0)) {
      return;
    }

    if (!force && this.events.length < this.batchSize && this.metrics.size === 0) {
      return;
    }

    const payload = {
      sessionId: this.sessionId,
      events: [...this.events],
      metrics: this.aggregateMetrics(),
      deviceInfo: this.deviceInfo,
      userProperties: this.userProperties,
      timestamp: Date.now()
    };

    try {
      // Simular envio para servidor de analytics
      console.log('📤 Enviando analytics:', {
        events: payload.events.length,
        metrics: Object.keys(payload.metrics).length
      });

      // TODO: Implementar envio real para serviço de analytics
      // await this.sendToAnalyticsServer(payload);

      // Limpar eventos enviados
      this.events = [];
      this.metrics.clear();

    } catch (error) {
      console.error('Erro ao enviar analytics:', error);
      // Em caso de erro, manter eventos para retry
    }
  }

  /**
   * Agrega métricas para envio
   */
  aggregateMetrics() {
    const aggregated = {};

    for (const [key, metrics] of this.metrics.entries()) {
      const values = metrics.map(m => m.value);
      const tags = metrics[0]?.tags || {};

      aggregated[key] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        tags,
        timestamps: metrics.map(m => m.timestamp)
      };
    }

    return aggregated;
  }

  /**
   * Obtém estatísticas da sessão atual
   */
  getSessionStats() {
    const sessionDuration = Date.now() - this.sessionStart;
    
    return {
      sessionId: this.sessionId,
      duration: sessionDuration,
      eventsCount: this.events.length,
      metricsCount: this.metrics.size,
      userProperties: this.userProperties,
      deviceInfo: this.deviceInfo
    };
  }

  /**
   * Habilita/desabilita analytics
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.trackEvent('analytics_enabled');
    } else {
      this.trackEvent('analytics_disabled');
      this.flush(true); // Enviar eventos pendentes antes de desabilitar
    }
  }

  /**
   * Finaliza sessão
   */
  async endSession() {
    const sessionDuration = Date.now() - this.sessionStart;
    
    this.trackEvent('session_end', {
      duration: sessionDuration,
      eventsCount: this.events.length
    });

    await this.flush(true);

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  /**
   * Para o serviço de analytics
   */
  async destroy() {
    await this.endSession();
    this.events = [];
    this.metrics.clear();
    if (this.timers) {
      this.timers.clear();
    }
  }
}

// Instância singleton
const analyticsService = new AnalyticsService();

// Eventos pré-definidos para o app
export const ANALYTICS_EVENTS = {
  // Autenticação
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  SIGNUP: 'signup',

  // Navegação
  SCREEN_VIEW: 'screen_view',
  NAVIGATION: 'navigation',

  // Ações do usuário
  STUDENT_CREATED: 'student_created',
  CLASS_CREATED: 'class_created',
  PAYMENT_CREATED: 'payment_created',
  NOTIFICATION_SENT: 'notification_sent',

  // Performance
  APP_LAUNCH: 'app_launch',
  CRASH: 'crash',
  ERROR: 'error',

  // Engajamento
  FEATURE_USED: 'feature_used',
  BUTTON_CLICKED: 'button_clicked',
  SEARCH_PERFORMED: 'search_performed'
};

export default analyticsService;
