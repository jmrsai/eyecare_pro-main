
import * as Localization from 'expo-localization';

const translations = {
  en: {
    astigmatism: 'Astigmatism',
    colorVision: 'Color Vision',
    visualAcuity: 'Visual Acuity',
    consultDoctor: 'Consult Doctor',
    saccadicTraining: 'Saccadic Training',
    headMovementWarning: 'Please keep your head still.',
    amslerGrid: 'Amsler Grid',
    contrastSensitivity: 'Contrast Sensitivity',
    resultsDashboard: 'Results Dashboard',
    trendAnalysis: 'Trend Analysis',
    educationalContent: 'Educational Content',
    userProfile: 'User Profile',
    deviceCalibration: 'Device Calibration',
    normal: 'Normal',
    attention: 'Attention',
    concern: 'Concern',
    rightEye: 'Right Eye',
    leftEye: 'Left Eye',
    reset: 'Reset',
  },
  es: {
    astigmatism: 'Astigmatismo',
    colorVision: 'Visión de color',
    visualAcuity: 'Agudeza visual',
    consultDoctor: 'Consulte a su médico',
    saccadicTraining: 'Entrenamiento Sacádico',
    headMovementWarning: 'Por favor, mantenga la cabeza quieta.',
    amslerGrid: 'Rejilla de Amsler',
    contrastSensitivity: 'Sensibilidad al Contraste',
    resultsDashboard: 'Tablero de Resultados',
    trendAnalysis: 'Análisis de Tendencias',
    educationalContent: 'Contenido Educativo',
    userProfile: 'Perfil de Usuario',
    deviceCalibration: 'Calibración del Dispositivo',
    normal: 'Normal',
    attention: 'Atención',
    concern: 'Preocupación',
    rightEye: 'Ojo Derecho',
    leftEye: 'Ojo Izquierdo',
    reset: 'Reiniciar',
  },
  // Add other languages here
};

const getLocale = () => {
  const locale = Localization.locale;
  return locale.split('-')[0]; // Get the language code (e.g., 'en' from 'en-US')
};

export const t = (key: keyof typeof translations.en) => {
  const locale = getLocale();
  const lang = translations[locale] ? locale : 'en';
  return translations[lang][key] || translations.en[key] || key;
};
