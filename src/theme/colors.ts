/**
 * Paleta de Cores e Tokens de Acessibilidade do Ecossistema Zelo
 * Projetado com foco em alto contraste (WCAG 2.1 AA/AAA) e usabilidade para idosos.
 */
export const Colors = {
  primary: '#0F172A', // Slate 900
  primaryLight: '#1E293B', // Slate 800
  brand: '#0D9488', // Teal 600
  brandLight: '#14B8A6', // Teal 500
  brandDark: '#115E59', // Teal 800
  
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceCard: '#F1F5F9', // Slate 100
  
  textPrimary: '#0F172A',
  textSecondary: '#334155', // Slate 700
  textMuted: '#64748B', // Slate 500
  textLight: '#FFFFFF',
  
  border: '#CBD5E1', // Slate 300
  borderLight: '#E2E8F0', // Slate 200
  
  success: '#15803D', // Green 700
  successBg: '#DCFCE7', // Green 100
  successBorder: '#86EFAC', // Green 300
  
  warning: '#B45309', // Amber 700
  warningBg: '#FEF3C7', // Amber 100
  warningBorder: '#FCD34D', // Amber 300
  
  danger: '#B91C1C', // Red 700
  dangerBg: '#FEE2E2', // Red 100
  dangerBorder: '#FCA5A5', // Red 300
  
  info: '#0369A1', // Sky 700
  infoBg: '#E0F2FE', // Sky 100
  infoBorder: '#7DD3FC', // Sky 300
};

export const Typography = {
  standard: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
  elderlyAccessible: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
    xxl: 40,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TouchTarget = {
  minTouchTarget: 48,
  accessibleElderlyTarget: 64,
  sosTarget: 80,
};
