import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Clock, Calendar, Bell, X, Trash2, Check, Pill, Activity } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';

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

interface Reminder {
  id: string;
  title: string;
  type: 'medication' | 'exercise' | 'appointment';
  time: Date;
  enabled: boolean;
  notificationId: string;
}

export default function RemindersScreen() {
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'medication' | 'exercise' | 'appointment'>('medication');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadReminders();
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Please enable notifications to receive reminders.');
    }
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem('reminders');
      if (stored) {
        // Parse dates correctly
        const parsed: Reminder[] = JSON.parse(stored).map((r: any) => ({
          ...r,
          time: new Date(r.time),
        }));
        setReminders(parsed);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const scheduleNotification = async (title: string, date: Date) => {
    const trigger = new Date(date);
    // If time has passed today, schedule for tomorrow
    if (trigger.getTime() <= Date.now()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reminder`,
        body: title,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      },
    });
    return id;
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your reminder.');
      return;
    }

    try {
      const notificationId = await scheduleNotification(newTitle, newTime);
      
      const newReminder: Reminder = {
        id: Date.now().toString(),
        title: newTitle,
        type: activeTab,
        time: newTime,
        enabled: true,
        notificationId,
      };

      const updatedReminders = [...reminders, newReminder];
      await saveReminders(updatedReminders);
      
      setNewTitle('');
      setNewTime(new Date());
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification.');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }
    const updated = reminders.filter(r => r.id !== id);
    await saveReminders(updated);
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    if (reminder.enabled) {
      // Disable
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      const updated = reminders.map(r => 
        r.id === id ? { ...r, enabled: false, notificationId: '' } : r
      );
      await saveReminders(updated);
    } else {
      // Enable
      const newId = await scheduleNotification(reminder.title, reminder.time);
      const updated = reminders.map(r => 
        r.id === id ? { ...r, enabled: true, notificationId: newId } : r
      );
      await saveReminders(updated);
    }
  };

  const filteredReminders = reminders.filter(r => r.type === activeTab);

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill size={20} color={activeTab === 'medication' ? '#FFFFFF' : theme.colors.subtext} />;
      case 'exercise': return <Activity size={20} color={activeTab === 'exercise' ? '#FFFFFF' : theme.colors.subtext} />;
      case 'appointment': return <Calendar size={20} color={activeTab === 'appointment' ? '#FFFFFF' : theme.colors.subtext} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
        <Text style={styles.headerSubtitle}>Manage your health schedule</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        {(['medication', 'exercise', 'appointment'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)}
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? '#FFFFFF' : theme.colors.subtext }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.colors.subtext} />
            <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>
              No {activeTab} reminders yet.
            </Text>
          </View>
        ) : (
          filteredReminders.map((reminder) => (
            <View key={reminder.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{reminder.title}</Text>
                  <TouchableOpacity onPress={() => toggleReminder(reminder.id)}>
                    <View style={[
                      styles.toggle,
                      { backgroundColor: reminder.enabled ? theme.colors.success : theme.colors.border }
                    ]}>
                      <View style={[
                        styles.toggleKnob,
                        { transform: [{ translateX: reminder.enabled ? 20 : 2 }] }
                      ]} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.timeInfo}>
                    <Clock size={16} color={theme.colors.subtext} />
                    <Text style={[styles.timeText, { color: theme.colors.subtext }]}>
                      {reminder.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteReminder(reminder.id)}>
                    <Trash2 size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reminder
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={theme.colors.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                placeholder={`e.g., Take Ibuprofen`}
                placeholderTextColor={theme.colors.subtext}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Time</Text>
              {Platform.OS === 'android' ? (
                <>
                  <TouchableOpacity 
                    style={[styles.timeButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={{ color: theme.colors.text }}>
                      {newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={newTime}
                      mode="time"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowTimePicker(false);
                        if (selectedDate) setNewTime(selectedDate);
                      }}
                    />
                  )}
                </>
              ) : (
                <DateTimePicker
                  value={newTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setNewTime(selectedDate);
                  }}
                  textColor={theme.colors.text}
                />
              )}
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddReminder}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.saveText}>Set Reminder</Text>
            </TouchableOpacity>
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
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
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
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
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
    minHeight: 400,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  timeButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
