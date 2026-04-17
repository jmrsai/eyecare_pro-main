
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Standard Credit Card is 85.6mm wide.
 * User aligns a digital box with their physical card.
 */
export const calculatePPI = (cardWidthInPixels: number): number => {
  const CARD_WIDTH_MM = 85.6;
  const pixelsPerMm = cardWidthInPixels / CARD_WIDTH_MM;
  return pixelsPerMm * 25.4; // Returns PPI
};

export const getMmToPixel = (mm: number, ppi: number): number => {
  return (mm / 25.4) * ppi;
};

// Example: 20/20 Snellen 'E' must be 8.73mm tall at 6 meters (scaled for phone distance)
