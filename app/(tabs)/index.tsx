import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Palette, Target, Grid3X3, Zap, Clock, BookOpen, AlertTriangle, Settings, ClipboardList, Shield, MapPin, Brain, Activity, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { StyledTouchableOpacity } from '../../components/StyledTouchableOpacity';
import ConsentModal from '../../components/Medical/ConsentModal';
import { MotiView, AnimatePresence } from 'moti';
import { useEyeStore } from '../../store/useEyeStore';

const { width } = Dimensions.get('window');

const diagnosticTests = [
  { id: 'visual-acuity', title: 'Visual Acuity', description: 'Sharpness screening', icon: Eye, route: '/tests/visual-acuity' },
  { id: 'color-vision', title: 'Color Vision', description: 'Deficiency screening', icon: Palette, route: '/tests/color-vision' },
  { id: 'astigmatism', title: 'Astigmatism', description: 'Symmetry check', icon: Target, route: '/tests/astigmatism' },
  { id: 'amsler-grid', title: 'Amsler Grid', description: 'Macular health', icon: Grid3X3, route: '/tests/amsler-grid' },
  { id: 'contrast-sensitivity', title: 'Contrast', description: 'Threshold mapping', icon: Zap, route: '/tests/contrast-sensitivity' },
  { id: 'visual-field', title: 'Side Sight', description: 'Peripheral mapping', icon: Brain, route: '/tests/visual-field' },
  { id: 'pupil-response', title: 'Pupil Response', description: 'Neurological check', icon: Activity, route: '/tests/pupil-response' },
];

export default function DashboardScreen() {
  const { theme, typography, spacing } = useTheme();
  const { wellnessScore, aiInsights, dailyProgress } = useEyeStore();

  const handleTestPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConsentModal />
      <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <StyledTouchableOpacity style={styles.iconButton} onPress={() => router.push('/emergency')}>
            <AlertTriangle size={20} color="#FFFFFF" />
          </StyledTouchableOpacity>
          <StyledTouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <Settings size={20} color="#FFFFFF" />
          </StyledTouchableOpacity>
        </View>
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }}>
          <Text style={styles.headerTitle}>EyeCare Pro</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.headerSubtitle}>Precision Diagnostics</Text>
            <View style={styles.encryptionBadge}>
              <Shield size={10} color="#FFFFFF" />
              <Text style={styles.encryptionText}>AI POWERED</Text>
            </View>
          </View>
        </MotiView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Wellness Hub */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push('/features/AssessmentHub' as any)}
          style={styles.wellnessCard}
        >
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 200 }}
          >
            <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.wellnessGradient}>
              <View style={styles.wellnessHeader}>
                <View style={styles.scoreCircle}>
                  <Activity size={24} color={theme.colors.primary} />
                  <Text style={styles.scoreText}>{wellnessScore}</Text>
                </View>
                <View style={styles.wellnessInfo}>
                  <Text style={styles.wellnessTitle}>Vision Wellness Score</Text>
                  <Text style={styles.wellnessStatus}>{wellnessScore >= 80 ? 'Optimal' : 'Needs Attention'}</Text>
                </View>
                <TrendingUp size={20} color={theme.colors.primary} />
              </View>
              
              <View style={styles.aiBox}>
                <Brain size={16} color={theme.colors.secondary} />
                <Text style={styles.aiInsightText}>{aiInsights[0]}</Text>
              </View>

              <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Daily Training</Text>
                      <Text style={styles.progressPercent}>{dailyProgress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                      <MotiView 
                          animate={{ width: `${dailyProgress}%` }}
                          transition={{ type: 'timing', duration: 1000 }}
                          style={[styles.progressFill, { backgroundColor: theme.colors.primary }]} 
                      />
                  </View>
              </View>
            </LinearGradient>
          </MotiView>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Medical Diagnostics</Text>
        
        {diagnosticTests.map((test, index) => (
          <MotiView
            key={test.id}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', delay: 400 + (index * 100) }}
          >
            <TouchableOpacity 
              style={styles.testCard} 
              onPress={() => handleTestPress(test.route)}
            >
              <View style={[styles.testIconBox, { backgroundColor: `${theme.colors.primary}10` }]}>
                <test.icon size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.testMeta}>
                <Text style={styles.testTitle}>{test.title}</Text>
                <Text style={styles.testDesc}>{test.description}</Text>
              </View>
              <TrendingUp size={16} color="#E2E8F0" />
            </TouchableOpacity>
          </MotiView>
        ))}

        <TouchableOpacity 
            style={styles.specialistCard}
            onPress={() => router.push('/doctor-finder' as any)}
        >
            <MapPin size={24} color="#FFF" />
            <Text style={styles.specialistText}>Find Nearest Eye Specialist</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  encryptionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5 },
  encryptionText: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  wellnessCard: { borderRadius: 30, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 30 },
  wellnessGradient: { padding: 25 },
  wellnessHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  scoreCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  scoreText: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  wellnessInfo: { flex: 1 },
  wellnessTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  wellnessStatus: { fontSize: 14, color: '#10B981', fontWeight: 'bold' },
  aiBox: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, gap: 10, alignItems: 'center', marginBottom: 20 },
  aiInsightText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },
  progressContainer: { marginTop: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  progressPercent: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  testCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  testIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  testMeta: { flex: 1 },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  testDesc: { fontSize: 12, color: '#64748B' },
  specialistCard: { backgroundColor: '#0F172A', padding: 20, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 },
  specialistText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
