# EyeCare Pro

A comprehensive eye health diagnosis and vision care mobile application built with React Native and Expo.

## Overview

EyeCare Pro is a world-class eye health platform that combines clinical-grade screening tools, therapeutic exercises, gamified learning for children, and advanced support features. The application serves users across all ages and visual abilities with cutting-edge technology and evidence-based approaches.

## Key Features

### 🔬 Clinical-Grade Diagnostic Tests (9 Tests)
- Visual Acuity Test (Snellen charts)
- Color Vision Test (Ishihara plates)
- Astigmatism Test
- Amsler Grid Test
- Contrast Sensitivity Test
- Visual Field Test (Perimetry)
- Pupil Response Test
- Reading Speed Test
- Duochrome (Bichrome) Test

### 💪 Vision Therapy & Exercise Suite (7 Programs)
- Quick Screen Break (2-min)
- Digital Eye Strain Relief (8-min)
- Morning Reset (5-min)
- Focus Endurance Training (12-min)
- Post-Work De-Stresser (10-min)
- Saccadic Eye Movement Training (5-min)
- Clinical Vision Therapy (15-min)

### 🎮 Kids Mode - PediaVision Pals (5 Games)
- Jungle Explorer
- Cosmic Racer
- Lily Pad Leap
- Hungry Chameleon
- Spot the Difference

### 📊 Results & Progress Tracking
- Comprehensive test history
- Trend analysis and visualizations
- Performance metrics
- Achievement badges
- Streak tracking

### 📚 Education & Prevention Hub
- Eye health guides
- Disease information
- Nutrition tips
- Digital eye strain management
- Protective measures

## Technology Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Hooks + AsyncStorage
- **Animations**: React Native Reanimated 3.17
- **UI Components**: Custom components with Material Design
- **Icons**: Lucide React Native
- **Backend Ready**: Supabase integration

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for web
npm run build:web
```

## Project Structure

```
eyecare-pro/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── tests/             # Diagnostic test screens
│   ├── exercises/         # Exercise program screens
│   └── kids/              # Kids games screens
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── assets/               # Images and static files
└── types/                # TypeScript type definitions
```

## Features Documentation

For comprehensive feature documentation, see [FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)

## Medical Disclaimer

This application is intended for educational and screening purposes only. It is NOT a substitute for professional medical examination, diagnosis, or treatment. Always consult with a qualified eye care professional for comprehensive eye examinations and medical advice.

## License

Copyright © 2025 EyeCare Technologies. All rights reserved.

## Version

**Version**: 1.0.0
**Status**: Beta - Ready for clinical validation
