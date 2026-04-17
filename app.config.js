export default {
  expo: {
    name: "EyeCare Pro",
    slug: "eyecare-pro",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.eyecare.pro",
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSCameraUsageDescription: "EyeCare Pro needs access to your camera for eye health screening and prescription scanning.",
        NSFaceIDUsageDescription: "EyeCare Pro uses Face ID to securely protect your eye health records."
      }
    },
    android: {
      package: "com.eyecare.pro",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "NOTIFICATIONS",
        "SCHEDULE_EXACT_ALARM",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-sqlite",
      "expo-localization",
      "expo-notifications",
      "expo-camera",
      "expo-local-authentication",
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/SpaceMono-Regular.ttf"
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "3db747e7-82ba-4ba8-baf2-258a5591e49c"
      }
    },
    owner: "opthas"
  }
};
