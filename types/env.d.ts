declare module 'react-native-vision-camera' {
  export interface Frame {
    toArrayBuffer(): ArrayBuffer;
    width: number;
    height: number;
  }
  export function useFrameProcessor(callback: (frame: Frame) => void, dependencies: any[]): any;
}

declare module 'react-native-fast-tflite' {
  export function useTensorflowModel(path: any, delegate?: string): any;
}

declare module 'react-native-worklets-core' {
  export const Worklets: {
    createRunOnJS: <T extends (...args: any[]) => any>(fn: T) => T;
  };
}
