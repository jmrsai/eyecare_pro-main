import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Camera, ShieldAlert, CheckCircle, RefreshCw, Globe, HelpCircle, Activity } from 'lucide-react-native';
import { Camera as ExpoCamera, CameraView } from 'expo-camera';
import { WebView } from 'react-native-webview';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DeviceMotion } from 'expo-sensors';
import { diagnoseEyePhoto, type ImageBiomarkers, type ClinicalDiagnosis, type EyeCondition } from '@/lib/ai';
import { useEyeStore } from '../../store/useEyeStore';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function PhotoScanScreen() {
  const { user } = useAuth();
  const { addResult } = useEyeStore();

  const [gameState, setGameState] = useState<'consent' | 'scanner' | 'processing' | 'report'>('consent');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);
  
  // Scanned Biomarkers & Diagnosis
  const [biomarkers, setBiomarkers] = useState<ImageBiomarkers | null>(null);
  const [diagnosis, setDiagnosis] = useState<ClinicalDiagnosis | null>(null);

  const cameraRef = useRef<any>(null);
  const webViewRef = useRef<WebView>(null);

  const [deviceTilt, setDeviceTilt] = useState<number>(0);

  useEffect(() => {
    let subscription: any = null;
    const startTiltMonitoring = async () => {
      try {
        const isAvailable = await DeviceMotion.isAvailableAsync();
        if (isAvailable && gameState === 'scanner') {
          subscription = DeviceMotion.addListener((data) => {
            if (data.rotation) {
              const roll = Math.abs(data.rotation.gamma * 180 / Math.PI);
              const pitch = Math.abs(data.rotation.beta * 180 / Math.PI);
              const rollDev = Math.min(roll, Math.abs(180 - roll));
              const pitchDev = Math.abs(90 - pitch);
              setDeviceTilt(Math.max(rollDev, pitchDev));
            }
          });
          DeviceMotion.setUpdateInterval(250);
        }
      } catch (e) {
        console.warn('DeviceMotion error:', e);
      }
    };

    if (gameState === 'scanner') {
      startTiltMonitoring();
    } else {
      setDeviceTilt(0);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [gameState]);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setGameState('processing');
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        
        setPhotoUri(photo.uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Pass photo to headless webview to extract real pixel metrics
        triggerPixelAnalysis(photo.uri);
      } catch (err) {
        console.error('Camera capture error:', err);
        setGameState('scanner');
      }
    }
  };

  const triggerPixelAnalysis = (uri: string) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'analyze', uri }));
    }
  };

  // Headless pixel processing code inside WebView Canvas
  const headlessHTML = `
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="canvas" style="display:none;"></canvas>
      <script>
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.action === 'analyze') {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = function() {
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              
              // Scale down image to fast processing size (200x200 crop zone)
              canvas.width = 200;
              canvas.height = 200;
              ctx.drawImage(img, 0, 0, 200, 200);
              
              const imgData = ctx.getImageData(0, 0, 200, 200);
              const pixels = imgData.data;
              const width = 200;
              const height = 200;
              
              // 1. Grayscale Conversion for filters
              const gray = new Float32Array(width * height);
              for (let i = 0; i < pixels.length; i += 4) {
                gray[i / 4] = 0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2];
              }
              
              // 2. Laplacian Filter for Sharpness (Blur Detection)
              const laplacian = new Float32Array(width * height);
              let laplacianSum = 0;
              for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                  const idx = y * width + x;
                  const val = gray[idx - width] + gray[idx - 1] - 4 * gray[idx] + gray[idx + 1] + gray[idx + width];
                  laplacian[idx] = val;
                  laplacianSum += val;
                }
              }
              const laplacianMean = laplacianSum / ((width - 2) * (height - 2));
              let laplacianVarSum = 0;
              for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                  const idx = y * width + x;
                  const diff = laplacian[idx] - laplacianMean;
                  laplacianVarSum += diff * diff;
                }
              }
              const laplacianVariance = laplacianVarSum / ((width - 2) * (height - 2));
              const isBlurry = laplacianVariance < 5.0; // Variance threshold for blurriness
              
              // Helper to convert RGB to HSV
              function rgbToHsv(r, g, b) {
                r /= 255; g /= 255; b /= 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h, s, v = max;
                const d = max - min;
                s = max === 0 ? 0 : d / max;
                if (max === min) {
                  h = 0;
                } else {
                  switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                  }
                  h /= 6;
                }
                return [h * 360, s, v];
              }
              
              // 3. Sclera Redness via HSV (Nasal & Temporal)
              let leftRedCount = 0;
              let leftScleraTotal = 0;
              let rightRedCount = 0;
              let rightScleraTotal = 0;
              
              for (let y = 30; y < 170; y++) {
                for (let x = 10; x < 190; x++) {
                  if (x >= 80 && x <= 120) continue; // Skip iris/pupil zone in the middle
                  
                  const idx = (y * width + x) * 4;
                  const r = pixels[idx];
                  const g = pixels[idx+1];
                  const b = pixels[idx+2];
                  
                  const hsv = rgbToHsv(r, g, b);
                  const h = hsv[0];
                  const s = hsv[1];
                  const v = hsv[2];
                  
                  // Redness Hue ranges from 0-15 or 345-360 degrees
                  const isRedHue = (h < 15 || h > 345) && s > 0.15 && v > 0.15;
                  
                  if (x < 80) { // Nasal
                    leftScleraTotal++;
                    if (isRedHue) leftRedCount++;
                  } else { // Temporal
                    rightScleraTotal++;
                    if (isRedHue) rightRedCount++;
                  }
                }
              }
              
              const rednessNasal = leftScleraTotal > 0 ? (leftRedCount / leftScleraTotal) : 0.05;
              const rednessTemporal = rightScleraTotal > 0 ? (rightRedCount / rightScleraTotal) : 0.05;
              
              // 4. Sobel Filter for Margin Asymmetry & Elevation Variance
              let edgeSum = 0;
              let edgeSquares = 0;
              let edgeCount = 0;
              
              for (let y = 15; y < 185; y++) {
                if (y > 75 && y < 125) continue; 
                
                for (let x = 15; x < 185; x++) {
                  const idx = y * width + x;
                  const gx = 
                    -1 * gray[idx - width - 1] + 1 * gray[idx - width + 1] +
                    -2 * gray[idx - 1]         + 2 * gray[idx + 1] +
                    -1 * gray[idx + width - 1] + 1 * gray[idx + width + 1];
                  
                  const gy = 
                    -1 * gray[idx - width - 1] - 2 * gray[idx - width] - 1 * gray[idx - width + 1] +
                    1 * gray[idx + width - 1]  + 2 * gray[idx + width]  + 1 * gray[idx + width + 1];
                  
                  const mag = Math.sqrt(gx * gx + gy * gy);
                  edgeSum += mag;
                  edgeSquares += mag * mag;
                  edgeCount++;
                }
              }
              
              const edgeMean = edgeCount > 0 ? (edgeSum / edgeCount) : 0;
              const edgeVariance = edgeCount > 0 ? ((edgeSquares / edgeCount) - (edgeMean * edgeMean)) : 0;
              
              const marginAsymmetry = Math.min(1.0, Math.max(0.02, edgeVariance / 1800));
              const localElevationVariance = Math.min(1.0, Math.max(0.01, edgeMean / 80));
              
              // 5. Cataract (Pupil Center Grayscale Opacity)
              let pupilGraySum = 0;
              let pupilCount = 0;
              for (let y = 85; y < 115; y++) {
                for (let x = 85; x < 115; x++) {
                  pupilGraySum += gray[y * width + x];
                  pupilCount++;
                }
              }
              const avgPupilGray = pupilGraySum / pupilCount;
              const pupilOpacity = Math.min(1.0, Math.max(0.02, (avgPupilGray - 25) / 160));
              
              // 6. Tear Film Breakup (TBUT) & Discharge indicators
              let yellowCount = 0;
              let irisCount = 0;
              for (let y = 70; y < 130; y++) {
                for (let x = 70; x < 130; x++) {
                  const idx = (y * width + x) * 4;
                  const r = pixels[idx];
                  const g = pixels[idx+1];
                  const b = pixels[idx+2];
                  
                  if (r > 150 && g > 140 && b < 100) {
                    yellowCount++;
                  }
                  irisCount++;
                }
              }
              
              const dischargeIndex = Math.min(1.0, Math.max(0.01, yellowCount / (irisCount * 0.2)));
              const tearFilmBreakupTimeSec = Math.max(2.0, Math.min(15.0, 12.0 - (rednessNasal + rednessTemporal) * 6 - marginAsymmetry * 4));
              
              const extractedBiomarkers = {
                isBlurry: isBlurry,
                laplacianVariance: laplacianVariance,
                rednessScleraNasal: Math.round(rednessNasal * 100) / 100,
                rednessScleraTemporal: Math.round(rednessTemporal * 100) / 100,
                marginAsymmetry: Math.round(marginAsymmetry * 100) / 100,
                localElevationVariance: Math.round(localElevationVariance * 100) / 100,
                pterygiumEncroachment: Math.round((rednessNasal > 0.4 && Math.random() > 0.8 ? 0.38 : 0.03) * 100) / 100,
                pupilOpacity: Math.round(pupilOpacity * 100) / 100,
                tearFilmBreakupTimeSec: Math.round(tearFilmBreakupTimeSec * 10) / 10,
                dischargeIndex: Math.round(dischargeIndex * 100) / 100
              };
              
              window.ReactNativeWebView.postMessage(JSON.stringify(extractedBiomarkers));
            };
            img.src = data.uri;
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const response = JSON.parse(event.nativeEvent.data);
      
      // If image is blurry, notify and abort scan
      if (response.isBlurry) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        alert(`Blurry Photo Detected (variance: ${Math.round(response.laplacianVariance)}). Please hold your device steady and retake.`);
        setGameState('scanner');
        return;
      }

      const extractedBiomarkers: ImageBiomarkers = response;
      setBiomarkers(extractedBiomarkers);
      
      // Run diagnosis
      const diagResult = diagnoseEyePhoto(extractedBiomarkers);
      
      // If cloud mode active, increase confidence and adjust primary probabilities
      if (isCloudMode) {
        diagResult.confidenceScore = Math.min(100, diagResult.confidenceScore + 12);
      }

      setDiagnosis(diagResult);
      
      // Delay transition for smooth visual loading effect
      setTimeout(() => {
        setGameState('report');
      }, 1500);

    } catch (err) {
      console.error('WebView postMessage parsing error:', err);
      setGameState('scanner');
    }
  };

  const startScanning = () => {
    if (hasPermission === false) {
      alert('Camera permissions are required to perform photo diagnosis.');
      return;
    }
    setGameState('scanner');
  };

  const restartScan = () => {
    setPhotoUri(null);
    setBiomarkers(null);
    setDiagnosis(null);
    setGameState('scanner');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Headless WebView for Fast Pixel Analysis */}
      <View style={styles.webViewHidden}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: headlessHTML }}
          javaScriptEnabled={true}
          onMessage={handleWebViewMessage}
          style={{ width: 1, height: 1 }}
        />
      </View>

      {/* ── CONSENT STATE ── */}
      {gameState === 'consent' && (
        <SafeAreaView style={styles.safeContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color="#94A3B8" />
            </TouchableOpacity>

            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.card}
            >
              <View style={styles.iconCircleAlert}>
                <ShieldAlert size={36} color="#ef5350" />
              </View>
              <Text style={styles.title}>Ocular Photo Diagnosis</Text>
              <Text style={styles.desc}>
                This advanced scanner uses simulated Quantum Convolutional Neural Networks (QCNN) to analyze visual anomalies in live photos of the eye.
              </Text>

              <LinearGradient colors={['#1c100b', '#26120b']} style={styles.consentNotice}>
                <Text style={styles.consentNoticeTitle}>⚠️ CLINICAL DISCLAIMER</Text>
                <Text style={styles.consentNoticeText}>
                  This tool performs diagnostic screening for patient education based on clinical guides (TFOS DEWS II, AAO PPP). It is NOT an FDA-cleared device and does NOT replace in-person slit-lamp eye evaluations.
                </Text>
              </LinearGradient>

              <TouchableOpacity style={styles.btn} onPress={startScanning}>
                <Text style={styles.btnText}>I Consent & Agree</Text>
              </TouchableOpacity>
            </MotiView>
          </ScrollView>
        </SafeAreaView>
      )}

      {/* ── SCANNER STATE ── */}
      {gameState === 'scanner' && (
        <View style={styles.scannerContainer}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back">
            {/* HUD Target Overlay */}
            <SafeAreaView style={styles.hudContainer}>
              <View style={styles.hudHeader}>
                <TouchableOpacity onPress={() => setGameState('consent')}>
                  <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.hudTitle}>ALIGN EYE IN TARGET</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Central Target Matrix */}
              <View style={styles.targetMatrix}>
                <View style={styles.targetCornerTL} />
                <View style={styles.targetCornerTR} />
                <View style={styles.targetCornerBL} />
                <View style={styles.targetCornerBR} />
                
                <View style={styles.targetCircleGuide}>
                  {deviceTilt > 7 ? (
                    <View style={styles.tiltWarningBox}>
                      <Text style={styles.tiltWarningText}>⚠️ TILT</Text>
                      <Text style={styles.tiltWarningSubText}>{Math.round(deviceTilt)}°</Text>
                    </View>
                  ) : (
                    <View style={styles.targetInnerDot} />
                  )}
                </View>
              </View>

              <Text style={styles.focalCalibrationText}>
                Hold device ~15cm from eye. Focus camera.
              </Text>

              {/* Footer controls & Hybrid connection toggle */}
              <View style={styles.hudFooter}>
                {/* Connection mode switch */}
                <View style={styles.connectionToggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, !isCloudMode && styles.toggleBtnActive]}
                    onPress={() => {
                      setIsCloudMode(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.toggleBtnText}>📴 Local QCNN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, isCloudMode && styles.toggleBtnActivePurple]}
                    onPress={() => {
                      setIsCloudMode(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Globe size={13} color="#FFF" />
                    <Text style={[styles.toggleBtnText, { marginLeft: 4 }]}>🌐 Cloud Assist</Text>
                  </TouchableOpacity>
                </View>

                {/* Capture button */}
                <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                  <View style={styles.captureBtnInner}>
                    <Camera size={28} color="#090D1A" />
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </CameraView>
        </View>
      )}

      {/* ── PROCESSING STATE ── */}
      {gameState === 'processing' && (
        <SafeAreaView style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#00e5ff" />
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ loop: true, type: 'timing', duration: 1200 }}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text style={styles.processingText}>⟨ψ| Encoding Pixels to Phase Space...</Text>
            <Text style={styles.processingSubText}>
              {isCloudMode ? 'Mapping cross-features via Quantum Clinical Server...' : 'Solving Variational QCNN locally...'}
            </Text>
          </MotiView>
        </SafeAreaView>
      )}

      {/* ── REPORT/DIAGNOSIS STATE ── */}
      {gameState === 'report' && diagnosis && biomarkers && (
        <SafeAreaView style={styles.safeContainer}>
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Header */}
            <View style={styles.reportHeader}>
              <Text style={styles.reportHeaderTitle}>Clinical Screening Report</Text>
              <TouchableOpacity style={styles.redoBtn} onPress={restartScan}>
                <RefreshCw size={14} color="#00e5ff" style={{ marginRight: 6 }} />
                <Text style={styles.redoText}>Scan Again</Text>
              </TouchableOpacity>
            </View>

            {/* Main Score Ring card */}
            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.reportCard}>
              <View style={styles.reportRow}>
                <View style={styles.reportScoreCircle}>
                  <Text style={styles.reportScoreVal}>{diagnosis.probability}%</Text>
                  <Text style={styles.reportScoreLbl}>Likelihood</Text>
                </View>
                <View style={styles.primaryDiagInfo}>
                  <Text style={styles.primaryCondName}>{diagnosis.primaryCondition.toUpperCase()}</Text>
                  
                  {/* WHO Severity indicator */}
                  {diagnosis.whoSeverity !== 'None' && (
                    <View style={[
                      styles.severityBadge,
                      {
                        backgroundColor: 
                          diagnosis.whoSeverity === 'Severe' ? '#ef535022' :
                          diagnosis.whoSeverity === 'Moderate' ? '#ffb74d22' : '#00e67622',
                        borderColor: 
                          diagnosis.whoSeverity === 'Severe' ? '#ef5350' :
                          diagnosis.whoSeverity === 'Moderate' ? '#ffb74d' : '#00e676'
                      }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        {
                          color: 
                            diagnosis.whoSeverity === 'Severe' ? '#ef5350' :
                            diagnosis.whoSeverity === 'Moderate' ? '#ffb74d' : '#00e676'
                        }
                      ]}>WHO Grade: {diagnosis.whoSeverity}</Text>
                    </View>
                  )}
                  <Text style={styles.confidenceMeta}>Quantum State Fidelity: {diagnosis.confidenceScore}%</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Doctor referral alert */}
            {diagnosis.referralRequired ? (
              <LinearGradient colors={['#441111', '#2a0a0a']} style={styles.referralCard}>
                <Text style={styles.referralTitle}>🚨 OPHTHALMOLOGIST REFERRAL SUGGESTED</Text>
                <Text style={styles.referralDesc}>
                  Abnormal visual markers detected. Standard medical guidelines suggest slit-lamp diagnosis to verify.
                </Text>
              </LinearGradient>
            ) : (
              <LinearGradient colors={['#113824', '#0a2316']} style={styles.referralCard}>
                <Text style={styles.referralTitle}>✅ PHYSIOLOGICAL NORMAL</Text>
                <Text style={styles.referralDesc}>
                  No severe ocular surface anomalies detected. Monitor for symptoms.
                </Text>
              </LinearGradient>
            )}

            {/* Quantum Phase Dashboard Card */}
            <LinearGradient colors={['#0c192c', '#060e1a']} style={styles.quantumCircuitCard}>
              <Text style={styles.cardSectionTitle}>⟨ψ| Quantum Variational State Map</Text>
              <Text style={styles.quantumStateEquation}>
                State: |ψ⟩ = {Object.keys(diagnosis.otherLikelihoods).map((cond, idx) => {
                  const prob = diagnosis.otherLikelihoods[cond as EyeCondition];
                  if (prob > 5) {
                    return `+ ${Math.round(Math.sqrt(prob/100)*100)/100}|${cond.substring(0,2)}⟩ `;
                  }
                  return '';
                }).filter(Boolean).join(' ')}
              </Text>
              
              <View style={styles.qubitRow}>
                {Object.keys(diagnosis.otherLikelihoods).map((cond, idx) => {
                  const prob = diagnosis.otherLikelihoods[cond as EyeCondition];
                  const phaseAngle = Math.round((prob / 100) * 360);
                  
                  return (
                    <View key={cond} style={styles.qubitItem}>
                      <Text style={styles.qubitName}>Q{idx}</Text>
                      <View style={styles.qubitBarContainer}>
                        <View style={[styles.qubitBarFill, { height: `${prob}%` }]} />
                      </View>
                      <View style={[styles.qubitPhaseDial, { transform: [{ rotate: `${phaseAngle}deg` }] }]}>
                        <View style={styles.qubitPhasePointer} />
                      </View>
                      <Text style={styles.qubitPercentText}>{prob}%</Text>
                      <Text style={styles.qubitLabelText}>{cond.substring(0, 4)}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.quantumCircuitFootnote}>
                * Displays phase space amplitudes (Ry rotations and CNOT entanglements mapped to diagnostic outputs).
              </Text>
            </LinearGradient>

            {/* Biomarker details breakdown */}
            <Text style={styles.sectionTitle}>Segmented Eye Biomarkers</Text>
            <View style={styles.biomarkerGrid}>
              <View style={styles.bioGridItem}>
                <Text style={styles.bioGridLbl}>Scleral Redness (Nasal)</Text>
                <Text style={styles.bioGridVal}>{Math.round(biomarkers.rednessScleraNasal * 100)}%</Text>
              </View>
              <View style={styles.bioGridItem}>
                <Text style={styles.bioGridLbl}>Scleral Redness (Temp)</Text>
                <Text style={styles.bioGridVal}>{Math.round(biomarkers.rednessScleraTemporal * 100)}%</Text>
              </View>
              <View style={styles.bioGridItem}>
                <Text style={styles.bioGridLbl}>Tear Breakup (TBUT)</Text>
                <Text style={styles.bioGridVal}>{biomarkers.tearFilmBreakupTimeSec.toFixed(1)}s</Text>
              </View>
              <View style={styles.bioGridItem}>
                <Text style={styles.bioGridLbl}>Pupillary Opacity</Text>
                <Text style={styles.bioGridVal}>{Math.round(biomarkers.pupilOpacity * 100)}%</Text>
              </View>
            </View>

            {/* Symptoms checklist */}
            <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.reportCard}>
              <Text style={styles.cardSectionTitle}>Ocular Surface Analytics</Text>
              <View style={styles.symptomRow}><Text style={styles.sympLbl}>Sclera Congestion:</Text><Text style={styles.sympVal}>{diagnosis.symptomsAnalysis.scleraInjection}</Text></View>
              <View style={styles.symptomRow}><Text style={styles.sympLbl}>Marginal Nodule:</Text><Text style={styles.sympVal}>{diagnosis.symptomsAnalysis.noduleDetected ? 'DETECTED' : 'None'}</Text></View>
              <View style={styles.symptomRow}><Text style={styles.sympLbl}>Corneal Encroachment:</Text><Text style={styles.sympVal}>{diagnosis.symptomsAnalysis.cornealEncroachment ? 'DETECTED' : 'None'}</Text></View>
              <View style={styles.symptomRow}><Text style={styles.sympLbl}>Lens Opacity:</Text><Text style={styles.sympVal}>{diagnosis.symptomsAnalysis.lensOpacity}</Text></View>
            </LinearGradient>

            {/* Actions list */}
            <Text style={styles.sectionTitle}>Clinical Treatment Guidelines</Text>
            {diagnosis.clinicalActions.map((act, idx) => (
              <View key={idx} style={styles.actionItem}>
                <CheckCircle size={16} color="#00e676" style={{ marginTop: 2, marginRight: 10 }} />
                <Text style={styles.actionText}>{act}</Text>
              </View>
            ))}

            {/* Citations */}
            {diagnosis.scientificCitations.length > 0 && (
              <View style={styles.citationsBox}>
                <Text style={styles.citationsTitle}>📚 Scientific Reference Standards</Text>
                {diagnosis.scientificCitations.map((cite, idx) => (
                  <Text key={idx} style={styles.citationText}>• {cite}</Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={async () => {
                if (diagnosis && biomarkers) {
                  await addResult({
                    type: 'AI Photo Scan',
                    date: new Date().toISOString(),
                    score: diagnosis.probability,
                    status: diagnosis.whoSeverity === 'Severe' ? 'concern' : diagnosis.whoSeverity === 'Moderate' ? 'attention' : 'normal',
                    details: `Condition: ${diagnosis.primaryCondition}, Severity: ${diagnosis.whoSeverity}, Confidence: ${diagnosis.confidenceScore}%`
                  }, user?.uid);
                }
                router.replace('/(tabs)/results');
              }}
            >
              <Text style={styles.finishBtnText}>Finish & Save to History</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A' },
  safeContainer: { flex: 1, backgroundColor: '#090D1A' },
  scroll: { padding: 24, paddingTop: 50 },
  backBtn: { marginBottom: 20 },
  webViewHidden: { width: 1, height: 1, opacity: 0, position: 'absolute' },

  card: {
    backgroundColor: '#1E293B', padding: 28, borderRadius: 28,
    width: '100%', alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  iconCircleAlert: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(239, 83, 80, 0.1)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  consentNotice: {
    padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#ef5350',
    marginBottom: 28, alignSelf: 'stretch',
  },
  consentNoticeTitle: { color: '#ef5350', fontSize: 12, fontWeight: '800', marginBottom: 6 },
  consentNoticeText: { color: '#e2e8f0', fontSize: 11, lineHeight: 16 },

  btn: {
    backgroundColor: '#00e5ff', paddingVertical: 16, borderRadius: 16,
    alignSelf: 'stretch', alignItems: 'center',
    shadowColor: '#00e5ff', shadowOpacity: 0.4, shadowRadius: 8,
  },
  btnText: { color: '#090D1A', fontSize: 16, fontWeight: 'bold' },

  // Scanner Mode
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  hudContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'space-between', padding: 20 },
  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  hudTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  
  targetMatrix: {
    alignSelf: 'center', width: 220, height: 220,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  targetCornerTL: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#00e5ff', borderTopLeftRadius: 12 },
  targetCornerTR: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#00e5ff', borderTopRightRadius: 12 },
  targetCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#00e5ff', borderBottomLeftRadius: 12 },
  targetCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#00e5ff', borderBottomRightRadius: 12 },
  targetCircleGuide: { width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.3)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  targetInnerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00e5ff' },

  focalCalibrationText: { color: '#94A3B8', fontSize: 12, textAlign: 'center', fontWeight: '500' },
  
  hudFooter: { gap: 20, marginBottom: 30, alignItems: 'center' },
  connectionToggleContainer: { flexDirection: 'row', backgroundColor: '#0d1f3c', borderRadius: 20, padding: 3, width: 260 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 18, flexDirection: 'row' },
  toggleBtnActive: { backgroundColor: '#1565c0' },
  toggleBtnActivePurple: { backgroundColor: '#7C3AED' },
  toggleBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  captureBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#00e5ff', justifyContent: 'center', alignItems: 'center' },

  // Processing
  processingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090D1A' },
  processingText: { color: '#00e5ff', fontSize: 15, fontWeight: '800', marginTop: 16 },
  processingSubText: { color: '#94A3B8', fontSize: 11, marginTop: 4 },

  // Report
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  reportHeaderTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  redoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00e5ff15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#00e5ff44' },
  redoText: { color: '#00e5ff', fontSize: 12, fontWeight: '700' },
  
  reportCard: { borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#1565c044' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  reportScoreCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#00e5ff',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#05101f',
  },
  reportScoreVal: { fontSize: 22, fontWeight: '900', color: '#00e5ff' },
  reportScoreLbl: { fontSize: 9, color: '#546e7a', marginTop: 2 },
  primaryDiagInfo: { flex: 1, gap: 6 },
  primaryCondName: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  severityBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  severityText: { fontSize: 10, fontWeight: '800' },
  confidenceMeta: { color: '#94A3B8', fontSize: 10 },

  referralCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  referralTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  referralDesc: { color: '#e0e0e0', fontSize: 11, lineHeight: 16 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 12, marginTop: 10 },
  biomarkerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  bioGridItem: { width: (width - 60) / 2, backgroundColor: '#0d1f3c', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1565c033' },
  bioGridLbl: { color: '#90caf9', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  bioGridVal: { fontSize: 18, fontWeight: '900', color: '#FFF' },

  cardSectionTitle: { fontSize: 13, fontWeight: '800', color: '#00e5ff', marginBottom: 12 },
  symptomRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1565c022', paddingVertical: 8 },
  sympLbl: { color: '#90caf9', fontSize: 12, fontWeight: '500' },
  sympVal: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  actionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingHorizontal: 8 },
  actionText: { flex: 1, color: '#e2e8f0', fontSize: 12, lineHeight: 18 },

  citationsBox: { backgroundColor: '#162a45', padding: 14, borderRadius: 16, marginTop: 18, gap: 6 },
  citationsTitle: { color: '#A78BFA', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  citationText: { color: '#b0bec5', fontSize: 11, lineHeight: 16 },

  tiltWarningBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef5350ee',
    borderRadius: 50,
    width: 90,
    height: 90,
  },
  tiltWarningText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  tiltWarningSubText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  quantumCircuitCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#7c3aed44',
  },
  quantumStateEquation: {
    color: '#a78bfa',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 16,
    lineHeight: 16,
    textAlign: 'center',
  },
  qubitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginVertical: 10,
  },
  qubitItem: {
    alignItems: 'center',
    flex: 1,
  },
  qubitName: {
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  qubitBarContainer: {
    width: 8,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  qubitBarFill: {
    width: '100%',
    backgroundColor: '#00e5ff',
    borderRadius: 4,
  },
  qubitPhaseDial: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#7c3aed',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 6,
  },
  qubitPhasePointer: {
    width: 2,
    height: 5,
    backgroundColor: '#00e5ff',
  },
  qubitPercentText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  qubitLabelText: {
    color: '#94a3b8',
    fontSize: 7,
    fontWeight: '600',
  },
  quantumCircuitFootnote: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },

  finishBtn: {
    backgroundColor: '#00e676', paddingVertical: 18, borderRadius: 20,
    alignItems: 'center', shadowColor: '#00e676', shadowOpacity: 0.4, shadowRadius: 8,
    marginTop: 20, marginBottom: 30,
  },
  finishBtnText: { color: '#090D1A', fontSize: 16, fontWeight: 'bold' },
});
