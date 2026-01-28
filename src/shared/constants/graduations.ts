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
    'Taekwondo': {
        federation: 'WT',
        levels: [
            { id: 'white', label: 'Branca', color: 'white' },
            { id: 'white_yellow', label: 'Branca/Amarela', color: 'yellow' },
            { id: 'yellow', label: 'Amarela', color: 'yellow' },
            { id: 'yellow_green', label: 'Amarela/Verde', color: 'green' },
            { id: 'green', label: 'Verde', color: 'green' },
            { id: 'green_blue', label: 'Verde/Azul', color: 'blue' },
            { id: 'blue', label: 'Azul', color: 'blue' },
            { id: 'blue_red', label: 'Azul/Vermelha', color: 'red' },
            { id: 'red', label: 'Vermelha', color: 'red' },
            { id: 'red_black', label: 'Vermelha/Preta', color: 'black' },
            { id: 'black', label: 'Preta (Dan)', color: 'black' },
        ]
    },
    'Kickboxing': {
        federation: 'WAKO',
        levels: [
            { id: 'white', label: 'Branca', color: 'white' },
            { id: 'yellow', label: 'Amarela', color: 'yellow' },
            { id: 'orange', label: 'Laranja', color: 'orange' },
            { id: 'green', label: 'Verde', color: 'green' },
            { id: 'blue', label: 'Azul', color: 'blue' },
            { id: 'brown', label: 'Marrom', color: 'brown' },
            { id: 'black', label: 'Preta', color: 'black' },
        ]
    },
    'Capoeira': {
        federation: 'Standard',
        levels: [
            { id: 'white_yellow', label: 'Crua/Amarela', color: 'yellow' },
            { id: 'yellow', label: 'Amarela', color: 'yellow' },
            { id: 'yellow_orange', label: 'Amarela/Laranja', color: 'orange' },
            { id: 'orange', label: 'Laranja', color: 'orange' },
            { id: 'orange_blue', label: 'Laranja/Azul', color: 'blue' },
            { id: 'blue', label: 'Azul (Graduado)', color: 'blue' },
            { id: 'blue_green', label: 'Azul/Verde', color: 'green' },
            { id: 'green', label: 'Verde', color: 'green' },
            { id: 'green_purple', label: 'Verde/Roxa', color: 'purple' },
            { id: 'purple', label: 'Roxa (Instrutor)', color: 'purple' },
            { id: 'purple_brown', label: 'Roxa/Marrom', color: 'brown' },
            { id: 'brown', label: 'Marrom (Professor)', color: 'brown' },
            { id: 'brown_red', label: 'Marrom/Vermelha', color: 'red' },
            { id: 'red', label: 'Vermelha (Mestre)', color: 'red' },
            { id: 'white', label: 'Branca (Grão-Mestre)', color: 'white' },
        ]
    },
    'Krav Maga': {
        federation: 'IKMF',
        levels: [
            { id: 'p1', label: 'Practitioner 1', color: 'yellow' },
            { id: 'p2', label: 'Practitioner 2', color: 'yellow' },
            { id: 'p3', label: 'Practitioner 3', color: 'yellow' },
            { id: 'p4', label: 'Practitioner 4', color: 'yellow' },
            { id: 'p5', label: 'Practitioner 5', color: 'yellow' },
            { id: 'g1', label: 'Graduate 1', color: 'blue' },
            { id: 'g2', label: 'Graduate 2', color: 'blue' },
            { id: 'g3', label: 'Graduate 3', color: 'blue' },
            { id: 'g4', label: 'Graduate 4', color: 'blue' },
            { id: 'g5', label: 'Graduate 5', color: 'blue' },
            { id: 'e1', label: 'Expert 1', color: 'brown' },
            { id: 'e2', label: 'Expert 2', color: 'brown' },
            { id: 'e3', label: 'Expert 3', color: 'brown' },
            { id: 'black', label: 'Master', color: 'black' },
        ]
    },
    'Aikido': {
        federation: 'Aikikai',
        levels: [
            { id: '6kyu', label: '6º Kyu (Branca)', color: 'white' },
            { id: '5kyu', label: '5º Kyu (Amarela)', color: 'yellow' },
            { id: '4kyu', label: '4º Kyu (Laranja)', color: 'orange' },
            { id: '3kyu', label: '3º Kyu (Verde)', color: 'green' },
            { id: '2kyu', label: '2º Kyu (Azul)', color: 'blue' },
            { id: '1kyu', label: '1º Kyu (Marrom)', color: 'brown' },
            { id: '1dan', label: '1º Dan (Preta)', color: 'black' },
        ]
    },
    'Sanda': {
        federation: 'IWUF',
        levels: [
            { id: 'level1', label: '1º Grau (Branca)', color: 'white' },
            { id: 'level2', label: '2º Grau (Amarela)', color: 'yellow' },
            { id: 'level3', label: '3º Grau (Laranja)', color: 'orange' },
            { id: 'level4', label: '4º Grau (Verde)', color: 'green' },
            { id: 'level5', label: '5º Grau (Azul)', color: 'blue' },
            { id: 'level6', label: '6º Grau (Marrom)', color: 'brown' },
            { id: 'level7', label: '7º Grau (Preta)', color: 'black' },
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
