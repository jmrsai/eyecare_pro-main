
// hooks/useDistance.ts
import { useState, useEffect } from 'react';
import { useCalibration } from './useCalibration';

const TARGET_DISTANCE_CM = 40;
const AVG_FACE_WIDTH_CM = 14.5; // Average adult face width

/**
 * A custom hook to estimate distance from the screen using face detection data.
 */
export const useDistance = (faceWidthPixels?: number) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [isAtTargetDistance, setIsAtTargetDistance] = useState(false);
  const { ppi } = useCalibration();

  useEffect(() => {
    if (!faceWidthPixels || !ppi) return;

    // Distance Calculation (simplified pinhole camera model)
    // Distance = (Real Width * Focal Length) / Pixel Width
    // Since focal length is device-specific, we use a heuristic based on PPI.
    // Approximate focal length in pixels: focalLengthPx = someConstant * ppi
    
    const faceWidthMm = faceWidthPixels * (25.4 / ppi);
    // Rough estimation: distance = (known_width * approximate_focal_length) / width_on_screen
    // A typical phone front camera has a focal length around 25-30mm (full frame equiv)
    // For estimation, we use the property that at 40cm, a 14.5cm face covers ~1/3 of the screen width.
    
    const estimatedDistanceCm = (AVG_FACE_WIDTH_CM * 1000) / faceWidthMm; // Simplified heuristic
    
    // Clamp values
    const finalDistance = Math.min(Math.max(estimatedDistanceCm, 10), 200);
    
    setDistance(finalDistance);
    setIsAtTargetDistance(Math.abs(finalDistance - TARGET_DISTANCE_CM) < 5);
  }, [faceWidthPixels, ppi]);

  return { distance, isAtTargetDistance };
};
