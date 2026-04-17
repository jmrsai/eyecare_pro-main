import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Calendar, Eye, AlertCircle, Download } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

interface TestResult {
  id: string;
  testType: string;
  date: string;
  score: number;
  status: 'normal' | 'attention' | 'concern';
  details: string;
}

export default function ResultsScreen() {
  const { theme } = useTheme();
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallScore, setOverallScore] = useState(85);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const storedResults = await AsyncStorage.getItem('testResults');
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      } else {
        // Sample data for demonstration
        const sampleResults: TestResult[] = [
          {
            id: '1',
            testType: 'Visual Acuity',
            date: '2025-01-15',
            score: 90,
            status: 'normal',
            details: '20/20 vision in both eyes',
          },
          {
            id: '2',
            testType: 'Color Vision',
            date: '2025-01-14',
            score: 95,
            status: 'normal',
            details: 'No color vision deficiency detected',
          },
          {
            id: '3',
            testType: 'Astigmatism',
            date: '2025-01-13',
            score: 75,
            status: 'attention',
            details: 'Mild astigmatism detected in left eye',
          },
        ];
        setResults(sampleResults);
        await AsyncStorage.setItem('testResults', JSON.stringify(sampleResults));
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return theme.colors.primary;
      case 'attention':
        return theme.colors.warning;
      case 'concern':
        return theme.colors.notification;
      default:
        return theme.colors.subtext;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'attention':
        return 'Needs Attention';
      case 'concern':
        return 'Concerning';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => theme.colors.subtext,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: theme.colors.border,
      strokeDasharray: "0",
    },
  };

  const chartData = {
    labels: results.slice(0, 5).reverse().map(r => formatDate(r.date)),
    datasets: [
      {
        data: results.slice(0, 5).reverse().map(r => r.score),
      },
    ],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.info]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your Results</Text>
        <Text style={styles.headerSubtitle}>Track your eye health progress</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Health Score */}
        <View style={[styles.scoreCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreTitle, { color: theme.colors.text }]}>Overall Eye Health Score</Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.scoreContent}>
            <Text style={[styles.scoreNumber, { color: theme.colors.primary }]}>{overallScore}</Text>
            <Text style={[styles.scoreOutOf, { color: theme.colors.subtext }]}>/100</Text>
          </View>
          <View style={[styles.scoreBar, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.scoreProgress, { width: `${overallScore}%`, backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.scoreDescription, { color: theme.colors.subtext }]}>
            Good overall eye health. Continue regular monitoring.
          </Text>
        </View>

        {/* Trends */}
        <View style={[styles.trendsCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.trendsHeader}>
            <TrendingUp size={20} color={theme.colors.primary} />
            <Text style={[styles.trendsTitle, { color: theme.colors.primary }]}>Health Trends</Text>
          </View>
          
          {results.length > 0 ? (
            <BarChart
              style={styles.chart}
              data={chartData}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              fromZero
            />
          ) : (
            <Text style={[styles.trendsText, { color: theme.colors.subtext }]}>
              Your eye health trends will appear here after you complete more tests. 
              Continue regular testing to monitor any changes.
            </Text>
          )}
        </View>

        {/* Recommendations */}
        <View style={[styles.recommendationsCard, { backgroundColor: theme.colors.info + '15', borderColor: theme.colors.info }]}>
          <View style={styles.recommendationsHeader}>
            <AlertCircle size={20} color={theme.colors.info} />
            <Text style={[styles.recommendationsTitle, { color: theme.colors.info }]}>Recommendations</Text>
          </View>
          <Text style={[styles.recommendationsText, { color: theme.colors.text }]}>
            • Schedule a comprehensive eye exam with an eye care professional{'\n'}
            • Continue regular eye health monitoring{'\n'}
            • Follow up on astigmatism findings{'\n'}
            • Maintain good eye hygiene and screen time habits
          </Text>
        </View>

        {/* Recent Tests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Test Results</Text>
          
          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Eye size={48} color={theme.colors.subtext} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.subtext }]}>No test results yet</Text>
              <Text style={[styles.emptyStateText, { color: theme.colors.subtext }]}>
                Complete your first eye test to see results here
              </Text>
            </View>
          ) : (
            results.map((result) => (
              <TouchableOpacity key={result.id} style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{result.testType}</Text>
                    <View style={styles.resultMeta}>
                      <Calendar size={14} color={theme.colors.subtext} />
                      <Text style={[styles.resultDate, { color: theme.colors.subtext }]}>{result.date}</Text>
                    </View>
                  </View>
                  <View style={styles.resultScore}>
                    <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{result.score}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) + '15' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(result.status) }]}>
                        {getStatusText(result.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.resultDetails, { color: theme.colors.subtext }]}>{result.details}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  downloadButton: {
    padding: 8,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold' as const,
  },
  scoreOutOf: {
    fontSize: 24,
    marginLeft: 4,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
  },
  trendsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  trendsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  resultScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  resultDetails: {
    fontSize: 14,
  },
  recommendationsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  recommendationsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});