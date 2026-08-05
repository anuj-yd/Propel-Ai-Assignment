const { GoogleGenerativeAI } = require('@google/generative-ai');

class AiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async generateCrewBriefing(faultType, boundary, pincode) {
    if (!this.apiKey) {
      console.warn('[AiService] No GEMINI_API_KEY found. Degrading to standard automated message.');
      return `Automated Priority: Standard. Fault Type: ${faultType}. Ensure crew checks all poles in the boundary at Pincode ${pincode}.`;
    }

    try {
      console.log(`[AiService] Generating AI briefing using Gemini for fault ${faultType}...`);
      
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are an AI assistant for a power utility control room. Keep responses extremely short, max 2 sentences."
      });

      const prompt = `A new fault has been detected.
              Fault Type: ${faultType}
              Boundary Poles: ${boundary.join(', ')}
              Pincode Location: ${pincode}
              
              Generate a concise, 2-line priority summary and crew briefing. State the Priority (High/Medium/Low) based on the fault type (Feeder faults are High, DT are High, Span are Medium), and recommend what the repair crew should bring (e.g. ladder, replacement wire, transformer fuse).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text.trim();
    } catch (error) {
      console.error('[AiService] Error generating AI briefing:', error.message);
      // Fallback in case of API failure (network issue, quota exceeded, etc.)
      return `Automated Priority: Standard. Fault Type: ${faultType}. Please inspect boundary poles manually.`;
    }
  }
}

module.exports = new AiService();
