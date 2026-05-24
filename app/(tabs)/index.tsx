import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Palette, Target, Grid3X3, Zap, Clock, BookOpen, AlertTriangle, Settings, ClipboardList, Shield, MapPin, Brain, Activity, TrendingUp, Camera, Flame, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { StyledTouchableOpacity } from '../../components/StyledTouchableOpacity';
import ConsentModal from '../../components/Medical/ConsentModal';
import { MotiView, AnimatePresence } from 'moti';
import { useEyeStore } from '../../store/useEyeStore';

const { width } = Dimensions.get('window');

const diagnosticTests = [
  { id: 'photo-scan', title: 'AI Photo Scanner', description: 'Scan infections & conditions', icon: Camera, route: '/tests/photo-scan' },
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
  const { wellnessScore, aiInsights, dailyProgress, dailyTasks, streak, checkDailyReset } = useEyeStore();

  useEffect(() => {
    checkDailyReset();
  }, []);

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

        {/* Daily Quests & Streaks Card */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 300 }}
          style={styles.questCard}
        >
          <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.questGradient}>
            <View style={styles.questHeader}>
              <View style={styles.questTitleRow}>
                <Flame size={20} color="#ff9800" style={{ marginRight: 6 }} />
                <Text style={styles.questTitle}>Daily Sight Quests</Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak} Day Streak</Text>
              </View>
            </View>
            
            <Text style={styles.questSubtitle}>
              Complete all daily tasks to keep your streak and maximize vision wellness.
            </Text>
            
            <View style={styles.tasksList}>
              {dailyTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
                  onPress={() => {
                    if (!task.completed) {
                      router.push(task.route as any);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.taskIconWrapper}>
                    {task.completed ? (
                      <CheckCircle2 size={18} color="#00e676" style={{ marginTop: 1 }} />
                    ) : (
                      <Clock size={18} color="#94a3b8" style={{ marginTop: 1 }} />
                    )}
                  </View>
                  
                  <View style={styles.taskMeta}>
                    <Text style={[styles.taskTitleText, task.completed && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskDescText}>{task.description}</Text>
                  </View>
                  
                  <View style={[styles.ptsBadge, task.completed && styles.ptsBadgeCompleted]}>
                    <Text style={[styles.ptsText, task.completed && styles.ptsTextCompleted]}>
                      +{task.points} pts
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </MotiView>

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
  wellnessCard: { 
    borderRadius: 32, 
    overflow: 'hidden', 
    elevation: 8, 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, 
    shadowRadius: 24, 
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
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
  testCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 16, 
    shadowColor: '#1E293B', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  testIconBox: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  testMeta: { flex: 1 },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  testDesc: { fontSize: 12, color: '#64748B' },
  specialistCard: { backgroundColor: '#0F172A', padding: 20, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 },
  specialistText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  questCard: {
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  questGradient: {
    padding: 24,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  streakBadge: {
    backgroundColor: '#ff980022',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  streakText: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  taskItemCompleted: {
    backgroundColor: 'rgba(0, 230, 118, 0.04)',
    borderColor: 'rgba(0, 230, 118, 0.1)',
  },
  taskIconWrapper: {
    marginRight: 12,
  },
  taskMeta: {
    flex: 1,
  },
  taskTitleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskTitleCompleted: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  taskDescText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  ptsBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  ptsBadgeCompleted: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  ptsText: {
    color: '#00e5ff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ptsTextCompleted: {
    color: '#00e676',
  }
});
