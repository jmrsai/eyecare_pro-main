import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { ChevronRight, Eye, ClipboardList, MessageSquare, TrendingUp, Activity, Bell, Pill } from 'lucide-react-native';
import appTheme from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import LogoSVG from '../../components/Medical/LogoSVG';

const FEATURES = [
    { id: 'features/ComprehensiveCheckup', title: 'Comprehensive Check-up', description: 'Complete 5 core tests in 5 minutes.', icon: <ClipboardList color="#3B82F6" size={24}/> },
    { id: 'medications', title: 'Medication Tracker', description: 'Scan prescriptions and set reminders.', icon: <Pill color="#10B981" size={24}/> },
    { id: 'features/AIChatbot', title: 'AI Chatbot', description: 'Ask questions about your eye health.', icon: <MessageSquare color="#8B5CF6" size={24}/> },
];

export default function Home() {
  const { COLORS } = appTheme;
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLatestScore();
  }, []);

  const loadLatestScore = async () => {
    try {
      const stored = await AsyncStorage.getItem('testResults');
      if (stored) {
        const results = JSON.parse(stored);
        if (results.length > 0) {
          setLatestScore(results[0].score);
        }
      }
    } catch (error) {
      console.error('Error loading score:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadLatestScore();
    setRefreshing(false);
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.welcomeRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <LogoSVG size={40} color={COLORS.primary} />
          <View>
            <Text style={styles.title}>Hello!</Text>
            <Text style={styles.subtitle}>Let&apos;s check your vision today.</Text>
          </View>
        </View>
        <Pressable style={styles.notificationBtn} onPress={() => router.push('/reminders')}>
          <Bell size={24} color={COLORS.text} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <MotiView 
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.scoreCard}
      >
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Latest Vision Score</Text>
          <Text style={styles.scoreValue}>{latestScore !== null ? `${latestScore}%` : '--'}</Text>
          <Text style={styles.scoreTrend}>
            <TrendingUp size={14} color="#10B981" /> +2% from last month
          </Text>
        </View>
        <View style={styles.scoreIcon}>
          <Activity color="#FFFFFF" size={32} />
        </View>
      </MotiView>
    </View>
  );

  const renderFeatureItem = ({ item, index }: { item: any, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100 }}
    >
      <Pressable 
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
        onPress={() => router.push(item.id)}
      >
        <View style={styles.cardIcon}>{item.icon}</View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
        <ChevronRight color={COLORS.textSecondary} size={20} />
      </Pressable>
    </MotiView>
  );

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Essential Tools</Text>
        {FEATURES.map((item, index) => (
            <View key={item.id}>
                {renderFeatureItem({ item, index })}
            </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Daily Exercises</Text>
        <Pressable 
            style={styles.exerciseCard}
            onPress={() => router.push('/exercises')}
        >
            <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>20-20-20 Rule</Text>
                <Text style={styles.exerciseSubtitle}>Relax your eyes now</Text>
            </View>
            <Eye color="#3B82F6" size={24} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContent: { padding: 20, paddingTop: 40, backgroundColor: '#FFFFFF' },
  welcomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B' },
  notificationBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  notifDot: { position: 'absolute', right: 10, top: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FFFFFF' },
  scoreCard: { 
    flexDirection: 'row', 
    backgroundColor: '#3B82F6', 
    padding: 24, 
    borderRadius: 24, 
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  scoreInfo: { flex: 1 },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  scoreValue: { color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  scoreTrend: { color: '#FFFFFF', fontSize: 12, opacity: 0.9 },
  scoreIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 16 },
  sectionContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2
  },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  cardDescription: { fontSize: 13, color: '#64748B', marginTop: 2 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  exerciseSubtitle: { fontSize: 13, color: '#3B82F6' },
});
