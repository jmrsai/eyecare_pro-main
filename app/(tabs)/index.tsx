
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Palette, Target, Grid3X3, Zap, Clock, BookOpen, AlertTriangle, Settings, ClipboardList, Shield, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { StyledTouchableOpacity } from '../../components/StyledTouchableOpacity';
import ConsentModal from '../../components/Medical/ConsentModal';

const diagnosticTests = [
  {
    id: 'visual-acuity',
    title: 'Visual Acuity Test',
    description: 'Test your vision sharpness using digital eye charts',
    icon: Eye,
    route: '/tests/visual-acuity',
  },
  {
    id: 'symptom-check',
    title: 'Symptom Checker',
    description: 'Assess your digital eye strain levels',
    icon: ClipboardList,
    route: '/symptoms',
  },
  {
    id: 'accommodation',
    title: 'Accommodation Test',
    description: 'Test your ability to switch focus (Near/Far)',
    icon: Target,
    route: '/tests/accommodation',
  },
  {
    id: 'color-vision',
    title: 'Color Vision Test',
    description: 'Screen for color blindness with Ishihara plates',
    icon: Palette,
    route: '/tests/color-vision',
  },
  {
    id: 'astigmatism',
    title: 'Astigmatism Test',
    description: 'Check for astigmatism using clock dial patterns',
    icon: Target,
    route: '/tests/astigmatism',
  },
  {
    id: 'amsler-grid',
    title: 'Amsler Grid Test',
    description: 'Screen for macular degeneration and central vision issues',
    icon: Grid3X3,
    route: '/tests/amsler-grid',
  },
  {
    id: 'contrast-sensitivity',
    title: 'Contrast Sensitivity',
    description: 'Measure your ability to distinguish contrast',
    icon: Zap,
    route: '/tests/contrast-sensitivity',
  },
  {
    id: 'visual-field',
    title: 'Visual Field Test',
    description: 'Screen for peripheral vision and glaucoma risk',
    icon: Target,
    route: '/tests/visual-field',
  },
  {
    id: 'pupil-response',
    title: 'Pupil Response Test',
    description: 'Experimental neurological screening (camera required)',
    icon: Eye,
    route: '/tests/pupil-response',
  },
  {
    id: 'reading-speed',
    title: 'Reading Speed Test',
    description: 'Assess reading performance and visual processing',
    icon: BookOpen,
    route: '/tests/reading-speed',
  },
  {
    id: 'doctor-finder',
    title: 'Find a Specialist',
    description: 'Locate ophthalmologists and eye clinics near you',
    icon: MapPin,
    route: '/doctor-finder',
  },
];

