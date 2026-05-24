import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useQuantumEngine } from '@/lib/quantum/useQuantumEngine';
import { predictCircadianStrain, assessMedicationRisk } from '@/lib/quantum/QuantumCore';
import { assessSystemicRisk, type RetinalAssessmentInput, type SystemicRiskProfile } from '@/lib/ai';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Mini pulse animation ──────────────────────────────────────────────────────
function PulseDot({ color = '#00f5ff', size = 8 }: { color?: string; size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);
  return (
    <Animated.View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, transform: [{ scale }],
        shadowColor: color, shadowOpacity: 0.9, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

// ─── Quantum State Visualiser ─────────────────────────────────────────────────
function QuantumStateBar({ probabilities, label }: { probabilities: number[]; label: string }) {
  const bars = probabilities.slice(0, 16); // show max 16
  return (
    <View style={styles.qbarContainer}>
      <Text style={styles.qbarLabel}>{label}</Text>
      <View style={styles.qbarRow}>
        {bars.map((p, i) => (
          <View key={i} style={styles.qbarSlot}>
            <View
              style={[
                styles.qbarFill,
                {
                  height: Math.max(4, p * 60),
                  backgroundColor: `hsl(${180 + i * 12}, 90%, 60%)`,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score, anim]);

  return (
    <View style={styles.scoreRingContainer}>
      <View style={[styles.scoreRing, { borderColor: color + '44' }]}>
        <View style={[styles.scoreRingInner, { borderColor: color }]}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      </View>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

// ─── Custom Slider Component (Pure-JS Bulletproof Incrementer) ─────────────────
interface CustomSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

function CustomSlider({ label, value, min, max, step = 1, unit = '', onChange }: CustomSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <View style={styles.sliderControl}>
      <View style={styles.sliderTextRow}>
        <Text style={styles.sliderTextLabel}>{label}</Text>
        <Text style={styles.sliderValueText}>{value.toFixed(step >= 1 ? 0 : 2)}{unit}</Text>
      </View>
      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.sliderBtn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={styles.sliderBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.sliderTrackBackground}>
          <View style={[styles.sliderTrackFill, { width: `${percent}%` }]} />
        </View>
        <TouchableOpacity
          style={styles.sliderBtn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={styles.sliderBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Quantum Dashboard ───────────────────────────────────────────────────
export default function QuantumDashboard() {
  const [, { predictStrain, assessMeds }] = useQuantumEngine();
  const [strainResult, setStrainResult] = useState<any>(null);
  const [medResult, setMedResult] = useState<any>(null);
  
  // Retinal Biomarker states
  const [age, setAge] = useState(38);
  const [artWidth, setArtWidth] = useState(115); // px
  const [venWidth, setVenWidth] = useState(165); // px
  const [cdrVal, setCdrVal] = useState(0.42);    // vertical Cup-to-Disc Ratio
  const [rnflVal, setRnflVal] = useState(102);   // µm RNFL thickness
  const [bpVal, setBpVal] = useState(125);       // mmHg systolic
  const [smoker, setSmoker] = useState(false);
  const [diabetic, setDiabetic] = useState(false);
  const [retinaResult, setRetinaResult] = useState<SystemicRiskProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'circadian' | 'medication' | 'retina' | 'info'>('circadian');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Run initial analysis
    runCircadianAnalysis();
    runMedicationAnalysis();
  }, []);

  // Update retinal analysis on state change
  useEffect(() => {
    runRetinaAssessment();
  }, [age, artWidth, venWidth, cdrVal, rnflVal, bpVal, smoker, diabetic]);

  const runCircadianAnalysis = () => {
    const now = new Date();
    const result = predictCircadianStrain({
      hourOfDay: now.getHours() + now.getMinutes() / 60,
      continuousScreenMinutes: 45,
      blueLight: false,
      ambientLux: 300,
      userAge: 28,
      hasDryEye: false,
    });
    setStrainResult(result);
  };

  const runMedicationAnalysis = () => {
    const result = assessMedicationRisk([
      { name: 'Timolol', doseMg: 5, frequencyPerDay: 2, eyeSideEffectRisk: 0.15, iop_effect: -0.4 },
      { name: 'Latanoprost', doseMg: 0.005, frequencyPerDay: 1, eyeSideEffectRisk: 0.12, iop_effect: -0.5 },
    ]);
    setMedResult(result);
  };

  const runRetinaAssessment = () => {
    const result = assessSystemicRisk({
      arterioleWidths: [artWidth, artWidth * 0.96, artWidth * 1.04],
      venuleWidths: [venWidth, venWidth * 0.97, venWidth * 1.03],
      vesselArcLengths: [122, 116, 132, 126, 120],
      vesselChordLengths: [118, 110, 124, 121, 116], // yields normal, low tortuosity
      cupToDiskRatio: cdrVal,
      discAreaMM2: 1.88,
      rimNotching: cdrVal > 0.68,
      rnflAverage: rnflVal,
      rnflInferior: rnflVal * 0.88,
      rnflSuperior: rnflVal * 1.08,
      gccThickness: Math.round(rnflVal * 0.82),
      mfVassDensity: 49.2,
      microaneurysmCount: diabetic ? 9 : 0,
      hemorrhageCount: diabetic ? 2 : 0,
      neovascularzation: false,
      hardExudates: false,
      drusenSize: 'None',
      drusenArea: 0,
      pigmentaryChanges: false,
      chronologicalAge: age,
      systolicBP: bpVal,
      isDiabetic: diabetic,
      isSmoker: smoker,
    });
    setRetinaResult(result);
  };

  const strainColor = strainResult
    ? strainResult.strainScore > 70 ? '#ff4444' : strainResult.strainScore > 40 ? '#ffaa00' : '#00e676'
    : '#00f5ff';

  // SVG Calculations for Digital Twin Retina disc cup visualizer
  const centerCoord = 90;
  const discRadius = 42;
  const cupRadius = discRadius * Math.sqrt(cdrVal);

  return (
    <LinearGradient colors={['#050b1a', '#0a1628', '#0d1f3c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <PulseDot color="#00f5ff" size={10} />
            <Text style={styles.headerTitle}>Quantum Eye Engine</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>v2.0 CLINICAL</Text>
          </View>
        </Animated.View>

        <Text style={styles.headerSub}>
          Quantum-inspired medical AI running locally on your device
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['circadian', 'medication', 'retina', 'info'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'circadian' ? '👁 Circadian' : tab === 'medication' ? '💊 Meds' : tab === 'retina' ? '👁️‍🗨️ Retina' : 'ℹ Info'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CIRCADIAN TAB ── */}
        {activeTab === 'circadian' && strainResult && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.ringRow}>
              <ScoreRing score={strainResult.strainScore} label="Eye Strain" color={strainColor} />
              <ScoreRing score={Math.round(strainResult.breakRecommendedInMin)} label="Break In (min)" color="#00e5ff" />
            </View>

            {/* Advice card */}
            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.card}>
              <Text style={styles.cardTitle}>⚛ Quantum Walk Prediction</Text>
              <View style={styles.row}>
                <PulseDot color={strainColor} size={6} />
                <Text style={[styles.cardValue, { color: strainColor, marginLeft: 8 }]}>
                  {strainResult.advice}
                </Text>
              </View>
              <Text style={styles.cardMeta}>Peak strain window: {strainResult.peakStrainWindow}</Text>
              <Text style={styles.cardMeta}>Quantum walk step: {strainResult.quantumWalkStep}/48</Text>
            </LinearGradient>

            {/* Quantum state visualiser */}
            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.card}>
              <Text style={styles.cardTitle}>⟨ψ| Superposition State</Text>
              <QuantumStateBar
                probabilities={Array.from({ length: 16 }, (_, i) =>
                  Math.exp(-Math.pow(i - strainResult.quantumWalkStep / 3, 2) / 4)
                )}
                label="Strain probability distribution over time"
              />
            </LinearGradient>

            <TouchableOpacity style={styles.refreshBtn} onPress={runCircadianAnalysis}>
              <Text style={styles.refreshBtnText}>↻ Re-run Quantum Analysis</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── MEDICATION TAB ── */}
        {activeTab === 'medication' && medResult && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.ringRow}>
              <ScoreRing
                score={medResult.overallRisk}
                label="Risk Score"
                color={medResult.overallRisk > 60 ? '#ff4444' : medResult.overallRisk > 30 ? '#ffaa00' : '#00e676'}
              />
              <ScoreRing
                score={Math.round(medResult.quantumConfidence * 100)}
                label="QAE Confidence"
                color="#b39ddb"
              />
            </View>

            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.card}>
              <Text style={styles.cardTitle}>🔬 Quantum Amplitude Estimation</Text>
              <Text style={[styles.recommendation, {
                color: medResult.overallRisk > 60 ? '#ff6b6b' : medResult.overallRisk > 30 ? '#ffd54f' : '#69f0ae'
              }]}>
                {medResult.recommendation}
              </Text>
              {medResult.iop_concern && (
                <View style={styles.alertBox}>
                  <Text style={styles.alertText}>⚠ IOP Effect Detected — Monitor intraocular pressure</Text>
                </View>
              )}
              {medResult.interactions.length > 0 && medResult.interactions.map((i: string, idx: number) => (
                <View key={idx} style={styles.interactionBox}>
                  <Text style={styles.interactionText}>⛔ {i}</Text>
                </View>
              ))}
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── RETINAL BIOMARKERS & DIGITAL TWIN TAB ── */}
        {activeTab === 'retina' && retinaResult && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* SVG Visualizer representing the Optic Disc and Vasculature */}
            <LinearGradient colors={['#0c192d', '#081222']} style={styles.digitalTwinCard}>
              <View style={styles.twinHeader}>
                <PulseDot color="#00e5ff" size={6} />
                <Text style={styles.twinTitle}>Digital Twin: Optic Fundus (Live Model)</Text>
              </View>
              
              <View style={styles.twinContainer}>
                <Svg width="180" height="180" style={styles.retinaSvg}>
                  {/* Optic Disc */}
                  <Circle cx={centerCoord} cy={centerCoord} r={discRadius} fill="#ffd54f" opacity="0.65" />
                  {/* Optic Cup (CDR representation) */}
                  <Circle cx={centerCoord} cy={centerCoord} r={cupRadius} fill="#fff9c4" opacity="0.85" />
                  
                  {/* Four major branching vessel pairs (arteriole = red, venule = dark purple) */}
                  {/* Upper Right Quadrant */}
                  <Path d={`M ${centerCoord},${centerCoord} Q ${centerCoord+15},${centerCoord-25} ${centerCoord+50},${centerCoord-65}`} fill="none" stroke="#ef5350" strokeWidth={Math.max(1, artWidth / 55)} />
                  <Path d={`M ${centerCoord+2},${centerCoord-2} Q ${centerCoord+20},${centerCoord-23} ${centerCoord+55},${centerCoord-61}`} fill="none" stroke="#880e4f" strokeWidth={Math.max(1.5, venWidth / 55)} />
                  
                  {/* Lower Right Quadrant */}
                  <Path d={`M ${centerCoord},${centerCoord} Q ${centerCoord+25},${centerCoord+15} ${centerCoord+65},${centerCoord+50}`} fill="none" stroke="#ef5350" strokeWidth={Math.max(1, artWidth / 55)} />
                  <Path d={`M ${centerCoord+2},${centerCoord+2} Q ${centerCoord+27},${centerCoord+12} ${centerCoord+69},${centerCoord+46}`} fill="none" stroke="#880e4f" strokeWidth={Math.max(1.5, venWidth / 55)} />
                  
                  {/* Upper Left Quadrant */}
                  <Path d={`M ${centerCoord},${centerCoord} Q ${centerCoord-20},${centerCoord-20} ${centerCoord-60},${centerCoord-55}`} fill="none" stroke="#ef5350" strokeWidth={Math.max(1, artWidth / 55)} />
                  <Path d={`M ${centerCoord-2},${centerCoord-2} Q ${centerCoord-18},${centerCoord-22} ${centerCoord-56},${centerCoord-59}`} fill="none" stroke="#880e4f" strokeWidth={Math.max(1.5, venWidth / 55)} />

                  {/* Lower Left Quadrant */}
                  <Path d={`M ${centerCoord},${centerCoord} Q ${centerCoord-15},${centerCoord+30} ${centerCoord-50},${centerCoord+65}`} fill="none" stroke="#ef5350" strokeWidth={Math.max(1, artWidth / 55)} />
                  <Path d={`M ${centerCoord-2},${centerCoord+2} Q ${centerCoord-13},${centerCoord+32} ${centerCoord-46},${centerCoord+69}`} fill="none" stroke="#880e4f" strokeWidth={Math.max(1.5, venWidth / 55)} />
                </Svg>
                
                <View style={styles.twinLegend}>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ffd54f' }]} /><Text style={styles.legendText}>Optic Disc</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#fff9c4' }]} /><Text style={styles.legendText}>Optic Cup</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef5350' }]} /><Text style={styles.legendText}>Arteriole (A)</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#880e4f' }]} /><Text style={styles.legendText}>Venule (V)</Text></View>
                </View>
              </View>
            </LinearGradient>

            {/* Live Sliders for Real-Time Parameter adjustments */}
            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.card}>
              <Text style={styles.cardTitle}>🔬 Interactive Fundus Biomarkers</Text>
              
              <CustomSlider label="Chronological Age" value={age} min={18} max={90} step={1} unit=" yr" onChange={setAge} />
              <CustomSlider label="Arteriole Width" value={artWidth} min={80} max={150} step={5} unit=" px" onChange={setArtWidth} />
              <CustomSlider label="Venule Width" value={venWidth} min={110} max={210} step={5} unit=" px" onChange={setVenWidth} />
              <CustomSlider label="Optic Cup-to-Disc Ratio (vCDR)" value={cdrVal} min={0.15} max={0.90} step={0.05} onChange={setCdrVal} />
              <CustomSlider label="RNFL Average Thickness" value={rnflVal} min={50} max={120} step={2} unit=" µm" onChange={setRnflVal} />
              <CustomSlider label="Systolic Blood Pressure" value={bpVal} min={90} max={180} step={5} unit=" mmHg" onChange={setBpVal} />
              
              {/* Toggles */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, smoker && styles.toggleBtnActive]}
                  onPress={() => setSmoker(!smoker)}
                >
                  <Text style={styles.toggleBtnText}>🚬 Smoker: {smoker ? 'Yes' : 'No'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, diabetic && styles.toggleBtnActive]}
                  onPress={() => setDiabetic(!diabetic)}
                >
                  <Text style={styles.toggleBtnText}>🍬 Diabetic: {diabetic ? 'Yes' : 'No'}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Referral warning box */}
            {retinaResult.priorityReferral ? (
              <LinearGradient colors={['#441111', '#2a0a0a']} style={styles.referralCard}>
                <Text style={[styles.referralTitle, { color: '#ff5252' }]}>🚨 PRIORITY REFERRAL INDICATED</Text>
                <Text style={styles.referralDesc}>{retinaResult.referralReason}</Text>
              </LinearGradient>
            ) : (
              <LinearGradient colors={['#113824', '#0a2316']} style={styles.referralCard}>
                <Text style={[styles.referralTitle, { color: '#69f0ae' }]}>✅ ROUTINE MONITORING</Text>
                <Text style={styles.referralDesc}>Parameters within physiological range. Continue annual eye examinations.</Text>
              </LinearGradient>
            )}

            {/* Grid of Results */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Retinal AVR</Text>
                <Text style={[styles.gridVal, { color: retinaResult.avr < 0.67 ? '#ff5252' : '#00e676' }]}>
                  {retinaResult.avr.toFixed(3)}
                </Text>
                <Text style={styles.gridStatus}>
                  {retinaResult.avr < 0.67 ? 'Narrowed (AVR < 0.67)' : 'Normal'}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Retinal Biological Age</Text>
                <Text style={[styles.gridVal, { color: retinaResult.retinalAgeGap > 4 ? '#ff5252' : '#00e5ff' }]}>
                  {retinaResult.retinalAge} yrs
                </Text>
                <Text style={styles.gridStatus}>
                  {retinaResult.retinalAgeGap > 0 ? `+${retinaResult.retinalAgeGap} yr gap` : `${retinaResult.retinalAgeGap} yr gap`}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>10-Year CVD Risk</Text>
                <Text style={[styles.gridVal, { color: retinaResult.cardiovascularRisk10Y > 15 ? '#ff5252' : '#00e676' }]}>
                  {retinaResult.cardiovascularRisk10Y}%
                </Text>
                <Text style={styles.gridStatus}>
                  {retinaResult.cardiovascularRisk10Y > 15 ? 'Elevated' : 'Optimal'}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Glaucoma Probability</Text>
                <Text style={[styles.gridVal, { color: retinaResult.glaucomaProbability > 50 ? '#ff5252' : '#00e676' }]}>
                  {retinaResult.glaucomaProbability}%
                </Text>
                <Text style={styles.gridStatus}>
                  {retinaResult.glaucomaProbability > 50 ? 'Glaucoma Suspect' : 'Low Probability'}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Alzheimer Risk Index</Text>
                <Text style={[styles.gridVal, { color: retinaResult.alzheimerRiskIndex > 60 ? '#ff5252' : '#00e676' }]}>
                  {retinaResult.alzheimerRiskIndex}/100
                </Text>
                <Text style={styles.gridStatus}>
                  {retinaResult.alzheimerRiskIndex > 60 ? 'Thinning RNFL/GCC' : 'Normal Layers'}
                </Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Hypertension Stage</Text>
                <Text style={[styles.gridVal, { color: retinaResult.hypertensionStage > 0 ? '#ffb74d' : '#00e676' }]}>
                  Stage {retinaResult.hypertensionStage}
                </Text>
                <Text style={styles.gridStatus}>
                  {retinaResult.hypertensionStage > 0 ? 'Retinopathy present' : 'Healthy vessels'}
                </Text>
              </View>
            </View>

            {/* VQE-Inspired Quantum Risk Vector representation */}
            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.card}>
              <Text style={styles.cardTitle}>⟨ψ| VQE Quantum Multi-Disease State Vector</Text>
              <QuantumStateBar
                probabilities={retinaResult.quantumRiskVector}
                label="Entangled probabilities for: [AVR, AgeGap, CVD, Glaucoma, AD, DR, AMD, Tortuosity]"
              />
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── INFO TAB ── */}
        {activeTab === 'info' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {[
              { icon: '👁️‍🗨️', name: 'DeepMind ARDA Biomarkers', desc: 'Predicts cardiovascular risks and biological age gaps directly from retinal microvasculature' },
              { icon: '🧠', name: 'UK Biobank RNFL Thinning', desc: 'Detects sub-clinical signs of neurodegenerative disorders (Alzheimer, Parkinson) using RNFL/GCC thickness' },
              { icon: '🌊', name: 'QStateVector', desc: 'Superposition over eye states for probabilistic health scoring' },
              { icon: '🧊', name: 'Quantum Annealing', desc: 'Optimises vision test scheduling using quantum tunnelling' },
              { icon: '〰', name: 'Interference Engine', desc: 'Detects healthy vs pathological gaze patterns via wave interference' },
              { icon: '📡', name: 'Amplitude Estimation', desc: 'Quadratically faster drug risk convergence vs classical Bayes' },
              { icon: '🚶', name: 'Quantum Walk', desc: 'Non-classical circadian fatigue diffusion model' },
            ].map((m, i) => (
              <LinearGradient key={i} colors={['#0f2744', '#0a1e3a']} style={styles.infoCard}>
                <Text style={styles.infoIcon}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoName}>{m.name}</Text>
                  <Text style={styles.infoDesc}>{m.desc}</Text>
                </View>
              </LinearGradient>
            ))}

            <LinearGradient colors={['#1a0a2e', '#0d0719']} style={[styles.card, { marginTop: 8 }]}>
              <Text style={[styles.cardTitle, { color: '#ce93d8' }]}>🔬 Scientific Foundation</Text>
              <Text style={styles.sciText}>
                These modules implement quantum-INSPIRED algorithms — mathematical primitives from
                quantum computing (phase estimation, Grover operators, quantum walks) that run
                efficiently on classical CPUs. They provide genuine advantages over naive heuristics
                in probabilistic optimisation and pattern recognition, without requiring quantum hardware.
              </Text>
              <Text style={[styles.sciText, { color: '#90a4ae', marginTop: 8 }]}>
                ⚕ For clinical decisions, always consult a qualified ophthalmologist.
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#e0f7fa', letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: '#4fc3f7', marginBottom: 20 },
  badge: {
    backgroundColor: '#00f5ff22', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#00f5ff44',
  },
  badgeText: { fontSize: 9, color: '#00f5ff', fontWeight: '700', letterSpacing: 1 },

  tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#0d1f3c', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#1565c0' },
  tabText: { fontSize: 11, color: '#4fc3f7', fontWeight: '600' },
  tabTextActive: { color: '#e3f2fd', fontWeight: '800' },

  ringRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  scoreRingContainer: { alignItems: 'center', gap: 8 },
  scoreRing: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
  },
  scoreRingInner: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#05101f',
  },
  scoreValue: { fontSize: 28, fontWeight: '900' },
  scoreMax: { fontSize: 11, color: '#546e7a' },
  scoreLabel: { fontSize: 12, color: '#90caf9', fontWeight: '600' },

  card: {
    borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: '#1565c044',
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#00e5ff', marginBottom: 12, letterSpacing: 0.5 },
  cardValue: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 },
  cardMeta: { fontSize: 11, color: '#4fc3f7', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },

  recommendation: { fontSize: 14, fontWeight: '700', lineHeight: 22, marginBottom: 12 },
  alertBox: {
    backgroundColor: '#ff980020', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#ff980060', marginBottom: 8,
  },
  alertText: { color: '#ffb74d', fontSize: 12, fontWeight: '600' },
  interactionBox: {
    backgroundColor: '#ef535020', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#ef535060', marginBottom: 8,
  },
  interactionText: { color: '#ef9a9a', fontSize: 12 },

  qbarContainer: { marginTop: 8 },
  qbarLabel: { fontSize: 10, color: '#4fc3f7', marginBottom: 6 },
  qbarRow: { flexDirection: 'row', alignItems: 'flex-end', height: 64, gap: 2 },
  qbarSlot: { flex: 1, justifyContent: 'flex-end' },
  qbarFill: { borderRadius: 3, opacity: 0.85 },

  infoCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: '#1565c044',
  },
  infoIcon: { fontSize: 26, width: 36, textAlign: 'center' },
  infoName: { fontSize: 13, color: '#80d8ff', fontWeight: '700', marginBottom: 3 },
  infoDesc: { fontSize: 11, color: '#78909c', lineHeight: 16 },

  sciText: { fontSize: 12, color: '#b0bec5', lineHeight: 20 },

  refreshBtn: {
    backgroundColor: '#00f5ff15', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#00f5ff44', marginBottom: 16,
  },
  refreshBtnText: { color: '#00f5ff', fontWeight: '700', fontSize: 13 },

  // Sliders
  sliderControl: { marginBottom: 16 },
  sliderTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sliderTextLabel: { color: '#e0e0e0', fontSize: 12, fontWeight: '600' },
  sliderValueText: { color: '#00e5ff', fontSize: 12, fontWeight: 'bold' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sliderBtn: {
    backgroundColor: '#1e385c', width: 28, height: 28, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  sliderBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sliderTrackBackground: { flex: 1, height: 6, backgroundColor: '#10223b', borderRadius: 3, overflow: 'hidden' },
  sliderTrackFill: { height: '100%', backgroundColor: '#00e5ff', borderRadius: 3 },

  // Toggles
  toggleContainer: { flexDirection: 'row', gap: 10, marginTop: 12 },
  toggleBtn: {
    flex: 1, backgroundColor: '#0c1d38', paddingVertical: 10,
    borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1565c044',
  },
  toggleBtnActive: { backgroundColor: '#1565c0', borderColor: '#00e5ff' },
  toggleBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Digital Twin
  digitalTwinCard: {
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#00e5ff44',
  },
  twinHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  twinTitle: { fontSize: 13, fontWeight: '800', color: '#00e5ff', letterSpacing: 0.5 },
  twinContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  retinaSvg: { backgroundColor: '#050a14', borderRadius: 90, borderWidth: 1, borderColor: '#1565c044' },
  twinLegend: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#90caf9', fontSize: 10, fontWeight: '500' },

  // Referral Alert
  referralCard: { borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'transparent' },
  referralTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  referralDesc: { color: '#e0e0e0', fontSize: 11, lineHeight: 16 },

  // Grid
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  gridItem: {
    width: (SCREEN_W - 50) / 2, backgroundColor: '#0d1f3c', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: '#1565c033',
  },
  gridLabel: { color: '#90caf9', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  gridVal: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 2 },
  gridStatus: { color: '#78909c', fontSize: 9, fontWeight: '500' },
});
