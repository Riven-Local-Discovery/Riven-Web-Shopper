// Mirrors the CSS custom properties in styles.css for the few places that need colors in JS.
export const colors = {
  primary: '#0B132B',
  primarySoft: '#1C2541',
  secondary: '#FF6B5E',
  secondarySoft: '#FFE3DF',
  tertiary: '#9BA1B7',
  neutral: '#787679',

  background: '#F8F3EC',
  surface: '#FFFFFF',
  surfaceAlt: '#F2ECE3',
  border: '#E7DFD3',
  overlay: 'rgba(11, 19, 43, 0.55)',

  text: '#0B132B',
  textMuted: '#787679',
  textSubtle: '#9BA1B7',
  textOnDark: '#FFFFFF',

  success: '#2E9E6B',
  successSoft: '#DDF3E8',
  warning: '#E8A33D',
  warningSoft: '#FCEFD8',
  info: '#3C6FD8',
  infoSoft: '#E1E9FA',
  danger: '#D64545',
  dangerSoft: '#FBE2E2',
  star: '#F5A524',
} as const;
