import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Target, Zap, Eye, Activity, Brain, CheckCircle2, Play, Flame, Palette } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRAINING_PLAN = [
  { id: 'reaction', title: 'Reaction Logic', duration: '1 min', icon: Zap, color: '#3B82F6', route: '/training/games/reaction' },
  { id: 'dichoptic', title: 'Lazy Eye Therapy', duration: '3 min', icon: Palette, color: '#EF4444', route: '/training/games/dichoptic-training' },
  { id: 'peripheral', title: 'Peripheral Scope', duration: '1 min', icon: Target, color: '#10B981', route: '/training/games/peripheral' },
  { id: 'focus', title: 'Focus Shift', duration: '1 min', icon: Activity, color: '#8B5CF6', route: '/training/games/focus' },
  { id: 'blink', title: 'Blink Training', duration: '30 sec', icon: Eye, color: '#F59E0B', route: '/training/games/blink' },
  { id: 'relax', title: 'Palming Mode', duration: '2 min', icon: Brain, color: '#6366F1', route: '/training/games/relax' },
];

export default function TrainingOverview() {
  const { theme } = useTheme();
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('training_stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setStreak(parsed.streak || 0);
        // Reset completion if it's a new day
        const today = new Date().toDateString();
        if (parsed.lastDate === today) {
          setCompletedToday(parsed.completedToday || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[theme.colors.primary, '#1E3A8A']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Daily Visual Gym</Text>
            <Text style={styles.headerSubtitle}>5-7 Minute Guided Routine</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.planCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today&apos;s Training Plan</Text>
          <Text style={[styles.sectionDesc, { color: theme.colors.subtext }]}>Complete all 5 sessions for maximum results.</Text>
          
          <View style={styles.planList}>
            {TRAINING_PLAN.map((item, index) => {
              const Icon = item.icon;
              const isCompleted = completedToday.includes(item.id);
              return (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: index * 100 }}
                  style={[styles.planItem, { backgroundColor: theme.colors.card }]}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                    <Icon size={20} color={item.color} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text style={[styles.itemDuration, { color: theme.colors.subtext }]}>{item.duration}</Text>
                  </View>
                  {isCompleted ? (
                    <CheckCircle2 size={22} color="#10B981" />
                  ) : (
                    <TouchableOpacity 
                        style={[styles.playBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.push(item.route as any)}
                    >
                      <Play size={14} color="#FFF" fill="#FFF" />
                    </TouchableOpacity>
                  )}
                </MotiView>
              );
            })}
          </View>
        </View>

        <View style={[styles.insightsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>Why this routine?</Text>
          <Text style={[styles.insightsText, { color: theme.colors.subtext }]}>
            This sequence is clinically designed to stimulate neural pathways between your retina and visual cortex, improving focus flexibility and reaction speed.
          </Text>
        </View>

        <TouchableOpacity 
            style={[styles.mainStartBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/training/games/reaction')}
        >
          <Text style={styles.mainStartBtnText}>Start Training Session</Text>
          <Zap size={20} color="#FFF" fill="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: { marginBottom: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  streakBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 15,
    gap: 6
  },
  streakText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  content: { flex: 1, padding: 20 },
  planCard: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  sectionDesc: { fontSize: 14, marginBottom: 20 },
  planList: { gap: 12 },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemDuration: { fontSize: 12, marginTop: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  insightsCard: { padding: 20, borderRadius: 25, marginBottom: 30 },
  insightsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  insightsText: { fontSize: 14, lineHeight: 22 },
  mainStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  mainStartBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
