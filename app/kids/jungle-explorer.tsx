import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import { ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const ANIMALS = [
  { name: 'Monkey', emoji: '🐵', position: { top: height * 0.4, left: width * 0.6 } },
  { name: 'Tiger', emoji: '🐯', position: { top: height * 0.7, left: width * 0.2 } },
  { name: 'Snake', emoji: '🐍', position: { top: height * 0.55, left: width * 0.1 } },
  { name: 'Frog', emoji: '🐸', position: { top: height * 0.8, left: width * 0.8 } },
  { name: 'Toucan', emoji: '🦜', position: { top: height * 0.2, left: width * 0.4 } },
];

export default function JungleExplorerGame() {
  const [foundAnimals, setFoundAnimals] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [animations, setAnimations] = useState(ANIMALS.map(() => new Animated.Value(0)));

  const allAnimalsFound = useMemo(() => foundAnimals.length === ANIMALS.length, [foundAnimals]);

  useEffect(() => {
    if (allAnimalsFound) {
      // Trigger success animation or navigation
    }
  }, [allAnimalsFound]);

  const handleAnimalPress = (animalName: string) => {
    if (!foundAnimals.includes(animalName)) {
      const animalIndex = ANIMALS.findIndex(a => a.name === animalName);
      setFoundAnimals([...foundAnimals, animalName]);
      Animated.timing(animations[animalIndex], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleHintPress = (animalName: string) => {
    setShowHint(animalName === showHint ? null : animalName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://your-jungle-image-url.com/jungle.jpg' }} // Replace with a real jungle image URL
        style={styles.background}
        imageStyle={{ opacity: 0.7 }}
      >
        <View style={styles.overlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.gameContainer}>
          {ANIMALS.map((animal, index) => {
            const isFound = foundAnimals.includes(animal.name);
            const scale = animations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5],
            });

            return (
              <Animated.View
                key={animal.name}
                style={[
                  styles.animalContainer,
                  animal.position,
                  { transform: [{ scale }] },
                ]}
              >
                <TouchableOpacity onPress={() => handleAnimalPress(animal.name)}>
                  <Text style={[styles.animalEmoji, isFound && styles.foundAnimal]}>
                    {animal.emoji}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.instructions}>Find the hidden animals!</Text>
          <View style={styles.animalList}>
            {ANIMALS.map(animal => (
              <View key={animal.name} style={styles.animalListItem}>
                <Text style={[styles.animalName, foundAnimals.includes(animal.name) && styles.foundText]}>
                  {animal.name}
                </Text>
                {foundAnimals.includes(animal.name) ? (
                  <CheckCircle size={18} color="#10B981" />
                ) : (
                  <TouchableOpacity onPress={() => handleHintPress(animal.name)}>
                    <HelpCircle size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {showHint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>Look near the {showHint === 'Monkey' ? 'big tree' : showHint === 'Tiger' ? 'bushes' : 'water'}!</Text>
            </View>
          )}
        </View>

        {allAnimalsFound && (
            <View style={styles.completeContainer}>
                <Text style={styles.completeTitle}>You found them all!</Text>
                <TouchableOpacity style={styles.playAgainButton} onPress={() => setFoundAnimals([])}>
                    <Text style={styles.playAgainText}>Play Again</Text>
                </TouchableOpacity>
            </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  gameContainer: {
    flex: 1,
  },
  animalContainer: {
    position: 'absolute',
  },
  animalEmoji: {
    fontSize: 40,
    opacity: 0.8,
  },
  foundAnimal: {
    opacity: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  instructions: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  animalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  animalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 10,
  },
  animalName: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
  foundText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  hintBox: {
    marginTop: 10,
    backgroundColor: '#1F2937',
    padding: 10,
    borderRadius: 8,
  },
  hintText: {
    color: 'white',
    textAlign: 'center',
  },
    completeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  playAgainButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  playAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
