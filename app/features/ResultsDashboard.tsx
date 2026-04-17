import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { FileDown, Calendar, ArrowRight, ClipboardCheck } from 'lucide-react-native';
import { generatePdfReport } from '../../utils/pdfGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import appTheme from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { getUserResults } from '../../lib/firebase';

interface TestResult {
  id: string;
  testType: string;
  date: string;
  score: number;
  status: 'normal' | 'attention' | 'concern';
  details: string;
}

export default function ResultsDashboard() {
  const { user } = useAuth();
  const { COLORS, SIZES, FONTS, SHADOWS } = appTheme;
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    try {
      let combinedResults: TestResult[] = [];

      // 1. Load from AsyncStorage (Local cache/Guest results)
      const stored = await AsyncStorage.getItem('testResults');
      if (stored) {
        combinedResults = JSON.parse(stored);
      }

      // 2. Load from Firebase if user is logged in
      if (user?.uid) {
        const firestoreResults = await getUserResults(user.uid);
        // Map firestore results to our interface
        const mappedFirestore: TestResult[] = firestoreResults.map((doc: any) => ({
          id: doc.id,
          testType: doc.testType,
          date: doc.date,
          score: doc.score,
          status: doc.status,
          details: doc.details
        }));

        // Merge and remove duplicates (based on content or id if needed)
        // For simplicity, we just concat and sort by date
        combinedResults = [...mappedFirestore, ...combinedResults.filter(lr => !mappedFirestore.find(fr => fr.date === lr.date && fr.testType === lr.testType))];
      }

      setResults(combinedResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareReport = () => {
    generatePdfReport(results);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10B981';
      case 'attention': return '#F59E0B';
      case 'concern': return '#EF4444';
      default: return COLORS.textSecondary;
    }
  };

  const renderResultItem = ({ item, index }: { item: TestResult, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100 }}
      style={styles.resultsCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.testTypeContainer}>
          <ClipboardCheck size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{item.testType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.scoreValue}>{item.score}%</Text>
          <Text style={styles.scoreLabel}>Health Score</Text>
        </View>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>

      <Text style={styles.detailsText}>{item.details}</Text>
    </MotiView>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History & Reports</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareReport} disabled={results.length === 0}>
          <FileDown size={20} color={COLORS.surface} />
          <Text style={styles.shareButtonText}>PDF Report</Text>
        </TouchableOpacity>
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyState}>
          <ClipboardCheck size={64} color={COLORS.textSecondary} opacity={0.5} />
          <Text style={styles.emptyText}>No test results found yet.</Text>
          <Text style={styles.emptySubtext}>Complete some tests to see your trends.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  listContent: {
    padding: 20,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
