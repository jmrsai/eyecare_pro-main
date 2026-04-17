import { useState } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useFrameProcessor, Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

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

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    if (model.state !== 'loaded') return;

    try {
      // Logic for iris processing using the model
      const leftIrisX = 100; // placeholder
      const rightIrisX = 200; // placeholder
      const pixelDistance = Math.abs(rightIrisX - leftIrisX);
      
      const focalLength = 500; 
      const estimatedDistanceCm = (focalLength * AVG_IPD_MM) / (pixelDistance * 10);
      
      onDistanceUpdate(estimatedDistanceCm);
    } catch (e) {
      console.error("Frame processing error:", e);
    }
  }, [model]);

  return {
    distance,
    isDistanceCorrect,
    frameProcessor,
    modelState: model.state
  };
}