export default function TestsScreen() {
  const { theme, typography, spacing, layout } = useTheme();

  const handleTestPress = (route: string) => {
    router.push(route as any);
  };

  const handleEmergencyPress = () => {
    router.push('/emergency' as any);
  };

  const handleSettingsPress = () => {
    router.push('/settings' as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
      },
    headerTitle: {
      ...typography.h1,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      ...typography.body,
      color: '#BFDBFE',
      opacity: 0.9,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    encryptionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      marginTop: 10,
    },
    trainingCTA: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderRadius: 25,
      marginBottom: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    trainingCTALeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    trainingIconBox: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    trainingCTATitle: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    trainingCTASubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
      marginTop: 2,
    },
    trainingBadge: {
      backgroundColor: '#10B981',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    trainingBadgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    encryptionText: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    disclaimerCard: {
      backgroundColor: '#FF950010',
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: '#FF950030',
    },
    disclaimerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
      gap: 8,
    },
    disclaimerTitle: {
      ...typography.h3,
      color: '#FF9500',
    },
    disclaimerText: {
      ...typography.body,
      color: theme.colors.text,
      lineHeight: 20,
      opacity: 0.8,
    },
    learnMore: {
      ...typography.caption,
      fontWeight: 'bold',
      marginTop: spacing.sm,
    },
    testCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    testCardContent: {
      flexDirection: 'row',
      padding: spacing.lg,
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    testInfo: {
      flex: 1,
    },
    testTitle: {
      ...typography.h3,
      color: theme.colors.text,
      marginBottom: spacing.xs,
    },
    testDescription: {
      ...typography.body,
      color: theme.colors.subtext,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    testMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    testDuration: {
      ...typography.caption,
      color: theme.colors.subtext,
      marginLeft: spacing.xs,
    },
    quickTipsCard: {
      backgroundColor: theme.colors.info,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    quickTipsTitle: {
      ...typography.h3,
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },
    quickTipsText: {
      ...typography.body,
      color: theme.colors.text,
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ConsentModal />
      <LinearGradient
        colors={[theme.colors.primary, '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <StyledTouchableOpacity style={styles.iconButton} onPress={handleEmergencyPress}>
            <AlertTriangle size={20} color="#FFFFFF" />
          </StyledTouchableOpacity>
          <StyledTouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
            <Settings size={20} color="#FFFFFF" />
          </StyledTouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>EyeCare Pro</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.headerSubtitle}>Comprehensive Eye Health Screening</Text>
          <View style={styles.encryptionBadge}>
            <Shield size={10} color="#FFFFFF" />
            <Text style={styles.encryptionText}>E2E ENCRYPTED</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <AlertTriangle size={20} color="#FF9500" />
            <Text style={styles.disclaimerTitle}>Clinical Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            EyeCare Pro is for screening and educational purposes only. It is <Text style={{ fontWeight: 'bold' }}>NOT</Text> a substitute for professional medical diagnosis or treatment.
          </Text>
          <TouchableOpacity onPress={() => router.push('/legal' as any)}>
            <Text style={[styles.learnMore, { color: theme.colors.primary }]}>Read full legal protection details ›</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Training CTA */}
        <TouchableOpacity 
          style={[styles.trainingCTA, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/training')}
        >
          <View style={styles.trainingCTALeft}>
            <View style={styles.trainingIconBox}>
              <Zap size={24} color="#FFF" fill="#FFF" />
            </View>
            <View>
              <Text style={styles.trainingCTATitle}>Daily Visual Gym</Text>
              <Text style={styles.trainingCTASubtitle}>Start your 5-min neural routine</Text>
            </View>
          </View>
          <View style={styles.trainingBadge}>
            <Text style={styles.trainingBadgeText}>READY</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Diagnostic Tests</Text>

        <StyledTouchableOpacity
          style={[styles.testCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary, borderWidth: 1 }]}
          onPress={() => router.push('/tests/quick-assessment' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.testCardContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
              <Zap size={24} color="#FFFFFF" />
            </View>
            <View style={styles.testInfo}>
              <Text style={[styles.testTitle, { color: theme.colors.primary }]}>Quick Assessment</Text>
              <Text style={styles.testDescription}>3-step early diagnosis flow (1 min)</Text>
              <View style={styles.testMeta}>
                <Clock size={14} color={theme.colors.subtext} />
                <Text style={styles.testDuration}>1 min • AI Assisted</Text>
              </View>
            </View>
          </View>
        </StyledTouchableOpacity>
        
        {diagnosticTests.map((test) => {
          const IconComponent = test.icon;
          return (
            <StyledTouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => handleTestPress(test.route)}
              activeOpacity={0.7}
            >
              <View style={styles.testCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <IconComponent size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>
                  <View style={styles.testMeta}>
                    <Clock size={14} color={theme.colors.subtext} />
                    <Text style={styles.testDuration}>3-5 min</Text>
                  </View>
                </View>
              </View>
            </StyledTouchableOpacity>
          );
        })}

        <View style={styles.quickTipsCard}>
          <Text style={styles.quickTipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.quickTipsText}>
            • Ensure good lighting when taking tests{'\n'}
            • Hold your device at arm&apos;s length{'\n'}
            • Take breaks between tests{'\n'}
            • Test each eye separately when instructed
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
