
const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// IMPORTANT: The user should set this in their Firebase environment
// firebase functions:config:set gemini.key="YOUR_API_KEY"
const API_KEY = functions.config().gemini ? functions.config().gemini.key : "YOUR_FALLBACK_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

exports.chat = functions.https.onCall(async (data, context) => {
  const userMessage = data.message;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert Eye Care Assistant. A user is reporting symptoms: "${userMessage}".
      
      Analyze the symptoms and provide a JSON response with:
      1. 'results': An array of top 3 possible conditions. Each condition should have:
         - 'condition': Name of the condition.
         - 'probability': A number between 0 and 1.
         - 'recommendation': Specific advice for this condition.
      2. 'disclaimer': A strong medical disclaimer.

      Format strictly as JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the JSON from Gemini's response
    const jsonStr = text.match(/\{[\s\S]*\}/)[0];
    const parsed = JSON.parse(jsonStr);

    return {
      results: parsed.results || [],
      disclaimer: parsed.disclaimer || 'This is not a medical diagnosis. Please consult a qualified professional.'
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback to basic logic if AI fails
    return {
      results: [
        { condition: "Consultation Required", probability: 1.0, recommendation: "We are unable to analyze your symptoms right now. Please see a doctor." }
      ],
      disclaimer: "System error during analysis."
    };
  }
});
