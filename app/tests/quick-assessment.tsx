import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Eye, Target, ClipboardList, Activity } from 'lucide-react-native';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';

const STEPS = [
  { id: 'symptoms', title: 'Symptoms', icon: ClipboardList },
  { id: 'acuity', title: 'Vision', icon: Eye },
  { id: 'astigmatism', title: 'Focus', icon: Target },
  { id: 'results', title: 'Report', icon: Activity },
];

const SYMPTOMS = [
  { id: 'blurry', name: 'Blurry Vision' },
  { id: 'dry', name: 'Dry/Itchy' },
  { id: 'strain', name: 'Eye Strain' },
  { id: 'headache', name: 'Headaches' },
];

export default function QuickAssessment() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [acuityScore, setAcuityScore] = useState(0);
  const [astigmatismLines, setAstigmatismLines] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'symptoms':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>How are your eyes feeling?</Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.subtext }]}>Select any symptoms you&apos;ve noticed lately.</Text>
            <View style={styles.grid}>
              {SYMPTOMS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.chip,
                    { backgroundColor: selectedSymptoms.includes(s.id) ? theme.colors.primary : theme.colors.card },
                    selectedSymptoms.includes(s.id) && styles.selectedChip
                  ]}
                  onPress={() => toggleSymptom(s.id)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: selectedSymptoms.includes(s.id) ? '#FFFFFF' : theme.colors.text }
                  ]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 'acuity':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Quick Vision Check</Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.subtext }]}>Can you see the letter &apos;E&apos; clearly at arm&apos;s length?</Text>
            <View style={styles.acuityContainer}>
              <Text style={[styles.acuityLetter, { color: theme.colors.text }]}>E</Text>
              <View style={styles.acuityButtons}>
                <TouchableOpacity 
                  style={[styles.acuityButton, { backgroundColor: theme.colors.success }]}
                  onPress={() => { setAcuityScore(100); handleNext(); }}
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.acuityButton, { backgroundColor: theme.colors.warning }]}
                  onPress={() => { setAcuityScore(50); handleNext(); }}
                >
                  <Text style={styles.buttonText}>Blurry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 'astigmatism':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Focus Test</Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.subtext }]}>Do any of these lines look darker than others?</Text>
            <View style={styles.astigContainer}>
              {[0, 45, 90, 135].map(angle => (
                <TouchableOpacity
                  key={angle}
                  style={[
                    styles.astigLine,
                    { 
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: astigmatismLines.includes(angle) ? theme.colors.primary : theme.colors.text 
                    }
                  ]}
                  onPress={() => {
                    setAstigmatismLines(prev => 
                      prev.includes(angle) ? prev.filter(a => a !== angle) : [...prev, angle]
                    );
                  }}
                />
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: theme.colors.primary, marginTop: 40 }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>See Report</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );
      case 'results':
        const overallStatus = selectedSymptoms.length > 1 || acuityScore < 100 || astigmatismLines.length > 0 ? 'attention' : 'normal';
        return (
          <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
              <Activity size={48} color={overallStatus === 'normal' ? theme.colors.success : theme.colors.warning} />
              <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Assessment Summary</Text>
              <View style={[styles.statusBadge, { backgroundColor: overallStatus === 'normal' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
                <Text style={{ color: overallStatus === 'normal' ? theme.colors.success : theme.colors.warning, fontWeight: 'bold' }}>
                  {overallStatus === 'normal' ? 'Good Health' : 'Needs Attention'}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: theme.colors.subtext }]}>Vision Score:</Text>
                <Text style={[styles.resultValue, { color: theme.colors.text }]}>{acuityScore}%</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: theme.colors.subtext }]}>Symptoms:</Text>
                <Text style={[styles.resultValue, { color: theme.colors.text }]}>{selectedSymptoms.length || 'None'}</Text>
              </View>
            </View>

            <View style={[styles.recommendationBox, { backgroundColor: theme.colors.primary + '10' }]}>
              <AlertCircle size={20} color={theme.colors.primary} />
              <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                {overallStatus === 'normal' 
                  ? 'Your eyes look healthy! Keep up with regular breaks and proper lighting.'
                  : 'We noticed some potential issues. Consider taking our full diagnostic tests for a more detailed analysis.'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack}>
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Assessment</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressWrapper}>
          <View style={[styles.progressBackground, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MotiView 
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              style={[styles.progressFill, { backgroundColor: '#FFFFFF' }]} 
            />
          </View>
          <View style={styles.stepIcons}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <View key={step.id} style={styles.stepIconWrapper}>
                  <View style={[
                    styles.stepIconCircle, 
                    { backgroundColor: index <= currentStep ? '#FFFFFF' : 'rgba(255,255,255,0.2)' }
                  ]}>
                    <Icon size={14} color={index <= currentStep ? theme.colors.primary : '#FFFFFF'} />
                  </View>
                  <Text style={styles.stepIconLabel}>{step.title}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={currentStep}
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ flex: 1 }}
          >
            {renderStepContent()}
          </MotiView>
        </AnimatePresence>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressWrapper: {
    marginTop: 10,
  },
  progressBackground: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  stepIconWrapper: {
    alignItems: 'center',
  },
  stepIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepIconLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -6,
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  selectedChip: {
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  acuityContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acuityLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 60,
  },
  acuityButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  acuityButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  astigContainer: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  astigLine: {
    position: 'absolute',
    width: 4,
    height: 200,
    borderRadius: 2,
  },
  mainButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  resultCard: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendationBox: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 30,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
});
