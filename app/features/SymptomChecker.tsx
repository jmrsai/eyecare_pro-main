import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, Activity } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const SYMPTOMS = [
  { id: 'dryness', label: 'Dryness or Grittiness', icon: '💧' },
  { id: 'redness', label: 'Redness or Bloodshot', icon: '🔴' },
  { id: 'blurry', label: 'Blurry Vision', icon: '🌫️' },
  { id: 'burning', label: 'Burning or Stinging', icon: '🔥' },
  { id: 'headache', label: 'Headaches or Brow Ache', icon: '🤕' },
  { id: 'sensitivity', label: 'Light Sensitivity', icon: '💡' },
  { id: 'floaters', label: 'New Floaters or Flashes', icon: '✨' },
  { id: 'double', label: 'Double Vision', icon: '👥' },
];

const ANALYSES: Record<string, any> = {
  'dryness-redness-burning': {
    title: 'Digital Eye Strain (Dry Eye)',
    risk: 'Moderate',
    description: 'Your symptoms suggest Dry Eye Syndrome, likely exacerbated by reduced blinking during screen use.',
    tips: [
      'Use artificial tears (preservative-free)',
      'Follow the 20-20-20 rule strictly',
      'Increase blink frequency consciously',
      'Adjust workspace humidity'
    ],
    urgency: 'routine'
  },
  'blurry-headache': {
    title: 'Computer Vision Syndrome',
    risk: 'Moderate',
    description: 'The combination of blurry vision and headaches often indicates uncorrected refractive error or extreme eye muscle fatigue.',
    tips: [
      'Check your prescription with a doctor',
      'Optimize screen distance (20-28 inches)',
      'Ensure proper ambient lighting',
      'Try focus-shifting exercises'
    ],
    urgency: 'urgent'
  },
  'floaters-sensitivity': {
    title: 'Retinal or Vitreous Concern',
    risk: 'High',
    description: 'New floaters accompanied by light sensitivity or flashes require immediate professional evaluation.',
    tips: [
      'Avoid sudden head movements',
      'Contact an ophthalmologist TODAY',
      'Do not perform eye exercises'
    ],
    urgency: 'immediate'
  },
  'default': {
    title: 'General Eye Fatigue',
    risk: 'Low',
    description: 'Your eyes seem fatigued from daily use. Standard preventive care is recommended.',
    tips: [
      'Get 7-9 hours of sleep',
      'Stay hydrated',
      'Use warm compresses at night',
      'Limit late-night screen use'
    ],
    urgency: 'routine'
  }
};

export default function SymptomChecker() {
  const { theme } = useTheme();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [step, setStep] = useState<'selection' | 'result'>('selection');

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getResult = () => {
    if (selectedSymptoms.includes('floaters')) return ANALYSES['floaters-sensitivity'];
    if (selectedSymptoms.includes('double')) return ANALYSES['floaters-sensitivity'];
    if (selectedSymptoms.includes('dryness') && selectedSymptoms.includes('burning')) return ANALYSES['dryness-redness-burning'];
    if (selectedSymptoms.includes('blurry') && selectedSymptoms.includes('headache')) return ANALYSES['blurry-headache'];
    return ANALYSES['default'];
  };

  const result = getResult();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[theme.colors.primary, '#1D4ED8']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => step === 'result' ? setStep('selection') : router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Checker</Text>
        <Text style={styles.headerSubtitle}>Identify potential causes and relief steps</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {step === 'selection' ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            <View style={styles.infoBox}>
              <HelpCircle size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                Select all the symptoms you are currently experiencing.
              </Text>
            </View>

            <View style={styles.symptomGrid}>
              {SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomCard,
                    { backgroundColor: theme.colors.card },
                    selectedSymptoms.includes(symptom.id) && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => toggleSymptom(symptom.id)}
                >
                  <Text style={styles.symptomEmoji}>{symptom.icon}</Text>
                  <Text style={[styles.symptomLabel, { color: theme.colors.text }]}>{symptom.label}</Text>
                  {selectedSymptoms.includes(symptom.id) && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.colors.primary }]}>
                      <CheckCircle2 size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.analyzeButton, 
                { backgroundColor: selectedSymptoms.length > 0 ? theme.colors.primary : theme.colors.border }
              ]}
              onPress={() => selectedSymptoms.length > 0 && setStep('result')}
              disabled={selectedSymptoms.length === 0}
            >
              <Activity size={20} color="#FFF" />
              <Text style={styles.analyzeButtonText}>Analyze Symptoms</Text>
            </TouchableOpacity>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.riskBadge, { backgroundColor: result.risk === 'High' ? '#FF3B30' : result.risk === 'Moderate' ? '#FF9500' : '#34C759' }]}>
                <Text style={styles.riskText}>{result.risk} Risk</Text>
              </View>
              
              <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{result.title}</Text>
              <Text style={[styles.resultDesc, { color: theme.colors.subtext }]}>{result.description}</Text>
              
              <View style={styles.divider} />
              
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recommended Actions</Text>
              {result.tips.map((tip: string, index: number) => (
                <View key={index} style={styles.tipRow}>
                  <View style={[styles.tipDot, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.tipText, { color: theme.colors.text }]}>{tip}</Text>
                </View>
              ))}

              {result.urgency === 'immediate' && (
                <View style={styles.urgencyBox}>
                  <AlertCircle size={20} color="#FF3B30" />
                  <Text style={styles.urgencyText}>Please seek emergency eye care immediately.</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/emergency')}
            >
              <Text style={styles.actionButtonText}>Find Emergency Care</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Disclaimer: This tool is for educational purposes only and does not constitute medical advice or a formal diagnosis.
            </Text>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 15,
    marginBottom: 25,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  symptomCard: {
    width: (Dimensions.get('window').width - 52) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 15,
  },
  riskText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultDesc: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tipText: {
    fontSize: 15,
    flex: 1,
  },
  urgencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    gap: 10,
  },
  urgencyText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 10,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  }
});
