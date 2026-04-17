import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Shield, Scale, AlertTriangle, Info } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const LEGAL_SECTIONS = [
  {
    id: 'disclaimer',
    title: 'Medical Disclaimer',
    icon: AlertTriangle,
    color: '#FF9500',
    content: `EyeCare Pro is for educational and screening purposes ONLY.

1. NOT MEDICAL ADVICE: The information and screening tools provided are not a substitute for professional medical advice, diagnosis, or treatment.

2. PROFESSIONAL CONSULTATION: Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

3. EMERGENCY: If you think you may have a medical emergency, call your doctor or emergency services immediately.

4. NO DOCTOR-PATIENT RELATIONSHIP: Your use of this app does not create a doctor-patient relationship.`
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: Shield,
    color: '#34C759',
    content: `Your privacy is our priority.

1. DATA COLLECTION: We collect health screening results and basic usage data to provide our services.

2. DATA SECURITY: All sensitive health data is encrypted before storage. We use industry-standard security measures to protect your information.

3. DATA SHARING: We do not sell your personal data. We only share anonymized data with third-party providers for essential app functionality.

4. USER RIGHTS: You have the right to access, export, or delete your data at any time via the Settings menu.`
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: Scale,
    color: '#007AFF',
    content: `By using EyeCare Pro, you agree to:

1. ACCEPTANCE: You accept these terms in full. If you disagree, you must stop using the application.

2. LIMITATION OF LIABILITY: EyeCare Technologies shall not be liable for any results, interpretations, or actions taken based on app data.

3. PERMITTED USE: You agree to use the app for its intended personal eye-care purpose and not for any commercial redistribution.

4. UPDATES: We may update these terms from time to time. Your continued use indicates acceptance.`
  }
];

export default function LegalScreen() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('disclaimer');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[theme.colors.card, theme.colors.background]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Legal & Privacy</Text>
      </LinearGradient>

      <View style={styles.tabs}>
        {LEGAL_SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.tab,
              activeSection === section.id && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 }
            ]}
            onPress={() => setActiveSection(section.id)}
          >
            <section.icon 
              size={20} 
              color={activeSection === section.id ? theme.colors.primary : theme.colors.subtext} 
            />
            <Text style={[
              styles.tabLabel, 
              { color: activeSection === section.id ? theme.colors.primary : theme.colors.subtext }
            ]}>
              {section.title.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: LEGAL_SECTIONS.find(s => s.id === activeSection)?.color + '20' }]}>
              {React.createElement(LEGAL_SECTIONS.find(s => s.id === activeSection)?.icon as any, {
                size: 24,
                color: LEGAL_SECTIONS.find(s => s.id === activeSection)?.color
              })}
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {LEGAL_SECTIONS.find(s => s.id === activeSection)?.title}
            </Text>
          </View>
          
          <Text style={[styles.legalText, { color: theme.colors.text }]}>
            {LEGAL_SECTIONS.find(s => s.id === activeSection)?.content}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Info size={16} color={theme.colors.subtext} />
          <Text style={[styles.infoText, { color: theme.colors.subtext }]}>
            Last updated: April 2025
          </Text>
        </View>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  legalText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
  }
});
