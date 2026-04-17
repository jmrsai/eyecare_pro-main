import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';
import { ChevronLeft, Check, AlertCircle, Info } from 'lucide-react-native';
import { MotiView } from 'moti';

const symptomsData = [
  { id: 'blurry_vision', name: 'Blurry Vision' },
  { id: 'eye_pain', name: 'Eye Pain' },
  { id: 'itchy_eyes', name: 'Itchy Eyes' },
  { id: 'dry_eyes', name: 'Dry Eyes' },
  { id: 'watery_eyes', name: 'Watery Eyes' },
  { id: 'redness', name: 'Redness' },
  { id: 'light_flashes', name: 'Flashes of Light' },
  { id: 'floaters', name: 'Floaters' },
  { id: 'double_vision', name: 'Double Vision' },
  { id: 'light_sensitivity', name: 'Light Sensitivity' },
  { id: 'halos', name: 'Halos Around Lights' },
  { id: 'headaches', name: 'Headaches' },
];

const conditions = {
  dry_eye_syndrome: ['dry_eyes', 'itchy_eyes', 'redness', 'blurry_vision'],
  conjunctivitis: ['redness', 'itchy_eyes', 'watery_eyes'],
  cataracts: ['blurry_vision', 'halos', 'light_sensitivity'],
  glaucoma: ['blurry_vision', 'halos', 'eye_pain', 'headaches'],
  macular_degeneration: ['blurry_vision', 'floaters'],
  retinal_detachment: ['light_flashes', 'floaters', 'blurry_vision'],
};

const SymptomCheckerScreen = () => {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<{name: string, score: number}[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
    setAnalysisResults(null);
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms Selected', 'Please select at least one symptom to analyze.');
      return;
    }

    setLoading(true);

    const scoredConditions = Object.entries(conditions)
      .map(([condition, conditionSymptoms]) => {
        const matchedSymptoms = selectedSymptoms.filter(symptom =>
          conditionSymptoms.includes(symptom)
        );
        return {
          name: condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          score: matchedSymptoms.length,
        };
      })
      .filter(condition => condition.score > 0)
      .sort((a, b) => b.score - a.score);

    setAnalysisResults(scoredConditions);

    // Save result to Firebase
    if (user?.uid) {
        const result = {
            testType: 'Symptom Check',
            date: new Date().toISOString().split('T')[0],
            score: Math.min(selectedSymptoms.length * 10, 100), // Arbitrary score for health tracking
            status: scoredConditions.length > 0 ? 'attention' : 'normal',
            details: `Selected ${selectedSymptoms.length} symptoms. Top match: ${scoredConditions[0]?.name || 'None'}`,
            metadata: { selectedSymptoms, matches: scoredConditions }
        };
        await saveTestResult(user.uid, result);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>Symptom Checker</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>What are you experiencing?</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply to your current condition.</Text>
        
        <View style={styles.symptomsGrid}>
          {symptomsData.map(symptom => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomChip,
                  isSelected && styles.selectedSymptomChip,
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                {isSelected && <Check size={16} color="#FFF" style={{marginRight: 6}} />}
                <Text
                  style={[
                    styles.symptomText,
                    isSelected && styles.selectedSymptomText,
                  ]}
                >
                  {symptom.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {analysisResults && (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.resultsCard}
          >
            <View style={styles.resultsHeader}>
                <AlertCircle size={20} color="#3B82F6" />
                <Text style={styles.resultsTitle}>Analysis Results</Text>
            </View>
            
            {analysisResults.length > 0 ? (
                <>
                <Text style={styles.resultsDesc}>Based on your symptoms, these conditions might be relevant:</Text>
                {analysisResults.slice(0, 3).map((res, i) => (
                    <View key={i} style={styles.resultItem}>
                        <View style={styles.resultDot} />
                        <Text style={styles.resultName}>{res.name}</Text>
                    </View>
                ))}
                </>
            ) : (
                <Text style={styles.resultsDesc}>No specific matches found. If symptoms persist, please consult a professional.</Text>
            )}

            <View style={styles.disclaimerBox}>
                <Info size={14} color="#64748B" />
                <Text style={styles.disclaimerText}>This is a screening tool, not a medical diagnosis.</Text>
            </View>
          </MotiView>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.analyzeButton, loading && { opacity: 0.7 }]} 
          onPress={analyzeSymptoms}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.analyzeButtonText}>Analyze Symptoms</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginLeft: 15 },
  scrollContainer: { padding: 24 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  sectionSubtitle: { fontSize: 16, color: '#64748B', marginTop: 8, marginBottom: 24 },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  symptomChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, margin: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedSymptomChip: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  symptomText: { color: '#475569', fontSize: 15, fontWeight: '500' },
  selectedSymptomText: { color: '#FFF', fontWeight: 'bold' },
  resultsCard: { backgroundColor: '#EFF6FF', borderRadius: 24, padding: 24, marginTop: 32, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginLeft: 10 },
  resultsDesc: { fontSize: 15, color: '#1E40AF', marginBottom: 16, lineHeight: 22 },
  resultItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6', marginRight: 12 },
  resultName: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
  disclaimerBox: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(59, 130, 246, 0.2)' },
  disclaimerText: { fontSize: 12, color: '#64748B', marginLeft: 8 },
  footer: { padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  analyzeButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  analyzeButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default SymptomCheckerScreen;
