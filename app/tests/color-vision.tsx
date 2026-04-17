import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';

interface ColorPlate {
  id: number;
  colors: string[];
  correctAnswer: string;
  options: string[];
  description: string;
}

const COLOR_PLATES: ColorPlate[] = [
  {
    id: 1,
    colors: ['#8B4513', '#228B22', '#32CD32', '#90EE90'],
    correctAnswer: '12',
    options: ['12', '21', '71', 'Nothing'],
    description: 'Normal vision should see 12',
  },
  {
    id: 2,
    colors: ['#FF6347', '#32CD32', '#90EE90', '#98FB98'],
    correctAnswer: '8',
    options: ['8', '3', '6', 'Nothing'],
    description: 'Normal vision should see 8',
  },
  {
    id: 3,
    colors: ['#FF4500', '#32CD32', '#228B22', '#006400'],
    correctAnswer: '29',
    options: ['29', '70', '20', 'Nothing'],
    description: 'Normal vision should see 29',
  },
  {
    id: 4,
    colors: ['#DC143C', '#32CD32', '#228B22', '#90EE90'],
    correctAnswer: '5',
    options: ['5', '2', '6', 'Nothing'],
    description: 'Normal vision should see 5',
  },
  {
    id: 5,
    colors: ['#FF69B4', '#32CD32', '#90EE90', '#98FB98'],
    correctAnswer: '3',
    options: ['3', '8', '5', 'Nothing'],
    description: 'Normal vision should see 3',
  },
];

export default function ColorVisionTest() {
  const { user } = useAuth();
  const [currentPlate, setCurrentPlate] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [testComplete, setTestComplete] = useState(false);

  const handleAnswer = async (selectedAnswer: string) => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentPlate < COLOR_PLATES.length - 1) {
      setCurrentPlate(currentPlate + 1);
    } else {
      await completeTest(newAnswers);
    }
  };

  const completeTest = async (testAnswers: string[]) => {
    let correctCount = 0;
    testAnswers.forEach((answer, index) => {
      if (answer === COLOR_PLATES[index].correctAnswer) {
        correctCount++;
      }
    });

    const accuracy = (correctCount / COLOR_PLATES.length) * 100;
    const status = getStatus(accuracy);

    try {
      const result = {
        testType: 'Color Vision',
        date: new Date().toISOString().split('T')[0],
        score: Math.round(accuracy),
        status,
        details: `${correctCount}/${COLOR_PLATES.length} plates identified correctly`,
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

    setTestComplete(true);
  };

  const getStatus = (score: number): 'normal' | 'attention' | 'concern' => {
    if (score >= 80) return 'normal';
    if (score >= 60) return 'attention';
    return 'concern';
  };

  const resetTest = () => {
    setCurrentPlate(0);
    setAnswers([]);
    setTestComplete(false);
  };

  const generateColorCircle = (colors: string[]) => {
    const circleSize = 200;
    const dotSize = 12;
    const dots = [];

    // Generate random dots with the specified colors
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * (circleSize / 2 - dotSize);
      const x = Math.cos(angle) * radius + circleSize / 2;
      const y = Math.sin(angle) * radius + circleSize / 2;
      const colorIndex = Math.floor(Math.random() * colors.length);
      
      dots.push({
        key: i,
        left: x - dotSize / 2,
        top: y - dotSize / 2,
        backgroundColor: colors[colorIndex],
      });
    }

    return dots;
  };

  if (testComplete) {
    const correctCount = answers.filter((answer, index) => 
      answer === COLOR_PLATES[index].correctAnswer
    ).length;
    const accuracy = Math.round((correctCount / COLOR_PLATES.length) * 100);
    const status = getStatus(accuracy);
    
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
            <Palette size={48} color="#10B981" />
            <Text style={styles.scoreTitle}>Color Vision Results</Text>
            <Text style={styles.scoreNumber}>{accuracy}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>

            <Text style={styles.detailsText}>
              {correctCount} out of {COLOR_PLATES.length} plates identified correctly
            </Text>
          </View>

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Interpretation</Text>
            <Text style={styles.interpretationText}>
              {status === 'normal' 
                ? 'Your color vision appears normal. You correctly identified most color patterns.'
                : status === 'attention'
                ? 'Some difficulty with color discrimination detected. Consider consulting an eye care professional.'
                : 'Significant color vision deficiency detected. We recommend professional evaluation.'
              }
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
            <RotateCcw size={20} color="#10B981" />
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPlateData = COLOR_PLATES[currentPlate];
  const colorDots = generateColorCircle(currentPlateData.colors);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Color Vision Test</Text>
        <Text style={styles.headerSubtitle}>
          Plate {currentPlate + 1} of {COLOR_PLATES.length}
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.instructionCard}>
          <Palette size={24} color="#10B981" />
          <Text style={styles.instructionText}>
            Look at the colored circle below and identify the number or pattern you see
          </Text>
        </View>

        <View style={styles.plateContainer}>
          <View style={styles.colorPlate}>
            {colorDots.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.colorDot,
                  {
                    left: dot.left,
                    top: dot.top,
                    backgroundColor: dot.backgroundColor,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>What do you see?</Text>
          <View style={styles.optionsGrid}>
            {currentPlateData.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {currentPlate + 1} / {COLOR_PLATES.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentPlate + 1) / COLOR_PLATES.length) * 100}%` }
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
    color: '#A7F3D0',
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
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: '#065F46',
    marginLeft: 12,
    flex: 1,
  },
  plateContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  colorPlate: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  colorDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
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
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: '#10B981',
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
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    borderColor: '#10B981',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#10B981',
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