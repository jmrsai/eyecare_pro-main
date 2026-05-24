import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Target, Zap, Eye, Activity, Brain, CheckCircle2, Play, Flame, Palette } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEyeStore } from '../../store/useEyeStore';

const TRAINING_PLAN = [
  { id: 'reaction', title: 'Reaction Logic', duration: '1 min', icon: Zap, color: '#3B82F6', route: '/training/games/reaction' },
  { id: 'brock', title: 'Brock String Fusion', duration: '2 min', icon: Activity, color: '#10B981', route: '/training/games/brock-string' },
  { id: 'gamma', title: '40Hz Neuro-Sync', duration: '15 min', icon: Brain, color: '#A78BFA', route: '/training/games/gamma-therapy' },
  { id: 'dichoptic', title: 'Lazy Eye Therapy', duration: '3 min', icon: Palette, color: '#EF4444', route: '/training/games/dichoptic-training' },
  { id: 'peripheral', title: 'Peripheral Scope', duration: '1 min', icon: Target, color: '#10B981', route: '/training/games/peripheral' },
  { id: 'focus', title: 'Focus Shift', duration: '1 min', icon: Activity, color: '#8B5CF6', route: '/training/games/focus' },
  { id: 'blink', title: 'Blink Training', duration: '30 sec', icon: Eye, color: '#F59E0B', route: '/training/games/blink' },
  { id: 'relax', title: 'Palming Mode', duration: '2 min', icon: Brain, color: '#6366F1', route: '/training/games/relax' },
];

export default function TrainingOverview() {
  const { theme } = useTheme();
  const { streak, dailyProgress } = useEyeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Visual Gym</Text>
            <Text style={styles.headerSubtitle}>Personalized Neural Training</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Daily Progress</Text>
            <View style={styles.progressBar}>
                <MotiView 
                    animate={{ width: `${dailyProgress}%` }}
                    style={[styles.progressFill, { backgroundColor: '#10B981' }]} 
                />
            </View>
            <Text style={styles.progressText}>{dailyProgress}% of daily goal achieved</Text>
        </View>

        <View style={styles.planList}>
          {TRAINING_PLAN.map((item, index) => {
            const Icon = item.icon;
            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50 }}
              >
                <TouchableOpacity 
                    style={styles.planItem}
                    onPress={() => router.push(item.route as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                    <Icon size={20} color={item.color} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDuration}>{item.duration} routine</Text>
                  </View>
                  <Play size={18} color="#E2E8F0" fill="#E2E8F0" />
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        <View style={styles.footerInfo}>
            <Brain size={20} color="#64748B" />
            <Text style={styles.footerText}>
                Consistency is key for neuroplasticity. Complete your daily gym to maintain your visual streak.
            </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backButton: { marginBottom: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, gap: 8 },
  streakText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  content: { flex: 1, padding: 20 },
  progressSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  progressBar: { height: 12, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 6 },
  progressText: { fontSize: 13, color: '#64748B' },
  planList: { gap: 15 },
  planItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 25, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  iconBox: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  itemDuration: { fontSize: 12, color: '#64748B', marginTop: 2 },
  footerInfo: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 20, borderRadius: 20, gap: 15, alignItems: 'center', marginTop: 30 },
  footerText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 }
});
