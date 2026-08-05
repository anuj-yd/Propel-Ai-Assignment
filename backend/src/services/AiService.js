const OpenAI = require('openai');

class AiService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  async generateCrewBriefing(faultType, boundary, pincode) {
    // Graceful degradation if API key is missing
    if (!this.apiKey) {
      console.warn('[AiService] No OPENAI_API_KEY found. Degrading to standard automated message.');
      return `Automated Priority: Standard. Fault Type: ${faultType}. Ensure crew checks all poles in the boundary at Pincode ${pincode}.`;
    }

    try {
      console.log(`[AiService] Generating AI briefing using OpenAI for fault ${faultType}...`);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for a power utility control room. Keep responses extremely short, max 2 sentences."
          },
          {
            role: "user",
            content: `A new fault has been detected.
              Fault Type: ${faultType}
              Boundary Poles: ${boundary.join(', ')}
              Pincode Location: ${pincode}
              
              Generate a concise, 2-line priority summary and crew briefing. State the Priority (High/Medium/Low) based on the fault type (Feeder faults are High, DT are High, Span are Medium), and recommend what the repair crew should bring (e.g. ladder, replacement wire, transformer fuse).`
          }
        ],
        temperature: 0.2,
      });

      const text = response.choices[0].message.content;
      return text.trim();
    } catch (error) {
      console.error('[AiService] Error generating AI briefing:', error.message);
      // Fallback in case of API failure (network issue, quota exceeded, etc.)
      return `Automated Priority: Standard. Fault Type: ${faultType}. Please inspect boundary poles manually.`;
    }
  }
}

module.exports = new AiService();
