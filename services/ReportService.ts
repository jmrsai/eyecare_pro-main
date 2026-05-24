
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// This is a placeholder for the data you would be passing in.
// In a real app, you would fetch this from your state management or database.
const placeholderResults = {
  patientName: 'John Doe',
  testDate: new Date().toLocaleDateString(),
  visualAcuity: '20/25',
  amslerGrid: 'No distortions reported',
  colorVision: 'Normal',
};

const generateHtml = (results: any) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .qr-code { text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>Clinical Vision Report</h1>
        <p><strong>Patient:</strong> ${results.patientName}</p>
        <p><strong>Date:</strong> ${results.testDate}</p>
        
        <h2>Test Results</h2>
        <table>
          <tr>
            <th>Test</th>
            <th>Result</th>
          </tr>
          <tr>
            <td>Visual Acuity</td>
            <td>${results.visualAcuity}</td>
          </tr>
          <tr>
            <td>Amsler Grid</td>
            <td>${results.amslerGrid}</td>
          </tr>
          <tr>
            <td>Color Vision</td>
            <td>${results.colorVision}</td>
          </tr>
        </table>

        <div class="qr-code">
          <p>Scan for detailed results:</p>
          <!-- In a real implementation, you would generate a QR code pointing to a secure URL -->
          <!-- For now, we'll use a placeholder image -->
          <img src="https://i.imgur.com/gFeCfvw.png" alt="QR Code" width="150" height="150">
        </div>
      </body>
    </html>
  `;
};

export const createAndSharePdf = async () => {
  const html = generateHtml(placeholderResults);
  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    }
  } catch (error) {
    console.error("Failed to create and share PDF:", error);
  }
};
