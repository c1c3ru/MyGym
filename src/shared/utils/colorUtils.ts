/**
 * Utilitários para manipulação de cores
 */

/**
 * Converte uma cor em formato HEX para RGBA
 * @param hex A cor em formato hexadecimal (ex: #FFFFFF ou #FFF)
 * @param opacity A opacidade (0 a 1)
 * @returns A string da cor em formato rgba
 */
export const hexToRgba = (hex: string, opacity: number): string => {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
    }
    // Se já for rgb/rgba ou nome de cor, retorna como está (falha graciosa)
    // Idealmente deveríamos suportar conversão de nomes de cores se necessário
    return hex;
};
