import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { TrendingUp, Award, Calendar, ChevronLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface TestResult {
  date: string;
  score: number;
}

export default function TrendAnalysis() {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('testResults');
      if (stored) {
        const results: TestResult[] = JSON.parse(stored);
        // Sort by date and take last 7 for the chart
        const sorted = results.sort((a: TestResult, b: TestResult) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setHistory(sorted);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (history.length === 0) return { labels: [], datasets: [{ data: [0] }] };
    
    // Last 6 entries
    const recent = history.slice(-6);
    return {
      labels: recent.map((r: TestResult) => new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric' })),
      datasets: [
        {
          data: recent.map((r: TestResult) => r.score),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3
        }
      ]
    };
  };

  const calculateStats = () => {
    if (history.length === 0) return { avg: 0, best: 0, trend: 0 };
    const scores = history.map((h: TestResult) => h.score);
    const avg = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    
    let trend = 0;
    if (history.length >= 2) {
      const last = history[history.length - 1].score;
      const prev = history[history.length - 2].score;
      trend = last - prev;
    }

    return { avg, best, trend };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.headerTitle}>Progress Trends</Text>
          <View style={{ width: 40 }} />
        </View>

        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.heroCard}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg. Score</Text>
              <Text style={styles.statValue}>{stats.avg}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Weekly Trend</Text>
              <View style={styles.trendRow}>
                {stats.trend >= 0 ? (
                  <ArrowUpRight size={16} color="#10B981" />
                ) : (
                  <ArrowDownRight size={16} color="#EF4444" />
                )}
                <Text style={[styles.statValue, { color: stats.trend >= 0 ? '#10B981' : '#EF4444' }]}>
                  {Math.abs(stats.trend)}%
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Vision Score History</Text>
        </View>

        <View style={styles.chartContainer}>
          {history.length > 0 ? (
            <LineChart
              data={getChartData()}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#3B82F6' },
                propsForBackgroundLines: { strokeDasharray: '', stroke: '#F1F5F9' }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Complete more tests to see trends</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Key Insights</Text>
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          style={styles.insightCard}
        >
          <Award size={24} color="#F59E0B" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Personal Best achieved!</Text>
            <Text style={styles.insightDesc}>Your vision score of {stats.best}% is the highest recorded this month.</Text>
          </View>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300 }}
          style={[styles.insightCard, { marginTop: 12 }]}
        >
          <Calendar size={24} color="#8B5CF6" />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Consistency is Key</Text>
            <Text style={styles.insightDesc}>You&apos;ve completed {history.length} checkups. Keep it up!</Text>
          </View>
        </MotiView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  heroCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  divider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
  trendRow: { flexDirection: 'row', alignItems: 'center' },
  content: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginLeft: 8, marginBottom: 16 },
  chartContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  chart: { borderRadius: 16, marginVertical: 8 },
  emptyState: { height: 200, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
  insightCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  insightContent: { marginLeft: 16, flex: 1 },
  insightTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  insightDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
});
