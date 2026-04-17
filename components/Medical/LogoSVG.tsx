import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function LogoSVG({ size = 100, color = '#3B82F6' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      
      {/* Outer Circle */}
      <Circle cx="50" cy="50" r="48" stroke="url(#grad)" strokeWidth="4" />
      
      {/* Eye Shape */}
      <Path 
        d="M20 50C20 50 35 30 50 30C65 30 80 50 80 50C80 50 65 70 50 70C35 70 20 50 20 50Z" 
        stroke="url(#grad)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Pupil */}
      <Circle cx="50" cy="50" r="10" fill="url(#grad)" />
      
      {/* Medical Cross Overlay */}
      <Path 
        d="M50 15V25M45 20H55" 
        stroke="url(#grad)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </Svg>
  );
}
