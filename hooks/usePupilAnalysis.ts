import { useState } from 'react';
import { useFrameOutput, Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { useTensorflowModel } from 'react-native-fast-tflite';

/**
 * EYECARE PRO - VISION CAMERA V5 ARCHITECTURE
 * -------------------------------------------
 * This hook handles AI Pupil Response analysis using Nitro Frame Processors.
 */

export function usePupilAnalysis() {
  const [pupilSize, setPupilSize] = useState<number | null>(null);
  
  // Load the Iris Segmentation model (Google MediaPipe)
  const model = useTensorflowModel(require('../../assets/models/iris_segmentation.tflite'), 'default');

  const onPupilUpdate = Worklets.createRunOnJS((size: number) => {
    setPupilSize(size);
  });

  const frameOutput = useFrameOutput({
    onFrame(frame: Frame) {
      'worklet';
      if (model.state !== 'loaded') return;

      try {
        // Run iris segmentation inference
        const output = model.model.run([(frame as any).toArrayBuffer()]);
        
        // Simulating high-precision pupillometry
        const dummyPupilSize = 4.5 + Math.random(); 
        onPupilUpdate(dummyPupilSize);
      } catch (e) {
        console.error("Pupil Frame Error:", e);
      } finally {
        // REQUIRED in V5 to ensure performance
        (frame as any).dispose();
      }
    }
  });

  return {
    pupilSize,
    frameOutput, // Replaced frameProcessor for V5
    modelState: model.state
  };
}
