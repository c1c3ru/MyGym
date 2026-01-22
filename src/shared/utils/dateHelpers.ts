
import { LanguageCode } from '@shared/utils/theme';

/**
 * Returns an array of translated day names starting from Sunday (0) to Saturday (6)
 * @param getString - The translation function from useTheme()
 * @returns Array of strings with day names
 */
export const getDayNames = (getString: (key: string) => string): string[] => {
    return [
        getString('sunday'),
        getString('monday'),
        getString('tuesday'),
        getString('wednesday'),
        getString('thursday'),
        getString('friday'),
        getString('saturday')
    ];
};

/**
 * Returns an array of translated short day names (D, S, T...)
 * @param getString - The translation function from useTheme()
 * @returns Array of strings with short day names
 */
export const getShortDayNames = (getString: (key: string) => string): string[] => {
    return [
        getString('daysOfWeekShort')[0],
        getString('daysOfWeekShort')[1],
        getString('daysOfWeekShort')[2],
        getString('daysOfWeekShort')[3],
        getString('daysOfWeekShort')[4],
        getString('daysOfWeekShort')[5],
        getString('daysOfWeekShort')[6]
    ];
};

/**
 * Returns an array of translated month names
 * @param getString - The translation function from useTheme()
 * @returns Array of strings with month names
 */
export const getMonthNames = (getString: (key: string) => string): string[] => {
    return [
        getString('january'),
        getString('february'),
        getString('march'),
        getString('april'),
        getString('may'),
        getString('june'),
        getString('july'),
        getString('august'),
        getString('september'),
        getString('october'),
        getString('november'),
        getString('december')
    ];
};

/**
 * Returns an array of translated short month names
 * @param getString - The translation function from useTheme()
 * @returns Array of strings with short month names
 */
export const getShortMonthNames = (getString: (key: string) => string): string[] => {
    return [
        getString('janShort'),
        getString('febShort'),
        getString('marShort'),
        getString('aprShort'),
        getString('mayShort'),
        getString('junShort'),
        getString('julShort'),
        getString('augShort'),
        getString('sepShort'),
        getString('octShort'),
        getString('novShort'),
        getString('decShort')
    ];
};
