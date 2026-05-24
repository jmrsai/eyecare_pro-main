/**
 * index.ts — Quantum Modules Public API
 * ─────────────────────────────────────────────────────────────────────────────
 * Import everything from this file:
 *   import { useQuantumEngine, QStateVector, scoreGazePattern } from '@/lib/quantum';
 */

// Core algorithms
export {
  // Primitives
  C,
  QStateVector,
  // Optimisation
  quantumAnneal,
  // Eye pattern analysis
  scoreGazePattern,
  // Medication risk
  assessMedicationRisk,
  // Circadian prediction
  predictCircadianStrain,
} from './QuantumCore';

// Type exports
export type {
  Complex,
  AnnealingConfig,
  GazePoint,
  PatternScore,
  MedicationEntry,
  MedRiskResult,
  CircadianInput,
  CircadianResult,
} from './QuantumCore';

// React hook
export { useQuantumEngine } from './useQuantumEngine';
export type { QuantumEngineState, QuantumEngineActions } from './useQuantumEngine';

// Version metadata
export const QUANTUM_MODULE_VERSION = '1.0.0';
export const QUANTUM_MODULE_INFO = {
  version: QUANTUM_MODULE_VERSION,
  description: 'Mini Quantum Modules — EyeCare Pro quantum-inspired analytics engine',
  algorithms: [
    'QStateVector (superposition/interference)',
    'Simulated Quantum Annealing (SQA)',
    'Quantum Interference Pattern Scoring',
    'Quantum Amplitude Estimation (QAE)',
    'Discrete Quantum Walk',
  ],
  runtime: 'Pure TypeScript — 100% on-device, no network required',
  medicalDisclaimer: 'Quantum-inspired algorithms for pattern analysis only. Not a medical device.',
};
