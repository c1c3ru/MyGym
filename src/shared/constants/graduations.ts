/**
 * Graduation Progressions for Martial Arts - MyGym
 * Based on major international federation rules.
 */

export const GRADUATION_PROGRESSIONS = {
    'Jiu-Jitsu': {
        federation: 'IBJJF',
        levels: [
            { id: 'white', label: 'Branca', color: 'white' },
            { id: 'blue', label: 'Azul', color: 'blue' },
            { id: 'purple', label: 'Roxa', color: 'purple' },
            { id: 'brown', label: 'Marrom', color: 'brown' },
            { id: 'black', label: 'Preta', color: 'black' },
            { id: 'red_black', label: 'Coral', color: 'red' },
            { id: 'red', label: 'Vermelha', color: 'red' },
        ]
    },
    'Muay Thai': {
        federation: 'CBMT / IFMA',
        levels: [
            { id: 'white', label: 'Branca', color: 'white' },
            { id: 'white_yellow', label: 'Branca/Amarela', color: 'yellow' },
            { id: 'yellow', label: 'Amarela', color: 'yellow' },
            { id: 'yellow_orange', label: 'Amarela/Laranja', color: 'orange' },
            { id: 'orange', label: 'Laranja', color: 'orange' },
            { id: 'orange_green', label: 'Laranja/Verde', color: 'green' },
            { id: 'green', label: 'Verde', color: 'green' },
            { id: 'green_blue', label: 'Verde/Azul', color: 'blue' },
            { id: 'blue', label: 'Azul', color: 'blue' },
            { id: 'blue_brown', label: 'Azul/Marrom', color: 'brown' },
            { id: 'brown', label: 'Marrom', color: 'brown' },
            { id: 'brown_black', label: 'Marrom/Preta', color: 'black' },
            { id: 'black', label: 'Preta', color: 'black' },
        ]
    },
    'Karatê': {
        federation: 'WKF',
        levels: [
            { id: 'white', label: 'Branca', color: 'white' },
            { id: 'yellow', label: 'Amarela', color: 'yellow' },
            { id: 'red', label: 'Vermelha', color: 'red' },
            { id: 'orange', label: 'Laranja', color: 'orange' },
            { id: 'green', label: 'Verde', color: 'green' },
            { id: 'purple', label: 'Roxa', color: 'purple' },
            { id: 'brown', label: 'Marrom', color: 'brown' },
            { id: 'black', label: 'Preta', color: 'black' },
        ]
    },
    'Judo': {
        federation: 'IJF',
        levels: [
            { id: 'white', label: 'Branca', color: 'white' },
            { id: 'blue', label: 'Azul', color: 'blue' },
            { id: 'yellow', label: 'Amarela', color: 'yellow' },
            { id: 'orange', label: 'Laranja', color: 'orange' },
            { id: 'green', label: 'Verde', color: 'green' },
            { id: 'purple', label: 'Roxa', color: 'purple' },
            { id: 'brown', label: 'Marrom', color: 'brown' },
            { id: 'black', label: 'Preta', color: 'black' },
        ]
    },
    'Default': {
        federation: 'Standard',
        levels: [
            { id: 'beg', label: 'Iniciante', color: 'gray' },
            { id: 'int', label: 'Intermediário', color: 'blue' },
            { id: 'adv', label: 'Avançado', color: 'red' },
            { id: 'mas', label: 'Mestre', color: 'black' },
        ]
    }
};

export const getProgressionForModality = (modality: string): { federation: string; levels: { id: string; label: string; color: string; }[] } => {
    return (GRADUATION_PROGRESSIONS as any)[modality] || GRADUATION_PROGRESSIONS['Default'];
};
