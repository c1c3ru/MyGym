/**
 * Utilitários para gerenciamento de horários e agendamentos
 */
// Configuração padrão de horários
export const DEFAULT_SCHEDULE_CONFIG = {
  timezone: 'America/Fortaleza',
  duration: 60, // minutos por slot
  hours: {
    sunday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    monday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    tuesday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    wednesday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    thursday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    friday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
    saturday: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
  }
};

// Nomes dos dias em português
export const DAY_NAMES = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado'
};

// Nomes dos dias abreviados
export const DAY_NAMES_SHORT = {
  sunday: 'Dom',
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb'
};

/**
 * Cria um schedule vazio
 */
export const createEmptySchedule = () => ({
  timezone: DEFAULT_SCHEDULE_CONFIG.timezone,
  duration: DEFAULT_SCHEDULE_CONFIG.duration,
  hours: {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  }
});

/**
 * Valida se um schedule é válido
 */
export const isValidSchedule = (schedule) => {
  if (!schedule || typeof schedule !== 'object') return false;
  if (!schedule.hours || typeof schedule.hours !== 'object') return false;
  
  const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return validDays.every(day => Array.isArray(schedule.hours[day]));
};

/**
 * Converte schedule para string de exibição
 */
export const scheduleToDisplayString = (schedule, locale = 'pt-BR') => {
  if (!isValidSchedule(schedule)) return 'Horário não definido';
  
  const activeDays = Object.entries(schedule.hours)
    .filter(([day, hours]) => hours.length > 0)
    .map(([day, hours]) => {
      const dayName = DAY_NAMES[day];
      if (hours.length === 1) {
        const endTime = addMinutesToTime(hours[0], schedule.duration || 60);
        return `${dayName}: ${hours[0]} às ${endTime}`;
      } else {
        const startTime = hours[0];
        const lastHour = hours[hours.length - 1];
        const endTime = addMinutesToTime(lastHour, schedule.duration || 60);
        return `${dayName}: ${startTime} às ${endTime}`;
      }
    });
  
  return activeDays.length > 0 ? activeDays.join('\n') : 'Nenhum horário selecionado';
};

/**
 * Adiciona minutos a um horário no formato HH:MM
 */
export const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

/**
 * Verifica se dois schedules têm conflito de horário
 */
export const hasScheduleConflict = (schedule1, schedule2) => {
  if (!isValidSchedule(schedule1) || !isValidSchedule(schedule2)) return false;
  
  return Object.keys(schedule1.hours).some(day => {
    const hours1 = schedule1.hours[day];
    const hours2 = schedule2.hours[day];
    return hours1.some(hour => hours2.includes(hour));
  });
};

/**
 * Obtém os próximos horários de uma turma
 */
export const getNextClassTimes = (schedule, limit = 5) => {
  if (!isValidSchedule(schedule)) return [];
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextTimes = [];
  
  // Buscar horários a partir de hoje
  for (let i = 0; i < 7 && nextTimes.length < limit; i++) {
    const dayIndex = (currentDay + i) % 7;
    const dayKey = dayOrder[dayIndex];
    const dayHours = schedule.hours[dayKey];
    
    dayHours.forEach(hour => {
      if (nextTimes.length >= limit) return;
      
      // Se for hoje, só incluir horários futuros
      if (i === 0 && hour <= currentTime) return;
      
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const [hours, minutes] = hour.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      
      nextTimes.push({
        date,
        day: DAY_NAMES[dayKey],
        time: hour,
        dayKey
      });
    });
  }
  
  return nextTimes.slice(0, limit);
};

/**
 * Formata horário para exibição
 */
export const formatTimeForDisplay = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Gera array de horários disponíveis para seleção
 */
export const generateTimeSlots = (startHour = 6, endHour = 22, interval = 60) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    if (interval === 30 && hour < endHour) {
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
  }
  return slots;
};

/**
 * Valida se um horário está no formato correto
 */
export const isValidTimeFormat = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export default {
  DEFAULT_SCHEDULE_CONFIG,
  DAY_NAMES,
  DAY_NAMES_SHORT,
  createEmptySchedule,
  isValidSchedule,
  scheduleToDisplayString,
  addMinutesToTime,
  hasScheduleConflict,
  getNextClassTimes,
  formatTimeForDisplay,
  generateTimeSlots,
  isValidTimeFormat
};
