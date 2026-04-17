import { useState, useEffect, useCallback } from 'react';
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

    // Run inference
    const output = model.model.run([frame.toArrayBuffer()]);
    
    // MediaPipe Face Mesh output parsing (simplified for logic)
    // Landmarks for irises are usually 468-472 and 473-477
    // We calculate the pixel distance between left and right iris centers
    
    // Dummy logic for demonstration of the CV pipeline
    // In a real implementation, we would extract specific landmark coordinates from the tensor output
    const leftIrisX = 100; // placeholder
    const rightIrisX = 200; // placeholder
    const pixelDistance = Math.abs(rightIrisX - leftIrisX);
    
    // Formula: Distance = (FocalLength * IPD_mm) / PixelDistance
    // Calibrated FocalLength (placeholder)
    const focalLength = 500; 
    const estimatedDistanceCm = (focalLength * AVG_IPD_MM) / (pixelDistance * 10);
    
    onDistanceUpdate(estimatedDistanceCm);
  }, [model]);

  return {
    distance,
    isDistanceCorrect,
    frameProcessor,
    modelState: model.state
  };
}
