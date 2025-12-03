// LangChain + OpenAI wrapper with error handling

const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class LangChainClient {
  constructor() {
    this.model = null;
    this.initialized = false;
  }

  initialize() {
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

module.exports = client;
