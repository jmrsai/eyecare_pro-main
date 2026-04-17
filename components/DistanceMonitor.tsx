
import React from 'react';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

export const DistanceMonitor = ({ onDistanceChange }) => {
  const handleFacesDetected = ({ faces }) => {
    if (faces.length > 0) {
      const face = faces[0];
      // Average human IPD is ~63mm. We use the distance between 
      // detected eye landmarks to estimate screen distance.
      const eyeDist = Math.sqrt(
        Math.pow(face.leftEyePosition.x - face.rightEyePosition.x, 2) +
        Math.pow(face.leftEyePosition.y - face.rightEyePosition.y, 2)
      );
      
      // Heuristic: Distance (cm) = (Constant / eyeDistInPixels)
      // You must calibrate this constant per device category
      const estimatedCm = (2500 / eyeDist); 
      onDistanceChange(estimatedCm);
    }
  };

  return (
    <Camera
      style={{ height: 1, width: 1 }} // Keep it "invisible" for background monitoring
      type={Camera.Constants.Type.front}
      onFacesDetected={handleFacesDetected}
      faceDetectorSettings={{
        mode: FaceDetector.FaceDetectorMode.accurate,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      }}
    />
  );
};
