import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { ShieldCheck, AlertTriangle, ArrowRight, Shield } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getSecureItem, saveSecureItem } from '../../utils/security';
import { logSecurityEvent } from '../../utils/logger';
import { LinearGradient } from 'expo-linear-gradient';

const CONSENT_KEY = 'medical_consent_accepted';

export default function ConsentModal() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const accepted = await getSecureItem(CONSENT_KEY);
    if (!accepted) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleAccept = async () => {
    await saveSecureItem(CONSENT_KEY, 'true');
    await logSecurityEvent('CONSENT_ACCEPTED', 'User accepted the medical disclaimer and terms of service');
    setVisible(false);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isCloseToBottom) {
      setScrolledToBottom(true);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + 'CC']}
            style={styles.header}
          >
            <ShieldCheck size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Medical Consent</Text>
            <Text style={styles.headerSubtitle}>Please review and accept to continue</Text>
          </LinearGradient>

          <ScrollView 
            style={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.warningBox}>
              <AlertTriangle size={20} color="#FF9500" />
              <Text style={styles.warningText}>
                Important: Not a Medical Substitute
              </Text>
            </View>

            <Text style={[styles.text, { color: theme.colors.text }]}>
              By using EyeCare Pro, you acknowledge and agree to the following:
            </Text>

            <View style={styles.point}>
              <View style={[styles.bullet, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.pointText, { color: theme.colors.text }]}>
                This app provides information for screening and educational purposes only.
              </Text>
            </View>

            <View style={styles.point}>
              <View style={[styles.bullet, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.pointText, { color: theme.colors.text }]}>
                Results are NOT a diagnosis. Always consult a licensed ophthalmologist for medical issues.
              </Text>
            </View>

            <View style={styles.point}>
              <View style={[styles.bullet, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.pointText, { color: theme.colors.text }]}>
                Your sensitive health data will be encrypted and handled according to our Privacy Policy.
              </Text>
            </View>

            <View style={styles.point}>
              <View style={[styles.bullet, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.pointText, { color: theme.colors.text }]}>
                In case of sudden vision loss or severe pain, seek emergency medical help immediately.
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            {!scrolledToBottom && (
              <Text style={[styles.scrollHint, { color: theme.colors.subtext }]}>
                Please scroll to the bottom to accept
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.acceptButton,
                { backgroundColor: scrolledToBottom ? theme.colors.primary : theme.colors.border }
              ]}
              disabled={!scrolledToBottom}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>I Accept & Agree</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF950015',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  warningText: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 14,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  point: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  scrollHint: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 10,
  },
  acceptButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
