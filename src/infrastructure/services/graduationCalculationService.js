/**
 * Serviço para cálculo de datas de graduação e alertas
 */

class GraduationCalculationService {
  constructor() {
    this.graduationRules = new Map();
    this.initializeDefaultRules();
  }

  /**
   * Inicializa regras padrão por modalidade
   */
  initializeDefaultRules() {
    // Jiu-Jitsu Brasileiro
    const jiuJitsuRules = [
      { fromBelt: 'Branca', toBelt: 'Azul', minimumDays: 365, minimumClasses: 80 },
      { fromBelt: 'Azul', toBelt: 'Roxa', minimumDays: 730, minimumClasses: 150 },
      { fromBelt: 'Roxa', toBelt: 'Marrom', minimumDays: 1095, minimumClasses: 200 },
      { fromBelt: 'Marrom', toBelt: 'Preta', minimumDays: 1460, minimumClasses: 250 }
    ];

    // Muay Thai
    const muayThaiRules = [
      { fromBelt: 'Branca', toBelt: 'Amarela', minimumDays: 90, minimumClasses: 30 },
      { fromBelt: 'Amarela', toBelt: 'Laranja', minimumDays: 120, minimumClasses: 40 },
      { fromBelt: 'Laranja', toBelt: 'Verde', minimumDays: 150, minimumClasses: 50 },
      { fromBelt: 'Verde', toBelt: 'Azul', minimumDays: 180, minimumClasses: 60 },
      { fromBelt: 'Azul', toBelt: 'Roxa', minimumDays: 240, minimumClasses: 80 },
      { fromBelt: 'Roxa', toBelt: 'Marrom', minimumDays: 365, minimumClasses: 120 },
      { fromBelt: 'Marrom', toBelt: 'Preta', minimumDays: 730, minimumClasses: 200 }
    ];

    // Karatê
    const karateRules = [
      { fromBelt: 'Branca', toBelt: 'Amarela', minimumDays: 120, minimumClasses: 40 },
      { fromBelt: 'Amarela', toBelt: 'Laranja', minimumDays: 120, minimumClasses: 40 },
      { fromBelt: 'Laranja', toBelt: 'Verde', minimumDays: 150, minimumClasses: 50 },
      { fromBelt: 'Verde', toBelt: 'Azul', minimumDays: 180, minimumClasses: 60 },
      { fromBelt: 'Azul', toBelt: 'Marrom', minimumDays: 240, minimumClasses: 80 },
      { fromBelt: 'Marrom', toBelt: 'Preta', minimumDays: 365, minimumClasses: 120 }
    ];

    // Jiu-Jitsu Infantil
    const jiuJitsuKidsRules = [
      { fromBelt: 'Branca', toBelt: 'Cinza', minimumDays: 180, minimumClasses: 60 },
      { fromBelt: 'Cinza', toBelt: 'Amarela', minimumDays: 240, minimumClasses: 80 },
      { fromBelt: 'Amarela', toBelt: 'Laranja', minimumDays: 300, minimumClasses: 100 },
      { fromBelt: 'Laranja', toBelt: 'Verde', minimumDays: 365, minimumClasses: 120 }
    ];

    this.graduationRules.set('Jiu-Jitsu', jiuJitsuRules);
    this.graduationRules.set('Muay Thai', muayThaiRules);
    this.graduationRules.set('Karatê', karateRules);
    this.graduationRules.set('Jiu-Jitsu Infantil', jiuJitsuKidsRules);
  }

  /**
   * Calcula alertas de graduação para um estudante
   * @param {Object} student - Dados do estudante
   * @param {Array} attendanceData - Dados de frequência
   * @returns {Object} - Alert de graduação ou null
   */
  calculateGraduationAlert(student, attendanceData = []) {
    try {
      if (!student.modalities || student.modalities.length === 0) {
        return null;
      }

      const alerts = [];

      for (const modality of student.modalities) {
        const alert = this.calculateModalityAlert(student, modality, attendanceData);
        if (alert) {
          alerts.push(alert);
        }
      }

      // Retorna o alerta mais próximo de estar pronto
      return alerts.sort((a, b) => {
        if (a.isEligible !== b.isEligible) {
          return b.isEligible - a.isEligible; // Elegíveis primeiro
        }
        return a.daysUntilEligible - b.daysUntilEligible; // Menor dias até elegível
      })[0] || null;

    } catch (error) {
      console.error('Erro ao calcular alerta de graduação:', error);
      return null;
    }
  }

