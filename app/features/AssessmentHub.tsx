import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, ShieldCheck, Activity, TrendingUp, ArrowLeft, Info, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEyeStore } from '../../store/useEyeStore';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function AssessmentHub() {
  const { wellnessScore, aiInsights, results } = useEyeStore();

  const getScoreColor = (): [string, string] => {
    if (wellnessScore >= 80) return ['#10B981', '#059669'];
    if (wellnessScore >= 60) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Assessment Hub</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wellness Score Ring */}
        <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.scoreCard}>
          <LinearGradient colors={getScoreColor()} style={styles.scoreGradient}>
            <View style={styles.scoreInner}>
              <Text style={styles.scoreLabel}>Eye Wellness</Text>
              <Text style={styles.scoreValue}>{wellnessScore}</Text>
              <Text style={styles.scoreLimit}>/100</Text>
            </View>
          </LinearGradient>
        </MotiView>

        {/* AI Insights Section */}
        <View style={styles.sectionHeader}>
          <Brain size={20} color="#0A2E6B" />
          <Text style={styles.sectionTitle}>AI Diagnostic Insights</Text>
        </View>

        {aiInsights.map((insight, index) => (
          <MotiView 
            key={index}
            from={{ translateX: -20, opacity: 0 }}
            animate={{ translateX: 0, opacity: 1 }}
            transition={{ delay: index * 100 }}
            style={styles.insightCard}
          >
            <ShieldCheck size={20} color="#10B981" />
            <Text style={styles.insightText}>{insight}</Text>
          </MotiView>
        ))}

        {/* Detailed Metrics */}
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#0A2E6B" />
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricItem 
            label="Visual Clarity" 
            value={results.find(r => r.type === 'Visual Acuity')?.score || '--'} 
            icon={TrendingUp}
          />
          <MetricItem 
            label="Neural Response" 
            value={results.find(r => r.type === 'Pupil Response')?.score || '--'} 
            icon={Brain}
          />
          <MetricItem 
            label="Chromatic Scale" 
            value={results.find(r => r.type.includes('Color'))?.score || '--'} 
            icon={Activity}
          />
        </View>

        {/* Warning/Info */}
        <View style={styles.warningBox}>
          <AlertCircle size={20} color="#64748B" />
          <Text style={styles.warningText}>
            This assessment is for screening purposes and does not replace a professional clinical diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricItem({ label, value, icon: Icon }: any) {
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <Icon size={16} color="#64748B" />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}%</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${value === '--' ? 0 : value}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
  backBtn: { padding: 10, marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  scrollContent: { padding: 20 },
  scoreCard: { alignItems: 'center', marginBottom: 30 },
  scoreGradient: { width: 180, height: 180, borderRadius: 90, padding: 10, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  scoreInner: { width: '100%', height: '100%', borderRadius: 80, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  scoreLabel: { fontSize: 12, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: '#0F172A' },
  scoreLimit: { fontSize: 14, color: '#94A3B8' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  insightCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12, elevation: 2 },
  insightText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  metricsGrid: { gap: 15 },
  metricItem: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  metricLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  progressBar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0A2E6B' },
  warningBox: { marginTop: 30, padding: 20, backgroundColor: '#F1F5F9', borderRadius: 20, flexDirection: 'row', gap: 12, alignItems: 'center' },
  warningText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 18 }
});
