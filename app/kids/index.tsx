import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Trophy, Heart, Gamepad2, ArrowLeft, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMES, THERAPIES } from './data';

interface KidsStats {
  totalStars: number;
  gamesPlayed: number;
  streakDays: number;
  badges: string[];
  todayPlayTime: number; // in minutes
  lastPlayDate: string;
}

export default function KidsHomeScreen() {
  const [stats, setStats] = useState<KidsStats>({
    totalStars: 0,
    gamesPlayed: 0,
    streakDays: 0,
    badges: [],
    todayPlayTime: 0,
    lastPlayDate: '',
  });
  const [childName, setChildName] = useState('Little Explorer');
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadKidsStats();
    startBounceAnimation();
  }, []);

  const loadKidsStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('kidsStats');
      const savedName = await AsyncStorage.getItem('childName');
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      if (savedName) {
        setChildName(savedName);
      }
    } catch (error) {
      console.error('Error loading kids stats:', error);
    }
  };

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const canPlayMore = () => {
    const MAX_DAILY_PLAYTIME = 15; // minutes
    return stats.todayPlayTime < MAX_DAILY_PLAYTIME;
  };

  const handleGamePress = (route: string) => {
    if (!canPlayMore()) {
      // Show friendly limit message
      return;
    }
    router.push(route as any);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B9D', '#C084FC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/kids/settings')}>
            <Settings size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.welcomeSection}>
          <Animated.Text style={[styles.welcomeText, { transform: [{ scale: bounceAnim }] }]}>
            🌟 Hi {childName}! 🌟
          </Animated.Text>
          <Text style={styles.welcomeSubtext}>Ready for some eye adventures?</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Star size={20} color="#FFD700" />
            <Text style={styles.statNumber}>{stats.totalStars}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={20} color="#FFD700" />
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Heart size={20} color="#FF69B4" />
            <Text style={styles.statNumber}>{stats.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Playtime Limit Warning */}
        {!canPlayMore() && (
          <View style={styles.limitCard}>
            <Text style={styles.limitTitle}>🎮 Great Job Today!</Text>
            <Text style={styles.limitText}>
              You&apos;ve played for {stats.todayPlayTime} minutes today. 
              Time to rest those amazing eyes! Come back tomorrow for more adventures!
            </Text>
          </View>
        )}

        {/* Games Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Eye Adventure Games</Text>
          
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { opacity: canPlayMore() ? 1 : 0.6 }]}
              onPress={() => handleGamePress(game.route)}
              disabled={!canPlayMore()}
            >
              <View style={[styles.gameIcon, { backgroundColor: game.color + '20' }]}>
                <Text style={styles.gameEmoji}>{game.icon}</Text>
              </View>
              
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                
                <View style={styles.gameMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(game.difficulty) }]}>
                      {game.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.durationText}>{game.duration}</Text>
                  <Text style={styles.skillText}>• {game.skill}</Text>
                </View>
              </View>
              
              <View style={styles.playButton}>
                <Gamepad2 size={20} color={game.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Therapies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Calm Corner Therapies</Text>
          
          {THERAPIES.map((therapy) => (
            <TouchableOpacity
              key={therapy.id}
              style={styles.therapyCard}
              onPress={() => router.push(therapy.route as any)}
            >
              <View style={[styles.therapyIcon, { backgroundColor: therapy.color + '20' }]}>
                <Text style={styles.therapyEmoji}>{therapy.icon}</Text>
              </View>
              
              <View style={styles.therapyInfo}>
                <Text style={styles.therapyTitle}>{therapy.title}</Text>
                <Text style={styles.therapySubtitle}>{therapy.subtitle}</Text>
                <Text style={styles.therapyDescription}>{therapy.description}</Text>
                <Text style={styles.therapyDuration}>⏱️ {therapy.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Encouragement Section */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementTitle}>🌈 You&apos;re Amazing!</Text>
          <Text style={styles.encouragementText}>
            Every game you play makes your eyes stronger and healthier. 
            Keep up the fantastic work, {childName}!
          </Text>
        </View>

        {/* Parent Info */}
        <View style={styles.parentInfo}>
          <Text style={styles.parentInfoTitle}>👨‍👩‍👧‍👦 For Parents</Text>
          <Text style={styles.parentInfoText}>
            Daily limit: {stats.todayPlayTime}/15 minutes • 
            These games are designed by eye care professionals to be both fun and therapeutic.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  limitCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  limitText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  gameSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 10,
    color: '#6B7280',
    marginRight: 8,
  },
  skillText: {
    fontSize: 10,
    color: '#6B7280',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  therapyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  therapyEmoji: {
    fontSize: 24,
  },
  therapyInfo: {
    flex: 1,
  },
  therapyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  therapySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  therapyDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  therapyDuration: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  encouragementCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  parentInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  parentInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  parentInfoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});