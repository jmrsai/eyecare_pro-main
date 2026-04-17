import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ArrowLeft, RotateCcw, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const READING_PASSAGES = [
  {
    id: 1,
    title: "The Benefits of Regular Exercise",
    text: "Regular physical exercise is one of the most important things you can do for your health. It can help control your weight, reduce your risk of heart disease, and strengthen your bones and muscles. Exercise also improves your mental health and mood. When you exercise, your body releases chemicals called endorphins that make you feel good. Regular exercise can help you sleep better at night and give you more energy during the day. Most adults should aim for at least 150 minutes of moderate exercise each week.",
    wordCount: 82,
    questions: [
      {
        question: "What chemicals does your body release during exercise?",
        options: ["Insulin", "Endorphins", "Adrenaline", "Cortisol"],
        correct: 1
      },
      {
        question: "How many minutes of exercise should adults aim for each week?",
        options: ["100 minutes", "120 minutes", "150 minutes", "200 minutes"],
        correct: 2
      }
    ]
  },
  {
    id: 2,
    title: "The Importance of Sleep",
    text: "Sleep is essential for good health and well-being. During sleep, your body repairs itself and your brain processes information from the day. Most adults need between seven and nine hours of sleep each night. Poor sleep can affect your immune system, making you more likely to get sick. It can also impact your ability to concentrate and make decisions. To improve your sleep quality, try to go to bed and wake up at the same time every day, avoid caffeine late in the day, and create a comfortable sleeping environment.",
    wordCount: 78,
    questions: [
      {
        question: "How many hours of sleep do most adults need?",
        options: ["5-6 hours", "6-7 hours", "7-9 hours", "9-10 hours"],
        correct: 2
      },
      {
        question: "What should you avoid late in the day to improve sleep?",
        options: ["Water", "Exercise", "Reading", "Caffeine"],
        correct: 3
      }
    ]
  }
];

