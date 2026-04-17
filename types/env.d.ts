

declare module 'react-native-fast-tflite' {
  export function useTensorflowModel(path: any, delegate?: string): any;
}

declare module 'react-native-worklets-core' {
  export const Worklets: {
    createRunOnJS: <T extends (...args: any[]) => any>(fn: T) => T;
  };
}
