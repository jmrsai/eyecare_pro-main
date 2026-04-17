# EyeCare Pro AI Models

This directory contains the TFLite models used for advanced computer vision diagnostics.

## Required Models

1.  **Face Mesh (`face_mesh.tflite`)**:
    *   **Purpose**: 468-point face landmark detection.
    *   **Usage**: Distance monitoring, blink detection, and iris tracking.
    *   **Source**: Google MediaPipe.

2.  **Iris Segmentation (`iris_segmentation.tflite`)**:
    *   **Purpose**: Precise pupil and iris boundary detection.
    *   **Usage**: Pupil response tests and medically accurate IPD calibration.
    *   **Source**: Google MediaPipe.

3.  **Pupil Response (`pupil_net.tflite`)**:
    *   **Purpose**: Neural network trained to detect pupil constriction percentages.
    *   **Usage**: Automated neurological screening.
    *   **Status**: Experimental.

## Integration Guide

All models must be registered in `app.config.js` to be bundled with the application.

```javascript
plugins: [
  [
    "expo-asset",
    {
      assets: ["./assets/models/face_mesh.tflite"]
    }
  ]
]
```
