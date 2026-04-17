import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';

const SNELLEN_LINES = [
  { size: 200, letters: ['E'], line: '20/200' },
  { size: 100, letters: ['F', 'P'], line: '20/100' },
  { size: 70, letters: ['T', 'O', 'Z'], line: '20/70' },
  { size: 50, letters: ['L', 'P', 'E', 'D'], line: '20/50' },
  { size: 40, letters: ['P', 'E', 'C', 'F', 'D'], line: '20/40' },
  { size: 30, letters: ['E', 'D', 'F', 'C', 'Z', 'P'], line: '20/30' },
  { size: 25, letters: ['F', 'E', 'L', 'O', 'P', 'Z', 'D'], line: '20/25' },
  { size: 20, letters: ['D', 'E', 'F', 'P', 'O', 'T', 'E', 'C'], line: '20/20' },
];

export default function VisualAcuityTest() {
  const { user } = useAuth();
  const [currentLine, setCurrentLine] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [testingEye, setTestingEye] = useState<'left' | 'right' | 'both'>('right');
  const [results, setResults] = useState<{ [key: string]: number }>({});

  const currentLineData = SNELLEN_LINES[currentLine];
  const currentLetterData = currentLineData.letters[currentLetter];

  const handleAnswer = (selectedLetter: string) => {
    const isCorrect = selectedLetter === currentLetterData;
    const newCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const newTotal = totalAnswers + 1;

    setCorrectAnswers(newCorrect);
    setTotalAnswers(newTotal);

    // Move to next letter or line
    if (currentLetter < currentLineData.letters.length - 1) {
      setCurrentLetter(currentLetter + 1);
    } else {
      // Calculate accuracy for current line
      const lineAccuracy = (newCorrect / newTotal) * 100;
      
      // If accuracy is too low (< 60%), stop the test
      if (lineAccuracy < 60 && currentLine > 2) {
        completeTest(newCorrect, newTotal);
        return;
      }

      // Move to next line or complete test
      if (currentLine < SNELLEN_LINES.length - 1) {
        setCurrentLine(currentLine + 1);
        setCurrentLetter(0);
      } else {
        completeTest(newCorrect, newTotal);
      }
    }
  };

  const completeTest = async (correct: number, total: number) => {
    const accuracy = (correct / total) * 100;
    const visualAcuity = calculateVisualAcuity(accuracy, currentLine);
    
    const eyeResults = { ...results, [testingEye]: accuracy };
    setResults(eyeResults);

    if (testingEye === 'right') {
      // Switch to left eye
      Alert.alert(
        'Right Eye Complete',
        `Accuracy: ${accuracy.toFixed(1)}%\n\nNow let's test your left eye. Cover your right eye and continue.`,
        [{ text: 'Continue', onPress: () => startLeftEyeTest() }]
      );
    } else {
      // Both eyes tested, save results
      await saveTestResults(eyeResults);
      setTestComplete(true);
    }
  };

  const startLeftEyeTest = () => {
    setTestingEye('left');
    setCurrentLine(0);
    setCurrentLetter(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
  };

  const calculateVisualAcuity = (accuracy: number, lastLine: number): string => {
    if (accuracy >= 80) {
      return SNELLEN_LINES[Math.min(lastLine + 1, SNELLEN_LINES.length - 1)].line;
    } else if (accuracy >= 60) {
      return SNELLEN_LINES[lastLine].line;
    } else {
      return SNELLEN_LINES[Math.max(lastLine - 1, 0)].line;
    }
  };

  const saveTestResults = async (testResults: { [key: string]: number }) => {
    try {
      const avgScore = Math.round((testResults.right + testResults.left) / 2);
      const result = {
        testType: 'Visual Acuity',
        date: new Date().toISOString().split('T')[0],
        score: avgScore,
        status: getStatus(avgScore),
        details: `Right eye: ${testResults.right.toFixed(1)}%, Left eye: ${testResults.left.toFixed(1)}%`,
      };

      if (user?.uid) {
        await saveTestResult(user.uid, result);
      }

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift({ id: Date.now().toString(), ...result });
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const getStatus = (score: number): 'normal' | 'attention' | 'concern' => {
    if (score >= 80) return 'normal';
    if (score >= 60) return 'attention';
    return 'concern';
  };

  const resetTest = () => {
    setCurrentLine(0);
    setCurrentLetter(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setTestComplete(false);
    setTestingEye('right');
    setResults({});
  };

  const generateOptions = () => {
    const correctLetter = currentLetterData;
    const allLetters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D', 'C'];
    const options = [correctLetter];
    
    while (options.length < 4) {
      const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
      if (!options.includes(randomLetter)) {
        options.push(randomLetter);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  if (testComplete) {
    const avgScore = Math.round((results.right + results.left) / 2);
    const status = getStatus(avgScore);
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Complete</Text>
        </LinearGradient>

        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Visual Acuity Results</Text>
            <Text style={styles.scoreNumber}>{avgScore}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>

            <View style={styles.eyeResults}>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Right Eye</Text>
                <Text style={styles.eyeScore}>{results.right?.toFixed(1)}%</Text>
              </View>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Left Eye</Text>
                <Text style={styles.eyeScore}>{results.left?.toFixed(1)}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>Recommendations</Text>
            <Text style={styles.recommendationText}>
              {status === 'normal' 
                ? 'Your visual acuity appears normal. Continue regular eye check-ups.'
                : status === 'attention'
                ? 'Consider scheduling an eye exam to discuss these results with a professional.'
                : 'We recommend scheduling an eye exam soon to address potential vision concerns.'
              }
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
            <RotateCcw size={20} color="#3B82F6" />
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visual Acuity Test</Text>
        <Text style={styles.headerSubtitle}>
          Testing {testingEye} eye • Line {currentLine + 1} of {SNELLEN_LINES.length}
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.instructionCard}>
          <Eye size={24} color="#3B82F6" />
          <Text style={styles.instructionText}>
            {testingEye === 'right' 
              ? 'Cover your left eye and read the letter below'
              : 'Cover your right eye and read the letter below'
            }
          </Text>
        </View>

        <View style={styles.letterContainer}>
          <Text style={[styles.testLetter, { fontSize: currentLineData.size }]}>
            {currentLetterData}
          </Text>
          <Text style={styles.lineIndicator}>{currentLineData.line}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Select the letter you see:</Text>
          <View style={styles.optionsGrid}>
            {generateOptions().map((letter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(letter)}
              >
                <Text style={styles.optionText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {totalAnswers} / {SNELLEN_LINES.reduce((sum, line) => sum + line.letters.length, 0)}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(totalAnswers / SNELLEN_LINES.reduce((sum, line) => sum + line.letters.length, 0)) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return '#10B981';
    case 'attention': return '#F59E0B';
    case 'concern': return '#EF4444';
    default: return '#6B7280';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal': return 'Normal';
    case 'attention': return 'Needs Attention';
    case 'concern': return 'Concerning';
    default: return 'Unknown';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    opacity: 0.9,
  },
  testContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: '#1E40AF',
    marginLeft: 12,
    flex: 1,
  },
  letterContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  testLetter: {
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  lineIndicator: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
  },
  scoreOutOf: {
    fontSize: 24,
    color: '#6B7280',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eyeResults: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  eyeResult: {
    alignItems: 'center',
  },
  eyeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eyeScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  recommendationCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});