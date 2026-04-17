import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Volume2, VolumeX, Moon, Sun, Bell, Globe, Shield, Info, Smartphone, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { isSoundEnabled, toggleSound } = useSound();

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>PREFERENCES</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                {isDark ? (
                  <Moon size={20} color={theme.colors.primary} />
                ) : (
                  <Sun size={20} color={theme.colors.primary} />
                )}
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary + '20' }]}>
                {isSoundEnabled ? (
                  <Volume2 size={20} color={theme.colors.secondary} />
                ) : (
                  <VolumeX size={20} color={theme.colors.secondary} />
                )}
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Sound Effects</Text>
            </View>
            <Switch
              value={isSoundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/reminders')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                <Bell size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notifications</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.subtext }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>SUPPORT</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => openLink('mailto:support@eyecarepro.com')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.info + '20' }]}>
                <Mail size={20} color={theme.colors.info} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Contact Support</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.subtext }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => openLink('https://eyecarepro.com/help')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <Info size={20} color={theme.colors.success} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Help Center</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.subtext }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>ABOUT</Text>
          
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Shield size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Privacy Policy</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.subtext }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.text + '10' }]}>
                <Globe size={20} color={theme.colors.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Terms of Service</Text>
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
            <Text style={[styles.versionText, { color: theme.colors.subtext }]}>1.0.0</Text>
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
});
