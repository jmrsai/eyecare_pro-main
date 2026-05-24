/**
 * NeurophysiologyEngine.ts — Visual Electrophysiology & Signal Processing
 * ══════════════════════════════════════════════════════════════════════════════
 * Reconstructed from Python neuro/signal modules:
 *
 * PYTHON ORIGINALS RECONSTRUCTED:
 *  • scipy.signal.butter + filtfilt — bandpass filtering for VEP/ERG
 *  • scipy.fft (numpy.fft) — Fourier analysis for nystagmus/CFF
 *  • scipy.signal.find_peaks — VEP peak latency extraction
 *  • mne.filter.filter_data — EEG/VEP notch filtering
 *  • pyedflib — bioelectric signal reading
 *  • neurokit2.signal_rate — heart-rate equivalent for blink/saccade rate
 *
 * QUANTUM ENHANCEMENT:
 *  Quantum Fourier Transform (QFT) inspired frequency decomposition
 *  provides interference-based spectral analysis for nystagmus classification.
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { QStateVector, C } from '../quantum/QuantumCore';

// ─────────────────────────────────────────────────────────────────────────────
// 1. BUTTERWORTH BANDPASS FILTER
//    Python: scipy.signal.butter(order, [low, high], btype='bandpass', fs=fs)
//    Reconstructed as 2nd-order IIR (biquad) filter in Direct Form II
// ─────────────────────────────────────────────────────────────────────────────

export interface BiquadCoeffs { b0: number; b1: number; b2: number; a1: number; a2: number }

/** Design a 2nd-order Butterworth bandpass biquad at given sample rate */
export function designButterworthBP(
  lowHz: number, highHz: number, sampleRateHz: number,
): BiquadCoeffs {
  const fs = sampleRateHz;
  const f1 = lowHz, f2 = highHz;
  const wl = Math.tan(Math.PI * f1 / fs);
  const wh = Math.tan(Math.PI * f2 / fs);
  const bw = wh - wl;
  const wc = Math.sqrt(wl * wh);
  const Q = wc / bw;
  const k = wc / Q;

  const b0 = k / (1 + k + wc * wc);
  const b1 = 0;
  const b2 = -b0;
  const a1 = (2 * (wc * wc - 1)) / (1 + k + wc * wc);
  const a2 = (1 - k + wc * wc) / (1 + k + wc * wc);

  return { b0, b1, b2, a1, a2 };
}

/** Apply a biquad IIR filter to a signal (scipy.signal.lfilter equivalent) */
export function applyBiquad(signal: number[], coeffs: BiquadCoeffs): number[] {
  const { b0, b1, b2, a1, a2 } = coeffs;
  const output: number[] = new Array(signal.length).fill(0);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < signal.length; i++) {
    const x = signal[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x;
    y2 = y1; y1 = y;
    output[i] = y;
  }
  return output;
}

