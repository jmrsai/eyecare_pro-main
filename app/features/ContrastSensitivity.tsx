
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CONTRAST_LEVELS = [1.0, 0.8, 0.6, 0.4, 0.2, 0.1, 0.05, 0.025];
const LETTERS = 'C, D, H, K, N, O, R, S, V, Z'.split(', ');

interface Result {
  level: number;
  letter: string;
}

export default function ContrastSensitivity() {
  const [level, setLevel] = useState(0);
  const [letter, setLetter] = useState(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  const [results, setResults] = useState<Result[]>([]);

  const handlePress = () => {
    setResults([...results, { level: CONTRAST_LEVELS[level], letter }]);
    if (level < CONTRAST_LEVELS.length - 1) {
      setLevel(level + 1);
      setLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    } else {
      // End of test
      alert(`Test complete! Your lowest contrast level was ${CONTRAST_LEVELS[level]}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.letter, { opacity: CONTRAST_LEVELS[level] }]}>
        {letter}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>I can see it</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  letter: {
    fontSize: 100,
    fontWeight: 'bold',
    color: 'black',
  },
  button: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  }
});
