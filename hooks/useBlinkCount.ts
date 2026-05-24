import { useState } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useFrameOutput, Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

/**
 * EYECARE PRO - VISION CAMERA V5 ARCHITECTURE
 */

export function useBlinkCount() {
  const [blinkCount, setBlinkCount] = useState(0);
  const model = useTensorflowModel(require('../assets/models/face_mesh.tflite'), 'default');

  const onBlink = Worklets.createRunOnJS(() => {
    setBlinkCount(prev => prev + 1);
  });

  const frameOutput = useFrameOutput({
    onFrame(frame: Frame) {
      'worklet';
      if (model.state !== 'loaded') return;

      try {
        const output = model.model.run([(frame as any).toArrayBuffer()]);
        
        // Eye Aspect Ratio (EAR) logic placeholder
        const ear = 0.25; 
        if (ear < 0.2) {
          onBlink();
        }
      } catch (e) {
        console.error("Blink Frame Error:", e);
      } finally {
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
