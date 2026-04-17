import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Play, Pause, RotateCcw, CheckCircle2, Wind } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const EXERCISE_STEPS = [
  { id: 1, title: 'Palming Relaxation', duration: 60, instruction: 'Cover your closed eyes with your palms (creating total darkness) and breathe deeply.' },
  { id: 2, title: 'Gentle Eye Massage', duration: 30, instruction: 'Using your fingertips, very gently massage the area around your eye sockets in circles.' },
  { id: 3, title: 'Distant Horizon', duration: 45, instruction: 'Look at the furthest point possible outside a window, letting your eyes relax.' },
];

export default function PostWorkDestress() {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXERCISE_STEPS[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t: number) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleStepComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStepComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (currentStep < EXERCISE_STEPS.length - 1) {
      setCurrentStep((s: number) => s + 1);
      setTimeLeft(EXERCISE_STEPS[currentStep + 1].duration);
      setIsActive(false);
    } else {
      setIsCompleted(true);
      setIsActive(false);
    }
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setTimeLeft(EXERCISE_STEPS[0].duration);
    setIsActive(false);
    setIsCompleted(false);
  };

  const step = EXERCISE_STEPS[currentStep];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F0FDF4', '#FFFFFF']} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Post-Work De-stress</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isCompleted ? (
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
          >
            <View style={styles.progressRow}>
              {EXERCISE_STEPS.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: i <= currentStep ? '#10B981' : '#F1F5F9' }
                  ]} 
                />
              ))}
            </View>

            <Text style={styles.stepTitle}>{step.title}</Text>
            
            <View style={styles.animationContainer}>
              <MotiView
                from={{ opacity: 0.2, scale: 1 }}
                animate={{ opacity: isActive ? 1 : 0.4, scale: isActive ? 1.4 : 1 }}
                transition={{ loop: true, type: 'timing', duration: 3000 }}
                style={styles.breathCircle}
              />
              <Wind size={48} color="#10B981" />
            </View>

            <Text style={styles.timerText}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
            <Text style={styles.instructionText}>{step.instruction}</Text>

            <View style={styles.controls}>
              <Pressable onPress={resetExercise} style={styles.iconBtn}>
                <RotateCcw size={24} color="#64748B" />
              </Pressable>
              
              <Pressable onPress={toggleTimer} style={styles.mainBtn}>
                {isActive ? <Pause size={32} color="#FFF" /> : <Play size={32} color="#FFF" fill="#FFF" />}
              </Pressable>

              <View style={{ width: 44 }} />
            </View>
          </MotiView>
        ) : (
          <MotiView 
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.completeCard}
          >
            <CheckCircle2 size={80} color="#10B981" />
            <Text style={styles.completeTitle}>Stress Released</Text>
            <Text style={styles.completeDesc}>You've given your eyes the recovery they deserve. Sleep well!</Text>
            <Pressable onPress={() => router.back()} style={styles.finishBtn}>
              <Text style={styles.finishBtnText}>Return Home</Text>
            </Pressable>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  content: { padding: 20, alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 30, width: '100%', alignItems: 'center', elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  progressRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 30 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, marginHorizontal: 4 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 20 },
  animationContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  breathCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#F0FDF4' },
  timerText: { fontSize: 56, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  instructionText: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  mainBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginHorizontal: 40, elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  completeCard: { alignItems: 'center', paddingVertical: 60 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginTop: 24 },
  completeDesc: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  finishBtn: { backgroundColor: '#10B981', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, marginTop: 40 },
  finishBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
