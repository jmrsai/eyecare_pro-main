import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ScrollView } from 'react-native';
import { Search, BookOpen, Clock, ChevronRight, Filter, BookMarked, ShieldCheck, Cpu } from 'lucide-react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const CATEGORIES = ['All', 'Conditions', 'Life Habits', 'Technology', 'Prevention'];

const ARTICLES = [
  {
    id: '1',
    title: 'Glaucoma: The Silent Thief',
    category: 'Conditions',
    summary: 'Essential knowledge on early detection and modern treatment options for glaucoma.',
    readTime: '5 min',
    icon: <ShieldCheck color="#3B82F6" size={24} />,
    color: '#EFF6FF'
  },
  {
    id: '2',
    title: 'Digital Eye Strain Guide',
    category: 'Technology',
    summary: 'The 20-20-20 rule and workspace optimizations to protect your vision in the digital age.',
    readTime: '4 min',
    icon: <Cpu color="#8B5CF6" size={24} />,
    color: '#F5F3FF'
  },
  {
    id: '3',
    title: 'Nutrition for Sharp Vision',
    category: 'Life Habits',
    summary: 'Top nutrients and lifestyle choices that significantly impact long-term ocular health.',
    readTime: '6 min',
    icon: <BookMarked color="#F59E0B" size={24} />,
    color: '#FFFBEB'
  },
  {
    id: '4',
    title: 'Regular Exams vs Screening',
    category: 'Prevention',
    summary: 'Understanding the difference and why professional care remains indispensable.',
    readTime: '3 min',
    icon: <Search color="#10B981" size={24} />,
    color: '#ECFDF5'
  }
];

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;
  icon: React.ReactNode;
  color: string;
}

export default function EducationalContent() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = ARTICLES.filter(art => 
    (selectedCategory === 'All' || art.category === selectedCategory) &&
    (art.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderArticle = ({ item, index }: { item: Article, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100 }}
    >
      <Pressable 
        style={styles.articleCard}
        onPress={() => console.log('Navigate to article details')}
      >
        <View style={[styles.iconBox, { backgroundColor: item.color }]}>
          {item.icon}
        </View>
        <View style={styles.articleContent}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>{item.category}</Text>
            <View style={styles.timeTag}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.timeText}>{item.readTime}</Text>
            </View>
          </View>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </Pressable>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={styles.header}>
        <Text style={styles.title}>Learn & Protect</Text>
        <Text style={styles.subtitle}>Curated medical insights for life-long eye health.</Text>
        
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput 
            placeholder="Search eye health topics..."
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <Pressable 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip, 
                selectedCategory === cat && styles.categoryChipActive
              ]}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive
              ]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredArticles}
        keyExtractor={(item: Article) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No articles found in this category.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, paddingTop: 60, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 20 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 16, 
    height: 50, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  input: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1E293B' },
  categoryContainer: { marginBottom: 16 },
  categoryScroll: { paddingHorizontal: 20 },
  categoryChip: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: '#F1F5F9', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  categoryChipActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  categoryChipText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  categoryChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 20, paddingBottom: 40 },
  articleCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  articleContent: { flex: 1, marginLeft: 16, marginRight: 8 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  categoryLabel: { fontSize: 11, fontWeight: '700', color: '#3B82F6', textTransform: 'uppercase' },
  timeTag: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 11, color: '#64748B', marginLeft: 4 },
  articleTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  articleSummary: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 15 }
});
