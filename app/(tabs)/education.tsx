import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, AlertTriangle, Heart, Sun, Shield } from 'lucide-react-native';

interface EducationTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  content: string;
}

const educationTopics: EducationTopic[] = [
  {
    id: 'common-conditions',
    title: 'Common Eye Conditions',
    description: 'Learn about prevalent eye health issues and their symptoms',
    icon: Eye,
    color: '#3B82F6',
    content: `**Myopia (Nearsightedness)**\nDifficulty seeing distant objects clearly. Often develops in childhood and can progress with age.\n\n**Hyperopia (Farsightedness)**\nDifficulty focusing on close objects. May cause eye strain and headaches.\n\n**Astigmatism**\nIrregular curvature of the cornea causing blurred or distorted vision at all distances.\n\n**Presbyopia**\nAge-related decline in near vision, typically beginning around age 40.\n\n**Cataracts**\nClouding of the eye\'s natural lens, causing vision to become blurry or dim.\n\n**Glaucoma**\nGroup of eye conditions that damage the optic nerve, often due to high eye pressure.`,
  },
  {
    id: 'diabetic-retinopathy',
    title: 'Diabetic Retinopathy',
    description: 'Understanding diabetes-related eye complications',
    icon: Heart,
    color: '#EF4444',
    content: `**What is Diabetic Retinopathy?**\nA diabetes complication that affects the blood vessels in the retina, potentially leading to vision loss.\n\n**Stages:**\n• Mild nonproliferative retinopathy\n• Moderate nonproliferative retinopathy\n• Severe nonproliferative retinopathy\n• Proliferative retinopathy\n\n**Risk Factors:**\n• Poor blood sugar control\n• High blood pressure\n• High cholesterol\n• Pregnancy\n• Duration of diabetes\n\n**Prevention:**\n• Maintain good blood sugar control\n• Regular eye exams\n• Control blood pressure and cholesterol\n• Don\'t smoke`,
  },
  {
    id: 'macular-degeneration',
    title: 'Macular Degeneration',
    description: 'Age-related central vision loss and prevention strategies',
    icon: AlertTriangle,
    color: '#F59E0B',
    content: `**Age-Related Macular Degeneration (AMD)**\nLeading cause of vision loss in people over 50, affecting central vision.\n\n**Types:**\n• **Dry AMD:** Gradual breakdown of light-sensitive cells\n• **Wet AMD:** Abnormal blood vessel growth under the retina\n\n**Symptoms:**\n• Blurred or fuzzy vision\n• Straight lines appear wavy\n• Dark or empty areas in central vision\n• Colors appear less bright\n\n**Risk Factors:**\n• Age (over 50)\n• Family history\n• Smoking\n• High blood pressure\n• Obesity\n\n**Prevention:**\n• Eat leafy greens and fish\n• Don\'t smoke\n• Exercise regularly\n• Protect eyes from UV light`,
  },
  {
    id: 'digital-eye-strain',
    title: 'Digital Eye Strain',
    description: 'Managing computer vision syndrome in the digital age',
    icon: Sun,
    color: '#8B5CF6',
    content: `**Computer Vision Syndrome**\nEye discomfort and vision problems from prolonged digital device use.\n\n**Symptoms:**\n• Eye strain and fatigue\n• Dry eyes\n• Blurred vision\n• Neck and shoulder pain\n• Headaches\n\n**20-20-20 Rule:**\nEvery 20 minutes, look at something 20 feet away for at least 20 seconds.\n\n**Prevention Tips:**\n• Adjust screen brightness and contrast\n• Position screen 20-26 inches away\n• Use artificial tears\n• Blink more frequently\n• Consider blue light filtering glasses\n• Take regular breaks`,
  },
  {
    id: 'eye-protection',
    title: 'Eye Protection & Safety',
    description: 'Essential tips for protecting your vision daily',
    icon: Shield,
    color: '#10B981',
    content: `**UV Protection**\nWear sunglasses that block 99-100% of UV-A and UV-B rays.\n\n**Workplace Safety**\n• Use appropriate safety eyewear\n• Follow safety protocols\n• Be aware of hazardous materials\n\n**Sports Protection**\nWear protective eyewear during sports activities, especially racquet sports and baseball.\n\n**Home Safety**\n• Use caution with chemicals and cleaning products\n• Secure area rugs and improve lighting\n• Keep sharp objects away from eyes\n\n**Nutrition for Eye Health**\n• Leafy green vegetables\n• Fish high in omega-3 fatty acids\n• Eggs, nuts, and beans\n• Oranges and citrus fruits\n• Oysters and pork`,
  },
];

export default function EducationScreen() {
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null);

  if (selectedTopic) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[selectedTopic.color, selectedTopic.color + 'CC']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedTopic(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedTopic.title}</Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.articleContent}>
            <Text style={styles.articleText}>{selectedTopic.content}</Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              This information is for educational purposes only and should not replace professional medical advice. 
              Always consult with a qualified eye care professional for diagnosis and treatment.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Eye Health Education</Text>
        <Text style={styles.headerSubtitle}>Learn about eye health and vision care</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Educational Topics</Text>
        
        {educationTopics.map((topic) => {
          const IconComponent = topic.icon;
          return (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => setSelectedTopic(topic)}
              activeOpacity={0.7}
            >
              <View style={styles.topicCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${topic.color}15` }]}>
                  <IconComponent size={24} color={topic.color} />
                </View>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>📚 Additional Resources</Text>
          <Text style={styles.resourcesText}>
            • American Academy of Ophthalmology (aao.org){'\n'}
            • National Eye Institute (nei.nih.gov){'\n'}
            • Prevent Blindness (preventblindness.org){'\n'}
            • American Optometric Association (aoa.org)
          </Text>
        </View>

        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 When to Seek Immediate Care</Text>
          <Text style={styles.emergencyText}>
            Contact an eye care professional immediately if you experience:{'\n\n'}
            • Sudden vision loss{'\n'}
            • Severe eye pain{'\n'}
            • Flashing lights or new floaters{'\n'}
            • Curtain-like vision loss{'\n'}
            • Chemical exposure to eyes
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#DDD6FE',
    opacity: 0.9,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topicCardContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  articleContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  articleText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  resourcesCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  resourcesText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
});