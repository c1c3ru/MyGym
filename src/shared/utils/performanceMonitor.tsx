import React from 'react';
import { Platform } from 'react-native';

type Metric = {
  startTime: number;
  startMemory: number;
};

class PerformanceMonitor {
  private metrics: Map<string, Metric>;
  private isEnabled: boolean;
  private startTime: number;

  constructor() {
    this.metrics = new Map<string, Metric>();
    this.isEnabled = (typeof __DEV__ !== 'undefined' && __DEV__) || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    this.startTime = Date.now();
  }

  // Iniciar medição de performance
  startMeasure(name: string): void {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    });
    
    console.log(`🚀 Performance: Iniciando medição "${name}"`);
  }

  // Finalizar medição de performance
  endMeasure(name: string): { name: string; duration: number; memoryDelta: number; startMemory: number; endMemory: number } | undefined {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Performance: Medição "${name}" não encontrada`);
      return;
    }

    const endTime = Date.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - metric.startTime;
    const memoryDelta = endMemory - metric.startMemory;

    const result = {
      name,
      duration,
      memoryDelta,
      startMemory: metric.startMemory,
      endMemory
    };

    // Log formatado
    console.log(`📊 Performance: "${name}" concluída`);
    console.log(`   ⏱️  Duração: ${duration}ms`);
    console.log(`   💾 Memória: ${memoryDelta > 0 ? '+' : ''}${memoryDelta.toFixed(2)}MB`);
    
    // Alertas para performance ruim
    if (duration > 1000) {
      console.warn(`🐌 Performance: "${name}" demorou ${duration}ms (>1s)`);
    }
    if (memoryDelta > 10) {
      console.warn(`🐘 Performance: "${name}" usou ${memoryDelta.toFixed(2)}MB de memória`);
    }

    this.metrics.delete(name);
    return result;
  }

  // Obter uso de memória (aproximado)
  getMemoryUsage(): number {
    if (Platform.OS === 'web' && (performance as any)?.memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    // Para mobile, retornar estimativa baseada no tempo
    return (Date.now() - this.startTime) / 10000; // Estimativa simples
  }

  // Medir tempo de renderização de componente
  measureComponentRender(componentName: string): { start: () => void; end: () => void } {
    return {
      start: () => this.startMeasure(`Component:${componentName}`),
      end: () => { this.endMeasure(`Component:${componentName}`); },
    };
  }

  // Medir navegação entre telas
  measureNavigation(fromScreen: string, toScreen: string): () => void {
    const measureName = `Navigation:${fromScreen}->${toScreen}`;
    this.startMeasure(measureName);
    
    return () => this.endMeasure(measureName);
  }

  // Medir operações assíncronas
  async measureAsync<T>(name: string, asyncOperation: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await asyncOperation();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      console.error(`❌ Performance: Erro em "${name}":`, error);
      throw error;
    }
  }

  // Relatório geral de performance
  getReport(): { uptime: number; currentMemory: number; platform: string; isEnabled: boolean; activeMetrics: string[] } {
    const uptime = Date.now() - this.startTime;
    const currentMemory = this.getMemoryUsage();
    
    return {
      uptime,
      currentMemory,
      platform: Platform.OS,
      isEnabled: this.isEnabled,
      activeMetrics: Array.from(this.metrics.keys())
    };
  }

  // Log do relatório
  logReport(): void {
    const report = this.getReport();
    console.log('📈 RELATÓRIO DE PERFORMANCE');
    console.log('=' .repeat(40));
    console.log(`⏰ Uptime: ${(report.uptime / 1000).toFixed(1)}s`);
    console.log(`💾 Memória atual: ${report.currentMemory.toFixed(2)}MB`);
    console.log(`📱 Plataforma: ${report.platform}`);
    console.log(`🔍 Medições ativas: ${report.activeMetrics.length}`);
    if (report.activeMetrics.length > 0) {
      console.log(`   ${report.activeMetrics.join(', ')}`);
    }
  }
}

// Instância singleton
const performanceMonitor = new PerformanceMonitor();

// HOC para medir performance de componentes
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const monitor = performanceMonitor.measureComponentRender(componentName || (WrappedComponent as any).name);
    
    React.useEffect(() => {
      monitor.start();
      return () => monitor.end();
    }, []);

    return <WrappedComponent {...(props as P)} ref={ref} />;
  });
};

// Hook para medir performance
export const usePerformanceMonitor = () => {
  return {
    startMeasure: (name: string) => performanceMonitor.startMeasure(name),
    endMeasure: (name: string) => performanceMonitor.endMeasure(name),
    measureAsync: function <T>(name: string, operation: () => Promise<T>) { return performanceMonitor.measureAsync<T>(name, operation); },
    measureNavigation: (from: string, to: string) => performanceMonitor.measureNavigation(from, to),
    getReport: () => performanceMonitor.getReport(),
    logReport: () => performanceMonitor.logReport(),
  };
};

export default performanceMonitor;
