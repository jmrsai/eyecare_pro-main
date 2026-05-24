
const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// IMPORTANT: The user should set this in their Firebase environment
// firebase functions:secrets:set GEMINI_API_KEY
// Locally, use a .env file in the functions directory
const API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features may not work.");
}
const genAI = new GoogleGenerativeAI(API_KEY || "dummy_key");

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
    let parsed = null;
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        console.error("JSON parse error on match:", e);
      }
    }
    
    // If parsing failed, try direct parse or fallback
    if (!parsed) {
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("Direct JSON parse error:", e);
      }
    }

    // Default fallback structure if parsing failed completely
    if (!parsed || !parsed.results) {
      parsed = {
        results: [
          { condition: "Ocular Discomfort", probability: 0.8, recommendation: "Your description indicates general ocular strain. Take frequent breaks and keep eyes hydrated." }
        ],
        disclaimer: "Could not perform detailed diagnostic classification. Please consult a clinician."
      };
    }

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
