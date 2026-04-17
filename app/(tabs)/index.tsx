
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Palette, Target, Grid3X3, Zap, Clock, BookOpen, AlertTriangle, Settings, ClipboardList } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { StyledTouchableOpacity } from '../../components/StyledTouchableOpacity';

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
    route: '/tests/symptoms',
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
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    disclaimerCard: {
      backgroundColor: theme.colors.warning,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
    },
    disclaimerTitle: {
      ...typography.h3,
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },
    disclaimerText: {
      ...typography.body,
      color: theme.colors.text,
      lineHeight: 20,
    },
    sectionTitle: {
      ...typography.h2,
      color: theme.colors.text,
      marginBottom: spacing.md,
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
        <Text style={styles.headerSubtitle}>Comprehensive Eye Health Screening</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            These tests are for screening purposes only and are NOT a substitute for professional medical examination. 
            Always consult with a qualified eye care professional for comprehensive eye examinations and medical advice.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Available Tests</Text>
        
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