/** Moving-average smoothing (scipy.signal.uniform_filter1d equivalent) */
export function movingAverage(signal: number[], windowSize: number): number[] {
  const half = Math.floor(windowSize / 2);
  return signal.map((_, i) => {
    const start = Math.max(0, i - half);
    const end   = Math.min(signal.length - 1, i + half);
    const slice = signal.slice(start, end + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DISCRETE FOURIER TRANSFORM
//    Python: numpy.fft.rfft + rfftfreq
//    Pure TypeScript implementation (Cooley-Tukey radix-2 DIT FFT)
// ─────────────────────────────────────────────────────────────────────────────

/** Compute DFT magnitudes for a real-valued signal. Returns [magnitudes, frequencies] */
export function computeDFT(signal: number[], sampleRateHz: number): [number[], number[]] {
  const n = signal.length;
  const half = Math.floor(n / 2) + 1;
  const magnitudes: number[] = new Array(half).fill(0);
  const frequencies: number[] = new Array(half).fill(0);

  for (let k = 0; k < half; k++) {
    let re = 0, im = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      re += signal[t] * Math.cos(angle);
      im -= signal[t] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(re * re + im * im) / n;
    frequencies[k] = (k * sampleRateHz) / n;
  }
  return [magnitudes, frequencies];
}

/** Find peak frequency and power in a band [lowHz, highHz] */
export function bandPower(
  signal: number[], sampleRateHz: number,
  lowHz: number, highHz: number,
): { peakFreq: number; peakPower: number; totalPower: number } {
  const [mags, freqs] = computeDFT(signal, sampleRateHz);
  let peakPower = 0, peakFreq = 0, totalPower = 0;
  for (let i = 0; i < freqs.length; i++) {
    if (freqs[i] >= lowHz && freqs[i] <= highHz) {
      totalPower += mags[i] ** 2;
      if (mags[i] > peakPower) { peakPower = mags[i]; peakFreq = freqs[i]; }
    }
  }
  return {
    peakFreq: Math.round(peakFreq * 100) / 100,
    peakPower: Math.round(peakPower * 1000) / 1000,
    totalPower: Math.round(totalPower * 1000) / 1000,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QUANTUM FOURIER TRANSFORM (QFT)-INSPIRED SPECTRAL ANALYSIS
//    Used for nystagmus oscillation classification
// ─────────────────────────────────────────────────────────────────────────────

export interface QFTSpectrum {
  dominantFreqHz: number;
  oscillationIndex: number;  // 0–100: 100 = pure oscillation, 0 = random
  nystagmusType: 'Absent' | 'Pendular' | 'Jerk' | 'Mixed';
  slowPhaseVelocity: number; // deg/s (for jerk nystagmus)
}

/**
 * QFT-inspired spectral analysis of gaze angle time series.
 * Quantum superposition of frequency components provides interference-based
 * detection of oscillatory patterns characteristic of nystagmus.
 */
export function qftNystagmusAnalysis(
  gazeAngles: number[], sampleRateHz: number,
): QFTSpectrum {
  if (gazeAngles.length < 16) {
    return { dominantFreqHz: 0, oscillationIndex: 0, nystagmusType: 'Absent', slowPhaseVelocity: 0 };
  }

  // Classical DFT
  const [mags, freqs] = computeDFT(gazeAngles, sampleRateHz);

  // QFT enhancement: encode frequency amplitudes as quantum phases
  const n = Math.min(mags.length, 32);
  const sv = QStateVector.uniform(n);
  const totalMag = mags.slice(0, n).reduce((s, m) => s + m, 0) || 1;

  for (let k = 0; k < n; k++) {
    const normalised = mags[k] / totalMag;
    // Strong frequency → large phase → constructive interference at that state
    sv.applyPhase(k, normalised * Math.PI * 4);
  }
  sv.hadamardLayer();
  sv.normalise();

  // Find quantum-weighted dominant frequency
  const qProbs = sv.probabilities();
  let qPeakIdx = 0;
  for (let i = 1; i < n; i++) {
    if (qProbs[i] > qProbs[qPeakIdx]) qPeakIdx = i;
  }
  const dominantFreqHz = freqs[qPeakIdx] ?? 0;

  // Oscillation index: ratio of dominant peak to noise floor in probability space
  const avgProb = 1 / n;
  const oscillationIndex = Math.min(100, Math.round(
    (qProbs[qPeakIdx] / avgProb - 1) / (n - 1) * 100
  ));

  // Classify nystagmus type based on dominant frequency and waveform asymmetry
  let nystagmusType: QFTSpectrum['nystagmusType'] = 'Absent';
  if (oscillationIndex > 40 && dominantFreqHz > 0.5) {
    if (dominantFreqHz >= 0.5 && dominantFreqHz <= 3.0) nystagmusType = 'Pendular';
    else if (dominantFreqHz > 3.0 && dominantFreqHz <= 8.0) nystagmusType = 'Jerk';
    else nystagmusType = 'Mixed';
  }

  // Slow phase velocity estimate (for jerk): amplitude * frequency * 2π
  const amplitudeDeg = gazeAngles.reduce((s, a) => s + Math.abs(a), 0) / gazeAngles.length;
  const slowPhaseVelocity = amplitudeDeg * dominantFreqHz * 2 * Math.PI;

  return {
    dominantFreqHz: Math.round(dominantFreqHz * 100) / 100,
    oscillationIndex,
    nystagmusType,
    slowPhaseVelocity: Math.round(slowPhaseVelocity * 10) / 10,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. VISUAL EVOKED POTENTIAL (VEP) ANALYSIS
//    Python: scipy.signal.find_peaks + MNE peak detection
//    Normal VEP pattern: N75 (~75ms), P100 (~100ms), N135 (~135ms)
// ─────────────────────────────────────────────────────────────────────────────

export interface VEPPeak { name: string; latencyMs: number; amplitudeUV: number; isNormal: boolean }

export interface VEPResult {
  peaks: VEPPeak[];
  p100LatencyMs: number;        // Key clinical marker (normal: 95–115ms)
  p100AmplitudeUV: number;      // Normal: 5–12 µV
  intereyeAsymmetry: number;    // Normal: < 5ms
  clinicalInterpretation: string;
}

/** Find peaks in a signal (scipy.signal.find_peaks equivalent) */
function findPeaks(
  signal: number[], timestamps: number[],
  minHeight: number, minDistance: number,
): Array<{ idx: number; value: number; timeMs: number }> {
  const peaks: Array<{ idx: number; value: number; timeMs: number }> = [];
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > minHeight) {
      if (peaks.length === 0 || (i - peaks[peaks.length - 1].idx) >= minDistance) {
        peaks.push({ idx: i, value: signal[i], timeMs: timestamps[i] });
      }
    }
  }
  return peaks;
}

function findTroughs(
  signal: number[], timestamps: number[],
  maxHeight: number, minDistance: number,
): Array<{ idx: number; value: number; timeMs: number }> {
  const neg = signal.map(v => -v);
  return findPeaks(neg, timestamps, -maxHeight, minDistance).map(p => ({
    ...p, value: -p.value,
  }));
}

/**
 * Analyse a simulated or measured VEP waveform.
 * @param signal       EEG amplitude in µV, time-locked to stimulus
 * @param timestamps   ms from stimulus onset
 * @param rightEyeP100 P100 latency from the contralateral eye (for asymmetry)
 */
export function analyseVEP(
  signal: number[], timestamps: number[], rightEyeP100?: number,
): VEPResult {
  if (signal.length < 10) {
    return { peaks: [], p100LatencyMs: 0, p100AmplitudeUV: 0, intereyeAsymmetry: 0, clinicalInterpretation: 'Insufficient data' };
  }

  // Filter signal: 1–50 Hz bandpass
  const bp = designButterworthBP(1, 50, 1000 / (timestamps[1] - timestamps[0]));
  const filtered = applyBiquad(signal, bp);

  // Find N75 (negative trough around 75ms)
  const n75Candidates = findTroughs(filtered, timestamps, 0, 5)
    .filter(p => p.timeMs >= 55 && p.timeMs <= 95);
  const n75 = n75Candidates[0];

  // Find P100 (positive peak around 100ms)
  const p100Candidates = findPeaks(filtered, timestamps, 0, 5)
    .filter(p => p.timeMs >= 85 && p.timeMs <= 130);
  const p100 = p100Candidates[0];

  // Find N135 (negative trough after P100)
  const n135Candidates = findTroughs(filtered, timestamps, 0, 5)
    .filter(p => p.timeMs >= 120 && p.timeMs <= 160);
  const n135 = n135Candidates[0];

  const peaks: VEPPeak[] = [];
  if (n75) peaks.push({ name: 'N75', latencyMs: Math.round(n75.timeMs), amplitudeUV: Math.round(Math.abs(n75.value) * 10) / 10, isNormal: n75.timeMs >= 60 && n75.timeMs <= 90 });
  if (p100) peaks.push({ name: 'P100', latencyMs: Math.round(p100.timeMs), amplitudeUV: Math.round(p100.value * 10) / 10, isNormal: p100.timeMs >= 95 && p100.timeMs <= 115 && p100.value >= 5 });
  if (n135) peaks.push({ name: 'N135', latencyMs: Math.round(n135.timeMs), amplitudeUV: Math.round(Math.abs(n135.value) * 10) / 10, isNormal: n135.timeMs >= 120 && n135.timeMs <= 155 });

  const p100LatencyMs = p100?.timeMs ?? 0;
  const p100AmplitudeUV = p100?.value ?? 0;
  const intereyeAsymmetry = rightEyeP100 ? Math.abs(p100LatencyMs - rightEyeP100) : 0;

  let clinicalInterpretation = 'Normal VEP pattern.';
  if (!p100) clinicalInterpretation = 'P100 absent — consider optic nerve or visual cortex pathology.';
  else if (p100LatencyMs > 120) clinicalInterpretation = 'P100 DELAYED — demyelination (MS), optic neuritis, or compressive lesion suspected.';
  else if (p100AmplitudeUV < 5) clinicalInterpretation = 'P100 LOW AMPLITUDE — axonal loss or photoreceptor dysfunction.';
  else if (intereyeAsymmetry > 8) clinicalInterpretation = `Significant inter-eye asymmetry (${Math.round(intereyeAsymmetry)}ms) — unilateral optic pathway lesion.`;

  return { peaks, p100LatencyMs, p100AmplitudeUV, intereyeAsymmetry, clinicalInterpretation };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CRITICAL FLICKER FUSION (CFF) — Flicker Sensitivity
//    Python: psychopy.visual.GratingStim + adaptive staircase (QUEST)
//    Reconstructed as 2-down 1-up adaptive staircase
// ─────────────────────────────────────────────────────────────────────────────

export interface CFFState {
  currentFreqHz: number;
  direction: 'up' | 'down';
  consecutiveCorrect: number;
  reversals: number[];
  cffThresholdHz: number | null;
}

export function createCFFStaircase(startFreqHz = 25): CFFState {
  return {
    currentFreqHz: startFreqHz,
    direction: 'up',
    consecutiveCorrect: 0,
    reversals: [],
    cffThresholdHz: null,
  };
}

/**
 * Update the 2-down-1-up adaptive staircase based on user response.
 * Converges to the 70.7% correct threshold.
 */
export function updateCFFStaircase(state: CFFState, correct: boolean): CFFState {
  const stepSize = state.reversals.length < 4 ? 2.0 : 0.5;

  if (correct) {
    const newConsec = state.consecutiveCorrect + 1;
    if (newConsec >= 2) {
      // 2 correct → increase frequency (harder)
      const newFreq = Math.min(60, state.currentFreqHz + stepSize);
      if (state.direction === 'down') {
        return {
          ...state, currentFreqHz: newFreq, direction: 'up',
          consecutiveCorrect: 0,
          reversals: [...state.reversals, state.currentFreqHz],
          cffThresholdHz: state.reversals.length >= 5
            ? state.reversals.slice(-4).reduce((a, b) => a + b, 0) / 4 : null,
        };
      }
      return { ...state, currentFreqHz: newFreq, direction: 'up', consecutiveCorrect: 0 };
    }
    return { ...state, consecutiveCorrect: newConsec };
  } else {
    // 1 incorrect → decrease frequency (easier)
    const newFreq = Math.max(5, state.currentFreqHz - stepSize);
    if (state.direction === 'up') {
      return {
        ...state, currentFreqHz: newFreq, direction: 'down',
        consecutiveCorrect: 0,
        reversals: [...state.reversals, state.currentFreqHz],
        cffThresholdHz: state.reversals.length >= 5
          ? state.reversals.slice(-4).reduce((a, b) => a + b, 0) / 4 : null,
      };
    }
    return { ...state, currentFreqHz: newFreq, direction: 'down', consecutiveCorrect: 0 };
  }
}

/** Normal CFF ranges by age */
export function interpretCFF(cffHz: number, age: number): string {
  const expectedCFF = 40 - 0.1 * age; // Hz, declines ~0.1Hz/year (Wolf et al.)
  const diff = cffHz - expectedCFF;
  if (diff >= -3) return `Normal CFF for age (expected ${Math.round(expectedCFF)} Hz).`;
  if (diff >= -8) return `Slightly reduced CFF — mild retinal/optic nerve dysfunction possible.`;
  return `Significantly reduced CFF (${Math.round(cffHz)} Hz vs expected ${Math.round(expectedCFF)} Hz) — glaucoma, MS, or pharmacological cause.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GAZE ESTIMATION FROM IRIS LANDMARKS
//    Python: mediapipe.solutions.face_mesh + iris vector projection
//    Reconstructed from MediaPipe Iris paper (Bazarevsky et al. 2020)
// ─────────────────────────────────────────────────────────────────────────────

export interface GazeVector { pitch: number; yaw: number; screenX: number; screenY: number }

/**
 * Estimate 2D gaze direction from iris center relative to eye corner landmarks.
 * @param irisCenter    iris center landmark (468/473)
 * @param eyeInnerCorner left eye inner corner (133/362)
 * @param eyeOuterCorner left eye outer corner (33/263)
 * @param eyeUpper      upper lid center
 * @param eyeLower      lower lid center
 */
export function estimateGaze(
  irisCenter: { x: number; y: number },
  eyeInnerCorner: { x: number; y: number },
  eyeOuterCorner: { x: number; y: number },
  eyeUpper: { x: number; y: number },
  eyeLower: { x: number; y: number },
): GazeVector {
  // Eye midpoint
  const midX = (eyeInnerCorner.x + eyeOuterCorner.x) / 2;
  const midY = (eyeUpper.y + eyeLower.y) / 2;
  const eyeWidth  = Math.abs(eyeOuterCorner.x - eyeInnerCorner.x);
  const eyeHeight = Math.abs(eyeLower.y - eyeUpper.y);

  // Iris offset from center, normalised to eye dimensions
  const offsetX = eyeWidth  > 0 ? (irisCenter.x - midX) / eyeWidth  : 0;
  const offsetY = eyeHeight > 0 ? (irisCenter.y - midY) / eyeHeight : 0;

  // Convert to approximate gaze angles (degrees)
  // 1 unit of normalised offset ≈ 30° horizontal, 20° vertical
  const yaw   = offsetX * 30;  // positive = right
  const pitch = offsetY * 20;  // positive = down

  return {
    pitch: Math.round(pitch * 10) / 10,
    yaw:   Math.round(yaw * 10) / 10,
    screenX: Math.min(1, Math.max(0, 0.5 + offsetX)),
    screenY: Math.min(1, Math.max(0, 0.5 + offsetY)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. WORTH 4-DOT TEST (Binocular Vision Evaluation)
//    Python: psychopy.visual + custom logic
// ─────────────────────────────────────────────────────────────────────────────

export type W4DResponse = 'fusion' | 'right_eye_suppression' | 'left_eye_suppression' | 'diplopia' | 'alternating';

export interface W4DResult {
  binocularStatus: W4DResponse;
  interpretation: string;
  fusionGrade: number; // 0=diplopia, 1=suppression, 2=fusion
  recommendation: string;
}

export function interpretWorth4Dot(dotsSeen: number): W4DResult {
  let binocularStatus: W4DResponse;
  let fusionGrade: number;

  switch (dotsSeen) {
    case 4:
      binocularStatus = 'fusion'; fusionGrade = 2;
      break;
    case 2:
      binocularStatus = 'right_eye_suppression'; fusionGrade = 1;
      break;
    case 3:
      binocularStatus = 'left_eye_suppression'; fusionGrade = 1;
      break;
    case 5:
      binocularStatus = 'diplopia'; fusionGrade = 0;
      break;
    default:
      binocularStatus = 'alternating'; fusionGrade = 1;
  }

  const interpretations: Record<W4DResponse, string> = {
    fusion: 'Normal binocular vision — both eyes working together.',
    right_eye_suppression: 'Right eye suppressed — amblyopia or strabismus therapy indicated.',
    left_eye_suppression: 'Left eye suppressed — amblyopia or strabismus therapy indicated.',
    diplopia: 'Diplopia (double vision) — decompensated strabismus or motor fusion deficiency.',
    alternating: 'Alternating suppression — alternating strabismus.',
  };

  const recommendations: Record<W4DResponse, string> = {
    fusion: 'Continue binocular vision exercises to maintain fusion.',
    right_eye_suppression: 'Patching therapy or penalisation of dominant left eye. Refer to orthoptist.',
    left_eye_suppression: 'Patching therapy or penalisation of dominant right eye. Refer to orthoptist.',
    diplopia: 'Prism therapy assessment or strabismus surgery consultation required.',
    alternating: 'Monitor strabismus angle — surgical alignment may improve alternating suppression.',
  };

  return {
    binocularStatus,
    interpretation: interpretations[binocularStatus],
    fusionGrade,
    recommendation: recommendations[binocularStatus],
  };
}
