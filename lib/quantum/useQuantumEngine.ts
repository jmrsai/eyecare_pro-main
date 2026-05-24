/**
 * useQuantumEngine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React hook that exposes all quantum-inspired analysis engines to components.
 * All processing is synchronous and runs on the JavaScript thread (< 5ms each),
 * so no async/Worker overhead is needed.
 */

import { useState, useCallback, useRef } from 'react';
import {
  scoreGazePattern,
  assessMedicationRisk,
  predictCircadianStrain,
  quantumAnneal,
  type GazePoint,
  type PatternScore,
  type MedicationEntry,
  type MedRiskResult,
  type CircadianInput,
  type CircadianResult,
} from './QuantumCore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuantumEngineState {
  gazeScore: PatternScore | null;
  medRisk: MedRiskResult | null;
  circadianStrain: CircadianResult | null;
  isProcessing: boolean;
  lastRunMs: number;
  totalInferences: number;
}

export interface QuantumEngineActions {
  analyseGaze: (gazePoints: GazePoint[], targetPoints: GazePoint[]) => PatternScore;
  assessMeds: (medications: MedicationEntry[]) => MedRiskResult;
  predictStrain: (input: CircadianInput) => CircadianResult;
  optimiseSchedule: (
    tasks: string[],
    costFn: (idx: number) => number
  ) => { orderedTasks: string[]; cost: number };
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuantumEngine(): [QuantumEngineState, QuantumEngineActions] {
  const [state, setState] = useState<QuantumEngineState>({
    gazeScore: null,
    medRisk: null,
    circadianStrain: null,
    isProcessing: false,
    lastRunMs: 0,
    totalInferences: 0,
  });

  const inferenceCount = useRef(0);

  const run = useCallback(<T>(fn: () => T, stateKey: keyof QuantumEngineState): T => {
    const start = performance.now();
    const result = fn();
    const elapsed = performance.now() - start;
    inferenceCount.current += 1;

    setState(prev => ({
      ...prev,
      [stateKey]: result,
      lastRunMs: Math.round(elapsed * 100) / 100,
      totalInferences: inferenceCount.current,
    }));

    return result;
  }, []);

  const analyseGaze = useCallback(
    (gazePoints: GazePoint[], targetPoints: GazePoint[]): PatternScore =>
      run(() => scoreGazePattern(gazePoints, targetPoints), 'gazeScore'),
    [run]
  );

  const assessMeds = useCallback(
    (medications: MedicationEntry[]): MedRiskResult =>
      run(() => assessMedicationRisk(medications), 'medRisk'),
    [run]
  );

  const predictStrain = useCallback(
    (input: CircadianInput): CircadianResult =>
      run(() => predictCircadianStrain(input), 'circadianStrain'),
    [run]
  );

  const optimiseSchedule = useCallback(
    (tasks: string[], costFn: (idx: number) => number) => {
      const { bestState, bestCost } = quantumAnneal(costFn, tasks.length, {
        steps: 300,
        tunnelStrength: 0.4,
      });
      // Reorder tasks: put best-scored task first
      const ordered = [...tasks];
      const best = ordered.splice(bestState, 1)[0];
      ordered.unshift(best);
      return { orderedTasks: ordered, cost: bestCost };
    },
    []
  );

  const reset = useCallback(() => {
    inferenceCount.current = 0;
    setState({
      gazeScore: null,
      medRisk: null,
      circadianStrain: null,
      isProcessing: false,
      lastRunMs: 0,
      totalInferences: 0,
    });
  }, []);

  return [state, { analyseGaze, assessMeds, predictStrain, optimiseSchedule, reset }];
}
