
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export const generatePdfReport = async (testResults: any) => {
  // In a real app, you'd format the results into a more professional HTML layout
  const html = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #333; }
          .results-section { margin-bottom: 20px; }
          .results-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
          .result-item { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <h1>Vision Test Report</h1>
        
        <div class="results-section">
          <div class="results-title">Amsler Grid</div>
          <div class="result-item">
            Distortions Recorded: ${testResults.amslerGrid?.distortions?.length || 0}
          </div>
        </div>

        <div class="results-section">
            <div class="results-title">Contrast Sensitivity</div>
            <div class="result-item">
                Score: ${testResults.contrastSensitivity?.score || 'N/A'}
            </div>
        </div>

        <div class="results-section">
            <div class="results-title">Saccadic Training</div>
            <div class="result-item">
                Accuracy: ${testResults.saccadicTraining?.accuracy || 'N/A'}
            </div>
        </div>

      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error("Failed to generate or share PDF report", error);
  }
};
