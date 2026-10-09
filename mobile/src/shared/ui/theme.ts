import { useColorScheme } from 'react-native';

/**
 * Design tokens propios (sin UI Kit). Centralizar colores, espaciado y tipografía
 * mantiene la UI consistente y permite el modo oscuro sin tocar componentes.
 */
const palette = {
  light: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF0F3',
    border: '#E1E4E8',
    text: '#1B1F24',
    textMuted: '#5B636E',
    primary: '#2F5BEA',
    onPrimary: '#FFFFFF',
    danger: '#C62828',
    high: { fg: '#B42318', bg: '#FDECEA' },
    medium: { fg: '#9A6700', bg: '#FFF4D6' },
    low: { fg: '#1F7A4D', bg: '#E5F5EC' },
    pending: { fg: '#5B636E', bg: '#EEF0F3' },
    inProgress: { fg: '#2F5BEA', bg: '#E8EEFD' },
    completed: { fg: '#1F7A4D', bg: '#E5F5EC' },
  },
  dark: {
    background: '#0F1115',
    surface: '#181B21',
    surfaceMuted: '#232731',
    border: '#2C313B',
    text: '#ECEFF3',
    textMuted: '#9AA3AF',
    primary: '#7B9BFF',
    onPrimary: '#0F1115',
    danger: '#FF8A80',
    high: { fg: '#FFB4AB', bg: '#3B1A18' },
    medium: { fg: '#FFD479', bg: '#352A10' },
    low: { fg: '#8FD9B0', bg: '#132B20' },
    pending: { fg: '#C2C8D0', bg: '#262A33' },
    inProgress: { fg: '#A9BEFF', bg: '#1C2440' },
    completed: { fg: '#8FD9B0', bg: '#132B20' },
  },
} as const;

export type Colors = (typeof palette)['light'] | (typeof palette)['dark'];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 8, md: 12, pill: 999 } as const;
export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const },
  subtitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
};

export const useTheme = () => {
  const scheme = useColorScheme();
  return {
    colors: scheme === 'dark' ? palette.dark : palette.light,
    isDark: scheme === 'dark',
  };
};
