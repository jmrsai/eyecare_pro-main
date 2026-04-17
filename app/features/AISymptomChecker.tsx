
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { MotiView } from 'moti';
import appTheme from '../../styles/theme';
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { AlertCircle } from 'lucide-react-native';

interface SymptomResult {
  condition: string;
  probability: number;
  recommendation?: string;
}

interface ChatResponse {
    results: SymptomResult[];
    disclaimer?: string;
}

export default function AISymptomChecker() {
  const { COLORS, SIZES, FONTS, SHADOWS } = appTheme;
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<SymptomResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  const handleCheckSymptoms = async () => {
    if (symptoms.trim() === '') {
      Alert.alert('Input Required', 'Please enter your symptoms.');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setResults([]);
    setDisclaimer(null);
    const functions = getFunctions();
    const chat = httpsCallable< { message: string }, ChatResponse>(functions, 'chat');
    
    try {
      const response: HttpsCallableResult<ChatResponse> = await chat({ message: symptoms });
      if (response.data && response.data.results) {
        setResults(response.data.results);
        if (response.data.disclaimer) {
          setDisclaimer(response.data.disclaimer);
        }
      }
    } catch (error: any) {
      console.error("Firebase callable function error:", error);
      Alert.alert('Analysis Failed', 'Could not analyze symptoms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item, index }: { item: SymptomResult, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing' }}
      style={styles.resultItem}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.conditionText}>{item.condition}</Text>
        <Text style={styles.probabilityText}>{(item.probability * 100).toFixed(0)}% Match</Text>
      </View>
      {item.recommendation && (
        <Text style={styles.recommendationText}>{item.recommendation}</Text>
      )}
    </MotiView>
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    inner: { padding: SIZES.padding, flex: 1 },
    title: { ...FONTS.h2, color: COLORS.text, marginBottom: SIZES.padding, textAlign: 'center', marginTop: SIZES.padding },
    input: { 
        backgroundColor: COLORS.surface, 
        borderRadius: SIZES.radius, 
        padding: SIZES.padding, 
        ...FONTS.body, 
        color: COLORS.text, 
        marginBottom: SIZES.padding, 
        minHeight: 120, 
        textAlignVertical: 'top',
        ...SHADOWS.light 
    },
    button: { backgroundColor: COLORS.primary, padding: SIZES.padding, borderRadius: SIZES.radius, alignItems: 'center', ...SHADOWS.medium },
    buttonText: { ...FONTS.h3, color: COLORS.surface },
    resultsContainer: { marginTop: SIZES.padding },
    resultItem: { backgroundColor: COLORS.surface, padding: SIZES.padding, borderRadius: SIZES.radius, marginBottom: SIZES.base, ...SHADOWS.light, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.base },
    conditionText: { ...FONTS.h3, flex: 1, color: COLORS.text, marginRight: SIZES.base },
    probabilityText: { ...FONTS.body, color: COLORS.primary, fontWeight: 'bold' as const },
    recommendationText: { ...FONTS.body, color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
    disclaimerBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: SIZES.base, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding, ...SHADOWS.light },
    disclaimerText: { ...FONTS.body, color: '#D97706', fontSize: 12, marginLeft: SIZES.base, flex: 1 }
  });

  return (
    <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>AI Symptom Checker</Text>
          <TextInput
            style={styles.input}
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="Describe what you're experiencing (e.g., 'My left eye is itchy and red when I wake up')..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />
          <Pressable style={styles.button} onPress={handleCheckSymptoms} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.buttonText}>Analyze Symptoms</Text>}
          </Pressable>

          {results.length > 0 && (
            <FlatList
              data={results}
              renderItem={renderResult}
              keyExtractor={item => item.condition}
              style={styles.resultsContainer}
              ListFooterComponent={() => 
                disclaimer ? (
                  <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.disclaimerBox}>
                    <AlertCircle size={20} color="#D97706" />
                    <Text style={styles.disclaimerText}>{disclaimer}</Text>
                  </MotiView>
                ) : null
              }
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
