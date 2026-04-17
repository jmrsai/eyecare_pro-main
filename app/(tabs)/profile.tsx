import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, Calendar, Eye, AlertTriangle, Edit2, Check, Pill } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface UserProfile {
  name: string;
  email: string;
  age: string;
  lastExam: string;
  notifications: boolean;
  dataSharing: boolean;
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: '35',
    lastExam: '2024-06-15',
    notifications: true,
    dataSharing: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSave = () => {
    saveProfile(profile);
    setIsEditing(false);
  };

  const toggleNotifications = () => {
    const updatedProfile = { ...profile, notifications: !profile.notifications };
    saveProfile(updatedProfile);
  };

  const toggleDataSharing = () => {
    const updatedProfile = { ...profile, dataSharing: !profile.dataSharing };
    saveProfile(updatedProfile);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic here
          console.log('User logged out');
        }},
      ]
    );
  };

  const handleSettingsPress = () => {
    router.push('/settings' as any);
  };

  const handleEmergencyPress = () => {
    router.push('/emergency' as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={32} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <>
                <TextInput 
                  style={styles.editNameInput}
                  value={profile.name}
                  onChangeText={(text) => setProfile({...profile, name: text})}
                  placeholder="Name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
                <TextInput 
                  style={styles.editEmailInput}
                  value={profile.email}
                  onChangeText={(text) => setProfile({...profile, email: text})}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            ) : (
              <>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </>
            )}
          </View>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? (
              <Check size={24} color="#FFFFFF" />
            ) : (
              <Edit2 size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Health Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Health Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Calendar size={20} color="#3B82F6" />
              <Text style={styles.summaryLabel}>Last Eye Exam</Text>
              <Text style={styles.summaryValue}>{formatDate(profile.lastExam)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Eye size={20} color="#10B981" />
              <Text style={styles.summaryLabel}>Tests Completed</Text>
              <Text style={styles.summaryValue}>12</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#6B7280" />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={profile.notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={profile.notifications ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Receive reminders for eye tests and health tips
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Shield size={20} color="#6B7280" />
                <Text style={styles.settingLabel}>Data Sharing</Text>
              </View>
              <Switch
                value={profile.dataSharing}
                onValueChange={toggleDataSharing}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={profile.dataSharing ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Share anonymized data to help improve eye health research
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.menuLabel}>Account Settings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/medications' as any)}>
            <Pill size={20} color="#3B82F6" />
            <Text style={styles.menuLabel}>Medications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/reminders' as any)}>
            <Bell size={20} color="#F59E0B" />
            <Text style={styles.menuLabel}>Reminders</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleEmergencyPress}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.menuLabel}>Emergency Information</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color="#6B7280" />
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Logout</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>🔒 Privacy & Security</Text>
          <Text style={styles.privacyText}>
            Your health data is encrypted and stored securely. We comply with HIPAA regulations 
            and never share your personal information without your explicit consent.
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appInfoTitle}>EyeCare Pro</Text>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 EyeCare Technologies</Text>
        </View>
      </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#C7D2FE',
    opacity: 0.9,
  },
  editNameInput: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
    paddingVertical: 0,
  },
  editEmailInput: {
    fontSize: 16,
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 0,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#065F46',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  appInfoCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});