export default function ReadingSpeedTest() {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [testPhase, setTestPhase] = useState<'instructions' | 'reading' | 'questions' | 'complete'>('instructions');
  const [startTime, setStartTime] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<{
    wordsPerMinute: number;
    comprehensionScore: number;
    readingEfficiency: number;
  } | null>(null);

  const passage = READING_PASSAGES[currentPassage];

  const startReading = () => {
    setTestPhase('reading');
    setStartTime(Date.now());
  };

  const finishReading = () => {
    const endTime = Date.now();
    const timeInMinutes = (endTime - startTime) / 60000;
    setReadingTime(timeInMinutes);
    setTestPhase('questions');
    setCurrentQuestion(0);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < passage.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = async (testAnswers: number[]) => {
    const wordsPerMinute = Math.round(passage.wordCount / readingTime);
    const correctAnswers = testAnswers.filter((answer, index) => 
      answer === passage.questions[index].correct
    ).length;
    const comprehensionScore = Math.round((correctAnswers / passage.questions.length) * 100);
    
    // Reading efficiency combines speed and comprehension
    const readingEfficiency = Math.round((wordsPerMinute * comprehensionScore) / 100);

    const testResults = {
      wordsPerMinute,
      comprehensionScore,
      readingEfficiency,
    };

    setResults(testResults);

    try {
      const result = {
        id: Date.now().toString(),
        testType: 'Reading Speed',
        date: new Date().toISOString().split('T')[0],
        score: readingEfficiency,
        status: getReadingStatus(wordsPerMinute, comprehensionScore),
        details: `${wordsPerMinute} WPM, ${comprehensionScore}% comprehension`,
      };

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift(result);
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
    }

    setTestPhase('complete');
  };

  const getReadingStatus = (wpm: number, comprehension: number): 'normal' | 'attention' | 'concern' => {
    if (wpm >= 200 && comprehension >= 80) return 'normal';
    if (wpm >= 150 && comprehension >= 70) return 'attention';
    return 'concern';
  };

  const resetTest = () => {
    setCurrentPassage(0);
    setTestPhase('instructions');
    setStartTime(0);
    setReadingTime(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
  };

  const nextPassage = () => {
    if (currentPassage < READING_PASSAGES.length - 1) {
      setCurrentPassage(currentPassage + 1);
      setTestPhase('instructions');
      setAnswers([]);
    }
  };

  if (testPhase === 'complete' && results) {
    const status = getReadingStatus(results.wordsPerMinute, results.comprehensionScore);
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Complete</Text>
        </LinearGradient>

        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <BookOpen size={48} color="#0EA5E9" />
            <Text style={styles.scoreTitle}>Reading Speed Results</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{results.wordsPerMinute}</Text>
                <Text style={styles.metricLabel}>Words/Min</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{results.comprehensionScore}%</Text>
                <Text style={styles.metricLabel}>Comprehension</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{results.readingEfficiency}</Text>
                <Text style={styles.metricLabel}>Efficiency</Text>
              </View>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>

          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkTitle}>Reading Speed Benchmarks</Text>
            <Text style={styles.benchmarkText}>
              • Average adult: 200-300 WPM{'\n'}
              • College student: 300-400 WPM{'\n'}
              • Speed reader: 400+ WPM{'\n'}
              • Minimum comprehension: 70%
            </Text>
          </View>

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Interpretation</Text>
            <Text style={styles.interpretationText}>
              {status === 'normal' 
                ? 'Your reading speed and comprehension are within normal ranges.'
                : status === 'attention'
                ? 'Your reading performance may benefit from practice or vision correction.'
                : 'Consider consulting an eye care professional if reading difficulties persist.'
              }
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {currentPassage < READING_PASSAGES.length - 1 && (
              <TouchableOpacity style={styles.nextButton} onPress={nextPassage}>
                <Text style={styles.nextButtonText}>Next Passage</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
              <RotateCcw size={20} color="#0EA5E9" />
              <Text style={styles.retakeButtonText}>Retake Test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading Speed Test</Text>
        <Text style={styles.headerSubtitle}>
          Passage {currentPassage + 1} of {READING_PASSAGES.length} • {testPhase}
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        {testPhase === 'instructions' && (
          <>
            <View style={styles.instructionCard}>
              <BookOpen size={24} color="#0EA5E9" />
              <Text style={styles.instructionText}>
                You will read a passage and answer comprehension questions. 
                Read at your normal pace for accuracy and understanding.
              </Text>
            </View>

            <View style={styles.passagePreview}>
              <Text style={styles.passageTitle}>{passage.title}</Text>
              <Text style={styles.passageInfo}>
                {passage.wordCount} words • {passage.questions.length} questions
              </Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startReading}>
              <Text style={styles.startButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </>
        )}

        {testPhase === 'reading' && (
          <>
            <View style={styles.timerCard}>
              <Clock size={20} color="#0EA5E9" />
              <Text style={styles.timerText}>Reading in progress...</Text>
            </View>

            <ScrollView style={styles.passageContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.passageTitle}>{passage.title}</Text>
              <Text style={styles.passageText}>{passage.text}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.finishButton} onPress={finishReading}>
              <Text style={styles.finishButtonText}>Finished Reading</Text>
            </TouchableOpacity>
          </>
        )}

        {testPhase === 'questions' && (
          <>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>
                Question {currentQuestion + 1} of {passage.questions.length}
              </Text>
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>
                {passage.questions[currentQuestion].question}
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {passage.questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(index)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
    case 'normal': return 'Good Performance';
    case 'attention': return 'Below Average';
    case 'concern': return 'Needs Improvement';
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
    color: '#BAE6FD',
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
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#0C4A6E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  passagePreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  passageInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  startButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginLeft: 8,
  },
  passageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  passageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  finishButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    color: '#1F2937',
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
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
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  benchmarkCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  benchmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  benchmarkText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  interpretationCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#6B7280',
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