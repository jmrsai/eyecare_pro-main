import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Phone, MapPin, Clock, Eye, Droplets, Zap, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  icon: any;
}

interface EmergencySymptom {
  symptom: string;
  urgency: 'immediate' | 'urgent' | 'soon';
  description: string;
  action: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Emergency Services',
    number: '911',
    description: 'Life-threatening emergencies',
    icon: Phone,
  },
  {
    name: 'Poison Control',
    number: '1-800-222-1222',
    description: 'Chemical exposure to eyes',
    icon: Droplets,
  },
  {
    name: 'Eye Emergency Hotline',
    number: '1-800-EYE-CARE',
    description: '24/7 eye emergency guidance',
    icon: Eye,
  },
];

const EMERGENCY_SYMPTOMS: EmergencySymptom[] = [
  {
    symptom: 'Sudden complete vision loss',
    urgency: 'immediate',
    description: 'Total or near-total vision loss in one or both eyes',
    action: 'Call 911 immediately. Do not drive. This may indicate stroke, retinal detachment, or severe eye injury.',
  },
  {
    symptom: 'Chemical splash in eye',
    urgency: 'immediate',
    description: 'Any chemical substance in contact with the eye',
    action: 'Flush eye with clean water for 15+ minutes. Call Poison Control (1-800-222-1222) while flushing. Seek immediate medical care.',
  },
  {
    symptom: 'Severe eye trauma or injury',
    urgency: 'immediate',
    description: 'Penetrating injury, severe blunt trauma, or foreign object in eye',
    action: 'Do NOT remove objects. Cover eye gently. Call 911. Avoid pressure on the eye.',
  },
  {
    symptom: 'Sudden severe eye pain with nausea',
    urgency: 'immediate',
    description: 'Intense eye pain accompanied by nausea, vomiting, or headache',
    action: 'May indicate acute angle-closure glaucoma. Seek emergency care within 1-2 hours to prevent permanent vision loss.',
  },
  {
    symptom: 'Flashing lights with vision loss',
    urgency: 'urgent',
    description: 'New flashing lights with curtain-like vision loss',
    action: 'Possible retinal detachment. Seek emergency eye care within 24 hours. Avoid sudden head movements.',
  },
  {
    symptom: 'Sudden double vision',
    urgency: 'urgent',
    description: 'New onset of seeing double images',
    action: 'May indicate neurological issue. Seek medical evaluation within 24 hours, sooner if accompanied by other symptoms.',
  },
  {
    symptom: 'New onset of many floaters',
    urgency: 'soon',
    description: 'Sudden increase in dark spots or cobwebs in vision',
    action: 'Schedule urgent eye exam within 24-48 hours. May indicate retinal tear or detachment.',
  },
];

export default function EmergencyScreen() {
  const makePhoneCall = (phoneNumber: string) => {
    Alert.alert(
      'Emergency Call',
      `Call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${phoneNumber}`) 
        },
      ]
    );
  };

  const findNearbyER = () => {
    const query = 'emergency room near me';
    const url = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return '#EF4444';
      case 'urgent': return '#F59E0B';
      case 'soon': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'CALL 911 NOW';
      case 'urgent': return 'SEEK CARE TODAY';
      case 'soon': return 'SCHEDULE SOON';
      default: return 'MONITOR';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <AlertTriangle size={32} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Eye Emergency Guide</Text>
          <Text style={styles.headerSubtitle}>When to seek immediate care</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          
          {EMERGENCY_CONTACTS.map((contact, index) => {
            const IconComponent = contact.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={() => makePhoneCall(contact.number)}
              >
                <View style={styles.contactIcon}>
                  <IconComponent size={24} color="#EF4444" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactDescription}>{contact.description}</Text>
                </View>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.locationCard} onPress={findNearbyER}>
            <MapPin size={24} color="#3B82F6" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Find Nearest Emergency Room</Text>
              <Text style={styles.locationDescription}>Open maps to locate nearby emergency care</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When to Seek Emergency Care</Text>
          
          {EMERGENCY_SYMPTOMS.map((symptom, index) => (
            <View key={index} style={styles.symptomCard}>
              <View style={styles.symptomHeader}>
                <Text style={styles.symptomTitle}>{symptom.symptom}</Text>
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(symptom.urgency) }]}>
                  <Text style={styles.urgencyText}>{getUrgencyText(symptom.urgency)}</Text>
                </View>
              </View>
              <Text style={styles.symptomDescription}>{symptom.description}</Text>
              <View style={styles.actionContainer}>
                <Zap size={16} color="#F59E0B" />
                <Text style={styles.actionText}>{symptom.action}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* First Aid Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency First Aid</Text>
          
          <View style={styles.firstAidCard}>
            <Text style={styles.firstAidTitle}>Chemical Eye Exposure</Text>
            <View style={styles.firstAidSteps}>
              <Text style={styles.firstAidStep}>1. Flush immediately with clean water</Text>
              <Text style={styles.firstAidStep}>2. Continue flushing for 15+ minutes</Text>
              <Text style={styles.firstAidStep}>3. Remove contact lenses if possible</Text>
              <Text style={styles.firstAidStep}>4. Call Poison Control while flushing</Text>
              <Text style={styles.firstAidStep}>5. Seek immediate medical care</Text>
            </View>
          </View>

          <View style={styles.firstAidCard}>
            <Text style={styles.firstAidTitle}>Foreign Object in Eye</Text>
            <View style={styles.firstAidSteps}>
              <Text style={styles.firstAidStep}>1. DO NOT rub the eye</Text>
              <Text style={styles.firstAidStep}>2. DO NOT remove embedded objects</Text>
              <Text style={styles.firstAidStep}>3. Cover eye gently with clean cloth</Text>
              <Text style={styles.firstAidStep}>4. Avoid applying pressure</Text>
              <Text style={styles.firstAidStep}>5. Seek immediate medical care</Text>
            </View>
          </View>
        </View>

        {/* Important Reminders */}
        <View style={styles.reminderCard}>
          <Clock size={24} color="#F59E0B" />
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Important Reminders</Text>
            <Text style={styles.reminderText}>
              • Time is critical in eye emergencies{'\n'}
              • When in doubt, seek professional care{'\n'}
              • Keep emergency numbers easily accessible{'\n'}
              • Never ignore sudden vision changes{'\n'}
              • Regular eye exams can prevent emergencies
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only and should not replace professional medical advice. 
            In any emergency, trust your instincts and seek immediate professional medical care.
          </Text>
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
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FCA5A5',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#3B82F6',
  },
  symptomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  symptomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  symptomDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  firstAidCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  firstAidTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 12,
  },
  firstAidSteps: {
    gap: 8,
  },
  firstAidStep: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  reminderCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
});