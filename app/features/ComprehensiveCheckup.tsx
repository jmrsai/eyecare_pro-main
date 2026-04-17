import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { CheckCircle2, Circle, ArrowRight, Play, Info } from 'lucide-react-native';
import appTheme from '../../styles/theme';
import PostureCheck from './common/PostureCheck';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TESTS = [
  { id: 'visual-acuity', title: 'Visual Acuity', route: '/tests/visual-acuity', duration: '2 min' },
  { id: 'amsler-grid', title: 'Macular Health', route: '/tests/amsler-grid', duration: '1 min' },
  { id: 'color-vision', title: 'Color Vision', route: '/tests/color-vision', duration: '1 min' },
  { id: 'visual-field', title: 'Peripheral Vision', route: '/tests/visual-field', duration: '1 min' },
  { id: 'accommodation', title: 'Accommodation', route: '/tests/accommodation', duration: '1 min' },
];

export default function ComprehensiveCheckup() {
  const { COLORS, SIZES, FONTS, SHADOWS } = appTheme;
  const [isPostureCorrect, setIsPostureCorrect] = useState(false);
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      checkCompletion();
    }, [])
  );

  const checkCompletion = async () => {
    try {
      const stored = await AsyncStorage.getItem('testResults');
      if (stored) {
        const results = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        const doneToday = results
          .filter((r: any) => r.date === today)
          .map((r: any) => {
            // Map testType to our internal IDs
            if (r.testType === 'Visual Acuity') return 'visual-acuity';
            if (r.testType === 'Color Vision') return 'color-vision';
            // Add more mappings as needed
            return r.testType.toLowerCase().replace(' ', '-');
          });
        setCompletedTests(doneToday);
      }
    } catch (error) {
      console.error('Error checking completion:', error);
    }
  };

  const currentTestIndex = TESTS.findIndex(t => !completedTests.includes(t.id));
  const isAllComplete = currentTestIndex === -1;

  if (!isPostureCorrect) {
    return <PostureCheck onPostureCorrect={setIsPostureCorrect} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MotiView 
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.header}
      >
        <Text style={styles.title}>Daily Check-up</Text>
        <Text style={styles.subtitle}>Complete these 5 tests for a monthly snapshot of your vision health.</Text>
      </MotiView>

      <View style={styles.testList}>
        {TESTS.map((test, index) => {
          const isCompleted = completedTests.includes(test.id);
          const isCurrent = index === currentTestIndex;
          
          return (
            <MotiView
              key={test.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 }}
              style={[
                styles.testItem,
                isCurrent && styles.activeTestItem,
                isCompleted && styles.completedTestItem
              ]}
            >
              <View style={styles.testIconContainer}>
                {isCompleted ? (
                  <CheckCircle2 size={24} color={COLORS.success} />
                ) : (
                  <Circle size={24} color={isCurrent ? COLORS.primary : COLORS.textSecondary} />
                )}
              </View>
              <View style={styles.testInfo}>
                <Text style={[styles.testTitle, isCompleted && styles.completedText]}>{test.title}</Text>
                <Text style={styles.testMeta}>{test.duration}</Text>
              </View>
              {isCurrent && (
                <MotiView 
                    from={{ scale: 0.8 }} 
                    animate={{ scale: 1 }} 
                    transition={{ loop: true, type: 'timing', duration: 1500 }}
                >
                    <ArrowRight size={20} color={COLORS.primary} />
                </MotiView>
              )}
            </MotiView>
          );
        })}
      </View>

      <View style={styles.footer}>
        {isAllComplete ? (
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={() => router.push('/(tabs)/results')}
          >
            <Text style={styles.mainButtonText}>View Final Report</Text>
            <ArrowRight size={20} color={COLORS.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: COLORS.primary }]} 
            onPress={() => router.push(TESTS[currentTestIndex].route as any)}
          >
            <Play size={20} color={COLORS.surface} fill={COLORS.surface} />
            <Text style={styles.mainButtonText}>
                {completedTests.length === 0 ? 'Start Check-up' : `Next: ${TESTS[currentTestIndex].title}`}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.disclaimer}>
          <Info size={12} color={COLORS.textSecondary} /> This is a screening tool, not a medical diagnosis.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  testList: { marginBottom: 40 },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTestItem: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  completedTestItem: {
    opacity: 0.8,
  },
  testIconContainer: { marginRight: 16 },
  testInfo: { flex: 1 },
  testTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  completedText: { color: '#64748B', textDecorationLine: 'line-through' },
  testMeta: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  footer: { alignItems: 'center' },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20
  },
  mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginHorizontal: 10 },
  disclaimer: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});
