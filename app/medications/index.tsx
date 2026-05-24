import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Platform, Modal, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pill, Plus, Clock, Trash2, Camera, Check, X, Bell, BarChart2 } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoogleGenerativeAI } from '@google/generative-ai';
import appTheme from '../../styles/theme';

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

interface AdherenceLog {
  id: string;
  date: string; // YYYY-MM-DD
  medName: string;
  medDosage: string;
  time: string;
  status: 'taken' | 'skipped';
}

export default function MedicationsScreen() {
  const { COLORS, SIZES, FONTS, SHADOWS } = appTheme;
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherenceLogs, setAdherenceLogs] = useState<AdherenceLog[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('1'); // times per day
  const [newTimes, setNewTimes] = useState<Date[]>([new Date()]);
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null);

  useEffect(() => {
    loadMedications();
    loadAdherenceLogs();
    registerForPushNotificationsAsync();

    // Listen to push notification interactive actions (Taken / Snooze)
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => subscription.remove();
  }, []);

  // Update newTimes array count when frequency changes
  useEffect(() => {
    const count = Math.max(1, parseInt(newFrequency) || 1);
    setNewTimes(prev => {
      const times = [...prev];
      while (times.length < count) {
        times.push(new Date());
      }
      return times.slice(0, count);
    });
  }, [newFrequency]);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medications', {
        name: 'Medications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync() as any;
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync() as any;
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications in Settings to receive dosage reminders.');
      return;
    }

    // Register lock screen categories
    await Notifications.setNotificationCategoryAsync('medication-reminder', [
      {
        identifier: 'MARK_TAKEN',
        buttonTitle: 'Mark as Taken',
        options: { opensAppToForeground: false }
      },
      {
        identifier: 'SNOOZE',
        buttonTitle: 'Snooze (10 mins)',
        options: { opensAppToForeground: false }
      }
    ]);
  };

  const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    const actionId = response.actionIdentifier;
    const bodyText = response.notification.request.content.body || '';
    
    // Extract medication name
    const medName = bodyText.replace('Time to take ', '').split(' (')[0] || 'Medication';
    const medDosage = bodyText.includes('(') ? bodyText.split('(')[1].replace(')', '') : '';

    if (actionId === 'MARK_TAKEN') {
      await logAdherenceDirectly(medName, medDosage, 'taken');
      Alert.alert('Success', `${medName} logged as Taken.`);
    } else if (actionId === 'SNOOZE') {
      // Re-schedule in 10 minutes
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Snoozed Medication Reminder",
          body: `Time to take ${medName} (${medDosage})`,
          categoryIdentifier: 'medication-reminder',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 600,
          repeats: false
        },
      });
      Alert.alert('Snoozed', 'Reminder rescheduled for 10 minutes.');
    }
  };

  const logAdherenceDirectly = async (name: string, dosage: string, status: 'taken' | 'skipped') => {
    const log: AdherenceLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      medName: name,
      medDosage: dosage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
    };

    try {
      const stored = await AsyncStorage.getItem('adherenceLogs');
      const logs = stored ? JSON.parse(stored) : [];
      logs.unshift(log);
      await AsyncStorage.setItem('adherenceLogs', JSON.stringify(logs));
      setAdherenceLogs(logs);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMedications = async () => {
    try {
      const stored = await AsyncStorage.getItem('medications');
      if (stored) setMedications(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const loadAdherenceLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('adherenceLogs');
      if (stored) setAdherenceLogs(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading adherence logs:', error);
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

    const times = newTimes.map(date => 
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    );

    // Schedule custom time notifications
    const notificationIds = [];
    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take ${newName} (${newDosage})`,
          categoryIdentifier: 'medication-reminder',
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
    setNewTimes([new Date()]);
    setLoading(false);
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    const medToDelete = medications.find(m => m.id === id);
    if (medToDelete) {
      for (const notifId of medToDelete.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      }
    }
    const updatedMeds = medications.filter(m => m.id !== id);
    await saveMedications(updatedMeds);
  };

  const handleOCR = async () => {
    if (!GEMINI_API_KEY) {
      Alert.alert('Configuration Error', 'Gemini API Key is not configured.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required.');
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
        const prompt = "Analyze this medical prescription label. Extract the medication name, dosage, frequency per day. Return ONLY valid JSON with keys: name, dosage, frequency.";

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
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setNewName(parsed.name || '');
          setNewDosage(parsed.dosage || '');
          setNewFrequency(parsed.frequency?.toString() || '1');
          Alert.alert('Scanned!', 'Medication details extracted. Please verify and pick custom times before saving.');
        } else {
          throw new Error('JSON parsing failed');
        }
      } catch (error) {
        console.error('OCR Error:', error);
        Alert.alert('OCR Failed', 'You can still enter details manually.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAdherence = async (med: Medication, status: 'taken' | 'skipped') => {
    await logAdherenceDirectly(med.name, med.dosage, status);
  };

  // Calculate compliance statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const logsToday = adherenceLogs.filter(log => log.date === todayStr);
  
  const takenCount = adherenceLogs.filter(log => log.status === 'taken').length;
  const totalLogs = adherenceLogs.length;
  const complianceRate = totalLogs > 0 ? Math.round((takenCount / totalLogs) * 100) : 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Hub</Text>
        <Text style={styles.headerSubtitle}>Real-time compliance logs & custom alarms</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Compliance Progress Widget */}
        <View style={[styles.adherenceWidget, { backgroundColor: COLORS.surface }]}>
          <View style={styles.widgetHeader}>
            <BarChart2 size={22} color={COLORS.primary} />
            <Text style={styles.widgetTitle}>Treatment Compliance</Text>
          </View>
          
          <View style={styles.progressRow}>
            <Text style={styles.progressPercentText}>{complianceRate}%</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${complianceRate}%`, backgroundColor: COLORS.primary }]} />
            </View>
          </View>
          <Text style={styles.feedbackText}>
            {complianceRate >= 85 
              ? 'Excellent adherence! Your target healing rates remain optimal.' 
              : 'Try keeping up with scheduled doses to prevent eye strain relapse.'}
          </Text>
        </View>

        {/* Today's Log Checklist */}
        <Text style={styles.sectionTitle}>{"Today's Schedule Checklist"}</Text>
        {medications.length === 0 ? (
          <Text style={styles.infoText}>No medications scheduled today.</Text>
        ) : (
          medications.map((med) => {
            const isLogged = logsToday.some(log => log.medName === med.name);
            const loggedStatus = logsToday.find(log => log.medName === med.name)?.status;

            return (
              <View key={med.id} style={[styles.checklistCard, { backgroundColor: COLORS.surface }]}>
                <View style={styles.checkInfo}>
                  <Text style={styles.checkName}>{med.name}</Text>
                  <Text style={styles.checkDetails}>{med.dosage} • {med.times.join(', ')}</Text>
                </View>
                {isLogged ? (
                  <View style={[styles.loggedBadge, { backgroundColor: loggedStatus === 'taken' ? '#D1FAE5' : '#FEE2E2' }]}>
                    <Text style={[styles.loggedText, { color: loggedStatus === 'taken' ? '#059669' : '#DC2626' }]}>
                      {loggedStatus?.toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.checkActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#E6F4EA' }]}
                      onPress={() => toggleAdherence(med, 'taken')}
                    >
                      <Check size={18} color="#137333" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#FCE8E6' }]}
                      onPress={() => toggleAdherence(med, 'skipped')}
                    >
                      <X size={18} color="#C5221F" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Prescription List */}
        <Text style={styles.sectionTitle}>Active Prescriptions</Text>
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Pill size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>Add your medications using the button below.</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={[styles.medCard, { backgroundColor: COLORS.surface }]}>
              <View style={styles.medIcon}>
                <Pill size={24} color={COLORS.primary} />
              </View>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage}</Text>
                <View style={styles.timeContainer}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.medTime}>{med.times.join(', ')}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(med.id)}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Medication Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Prescription</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Processing request...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.ocrButton} onPress={handleOCR}>
                    <Camera size={20} color={COLORS.primary} />
                    <Text style={styles.ocrText}>Scan Pharmacy Label (OCR)</Text>
                  </TouchableOpacity>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Medication Name</Text>
                    <TextInput 
                      style={styles.textInput}
                      placeholder="e.g. Lubricant Eye Drops"
                      placeholderTextColor="#94A3B8"
                      value={newName}
                      onChangeText={setNewName}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Dosage</Text>
                    <TextInput 
                      style={styles.textInput}
                      placeholder="e.g. 1 Drop"
                      placeholderTextColor="#94A3B8"
                      value={newDosage}
                      onChangeText={setNewDosage}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Frequency (Times Daily)</Text>
                    <TextInput 
                      style={styles.textInput}
                      placeholder="e.g. 2"
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      value={newFrequency}
                      onChangeText={setNewFrequency}
                    />
                  </View>

                  {/* Pick exact times dynamically */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Alert Times</Text>
                    {newTimes.map((time, idx) => (
                      <View key={idx} style={styles.timePickerRow}>
                        <Text style={styles.timeLabel}>Dose #{idx + 1}</Text>
                        <TouchableOpacity 
                          style={styles.timePickBtn}
                          onPress={() => setActivePickerIndex(idx)}
                        >
                          <Clock size={16} color={COLORS.primary} />
                          <Text style={styles.timePickBtnText}>
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </TouchableOpacity>

                        {activePickerIndex === idx && (
                          <DateTimePicker
                            value={time}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                              setActivePickerIndex(null);
                              if (selectedDate) {
                                setNewTimes(prev => {
                                  const times = [...prev];
                                  times[idx] = selectedDate;
                                  return times;
                                });
                              }
                            }}
                          />
                        )}
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.saveButton} onPress={handleAddMedication}>
                    <Check size={20} color="#FFF" />
                    <Text style={styles.saveText}>Save Medication</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backButton: { marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginTop: 24, marginBottom: 14 },
  infoText: { fontSize: 14, color: '#64748B', fontStyle: 'italic' },
  adherenceWidget: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  widgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  widgetTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  progressPercentText: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  track: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  feedbackText: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  checklistCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  checkInfo: { flex: 1 },
  checkName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  checkDetails: { fontSize: 12, color: '#64748B', marginTop: 2 },
  checkActions: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  loggedBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  loggedText: { fontSize: 10, fontWeight: 'bold' },
  medCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  medIcon: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.08)', marginRight: 14 },
  medInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  medDosage: { fontSize: 13, color: '#64748B' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  medTime: { fontSize: 11, color: '#64748B' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#64748B', marginTop: 8, textAlign: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  ocrButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#3B82F6', gap: 8, marginBottom: 20 },
  ocrText: { fontSize: 14, fontWeight: 'bold', color: '#3B82F6' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  textInput: { height: 50, backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: '#0F172A' },
  timePickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 8 },
  timeLabel: { fontSize: 14, color: '#0F172A' },
  timePickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timePickBtnText: { fontSize: 15, color: '#3B82F6', fontWeight: 'bold' },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#10B981', borderRadius: 16, gap: 8, marginTop: 24 },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', padding: 30, gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14 }
});
