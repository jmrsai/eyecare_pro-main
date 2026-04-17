
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, GestureResponderEvent } from 'react-native';
import { GLView } from 'expo-gl';

interface Distortion {
  x: number;
  y: number;
}

const MacularHealth = ({ navigation }: { navigation: any }) => {
  const [distortions, setDistortions] = useState<Distortion[]>([]);
  const onContextCreate = (gl: any) => {
    // Drawing logic for the Amsler Grid
    const drawGrid = () => {
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Simple grid drawing logic
      // In a real app, this would be more complex and precise
      const lines = 20;
      const step = gl.drawingBufferWidth / lines;
      
      // A simple vertex shader
      const vertSrc = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;
      
      // A simple fragment shader
      const fragSrc = `
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
      `;

      // Compile and link shaders to create a program
      const vertShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertShader, vertSrc);
      gl.compileShader(vertShader);

      const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragShader, fragSrc);
      gl.compileShader(fragShader);

      const program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const positionAttrib = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionAttrib);

      // Draw grid lines
      for (let i = 0; i < lines; i++) {
        const vertices = new Float32Array([
          -1 + step * i / (gl.drawingBufferWidth / 2), -1, 
          -1 + step * i / (gl.drawingBufferWidth / 2), 1,
          -1, -1 + step * i / (gl.drawingBufferHeight / 2),
          1, -1 + step * i / (gl.drawingBufferHeight / 2),
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, 4);
      }
      
      gl.endFrameEXP();
    };

    drawGrid();
  };

  const handlePress = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    setDistortions([...distortions, { x: locationX, y: locationY }]);
  };

  const saveAndExit = () => {
    // Here you would save the distortion data
    console.log('Distortions:', distortions);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.glContainer}>
        <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
        {distortions.map((d, i) => (
          <View key={i} style={[styles.distortionMarker, { left: d.x - 5, top: d.y - 5 }]} />
        ))}
      </Pressable>
      <Pressable style={styles.button} onPress={saveAndExit}>
        <Text style={styles.buttonText}>Save and Exit</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  glContainer: { flex: 1 },
  distortionMarker: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: 'red' },
  button: { backgroundColor: '#007bff', padding: 15, alignItems: 'center', justifyContent: 'center', margin: 20 },
  buttonText: { color: 'white', fontSize: 16 },
});

export default MacularHealth;
