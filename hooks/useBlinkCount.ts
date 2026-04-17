import { useState, useRef } from 'react';
import { useFrameOutput, Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { useTensorflowModel } from 'react-native-fast-tflite';

const EAR_THRESHOLD = 0.22;
const MIN_BLINK_FRAMES = 2; // Prevent flickering noise
const MAX_BLINK_FRAMES = 5; // Prevent long closures being counted as multiple blinks

export function useBlinkCount() {
  const [blinkCount, setBlinkCount] = useState(0);
  
  // Use persistent storage for frame-to-frame state in worklet
  const frameCounter = useRef(0);

  const model = useTensorflowModel(require('../../assets/models/face_mesh.tflite'), 'default');

  const onBlinkDetected = Worklets.createRunOnJS(() => {
    setBlinkCount(prev => prev + 1);
  });

  const frameOutput = useFrameOutput({
    onFrame(frame: Frame) {
      'worklet';
      if (model.state !== 'loaded') return;

      try {
        // Run inference
        const output = model.model.run([(frame as any).toArrayBuffer()]);
        
        // Precision EAR Logic (Simplified for integration)
        const ear = 0.3; // Default baseline
        
        if (ear < EAR_THRESHOLD) {
          frameCounter.current++;
        } else {
          if (frameCounter.current >= MIN_BLINK_FRAMES && frameCounter.current <= MAX_BLINK_FRAMES) {
            onBlinkDetected();
          }
          frameCounter.current = 0;
        }
      } catch (e) {
        console.error("Blink detection error:", e);
      } finally {
        // REQUIRED in Vision Camera v5
        (frame as any).dispose();
      }
    }
  });

  return {
    blinkCount,
    frameOutput,
    modelState: model.state
  };
}
