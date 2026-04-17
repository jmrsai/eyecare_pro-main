import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTRAST_LEVELS = [
  { level: 100, letter: 'E', description: '100% Contrast' },
  { level: 75, letter: 'F', description: '75% Contrast' },
  { level: 50, letter: 'P', description: '50% Contrast' },
  { level: 35, letter: 'T', description: '35% Contrast' },
  { level: 25, letter: 'O', description: '25% Contrast' },
  { level: 15, letter: 'Z', description: '15% Contrast' },
  { level: 10, letter: 'L', description: '10% Contrast' },
  { level: 5, letter: 'D', description: '5% Contrast' },
];

export default function ContrastSensitivityTest() {
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [testComplete, setTestComplete] = useState(false);

  const currentTest = CONTRAST_LEVELS[currentLevel];
  const contrastOpacity = currentTest.level / 100;

  const handleAnswer = (selectedLetter: string) => {
    const isCorrect = selectedLetter === currentTest.letter;
    
    if (!isCorrect) {
      // Failed at this level, record the previous successful level
      const eyeResults = { ...results };
      const previousLevel = currentLevel > 0 ? CONTRAST_LEVELS[currentLevel - 1].level : 0;
      eyeResults[currentEye] = previousLevel;
      setResults(eyeResults);
      
      if (currentEye === 'right') {
        setCurrentEye('left');
        setCurrentLevel(0);
      } else {
        completeTest(eyeResults);
      }
      return;
    }

    // Correct answer, move to next level or complete
    if (currentLevel < CONTRAST_LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      // Completed all levels successfully
      const eyeResults = { ...results };
      eyeResults[currentEye] = currentTest.level;
      setResults(eyeResults);
      
      if (currentEye === 'right') {
        setCurrentEye('left');
        setCurrentLevel(0);
      } else {
        completeTest(eyeResults);
      }
    }
  };

  const completeTest = async (testResults: { [key: string]: number }) => {
    try {
      const avgContrast = (testResults.right + testResults.left) / 2;
      const score = Math.round((avgContrast / 100) * 100);
      
      const result = {
        id: Date.now().toString(),
        testType: 'Contrast Sensitivity',
        date: new Date().toISOString().split('T')[0],
        score,
        status: getContrastStatus(avgContrast),
        details: `Right eye: ${testResults.right}% threshold, Left eye: ${testResults.left}% threshold`,
      };

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift(result);
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
    }

    setTestComplete(true);
  };

  const getContrastStatus = (contrast: number): 'normal' | 'attention' | 'concern' => {
    if (contrast >= 15) return 'normal';
    if (contrast >= 10) return 'attention';
    return 'concern';
  };

  const resetTest = () => {
    setCurrentEye('right');
    setCurrentLevel(0);
    setResults({});
    setTestComplete(false);
  };

  const generateOptions = () => {
    const correctLetter = currentTest.letter;
    const allLetters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D', 'C', 'R'];
    const options = [correctLetter];
    
    while (options.length < 4) {
      const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
      if (!options.includes(randomLetter)) {
        options.push(randomLetter);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

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
      case 'normal': return 'Normal Sensitivity';
      case 'attention': return 'Reduced Sensitivity';
      case 'concern': return 'Poor Sensitivity';
      default: return 'Unknown';
    }
  };

  if (testComplete) {
    const avgContrast = (results.right + results.left) / 2;
    const score = Math.round((avgContrast / 100) * 100);
    const status = getContrastStatus(avgContrast);
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Complete</Text>
        </LinearGradient>

        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Zap size={48} color="#8B5CF6" />
            <Text style={styles.scoreTitle}>Contrast Sensitivity Results</Text>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>

            <View style={styles.eyeResults}>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Right Eye</Text>
                <Text style={styles.eyeScore}>{results.right}%</Text>
              </View>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Left Eye</Text>
                <Text style={styles.eyeScore}>{results.left}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkTitle}>Contrast Sensitivity Benchmarks</Text>
            <Text style={styles.benchmarkText}>
              • Excellent: 15% or lower{'\n'}
              • Good: 15-25%{'\n'}
              • Fair: 25-35%{'\n'}
              • Poor: Above 35%
            </Text>
          </View>

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Clinical Significance</Text>
            <Text style={styles.interpretationText}>
              {status === 'normal' 
                ? 'Your contrast sensitivity is within normal ranges for good vision in various lighting conditions.'
                : status === 'attention'
                ? 'Mild reduction in contrast sensitivity detected. May affect vision in low light or foggy conditions.'
                : 'Significant contrast sensitivity loss detected. This may indicate cataracts, glaucoma, or other eye conditions requiring evaluation.'
              }
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
            <RotateCcw size={20} color="#8B5CF6" />
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
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contrast Sensitivity Test</Text>
        <Text style={styles.headerSubtitle}>
          Testing {currentEye} eye • Level {currentLevel + 1} of {CONTRAST_LEVELS.length}
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.instructionCard}>
          <Zap size={24} color="#8B5CF6" />
          <Text style={styles.instructionText}>
            {currentEye === 'right' 
              ? 'Cover your left eye and identify the faint letter below'
              : 'Cover your right eye and identify the faint letter below'
            }
          </Text>
        </View>

        <View style={styles.letterContainer}>
          <View style={styles.letterBackground}>
            <Text 
              style={[
                styles.testLetter, 
                { 
                  opacity: contrastOpacity,
                  color: `rgba(55, 65, 81, ${contrastOpacity})`
                }
              ]}
            >
              {currentTest.letter}
            </Text>
          </View>
          <Text style={styles.contrastLabel}>{currentTest.description}</Text>
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
            Contrast Level: {currentTest.level}% • {currentEye.toUpperCase()} EYE
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentLevel + 1) / CONTRAST_LEVELS.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    color: '#DDD6FE',
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
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: '#5B21B6',
    marginLeft: 12,
    flex: 1,
  },
  letterContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  letterBackground: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  contrastLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
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
    backgroundColor: '#8B5CF6',
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
    marginTop: 16,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B5CF6',
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
  benchmarkCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  benchmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 8,
  },
  benchmarkText: {
    fontSize: 14,
    color: '#5B21B6',
    lineHeight: 20,
  },
  interpretationCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  interpretationText: {
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
    borderColor: '#8B5CF6',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#8B5CF6',
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