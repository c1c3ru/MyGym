import { GraduationRule } from '../entities/GraduationAlert';

/**
 * Regras oficiais de graduação por modalidade
 * Baseadas nos padrões internacionais de artes marciais
 */
export const GRADUATION_RULES: GraduationRule[] = [
  // KARATÊ - Sistema tradicional
  {
    modality: 'Karatê',
    fromBelt: 'Branca',
    toBelt: 'Amarela',
    minimumDays: 90,
    minimumClasses: 24,
    additionalRequirements: ['Kata básico', 'Conhecimento de etiqueta']
  },
  {
    modality: 'Karatê',
    fromBelt: 'Amarela',
    toBelt: 'Laranja',
    minimumDays: 120,
    minimumClasses: 32,
    additionalRequirements: ['2 katas básicos', 'Kumite controlado']
  },
  {
    modality: 'Karatê',
    fromBelt: 'Laranja',
    toBelt: 'Verde',
    minimumDays: 150,
    minimumClasses: 40,
    additionalRequirements: ['3 katas', 'Técnicas de defesa pessoal']
  },
  {
    modality: 'Karatê',
    fromBelt: 'Verde',
    toBelt: 'Azul',
    minimumDays: 180,
    minimumClasses: 48,
    additionalRequirements: ['4 katas', 'Kumite livre básico']
  },
  {
    modality: 'Karatê',
    fromBelt: 'Azul',
    toBelt: 'Marrom',
    minimumDays: 240,
    minimumClasses: 64,
    additionalRequirements: ['5 katas', 'Ensinar técnicas básicas']
  },
  {
    modality: 'Karatê',
    fromBelt: 'Marrom',
    toBelt: 'Preta 1º Dan',
    minimumDays: 365,
    minimumClasses: 96,
    additionalRequirements: ['Todos os katas básicos', 'Exame teórico', 'Demonstração de ensino']
  },

  // JIU-JITSU BRASILEIRO - Sistema Gracie
  {
    modality: 'Jiu-Jitsu',
    fromBelt: 'Branca',
    toBelt: 'Azul',
    minimumDays: 730, // 2 anos
    minimumClasses: 150,
    additionalRequirements: ['Posições básicas', 'Finalizações fundamentais', 'Defesas essenciais']
  },
  {
    modality: 'Jiu-Jitsu',
    fromBelt: 'Azul',
    toBelt: 'Roxa',
    minimumDays: 730, // 2 anos
    minimumClasses: 200,
    additionalRequirements: ['Transições avançadas', 'Guardas variadas', 'Ensinar iniciantes']
  },
  {
    modality: 'Jiu-Jitsu',
    fromBelt: 'Roxa',
    toBelt: 'Marrom',
    minimumDays: 548, // 1.5 anos
    minimumClasses: 150,
    additionalRequirements: ['Jogo completo', 'Competições', 'Auxiliar instrução']
  },
  {
    modality: 'Jiu-Jitsu',
    fromBelt: 'Marrom',
    toBelt: 'Preta',
    minimumDays: 365, // 1 ano
    minimumClasses: 100,
    additionalRequirements: ['Domínio técnico completo', 'Capacidade de ensino', 'Exame rigoroso']
  },

  // MUAY THAI - Sistema tradicional tailandês
  {
    modality: 'Muay Thai',
    fromBelt: 'Branca',
    toBelt: 'Amarela',
    minimumDays: 120,
    minimumClasses: 32,
    additionalRequirements: ['Postura básica', 'Jab, cross, hook, uppercut', 'Chutes básicos']
  },
  {
    modality: 'Muay Thai',
    fromBelt: 'Amarela',
    toBelt: 'Laranja',
    minimumDays: 150,
    minimumClasses: 40,
    additionalRequirements: ['Clinch básico', 'Joelhadas', 'Defesas']
  },
  {
    modality: 'Muay Thai',
    fromBelt: 'Laranja',
    toBelt: 'Verde',
    minimumDays: 180,
    minimumClasses: 48,
    additionalRequirements: ['Combinações avançadas', 'Sparring controlado', 'Condicionamento']
  },
  {
    modality: 'Muay Thai',
    fromBelt: 'Verde',
    toBelt: 'Azul',
    minimumDays: 240,
    minimumClasses: 64,
    additionalRequirements: ['Técnicas avançadas de clinch', 'Sparring livre', 'Wai Kru Ram Muay']
  },
  {
    modality: 'Muay Thai',
    fromBelt: 'Azul',
    toBelt: 'Marrom',
    minimumDays: 300,
    minimumClasses: 80,
    additionalRequirements: ['Domínio completo', 'Competições', 'Ensinar iniciantes']
  },

  // JUDÔ - Sistema Kodokan
  {
    modality: 'Judô',
    fromBelt: 'Branca',
    toBelt: 'Amarela',
    minimumDays: 90,
    minimumClasses: 24,
    additionalRequirements: ['Ukemi básico', '5 técnicas de pé', 'Etiqueta do tatami']
  },
  {
    modality: 'Judô',
    fromBelt: 'Amarela',
    toBelt: 'Laranja',
    minimumDays: 120,
    minimumClasses: 32,
    additionalRequirements: ['10 técnicas de pé', 'Imobilizações básicas', 'Randori leve']
  },
  {
    modality: 'Judô',
    fromBelt: 'Laranja',
    toBelt: 'Verde',
    minimumDays: 150,
    minimumClasses: 40,
    additionalRequirements: ['15 técnicas de pé', 'Técnicas de solo', 'Kata básico']
  },
  {
    modality: 'Judô',
    fromBelt: 'Verde',
    toBelt: 'Azul',
    minimumDays: 180,
    minimumClasses: 48,
    additionalRequirements: ['20 técnicas de pé', 'Estrangulamentos', 'Randori ativo']
  },
  {
    modality: 'Judô',
    fromBelt: 'Azul',
    toBelt: 'Marrom',
    minimumDays: 240,
    minimumClasses: 64,
    additionalRequirements: ['Nage-no-kata', 'Katame-no-kata', 'Competições']
  },
  {
    modality: 'Judô',
    fromBelt: 'Marrom',
    toBelt: 'Preta 1º Dan',
    minimumDays: 365,
    minimumClasses: 96,
    additionalRequirements: ['Todos os katas', 'Exame teórico rigoroso', 'Arbitragem']
  },

  // TAEKWONDO - Sistema WTF
  {
    modality: 'Taekwondo',
    fromBelt: 'Branca',
    toBelt: 'Amarela',
    minimumDays: 60,
    minimumClasses: 16,
    additionalRequirements: ['Posições básicas', 'Chutes básicos', 'Poomsae Taegeuk 1']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Amarela',
    toBelt: 'Amarela com ponta verde',
    minimumDays: 90,
    minimumClasses: 24,
    additionalRequirements: ['Chutes médios', 'Poomsae Taegeuk 2', 'Quebramento básico']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Amarela com ponta verde',
    toBelt: 'Verde',
    minimumDays: 120,
    minimumClasses: 32,
    additionalRequirements: ['Chutes altos', 'Poomsae Taegeuk 3', 'Sparring básico']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Verde',
    toBelt: 'Verde com ponta azul',
    minimumDays: 150,
    minimumClasses: 40,
    additionalRequirements: ['Chutes saltados', 'Poomsae Taegeuk 4', 'Defesa pessoal']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Verde com ponta azul',
    toBelt: 'Azul',
    minimumDays: 180,
    minimumClasses: 48,
    additionalRequirements: ['Combinações avançadas', 'Poomsae Taegeuk 5', 'Competição']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Azul',
    toBelt: 'Azul com ponta vermelha',
    minimumDays: 210,
    minimumClasses: 56,
    additionalRequirements: ['Técnicas aéreas', 'Poomsae Taegeuk 6', 'Arbitragem básica']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Azul com ponta vermelha',
    toBelt: 'Vermelha',
    minimumDays: 240,
    minimumClasses: 64,
    additionalRequirements: ['Domínio técnico', 'Poomsae Taegeuk 7', 'Ensinar iniciantes']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Vermelha',
    toBelt: 'Vermelha com ponta preta',
    minimumDays: 270,
    minimumClasses: 72,
    additionalRequirements: ['Técnicas especiais', 'Poomsae Taegeuk 8', 'Liderança']
  },
  {
    modality: 'Taekwondo',
    fromBelt: 'Vermelha com ponta preta',
    toBelt: 'Preta 1º Dan',
    minimumDays: 300,
    minimumClasses: 80,
    additionalRequirements: ['Todos os poomsaes', 'Exame completo', 'Demonstração de ensino']
  }
];

/**
 * Obtém as regras de graduação para uma modalidade específica
 */
export function getGraduationRulesByModality(modality: string): GraduationRule[] {
  return GRADUATION_RULES.filter(rule => rule.modality === modality);
}

/**
 * Obtém uma regra específica de graduação
 */
export function getGraduationRule(modality: string, fromBelt: string): GraduationRule | undefined {
  return GRADUATION_RULES.find(
    rule => rule.modality === modality && rule.fromBelt === fromBelt
  );
}

/**
 * Obtém todas as modalidades disponíveis
 */
export function getAvailableModalities(): string[] {
  return [...new Set(GRADUATION_RULES.map(rule => rule.modality))];
}

/**
 * Obtém todas as faixas para uma modalidade
 */
export function getBeltsForModality(modality: string): string[] {
  const rules = getGraduationRulesByModality(modality);
  const belts = new Set<string>();
  
  rules.forEach(rule => {
    belts.add(rule.fromBelt);
    belts.add(rule.toBelt);
  });
  
  return Array.from(belts);
}
