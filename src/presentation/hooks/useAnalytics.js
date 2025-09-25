import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import analyticsService, { ANALYTICS_EVENTS } from '@services/analyticsService';
import { useAuthFacade } from '@presentation/auth/AuthFacade';

/**
 * Hook principal para usar analytics nos componentes
 */
export const useAnalytics = () => {
  const { user, userProfile } = useAuthFacade();

  // Configurar propriedades do usuário quando disponível
  useEffect(() => {
    if (user && userProfile) {
      analyticsService.setUserProperties({
        userId: user.uid,
        userType: userProfile.userType,
        academiaId: userProfile.academiaId,
        hasAcademia: !!userProfile.academiaId
      });
    }
  }, [user, userProfile]);

  // Rastrear evento
  const trackEvent = useCallback((eventName, properties = {}) => {
    analyticsService.trackEvent(eventName, properties);
  }, []);

  // Rastrear métrica
  const trackMetric = useCallback((metricName, value, tags = {}) => {
    analyticsService.trackMetric(metricName, value, tags);
  }, []);

  // Rastrear erro
  const trackError = useCallback((error, context = {}) => {
    analyticsService.trackError(error, context);
  }, []);

  // Rastrear interação do usuário
  const trackInteraction = useCallback((action, element, properties = {}) => {
    analyticsService.trackUserInteraction(action, element, properties);
  }, []);

  // Rastrear conversão
  const trackConversion = useCallback((conversionName, value = null, properties = {}) => {
    analyticsService.trackConversion(conversionName, value, properties);
  }, []);

  // Iniciar timer
  const startTimer = useCallback((timerName) => {
    return analyticsService.startTiming(timerName);
  }, []);

  // Finalizar timer
  const endTimer = useCallback((timerName, properties = {}) => {
    return analyticsService.endTiming(timerName, properties);
  }, []);

  return {
    trackEvent,
    trackMetric,
    trackError,
    trackInteraction,
    trackConversion,
    startTimer,
    endTimer,
    EVENTS: ANALYTICS_EVENTS
  };
};

/**
 * Hook para rastrear visualização de tela
 */
export const useScreenTracking = (screenName, additionalProperties = {}) => {
  const { trackEvent, startTimer, endTimer } = useAnalytics();
  const screenStartTime = useRef(null);
  const timerName = `screen_${screenName}`;

  useFocusEffect(
    useCallback(() => {
      // Tela ganhou foco
      screenStartTime.current = Date.now();
      startTimer(timerName);
      
      trackEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
        screen: screenName,
        ...additionalProperties
      });

      return () => {
        // Tela perdeu foco
        if (screenStartTime.current) {
          const duration = endTimer(timerName, {
            screen: screenName,
            ...additionalProperties
          });
          
          trackEvent('screen_exit', {
            screen: screenName,
            duration,
            ...additionalProperties
          });
        }
      };
    }, [screenName, trackEvent, startTimer, endTimer, additionalProperties])
  );
};

/**
 * Hook para rastrear performance de componentes
 */
export const usePerformanceTracking = (componentName) => {
  const { trackMetric, trackEvent } = useAnalytics();
  const renderCount = useRef(0);
  const mountTime = useRef(null);

  useEffect(() => {
    // Componente montado
    mountTime.current = Date.now();
    renderCount.current = 0;
    
    trackEvent('component_mount', {
      component: componentName
    });

    return () => {
      // Componente desmontado
      const lifetime = mountTime.current ? Date.now() - mountTime.current : 0;
      
      trackEvent('component_unmount', {
        component: componentName,
        lifetime,
        renderCount: renderCount.current
      });

      trackMetric('component_lifetime', lifetime, {
        component: componentName
      });
    };
  }, [componentName, trackEvent, trackMetric]);

  // Rastrear renders
  useEffect(() => {
    renderCount.current++;
    
    trackMetric('component_render', 1, {
      component: componentName,
      renderNumber: renderCount.current
    });
  });

  return {
    renderCount: renderCount.current
  };
};

/**
 * Hook para rastrear formulários
 */
export const useFormTracking = (formName) => {
  const { trackEvent, trackError, startTimer, endTimer } = useAnalytics();
  const formStartTime = useRef(null);
  const fieldInteractions = useRef({});

  const trackFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    startTimer(`form_${formName}`);
    
    trackEvent('form_start', {
      form: formName
    });
  }, [formName, trackEvent, startTimer]);

  const trackFieldInteraction = useCallback((fieldName, action = 'focus') => {
    if (!fieldInteractions.current[fieldName]) {
      fieldInteractions.current[fieldName] = [];
    }
    
    fieldInteractions.current[fieldName].push({
      action,
      timestamp: Date.now()
    });

    trackEvent('form_field_interaction', {
      form: formName,
      field: fieldName,
      action
    });
  }, [formName, trackEvent]);

  const trackFormSubmit = useCallback((success = true, errors = {}) => {
    const duration = endTimer(`form_${formName}`, {
      form: formName,
      success,
      errorCount: Object.keys(errors).length
    });

    trackEvent('form_submit', {
      form: formName,
      success,
      duration,
      fieldInteractions: Object.keys(fieldInteractions.current).length,
      errors: Object.keys(errors)
    });

    if (!success) {
      trackError(new Error('Form validation failed'), {
        form: formName,
        errors
      });
    }
  }, [formName, trackEvent, trackError, endTimer]);

  const trackFormAbandon = useCallback((currentField = null) => {
    const duration = formStartTime.current ? Date.now() - formStartTime.current : 0;
    
    trackEvent('form_abandon', {
      form: formName,
      duration,
      currentField,
      fieldInteractions: Object.keys(fieldInteractions.current).length
    });
  }, [formName, trackEvent]);

  return {
    trackFormStart,
    trackFieldInteraction,
    trackFormSubmit,
    trackFormAbandon
  };
};

/**
 * Hook para rastrear API calls
 */
export const useApiTracking = () => {
  const { trackEvent, trackMetric, trackError } = useAnalytics();

  const trackApiCall = useCallback(async (apiFunction, endpoint, method = 'GET') => {
    const startTime = Date.now();
    
    try {
      const result = await apiFunction();
      const duration = Date.now() - startTime;
      
      analyticsService.trackApiCall(endpoint, method, duration, 200);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const status = error.status || error.code || 500;
      
      analyticsService.trackApiCall(endpoint, method, duration, status, error);
      
      throw error;
    }
  }, []);

  return { trackApiCall };
};

/**
 * Hook para rastrear erros de componente
 */
export const useErrorTracking = (componentName) => {
  const { trackError } = useAnalytics();

  const trackComponentError = useCallback((error, errorInfo = {}) => {
    trackError(error, {
      component: componentName,
      ...errorInfo
    });
  }, [componentName, trackError]);

  return { trackComponentError };
};

/**
 * Hook para rastrear ações de usuário específicas
 */
export const useUserActionTracking = () => {
  const { trackEvent, trackInteraction } = useAnalytics();

  const trackButtonClick = useCallback((buttonName, properties = {}) => {
    trackInteraction('click', buttonName, properties);
    trackEvent(ANALYTICS_EVENTS.BUTTON_CLICKED, {
      button: buttonName,
      ...properties
    });
  }, [trackEvent, trackInteraction]);

  const trackSearch = useCallback((query, results = 0, properties = {}) => {
    trackEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query,
      resultsCount: results,
      ...properties
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((featureName, properties = {}) => {
    trackEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature: featureName,
      ...properties
    });
  }, [trackEvent]);

  return {
    trackButtonClick,
    trackSearch,
    trackFeatureUsage
  };
};

export default useAnalytics;
