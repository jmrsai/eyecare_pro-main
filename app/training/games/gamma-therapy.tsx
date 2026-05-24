import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Play, Square, ShieldAlert, Heart, ShieldCheck } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { screenForTherapySafety, quantumGammaEntrainment, evaluateTherapySession } from '@/lib/ai';

const { width } = Dimensions.get('window');

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

export default function GammaTherapyScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState<'safety' | 'config' | 'running' | 'summary'>('safety');
  
  // Configuration
  const [frequency, setFrequency] = useState(40); // Target frequency (Hz)
  const [carrier, setCarrier] = useState(200);   // Carrier frequency (Hz)
  const [volume, setVolume] = useState(0.8);
  const [contrast, setContrast] = useState(0.8);  // Visual flicker contrast
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [entrainment, setEntrainment] = useState(0);

  // Safety Screening Questions
  const [hasEpilepsy, setHasEpilepsy] = useState<boolean | null>(null);
  const [hasMigraine, setHasMigraine] = useState<boolean | null>(null);
  const [hasPhotophobia, setHasPhotophobia] = useState<boolean | null>(null);

  const webViewRef = useRef<WebView>(null);
  const timerRef = useRef<any>(null);

  // Safety verification
  const isSafetyCleared = hasEpilepsy === false;
  const isMigraineOrPhoto = hasMigraine === true || hasPhotophobia === true;

  // Real-time quantum walk simulation
  useEffect(() => {
    if (step === 'running' && isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          // Recalculate quantum walk entrainment estimation every 5 seconds
          if (next % 5 === 0) {
            const { entrainmentPercent } = quantumGammaEntrainment(
              next / 60, // minutes
              frequency,
              30, // default age
              hasMigraine || false
            );
            setEntrainment(entrainmentPercent);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isPlaying]);

  const handleStartTherapy = () => {
    if (webViewRef.current) {
      // Send signal to webview to start Web Audio oscillators
      webViewRef.current.postMessage(JSON.stringify({
        action: 'start',
        carrier,
        beat: frequency,
        volume,
        contrast
      }));
    }
    setIsPlaying(true);
    setStep('running');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStopTherapy = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'stop' }));
    }
    setIsPlaying(false);
    setStep('summary');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const resetSession = () => {
    setElapsedSeconds(0);
    setEntrainment(0);
    setIsPlaying(false);
    setStep('config');
  };

  // HTML/JS code running inside WebView to perform rock-solid 40Hz audio & visual rendering
  const webViewHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html {
          margin: 0; padding: 0; width: 100%; height: 100%;
          background-color: #000; overflow: hidden;
          transition: background-color 0.05s ease;
        }
        #status {
          position: absolute; top: 10px; left: 10px;
          color: rgba(255,255,255,0.3); font-family: monospace; font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div id="status">Binaural Synth Idle</div>
      <script>
        let audioCtx = null;
        let leftOsc = null;
        let rightOsc = null;
        let leftGain = null;
        let rightGain = null;
        let merger = null;
        
        let targetFreq = 40;
        let carrierFreq = 200;
        let volumeLevel = 0.8;
        let visualContrast = 0.8;
        
        let flickerActive = false;
        let lastFrameTime = 0;
        let isLight = false;

        // Visual flicker requestAnimationFrame loop
        function flickerLoop(timestamp) {
          if (!flickerActive) {
            document.body.style.backgroundColor = '#000000';
            return;
          }
          
          requestAnimationFrame(flickerLoop);

          if (!audioCtx) return;
          const t = audioCtx.currentTime;
          
          // Generate 40Hz square-wave visual toggle
          const period = 1.0 / targetFreq;
          const phase = (t % period) / period;
          
          const isLightNext = phase < 0.5;
          if (isLightNext !== isLight) {
            isLight = isLightNext;
            // Contrast-based background modulation
            const val = isLight ? Math.round(255 * visualContrast) : 0;
            document.body.style.backgroundColor = 'rgb(' + val + ',' + val + ',' + val + ')';
          }
        }

        function initAudio() {
          if (audioCtx) return;
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        function startSynth() {
          initAudio();
          stopSynth(); // Ensure clean start

          // Create Left Channel (Carrier)
          leftOsc = audioCtx.createOscillator();
          leftOsc.type = 'sine';
          leftOsc.frequency.setValueAtTime(carrierFreq, audioCtx.currentTime);

          leftGain = audioCtx.createGain();
          leftGain.gain.setValueAtTime(volumeLevel, audioCtx.currentTime);
          leftOsc.connect(leftGain);

          // Create Right Channel (Carrier + Beat)
          rightOsc = audioCtx.createOscillator();
          rightOsc.type = 'sine';
          rightOsc.frequency.setValueAtTime(carrierFreq + targetFreq, audioCtx.currentTime);

          rightGain = audioCtx.createGain();
          rightGain.gain.setValueAtTime(volumeLevel, audioCtx.currentTime);
          rightOsc.connect(rightGain);

          // Route to specific stereo channels
          merger = audioCtx.createChannelMerger(2);
          
          // Split left and right into separate channels
          const leftPanner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
          const rightPanner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
          
          if (leftPanner && rightPanner) {
            leftPanner.pan.setValueAtTime(-1, audioCtx.currentTime);
            rightPanner.pan.setValueAtTime(1, audioCtx.currentTime);
            leftGain.connect(leftPanner);
            rightGain.connect(rightPanner);
            leftPanner.connect(audioCtx.destination);
            rightPanner.connect(audioCtx.destination);
          } else {
            // Fallback merger routing
            leftGain.connect(merger, 0, 0);
            rightGain.connect(merger, 0, 1);
            merger.connect(audioCtx.destination);
          }

          // Start Oscillators
          leftOsc.start();
          rightOsc.start();

          // Start Flicker
          flickerActive = true;
          isLight = false;
          requestAnimationFrame(flickerLoop);
          
          document.getElementById('status').innerText = 'Playing: ' + targetFreq + 'Hz (Carrier: ' + carrierFreq + 'Hz)';
        }

        function stopSynth() {
          flickerActive = false;
          document.body.style.backgroundColor = '#000000';
          
          if (leftOsc) {
            try { leftOsc.stop(); } catch(e){}
            leftOsc.disconnect();
            leftOsc = null;
          }
          if (rightOsc) {
            try { rightOsc.stop(); } catch(e){}
            rightOsc.disconnect();
            rightOsc = null;
          }
          document.getElementById('status').innerText = 'Synth Stopped';
        }

        // Listen for React Native commands
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.action === 'start') {
            carrierFreq = data.carrier || 200;
            targetFreq = data.beat || 40;
            volumeLevel = data.volume !== undefined ? data.volume : 0.8;
            visualContrast = data.contrast !== undefined ? data.contrast : 0.8;
            startSynth();
          } else if (data.action === 'stop') {
            stopSynth();
          }
        });
      </script>
    </body>
    </html>
  `;

  // Render evaluation
  const summaryResult = evaluateTherapySession(
    {
      mode: 'gamma_combined',
      frequencyHz: frequency,
      dutyCycle: 0.5,
      durationMin: 15,
      luminanceLux: Math.round(500 * contrast),
      contrastLevel: contrast,
    },
    elapsedSeconds / 60,
    30,
    hasMigraine || false,
    [15, 20, 15] // Mock history
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Embedded Web View for Synth Engine */}
      <View style={styles.webViewHidden}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: webViewHTML }}
          javaScriptEnabled={true}
          style={{ width: 1, height: 1 }}
        />
      </View>

      {/* ── SAFETY SCREEN ── */}
      {step === 'safety' && (
        <SafeAreaView style={styles.safeContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color="#94A3B8" />
            </TouchableOpacity>

            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.safetyCard}
            >
              <View style={styles.iconCircleAlert}>
                <ShieldAlert size={36} color="#ef5350" />
              </View>
              <Text style={styles.title}>Photosensitive Safety Check</Text>
              <Text style={styles.desc}>
                MIT GENUS 40Hz flicker therapy stimulates visual and auditory paths. Please complete this safety screen:
              </Text>

              {/* Safety Question 1 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>1. Do you have a history of epilepsy or seizures?</Text>
                <View style={styles.answers}>
                  <TouchableOpacity
                    style={[styles.answerBtn, hasEpilepsy === true && styles.answerBtnActiveRed]}
                    onPress={() => setHasEpilepsy(true)}
                  >
                    <Text style={styles.answerText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerBtn, hasEpilepsy === false && styles.answerBtnActiveGreen]}
                    onPress={() => setHasEpilepsy(false)}
                  >
                    <Text style={styles.answerText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Safety Question 2 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>2. Do you suffer from migraine with aura?</Text>
                <View style={styles.answers}>
                  <TouchableOpacity
                    style={[styles.answerBtn, hasMigraine === true && styles.answerBtnActiveRed]}
                    onPress={() => setHasMigraine(true)}
                  >
                    <Text style={styles.answerText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerBtn, hasMigraine === false && styles.answerBtnActiveGreen]}
                    onPress={() => setHasMigraine(false)}
                  >
                    <Text style={styles.answerText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Safety Question 3 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>3. Do you have severe photophobia (light sensitivity)?</Text>
                <View style={styles.answers}>
                  <TouchableOpacity
                    style={[styles.answerBtn, hasPhotophobia === true && styles.answerBtnActiveRed]}
                    onPress={() => setHasPhotophobia(true)}
                  >
                    <Text style={styles.answerText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerBtn, hasPhotophobia === false && styles.answerBtnActiveGreen]}
                    onPress={() => setHasPhotophobia(false)}
                  >
                    <Text style={styles.answerText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Decision */}
              {hasEpilepsy === true && (
                <View style={styles.contraindicationBox}>
                  <Text style={styles.contraText}>
                    ⛔ Visual flicker is strictly contraindicated for epilepsy. Please do not proceed.
                  </Text>
                </View>
              )}

              {hasEpilepsy === false && isMigraineOrPhoto && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Relative warning: Consider setting carrier to 400Hz and visual contrast to low (0.3) to avoid triggering headaches.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, !isSafetyCleared && styles.btnDisabled]}
                disabled={!isSafetyCleared}
                onPress={() => setStep('config')}
              >
                <Text style={styles.btnText}>Proceed to Therapy</Text>
              </TouchableOpacity>
            </MotiView>
          </ScrollView>
        </SafeAreaView>
      )}

      {/* ── CONFIG SCREEN ── */}
      {step === 'config' && (
        <SafeAreaView style={styles.safeContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setStep('safety')} style={styles.backBtn}>
              <ArrowLeft size={24} color="#94A3B8" />
            </TouchableOpacity>

            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.configCard}
            >
              <Text style={styles.title}>40Hz Neuro-Sync Setup</Text>
              <Text style={styles.desc}>
                Configure the dual auditory-visual flicker. Put on stereo headphones for the binaural beat effect.
              </Text>

              {/* Incremental Sliders */}
              <View style={styles.setupControls}>
                <View style={styles.sliderWrapper}>
                  <View style={styles.sliderInfo}>
                    <Text style={styles.sliderLabel}>Target Stimulation Frequency</Text>
                    <Text style={styles.sliderValue}>{frequency} Hz</Text>
                  </View>
                  <View style={styles.freqButtons}>
                    {[40, 10, 6].map(hz => (
                      <TouchableOpacity
                        key={hz}
                        style={[styles.freqBtn, frequency === hz && styles.freqBtnActive]}
                        onPress={() => {
                          setFrequency(hz);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={styles.freqBtnText}>{hz}Hz ({hz === 40 ? 'Gamma' : hz === 10 ? 'Alpha' : 'Theta'})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.sliderWrapper}>
                  <View style={styles.sliderInfo}>
                    <Text style={styles.sliderLabel}>Binaural Carrier Tone</Text>
                    <Text style={styles.sliderValue}>{carrier} Hz</Text>
                  </View>
                  <View style={styles.carrierRow}>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => setCarrier(Math.max(100, carrier - 50))}
                    >
                      <Text style={styles.adjustText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.carrierIndicator}>
                      <Text style={styles.carrierIndText}>{carrier === 200 ? 'Deep hum (200Hz)' : `${carrier}Hz`}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => setCarrier(Math.min(600, carrier + 50))}
                    >
                      <Text style={styles.adjustText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.sliderWrapper}>
                  <View style={styles.sliderInfo}>
                    <Text style={styles.sliderLabel}>Visual Flicker Contrast</Text>
                    <Text style={styles.sliderValue}>{Math.round(contrast * 100)}%</Text>
                  </View>
                  <View style={styles.carrierRow}>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => setContrast(Math.max(0.1, contrast - 0.1))}
                    >
                      <Text style={styles.adjustText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.carrierIndicator}>
                      <Text style={styles.carrierIndText}>{contrast < 0.4 ? 'Subtle' : contrast > 0.7 ? 'Strong' : 'Moderate'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.adjustBtn}
                      onPress={() => setContrast(Math.min(1.0, contrast + 0.1))}
                    >
                      <Text style={styles.adjustText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.btn} onPress={handleStartTherapy}>
                <Play size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Start Stimulation</Text>
              </TouchableOpacity>
            </MotiView>
          </ScrollView>
        </SafeAreaView>
      )}

      {/* ── RUNNING STIMULATION SCREEN ── */}
      {step === 'running' && (
        <View style={styles.runningContainer}>
          {/* WebView behind overlays, running 40Hz stroboscopic light */}
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: webViewHTML }}
            javaScriptEnabled={true}
            style={StyleSheet.absoluteFill}
          />

          {/* Semi-transparent dark overlay HUD */}
          <SafeAreaView style={styles.hudOverlay}>
            <View style={styles.hudHeader}>
              <View style={styles.pulseTitle}>
                <PulseDot color="#A78BFA" size={10} />
                <Text style={styles.hudTitle}>NEURO-SYNC FLICKER ACTIVE</Text>
              </View>
              <Text style={styles.hudTime}>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</Text>
            </View>

            <View style={styles.hudBody}>
              <View style={styles.circleProgressOuter}>
                <View style={styles.circleProgressInner}>
                  <Text style={styles.entrainmentPct}>{entrainment}%</Text>
                  <Text style={styles.entrainmentLbl}>Gamma Entrainment</Text>
                </View>
              </View>
              <Text style={styles.runningHint}>Adjust phone distance. Look gently at the center of the screen.</Text>
            </View>

            <View style={styles.hudControls}>
              <TouchableOpacity style={styles.stopBtn} onPress={handleStopTherapy}>
                <Square size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.stopBtnText}>End Therapy Session</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}

      {/* ── SUMMARY SCREEN ── */}
      {step === 'summary' && (
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.center}>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.safetyCard}
            >
              <View style={styles.iconCircleSuccess}>
                <ShieldCheck size={40} color="#00e676" />
              </View>
              <Text style={styles.title}>Stimulation Completed</Text>
              <Text style={styles.desc}>Gamma rhythmic neuro-stimulation session completed successfully.</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>COMPLETED TIME</Text>
                  <Text style={styles.statValue}>{(elapsedSeconds / 60).toFixed(1)} Min</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>EST. ENTRAINMENT</Text>
                  <Text style={styles.statValue}>{entrainment}%</Text>
                </View>
              </View>

              <LinearGradient colors={['#162a45', '#0f1e33']} style={styles.recBox}>
                <Text style={styles.recTitle}>🩺 Quantum walk advice:</Text>
                <Text style={styles.recText}>{summaryResult.recommendation}</Text>
              </LinearGradient>

              <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/exercises')}>
                <Text style={styles.btnText}>Return to Gym</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={resetSession}>
                <Text style={styles.secondaryBtnText}>Restart Session</Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A' },
  safeContainer: { flex: 1, backgroundColor: '#090D1A' },
  scroll: { padding: 24, paddingBottom: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  backBtn: { marginBottom: 20 },
  webViewHidden: { width: 1, height: 1, opacity: 0, position: 'absolute' },

  safetyCard: {
    backgroundColor: '#1E293B', padding: 24, borderRadius: 24,
    width: '100%', alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  configCard: {
    backgroundColor: '#1E293B', padding: 24, borderRadius: 24,
    width: '100%', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  iconCircleAlert: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(239, 83, 80, 0.1)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSuccess: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.1)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  questionBlock: { alignSelf: 'stretch', marginBottom: 20 },
  questionText: { fontSize: 13, color: '#e2e8f0', fontWeight: '600', marginBottom: 10 },
  answers: { flexDirection: 'row', gap: 12 },
  answerBtn: {
    flex: 1, backgroundColor: '#334155', paddingVertical: 12,
    borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  answerBtnActiveGreen: { backgroundColor: 'rgba(0, 230, 118, 0.15)', borderColor: '#00e676' },
  answerBtnActiveRed: { backgroundColor: 'rgba(239, 83, 80, 0.15)', borderColor: '#ef5350' },
  answerText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  contraindicationBox: {
    backgroundColor: 'rgba(239, 83, 80, 0.1)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#ef535060', marginBottom: 20, alignSelf: 'stretch',
  },
  contraText: { color: '#ff8a80', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  warningBox: {
    backgroundColor: 'rgba(255, 183, 77, 0.1)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#ffb74d60', marginBottom: 20, alignSelf: 'stretch',
  },
  warningText: { color: '#ffe082', fontSize: 11, textAlign: 'center', lineHeight: 16 },

  btn: {
    backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 16,
    alignSelf: 'stretch', alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    shadowColor: '#7C3AED', shadowOpacity: 0.4, shadowRadius: 8, marginTop: 10,
  },
  btnDisabled: { backgroundColor: '#475569', opacity: 0.5 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  // Setup / Config
  setupControls: { alignSelf: 'stretch', gap: 20, marginBottom: 24 },
  sliderWrapper: { gap: 8 },
  sliderInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabel: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  sliderValue: { color: '#A78BFA', fontSize: 13, fontWeight: 'bold' },
  freqButtons: { flexDirection: 'row', gap: 8 },
  freqBtn: {
    flex: 1, backgroundColor: '#334155', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  freqBtnActive: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: '#7C3AED' },
  freqBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  carrierRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adjustBtn: {
    backgroundColor: '#334155', width: 36, height: 36, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  adjustText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  carrierIndicator: { flex: 1, height: 36, backgroundColor: '#0f172a', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  carrierIndText: { color: '#A78BFA', fontSize: 12, fontWeight: 'bold' },

  // Running
  runningContainer: { flex: 1, backgroundColor: '#000' },
  hudOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'space-between', padding: 24 },
  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  pulseTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hudTitle: { color: '#C084FC', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  hudTime: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  hudBody: { alignItems: 'center', gap: 16 },
  circleProgressOuter: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 4, borderColor: '#A78BFA33',
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  circleProgressInner: { alignItems: 'center' },
  entrainmentPct: { color: '#C084FC', fontSize: 36, fontWeight: '900' },
  entrainmentLbl: { color: '#94A3B8', fontSize: 10, marginTop: 4, fontWeight: '600' },
  runningHint: { color: '#94A3B8', fontSize: 12, textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 },
  hudControls: { marginBottom: 30 },
  stopBtn: {
    backgroundColor: '#ef5350', paddingVertical: 16, borderRadius: 16,
    width: width - 48, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  stopBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  // Summary
  statsGrid: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 20, marginTop: 10 },
  statBox: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 14, alignItems: 'center' },
  statLabel: { fontSize: 9, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  recBox: { alignSelf: 'stretch', padding: 14, borderRadius: 14, marginBottom: 20 },
  recTitle: { color: '#C084FC', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  recText: { color: '#e2e8f0', fontSize: 11, lineHeight: 16 },
  secondaryBtn: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  secondaryBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});
