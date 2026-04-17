
// services/ClinicalLogic.ts

/**
 * A service for converting raw diagnostic data into clinically meaningful results.
 */
export const ClinicalLogic = {
  /**
   * Converts a Snellen fraction (e.g., "20/40") to a LogMAR value.
   * @param snellen - The Snellen fraction as a string.
   * @returns The LogMAR value.
   */
  convertSnellenToLogMAR: (snellen: string): number => {
    const parts = snellen.split('/');
    if (parts.length !== 2) {
      throw new Error('Invalid Snellen fraction format.');
    }
    const numerator = parseInt(parts[0], 10);
    const denominator = parseInt(parts[1], 10);

    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        throw new Error('Invalid Snellen fraction values.');
    }

    return Math.log10(denominator / numerator);
  },

  // Other clinical logic functions can be added here.
};
