import { useState } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useFrameOutput, Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

/**
 * EYECARE PRO - VISION CAMERA V5 ARCHITECTURE
 * -------------------------------------------
 * IMPORTANT: useFrameProcessor was removed in Vision Camera v5.
 * We MUST use useFrameOutput and call frame.dispose() to prevent pipeline stalls.
 */

// Average human interpupillary distance (IPD) is 63mm
const AVG_IPD_MM = 63;
const TARGET_DISTANCE_CM = 40;
const TOLERANCE_CM = 5;

export function useFaceDistance() {
  const [distance, setDistance] = useState<number | null>(null);
  const [isDistanceCorrect, setIsDistanceCorrect] = useState(false);
  
  // Load the MediaPipe Face Mesh model
  const model = useTensorflowModel(require('../../assets/models/face_mesh.tflite'), 'default');

  const onDistanceUpdate = Worklets.createRunOnJS((d: number) => {
    setDistance(Math.round(d));
    setIsDistanceCorrect(Math.abs(d - TARGET_DISTANCE_CM) <= TOLERANCE_CM);
  });

  const frameOutput = useFrameOutput({
    onFrame(frame: Frame) {
      'worklet';
      if (model.state !== 'loaded') return;

      try {
        // Run inference
        const output = model.model.run([(frame as any).toArrayBuffer()]);
        
        // Landmark processing placeholder
        const leftIrisX = 100; 
        const rightIrisX = 200; 
        const pixelDistance = Math.abs(rightIrisX - leftIrisX);
        
        const focalLength = 500; 
        const estimatedDistanceCm = (focalLength * AVG_IPD_MM) / (pixelDistance * 10);
        
        onDistanceUpdate(estimatedDistanceCm);
      } catch (e) {
        console.error("Distance Frame Error:", e);
      } finally {
        // REQUIRED in V5 to avoid memory leaks
        (frame as any).dispose();
      }
    }
  });

  return {
    distance,
    isDistanceCorrect,
    frameOutput, // Migrated to V5
    modelState: model.state
  };
}
