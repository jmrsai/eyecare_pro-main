import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, AlertTriangle, Heart, Sun, Shield, Search, BookOpen, ExternalLink } from 'lucide-react-native';

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

interface PubMedArticle {
  id: string;
  title: string;
  authors: string;
  journal: string;
  pubdate: string;
  url: string;
}

export default function EducationScreen() {
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null);

  // PubMed states
  const [pubmedQuery, setPubmedQuery] = useState('');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial default optometry articles on mount
    fetchClinicalResearch('eye health clinical trial');
  }, []);

  const fetchClinicalResearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Search for article IDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=4`;
      const searchRes = await fetch(searchUrl);
      const searchJson = await searchRes.json();
      const ids: string[] = searchJson.esearchresult?.idlist || [];

      if (ids.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      // 2. Fetch Summaries of these IDs
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryJson = await summaryRes.json();
      
      const parsedArticles: PubMedArticle[] = ids.map((id) => {
        const doc = summaryJson.result[id];
        return {
          id,
          title: doc?.title || 'No Title Available',
          authors: doc?.authors?.map((a: any) => a.name).join(', ') || 'Unknown Authors',
          journal: doc?.source || 'PubMed Central',
          pubdate: doc?.pubdate || 'N/A',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        };
      });

      setArticles(parsedArticles);
    } catch (e) {
      console.error(e);
      setError('Could not connect to medical database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!pubmedQuery.trim()) return;
    fetchClinicalResearch(pubmedQuery.trim());
  };

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
        <Text style={styles.headerTitle}>Eye Health Library</Text>
        <Text style={styles.headerSubtitle}>Optometry guides and real-time medical updates</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Essential Topics</Text>
        
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

        {/* PubMed Real-time Database Search Section */}
        <View style={styles.pubmedHeaderSection}>
          <Text style={styles.sectionTitle}>NCBI PubMed Medical Feed</Text>
          <Text style={styles.sectionSubtitle}>Search official, peer-reviewed clinical studies</Text>
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search PubMed (e.g. Myopia, Dry Eye)..."
            placeholderTextColor="#94A3B8"
            value={pubmedQuery}
            onChangeText={setPubmedQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Search size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerSpinner}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.spinnerText}>Loading official clinical documents...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.articleList}>
            {articles.map((art) => (
              <TouchableOpacity
                key={art.id}
                style={styles.pubmedCard}
                onPress={() => Linking.openURL(art.url)}
              >
                <View style={styles.pubmedCardHeader}>
                  <BookOpen size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                  <Text style={styles.journalName} numberOfLines={1}>{art.journal}</Text>
                </View>
                <Text style={styles.pubmedTitle}>{art.title}</Text>
                <Text style={styles.authorsName} numberOfLines={1}>{art.authors}</Text>
                <View style={styles.pubmedCardFooter}>
                  <Text style={styles.pubmedDate}>Published: {art.pubdate}</Text>
                  <View style={styles.linkRow}>
                    <Text style={styles.linkLabel}>PubMed Central</Text>
                    <ExternalLink size={12} color="#7C3AED" style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
        
        <View style={{ height: 40 }} />
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
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 16,
  },
  pubmedHeaderSection: {
    marginTop: 28,
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  topicCardContent: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  articleContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  articleText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSpinner: {
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  spinnerText: {
    color: '#64748B',
    fontSize: 13,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 12,
  },
  articleList: {
    gap: 14,
    marginBottom: 20,
  },
  pubmedCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  pubmedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  journalName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7C3AED',
    flex: 1,
  },
  pubmedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  authorsName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  pubmedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  pubmedDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  resourcesCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  resourcesTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  resourcesText: {
    fontSize: 13,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 20,
  },
});