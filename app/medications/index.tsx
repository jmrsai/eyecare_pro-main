import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Platform, Modal, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pill, Plus, Clock, Trash2, Camera, Check, X, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTheme } from '../../contexts/ThemeContext';

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // "HH:MM" format
  notificationIds: string[];
}

export default function MedicationsScreen() {
  const { theme } = useTheme();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('1'); // times per day
  
  useEffect(() => {
    loadMedications();
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medications', {
        name: 'Medications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permission needed', 'Failed to get push token for push notification!');
      return;
    }
  };

  const loadMedications = async () => {
    try {
      const stored = await AsyncStorage.getItem('medications');
      if (stored) {
        setMedications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const saveMedications = async (newMeds: Medication[]) => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(newMeds));
      setMedications(newMeds);
    } catch (error) {
      console.error('Error saving medications:', error);
    }
  };

  const handleAddMedication = async () => {
    if (!newName || !newDosage) {
      Alert.alert('Missing Info', 'Please enter medication name and dosage.');
      return;
    }

    setLoading(true);

    // Generate default times based on frequency
    // Simple logic: Start at 9 AM and space out
    const times = [];
    const count = parseInt(newFrequency);
    const startHour = 9;
    const interval = Math.floor(12 / count); // Spread over 12 hours

    for (let i = 0; i < count; i++) {
      const hour = startHour + (i * interval);
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Schedule notifications
    const notificationIds = [];
    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take ${newName} (${newDosage})`,
          data: { data: 'goes here' },
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour, 
          minute, 
          repeats: true 
        },
      });
      notificationIds.push(id);
    }

    const newMed: Medication = {
      id: Date.now().toString(),
      name: newName,
      dosage: newDosage,
      frequency: newFrequency,
      times,
      notificationIds,
    };

    const updatedMeds = [...medications, newMed];
    await saveMedications(updatedMeds);
    
    // Reset form
    setNewName('');
    setNewDosage('');
    setNewFrequency('1');
    setLoading(false);
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    const medToDelete = medications.find(m => m.id === id);
    if (medToDelete) {
      // Cancel notifications
      for (const notifId of medToDelete.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      }
    }
    const updatedMeds = medications.filter(m => m.id !== id);
    await saveMedications(updatedMeds);
  };

  const handleOCR = async () => {
    if (!GEMINI_API_KEY) {
      Alert.alert('Configuration Error', 'Gemini API Key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required for OCR.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Analyze this medical prescription label. Extract the medication name, dosage, frequency per day, and any specific times mentioned. Return ONLY valid JSON with keys: name, dosage, frequency, times (array of HH:MM strings). If info is missing, use empty strings or reasonable defaults (like 09:00 for a morning dose).";

        const aiResult = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64,
              mimeType: "image/jpeg"
            }
          }
        ]);

        const response = await aiResult.response;
        const text = response.text();
        
        // Clean and parse JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setNewName(parsed.name || '');
          setNewDosage(parsed.dosage || '');
          setNewFrequency(parsed.frequency?.toString() || '1');
          
          Alert.alert('Scanned!', 'Medication details extracted. Please verify the information before saving.');
        } else {
          throw new Error('Could not parse AI response');
        }
      } catch (error) {
        console.error('OCR Error:', error);
        Alert.alert('OCR Failed', 'Failed to analyze the image. You can still enter details manually.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medications</Text>
        <Text style={styles.headerSubtitle}>Track and manage your treatments</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Pill size={64} color={theme.colors.subtext} />
            <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>No medications added yet.</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={[styles.medCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.medIcon}>
                <Pill size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.medInfo}>
                <Text style={[styles.medName, { color: theme.colors.text }]}>{med.name}</Text>
                <Text style={[styles.medDosage, { color: theme.colors.subtext }]}>{med.dosage}</Text>
                <View style={styles.timeContainer}>
                  <Clock size={14} color={theme.colors.subtext} />
                  <Text style={[styles.medTime, { color: theme.colors.subtext }]}>
                    {med.times.join(', ')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(med.id)}>
                <Trash2 size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Medication</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={theme.colors.subtext} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>Processing...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.ocrButton, { borderColor: theme.colors.primary }]}
                  onPress={handleOCR}
                >
                  <Camera size={24} color={theme.colors.primary} />
                  <Text style={[styles.ocrText, { color: theme.colors.primary }]}>Scan Label (OCR)</Text>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Medication Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
                    <TextInput 
                      style={[styles.textInput, { color: theme.colors.text }]}
                      placeholder="e.g. Ibuprofen"
                      placeholderTextColor={theme.colors.subtext}
                      value={newName}
                      onChangeText={setNewName}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Dosage</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
                    <TextInput 
                      style={[styles.textInput, { color: theme.colors.text }]}
                      placeholder="e.g. 200mg"
                      placeholderTextColor={theme.colors.subtext}
                      value={newDosage}
                      onChangeText={setNewDosage}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Frequency (times per day)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
                    <TextInput 
                      style={[styles.textInput, { color: theme.colors.text }]}
                      placeholder="1"
                      keyboardType="numeric"
                      placeholderTextColor={theme.colors.subtext}
                      value={newFrequency}
                      onChangeText={setNewFrequency}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: theme.colors.success }]}
                  onPress={handleAddMedication}
                >
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>Save Medication</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medIcon: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginRight: 16,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  medDosage: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medTime: {
    fontSize: 12,
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ocrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  ocrText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
