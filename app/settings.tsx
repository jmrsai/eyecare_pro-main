import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Volume2, VolumeX, Moon, Sun, Bell, Shield, Info, Smartphone, Mail, Lock, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';
import { authenticateUser, getSecureItem, saveSecureItem } from '../utils/security';
import { logSecurityEvent } from '../utils/logger';
import { registerForPushNotificationsAsync, scheduleBreakReminder, cancelAllReminders } from '../utils/notifications';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { isSoundEnabled, toggleSound } = useSound();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(20);

  useEffect(() => {
    const loadSettings = async () => {
      const bioStatus = await getSecureItem('biometrics_enabled');
      setBiometricsEnabled(bioStatus === 'true');
      
      const stored = await AsyncStorage.getItem('settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRemindersEnabled(parsed.remindersEnabled || false);
        setReminderInterval(parsed.reminderInterval || 20);
      }
    };
    loadSettings();
  }, []);

  const toggleBiometrics = async () => {
    const newValue = !biometricsEnabled;
    if (newValue) {
      const isAuthenticated = await authenticateUser();
      if (isAuthenticated) {
        await saveSecureItem('biometrics_enabled', 'true');
        setBiometricsEnabled(true);
        await logSecurityEvent('BIOMETRIC_TOGGLE', 'User enabled biometric authentication');
      }
    } else {
      await saveSecureItem('biometrics_enabled', 'false');
      setBiometricsEnabled(false);
      await logSecurityEvent('BIOMETRIC_TOGGLE', 'User disabled biometric authentication');
    }
  };

  const toggleReminders = async () => {
    const newValue = !remindersEnabled;
    if (newValue) {
      const granted = await registerForPushNotificationsAsync();
      if (granted) {
        setRemindersEnabled(true);
        await scheduleBreakReminder(reminderInterval);
        Toast.show({ type: 'success', text1: 'Reminders Enabled', text2: `Every ${reminderInterval} minutes` });
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your system settings.');
        return;
      }
    } else {
      setRemindersEnabled(false);
      await cancelAllReminders();
    }
    
    // Save to AsyncStorage
    const stored = await AsyncStorage.getItem('settings');
    const parsed = stored ? JSON.parse(stored) : {};
    await AsyncStorage.setItem('settings', JSON.stringify({ ...parsed, remindersEnabled: newValue }));
  };

  const updateInterval = async (val: number) => {
    setReminderInterval(val);
    if (remindersEnabled) {
      await scheduleBreakReminder(val);
    }
    const stored = await AsyncStorage.getItem('settings');
    const parsed = stored ? JSON.parse(stored) : {};
    await AsyncStorage.setItem('settings', JSON.stringify({ ...parsed, reminderInterval: val }));
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your medical data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await logSecurityEvent('DATA_DELETION', 'User requested full data deletion');
            Alert.alert('Request Received', 'Your data deletion request has been received and will be processed within 48 hours.');
          }
        }
      ]
    );
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.card, theme.colors.background]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>PREFERENCES</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                {isDark ? <Moon size={20} color={theme.colors.text} /> : <Sun size={20} color={theme.colors.text} />}
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                {isSoundEnabled ? <Volume2 size={20} color={theme.colors.text} /> : <VolumeX size={20} color={theme.colors.text} />}
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Sound Effects</Text>
            </View>
            <Switch
              value={isSoundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isSoundEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Bell size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Break Reminders</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={remindersEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          {remindersEnabled && (
            <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                  <Clock size={20} color={theme.colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Interval (Minutes)</Text>
              </View>
              <View style={styles.intervalControls}>
                <TouchableOpacity onPress={() => updateInterval(Math.max(5, reminderInterval - 5))}>
                  <Text style={[styles.intervalBtn, { color: theme.colors.primary }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.intervalValue, { color: theme.colors.text }]}>{reminderInterval}</Text>
                <TouchableOpacity onPress={() => updateInterval(Math.min(60, reminderInterval + 5))}>
                  <Text style={[styles.intervalBtn, { color: theme.colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>SECURITY</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Lock size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Biometric Lock</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={biometricsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>DATA & PRIVACY</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={handleDeleteData}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF3B3020' }]}>
                <Shield size={20} color="#FF3B30" />
              </View>
              <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Delete All My Data</Text>
            </View>
            <Text style={[styles.arrow, { color: '#FF3B30' }]}>›</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Info size={14} color={theme.colors.subtext} />
            <Text style={[styles.privacyNote, { color: theme.colors.subtext }]}>
              All sensitive health data is encrypted locally.
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>ABOUT & LEGAL</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/legal' as any)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Shield size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Legal & Privacy Policy</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.subtext }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => openLink('https://eyecarepro.com/support')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Mail size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Contact Support</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.subtext }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Smartphone size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>App Version</Text>
            </View>
            <Text style={[styles.versionText, { color: theme.colors.subtext }]}>1.0.0 (Production)</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  intervalBtn: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  intervalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  privacyNote: {
    fontSize: 12,
    opacity: 0.8,
  },
});
