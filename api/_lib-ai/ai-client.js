// AI Client - calls shared-ai-gateway for all AI operations
// Gateway handles tier fallback: HuggingFace → VPS CPU → RunPod

class AIClient {
  constructor() {
    this.initialized = false;
    this.gatewayUrl = process.env.AI_GATEWAY_URL || null;
  }

  initialize() {
    if (!this.gatewayUrl) {
      console.warn('AI_GATEWAY_URL not configured - AI features disabled');
      return false;
    }

    console.log('AI client initialized with gateway:', this.gatewayUrl);
    this.initialized = true;
    return true;
  }

  async generateCompletion(prompt, context) {
    if (!this.initialized) {
      throw new Error('AI client not initialized');
    }

    // Replace template variables in the prompt
    let formattedPrompt = prompt;
    for (const [key, value] of Object.entries(context)) {
      formattedPrompt = formattedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    try {
      const response = await fetch(`${this.gatewayUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formattedPrompt,
          app: 'bookmarks',
          maxTokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI Gateway error ${response.status}: ${error}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI generation error:', error);

      if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('AI Gateway is not available.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }

      throw error;
    }
  }

  isAvailable() {
    return this.initialized;
  }
}

// Singleton instance
const client = new AIClient();

export default client;