  /**
   * Calcula alerta para uma modalidade específica
   * @param {Object} student - Dados do estudante
   * @param {string} modality - Modalidade
   * @param {Array} attendanceData - Dados de frequência
   * @returns {Object|null} - Alert específico da modalidade
   */
  calculateModalityAlert(student, modality, attendanceData) {
    const rules = this.graduationRules.get(modality);
    if (!rules) {
      console.warn(`Regras não encontradas para modalidade: ${modality}`);
      return null;
    }

    const currentBelt = this.getCurrentBeltForModality(student, modality);
    const nextBeltRule = this.getNextBeltRule(rules, currentBelt);
    
    if (!nextBeltRule) {
      return null; // Já está na graduação máxima
    }

    const trainingStartDate = this.getTrainingStartDate(student, modality);
    const totalClasses = this.getTotalClassesForModality(attendanceData, modality);
    
    const daysTrained = this.calculateDaysTrained(trainingStartDate);
    const daysUntilEligible = Math.max(0, nextBeltRule.minimumDays - daysTrained);
    const classesNeeded = Math.max(0, (nextBeltRule.minimumClasses || 0) - totalClasses);
    
    const isEligible = daysUntilEligible === 0 && classesNeeded === 0;
    const alertLevel = this.determineAlertLevel(daysUntilEligible, classesNeeded, isEligible);
    
    const estimatedGraduationDate = new Date();
    estimatedGraduationDate.setDate(estimatedGraduationDate.getDate() + daysUntilEligible);

    return {
      id: `${student.id}_${modality}_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      currentBelt: currentBelt,
      nextBelt: nextBeltRule.toBelt,
      modality: modality,
      estimatedGraduationDate: estimatedGraduationDate,
      trainingStartDate: trainingStartDate,
      minimumTrainingDays: nextBeltRule.minimumDays,
      daysUntilEligible: daysUntilEligible,
      classesCompleted: totalClasses,
      classesNeeded: classesNeeded,
      minimumClasses: nextBeltRule.minimumClasses || 0,
      isEligible: isEligible,
      alertLevel: alertLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Obtém a graduação atual do estudante para uma modalidade
   * @param {Object} student - Dados do estudante
   * @param {string} modality - Modalidade
   * @returns {string} - Graduação atual
   */
  getCurrentBeltForModality(student, modality) {
    if (student.graduations && student.graduations.length > 0) {
      // Busca a graduação mais recente para a modalidade
      const modalityGraduations = student.graduations
        .filter(grad => grad.modality === modality)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (modalityGraduations.length > 0) {
        return modalityGraduations[0].level;
      }
    }
    
    return student.currentGraduation || 'Branca';
  }

  /**
   * Obtém a regra para a próxima graduação
   * @param {Array} rules - Regras da modalidade
   * @param {string} currentBelt - Graduação atual
   * @returns {Object|null} - Regra da próxima graduação
   */
  getNextBeltRule(rules, currentBelt) {
    return rules.find(rule => rule.fromBelt === currentBelt);
  }

  /**
   * Obtém a data de início do treinamento
   * @param {Object} student - Dados do estudante
   * @param {string} modality - Modalidade
   * @returns {Date} - Data de início
   */
  getTrainingStartDate(student, modality) {
    if (student.graduations && student.graduations.length > 0) {
      const modalityGraduations = student.graduations
        .filter(grad => grad.modality === modality)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (modalityGraduations.length > 0) {
        return new Date(modalityGraduations[0].date);
      }
    }
    
    return student.createdAt ? new Date(student.createdAt) : new Date();
  }

  /**
   * Calcula total de aulas para uma modalidade
   * @param {Array} attendanceData - Dados de frequência
   * @param {string} modality - Modalidade
   * @returns {number} - Total de aulas
   */
  getTotalClassesForModality(attendanceData, modality) {
    if (!attendanceData || attendanceData.length === 0) {
      return 0;
    }
    
    return attendanceData.filter(attendance => 
      attendance.modality === modality && attendance.present
    ).length;
  }

  /**
   * Calcula dias de treinamento
   * @param {Date} startDate - Data de início
   * @returns {number} - Dias treinados
   */
  calculateDaysTrained(startDate) {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Determina o nível de alerta
   * @param {number} daysUntilEligible - Dias até elegibilidade
   * @param {number} classesNeeded - Aulas necessárias
   * @param {boolean} isEligible - Se está elegível
   * @returns {string} - Nível do alerta
   */
  determineAlertLevel(daysUntilEligible, classesNeeded, isEligible) {
    if (isEligible) {
      return 'ready';
    } else if (daysUntilEligible <= 30 || classesNeeded <= 5) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * Calcula alertas para múltiplos estudantes
   * @param {Array} students - Lista de estudantes
   * @param {Object} attendanceMap - Mapa de frequência por estudante
   * @returns {Array} - Lista de alertas
   */
  calculateBulkGraduationAlerts(students, attendanceMap = {}) {
    const alerts = [];
    
    for (const student of students) {
      const attendanceData = attendanceMap[student.id] || [];
      const alert = this.calculateGraduationAlert(student, attendanceData);
      
      if (alert) {
        alerts.push(alert);
      }
    }
    
    return alerts.sort((a, b) => {
      // Ordenar por: elegíveis primeiro, depois por dias até elegibilidade
      if (a.isEligible !== b.isEligible) {
        return b.isEligible - a.isEligible;
      }
      return a.daysUntilEligible - b.daysUntilEligible;
    });
  }

  /**
   * Obtém estatísticas de graduação por modalidade
   * @param {Array} students - Lista de estudantes
   * @param {Array} alerts - Lista de alertas
   * @returns {Array} - Estatísticas por modalidade
   */
  getModalityGraduationStats(students, alerts) {
    const modalityStats = new Map();
    
    // Inicializar estatísticas
    students.forEach(student => {
      if (student.modalities) {
        student.modalities.forEach(modality => {
          if (!modalityStats.has(modality)) {
            modalityStats.set(modality, {
              modality: modality,
              totalStudents: 0,
              eligibleStudents: 0,
              nextExamDate: null,
              averageTrainingTime: 0,
              trainingTimes: []
            });
          }
          
          const stats = modalityStats.get(modality);
          stats.totalStudents++;
          
          const trainingStart = this.getTrainingStartDate(student, modality);
          const daysTrained = this.calculateDaysTrained(trainingStart);
          stats.trainingTimes.push(daysTrained);
        });
      }
    });
    
    // Calcular estudantes elegíveis
    alerts.forEach(alert => {
      if (alert.isEligible && modalityStats.has(alert.modality)) {
        modalityStats.get(alert.modality).eligibleStudents++;
      }
    });
    
    // Calcular tempo médio de treinamento
    modalityStats.forEach(stats => {
      if (stats.trainingTimes.length > 0) {
        stats.averageTrainingTime = Math.round(
          stats.trainingTimes.reduce((sum, time) => sum + time, 0) / stats.trainingTimes.length
        );
      }
      delete stats.trainingTimes; // Remover dados temporários
    });
    
    return Array.from(modalityStats.values());
  }

  /**
   * Adiciona regras customizadas para uma modalidade
   * @param {string} modality - Nome da modalidade
   * @param {Array} rules - Array de regras
   */
  addCustomModalityRules(modality, rules) {
    this.graduationRules.set(modality, rules);
  }

  /**
   * Obtém todas as regras de uma modalidade
   * @param {string} modality - Nome da modalidade
   * @returns {Array} - Regras da modalidade
   */
  getModalityRules(modality) {
    return this.graduationRules.get(modality) || [];
  }

  /**
   * Lista todas as modalidades disponíveis
   * @returns {Array} - Lista de modalidades
   */
  getAvailableModalities() {
    return Array.from(this.graduationRules.keys());
  }
}

export default new GraduationCalculationService();