import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BlinkingOwlScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blinking Owl</Text>
      <Text>Therapy coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
