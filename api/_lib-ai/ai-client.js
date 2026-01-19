// Vercel AI SDK + HuggingFace wrapper
// Lightweight replacement for LangChain with faster cold starts

import { generateText } from 'ai';
import { createHuggingFace } from '@ai-sdk/huggingface';

class AIClient {
  constructor() {
    this.huggingface = null;
    this.initialized = false;
    this.model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
  }

  initialize() {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn('HuggingFace API key not found - AI features disabled');
      return false;
    }

    try {
      this.huggingface = createHuggingFace({
        apiKey: process.env.HUGGINGFACE_API_KEY,
      });

      this.initialized = true;
      console.log('AI client initialized with model:', this.model);
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

    try {
      const { text } = await generateText({
        model: this.huggingface(this.model),
        prompt: formattedPrompt,
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
      });

      return text;
    } catch (error) {
      console.error('AI generation error:', error);

      // Provide user-friendly error messages
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('authentication') || error.message?.includes('401')) {
        throw new Error('HuggingFace authentication failed. Check your API key.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message?.includes('model') && error.message?.includes('not found')) {
        throw new Error(`Model ${this.model} not found. Check HF_MODEL environment variable.`);
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
