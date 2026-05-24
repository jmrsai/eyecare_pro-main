/**
 * lib/ai/index.ts — EyeCare Pro AI Engine Public API
 * ══════════════════════════════════════════════════════════════════════════════
 * Single import point for all AI/quantum modules.
 * Usage: import { EARAnalyser, analyseVEP, generateQuantumInsights } from '@/lib/ai';
 */

// ── Eye Aspect Ratio & Pupillometry ──────────────────────────────────────────
export {
  computeEAR,
  EARAnalyser,
  analysePLR,
  analyseIris,
  analyseSaccades,
  EYE_LANDMARKS,
} from './EyeAR';
export type {
  LandmarkPoint,
  EARResult,
  PLRResult,
  IrisMetrics,
  SaccadeMetrics,
} from './EyeAR';

// ── Clinical Vision Algorithms ────────────────────────────────────────────────
export {
  snellenToLogMAR,
  logMARToSnellen,
  logMARToETDRS,
  etdrsToLogMAR,
  getAcuityProfile,
  refractionToPowerVector,
  powerVectorToRefraction,
  sphericalEquivalent,
  prismaticDeviation,
  predictMyopiaProgression,
  analyseVisualField,
  analyseCSF,
  correctIOP,
  classifyColourVision,
  scoreStereopsis,
} from './ClinicalVision';
export type {
  AcuityResult,
  Refraction,
  PowerVector,
  MyopiaDataPoint,
  MyopiaProgressionResult,
  VisualFieldResult,
  CSFResult,
  IOPResult,
  ColourVisionType,
  ColourVisionResult,
  StereopsisResult,
} from './ClinicalVision';

// ── Neurophysiology & Signal Processing ──────────────────────────────────────
export {
  designButterworthBP,
  applyBiquad,
  movingAverage,
  computeDFT,
  bandPower,
  qftNystagmusAnalysis,
  analyseVEP,
  createCFFStaircase,
  updateCFFStaircase,
  interpretCFF,
  estimateGaze,
  interpretWorth4Dot,
} from './NeurophysiologyEngine';
export type {
  BiquadCoeffs,
  QFTSpectrum,
  VEPPeak,
  VEPResult,
  CFFState,
  GazeVector,
  W4DResponse,
  W4DResult,
} from './NeurophysiologyEngine';

// ── Quantum Health Insights & Recommendations ─────────────────────────────────
export {
  generateQuantumInsights,
  getQuantumRecommendation,
} from './QuantumHealthInsights';
export type {
  EyeHealthRecord,
  QuantumInsight,
  QuantumRecommendation,
  RecommendedExercise,
} from './QuantumHealthInsights';

// ── Retinal Biomarkers & Systemic Disease ─────────────────────────────────────
export {
  computeAVR,
  computeFractalDimension,
  computeTortuosity,
  predictRetinalAge,
  gradeDiabeticRetinopathy,
  computeGlaucomaProbability,
  computeAlzheimerRiskIndex,
  compute10YearCVDRisk,
  stratifyAMDRisk,
  vqeRiskVector,
  assessSystemicRisk,
} from './RetinalBiomarkerEngine';
export type {
  RetinalVesselMetrics,
  OpticDiscMetrics,
  RNFLMetrics,
  SystemicRiskProfile,
  RetinalAssessmentInput,
} from './RetinalBiomarkerEngine';

// ── Gamma Therapy & Neuro-entrainment ─────────────────────────────────────────
export {
  THERAPY_PRESCRIPTIONS,
  screenForTherapySafety,
  generateFlickerSequence,
  quantumGammaEntrainment,
  designBinauralBeat,
  evaluateTherapySession,
} from './GammaTherapyEngine';
export type {
  TherapyMode,
  TherapySession,
  TherapyResult,
  GammaPrescription,
  SafetyScreening,
  FlickerFrame,
  BinauralParameters,
} from './GammaTherapyEngine';

// ── Quantum Eye Photo Scanner ────────────────────────────────────────────────
export {
  qcnnClassify,
  diagnoseEyePhoto,
} from './QuantumEyeScanner';
export type {
  EyeCondition,
  WHOSeverity,
  ImageBiomarkers,
  ClinicalDiagnosis,
} from './QuantumEyeScanner';

// ── Legacy API (backward compatible) ─────────────────────────────────────────
export { generateHealthInsights } from './healthInsights';
export { getPersonalizedRecommendation } from './recommendationEngine';

// ── Module metadata ───────────────────────────────────────────────────────────
export const AI_ENGINE_VERSION = '2.2.0-quantum';
export const AI_ENGINE_MODULES = [
  'EyeAR (EAR, PLR, Iris, Saccade)',
  'ClinicalVision (Acuity, Refraction, Myopia, VF, CSF, IOP, Colour, Stereo)',
  'NeurophysiologyEngine (VEP, Nystagmus QFT, CFF, Gaze, Worth4Dot)',
  'QuantumHealthInsights (QBN Insights, Quantum-Annealed Therapy)',
  'QuantumCore (QStateVector, Annealing, Amplitude Estimation, Walk)',
  'RetinalBiomarkerEngine (DeepMind ARDA, UK Biobank AD, VQE Risk)',
  'GammaTherapyEngine (MIT 40Hz GENUS, Safety, Waveforms, Q-Walk Entrainment)',
  'QuantumEyeScanner (QCNN Image Scanner, TFOS DEWS II, WHO Severity)',
];
