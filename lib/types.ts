export interface TestResult {
  date: string;
  score: number;
  type?: string;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  title: string;
  intensity: 'Low' | 'Medium' | 'High';
  reason: string;
  targetFocus: string;
}

export interface Insight {
  type: 'Positive' | 'Caution' | 'Action';
  title: string;
  message: string;
  impactLevel: 'Low' | 'Medium' | 'High';
}
