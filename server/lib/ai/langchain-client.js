import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

class LangChainClient {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.useLocalAI = process.env.USE_LOCAL_AI === 'true';
    this.localAIUrl = process.env.LOCAL_AI_URL || 'http://bookmarked-ai-engine:8001';
  }

  initialize() {
    if (this.useLocalAI) {
      console.log('Using Local OpenVINO AI Engine at ' + this.localAIUrl);
      this.initialized = true;
      return true;
    }

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
      console.log('LangChain client initialized with OpenAI successfully');
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

    const filledPrompt = prompt.replace(/{(\w+)}/g, (_, key) => context[key] || '');

    if (this.useLocalAI) {
      try {
        console.log('Sending request to local AI: ' + this.localAIUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

        const response = await fetch(this.localAIUrl + '/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: filledPrompt,
            max_new_tokens: 200
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        
        const data = await response.json();
        return data.response;
      } catch (error) {
        console.error('Local AI generation error: ' + error.message);
        throw new Error('Local AI failed to respond');
      }
    }

    try {
      const promptTemplate = PromptTemplate.fromTemplate(prompt);
      const chain = promptTemplate.pipe(this.model).pipe(new StringOutputParser());

      const response = await chain.invoke(context);
      return response;
    } catch (error) {
      console.error('LangChain generation error:', error);
      throw error;
    }
  }

  isAvailable() {
    return this.initialized;
  }
}

const client = new LangChainClient();
export default client;
