export interface GraduationRule {
    minTimeMonths: number;
    minClasses?: number;
}

export const BELTS_BY_MODALITY: Record<string, string[]> = {
    'Jiu-Jitsu': [
        'Branca',
        'Cinza',
        'Amarela',
        'Laranja',
        'Verde',
        'Azul',
        'Roxa',
        'Marrom',
        'Preta',
        'Coral',
        'Vermelha'
    ],
    'Judo': [
        'Branca',
        'Cinza',
        'Azul',
        'Amarela',
        'Laranja',
        'Verde',
        'Roxa',
        'Marrom',
        'Preta',
        'Coral',
        'Vermelha'
    ],
    'Muay Thai': [
        'Branca',
        'Amarela',
        'Laranja',
        'Verde',
        'Azul',
        'Marrom',
        'Preta'
    ]
};

export const GRADUATION_RULES: Record<string, Record<string, GraduationRule>> = {
    'Jiu-Jitsu': {
        'Branca': { minTimeMonths: 0 }, // Depende do mestre, mas vamos considerar tempo de carência para Azul
        'Azul': { minTimeMonths: 24 }, // 2 anos na Azul para ir pra Roxa (IBJJF)
        'Roxa': { minTimeMonths: 18 }, // 1.5 anos na Roxa
        'Marrom': { minTimeMonths: 12 }, // 1 ano na Marrom
        'Preta': { minTimeMonths: 36 }  // 3 anos para os graus
    },
    'Judo': {
        'Branca': { minTimeMonths: 3 },
        'Azul': { minTimeMonths: 6 }, // Exemplo genérico, varia por federação
        'Amarela': { minTimeMonths: 12 },
        'Laranja': { minTimeMonths: 12 },
        'Verde': { minTimeMonths: 12 },
        'Roxa': { minTimeMonths: 12 },
        'Marrom': { minTimeMonths: 12 }
    },
    'Muay Thai': {
        'Branca': { minTimeMonths: 3 },
        'Amarela': { minTimeMonths: 3 },
        'Laranja': { minTimeMonths: 4 }
        // Simplificado
    }
};

export const getGraduationEligibility = (
    modality: string,
    currentBelt: string,
    lastGraduationDate: Date | string,
    currentDate: Date = new Date()
) => {
    const modalityRules = GRADUATION_RULES[modality] || GRADUATION_RULES['Jiu-Jitsu']; // Default to JBJJ if unknown
    const normalizedBelt = currentBelt.split(' ')[0].trim(); // Remove graus ex: "Branca 2 graus" -> "Branca"

    // Encontrar regra aproximada (busca simples)
    const ruleKey = Object.keys(modalityRules).find(key =>
        normalizedBelt.toLowerCase().includes(key.toLowerCase())
    );

    if (!ruleKey) return null;

    const rule = modalityRules[ruleKey];
    const graduationTime = new Date(lastGraduationDate);

    // Calcular meses passados
    const diffTime = Math.abs(currentDate.getTime() - graduationTime.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    const eligibleDate = new Date(graduationTime);
    eligibleDate.setMonth(eligibleDate.getMonth() + rule.minTimeMonths);

    const monthsRemaining = rule.minTimeMonths - diffMonths;
    const isEligible = monthsRemaining <= 0;

    // Próximo à data: 1 mês antes
    const isClose = monthsRemaining === 1;

    return {
        isEligible,
        isClose,
        monthsRemaining,
        eligibleDate,
        rule: ruleKey
    };
};
