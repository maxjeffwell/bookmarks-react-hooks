// LangChain + OpenAI wrapper with error handling
// Supports both OpenAI and local AI (OpenVINO) backends

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Use Node.js built-in fetch (available in Node 18+)
const fetch = global.fetch || (async () => {
  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
})();

class LangChainClient {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.useLocalAI = process.env.USE_LOCAL_AI === 'true';
    this.localAIUrl = process.env.LOCAL_AI_URL || process.env.AI_GATEWAY_URL || 'http://shared-ai-gateway:8002';
  }

  initialize() {
    // If using local AI, we don't need OpenAI credentials
    if (this.useLocalAI) {
      console.log('Using local AI gateway at:', this.localAIUrl);
      this.initialized = true;
      return true;
    }

    // Otherwise, initialize OpenAI via LangChain
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found - AI features disabled');
      return false;
    }

    try {
      this.model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      });

      this.initialized = true;
      console.log('LangChain client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize LangChain client:', error);
      return false;
    }
  }

  async generateCompletion(prompt, context) {
    if (!this.initialized) {
      throw new Error('LangChain client not initialized');
    }

    // Route to local AI or OpenAI based on configuration
    if (this.useLocalAI) {
      return await this.generateWithLocalAI(prompt, context);
    } else {
      return await this.generateWithOpenAI(prompt, context);
    }
  }

  async generateWithLocalAI(prompt, context) {
    try {
      // Replace template variables in the prompt
      let formattedPrompt = prompt;
      for (const [key, value] of Object.entries(context)) {
        formattedPrompt = formattedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }

      const fetchFn = typeof fetch === 'function' ? fetch : await fetch;
      const response = await fetchFn(`${this.localAIUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formattedPrompt,
          app: 'bookmarks',
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500')
        })
      });

      if (!response.ok) {
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Local AI generation error:', error);

      // Provide user-friendly error messages
      if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('Local AI gateway is not available. Check if shared-ai-gateway is running.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }

      throw error;
    }
  }

  async generateWithOpenAI(prompt, context) {
    try {
      const promptTemplate = PromptTemplate.fromTemplate(prompt);
      const chain = promptTemplate.pipe(this.model).pipe(new StringOutputParser());

      const response = await chain.invoke(context);
      return response;
    } catch (error) {
      console.error('LangChain generation error:', error);

      // Provide user-friendly error messages
      if (error.message?.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('authentication')) {
        throw new Error('OpenAI authentication failed. Check your API key.');
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
const client = new LangChainClient();

export default client;
