// Vercel AI SDK + HuggingFace with gateway fallback
// Primary: HuggingFace Inference API
// Fallback: shared-ai-gateway (when HuggingFace fails)

import { generateText } from 'ai';
import { createHuggingFace } from '@ai-sdk/huggingface';

class AIClient {
  constructor() {
    this.huggingface = null;
    this.initialized = false;
    this.model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
    this.gatewayUrl = process.env.AI_GATEWAY_URL || null;
  }

  initialize() {
    // Need at least one provider configured
    if (!process.env.HUGGINGFACE_API_KEY && !this.gatewayUrl) {
      console.warn('No AI provider configured - AI features disabled');
      return false;
    }

    try {
      if (process.env.HUGGINGFACE_API_KEY) {
        this.huggingface = createHuggingFace({
          apiKey: process.env.HUGGINGFACE_API_KEY,
        });
        console.log('HuggingFace initialized with model:', this.model);
      }

      if (this.gatewayUrl) {
        console.log('AI Gateway fallback configured:', this.gatewayUrl);
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AI client:', error);
      return false;
    }
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

    // Try HuggingFace first, fall back to gateway
    if (this.huggingface) {
      try {
        return await this.generateWithHuggingFace(formattedPrompt);
      } catch (error) {
        console.warn('HuggingFace failed, trying gateway fallback:', error.message);
        if (this.gatewayUrl) {
          return await this.generateWithGateway(formattedPrompt);
        }
        throw error;
      }
    } else if (this.gatewayUrl) {
      return await this.generateWithGateway(formattedPrompt);
    }

    throw new Error('No AI provider available');
  }

  async generateWithHuggingFace(prompt) {
    const { text } = await generateText({
      model: this.huggingface(this.model),
      prompt: prompt,
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
    });
    return text;
  }

  async generateWithGateway(prompt) {
    try {
      const response = await fetch(`${this.gatewayUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          app: 'bookmarks',
          maxTokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Gateway generation error:', error);

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
