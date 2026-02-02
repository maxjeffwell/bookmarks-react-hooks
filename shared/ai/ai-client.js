// Unified AI Client - supports multiple backends:
// 1. AI Gateway (Vercel/K8s) - when AI_GATEWAY_URL is set
// 2. Local AI Gateway (K8s) - when USE_LOCAL_AI=true
// 3. Direct OpenAI via LangChain - when OPENAI_API_KEY is set

let ChatOpenAI, PromptTemplate, StringOutputParser;

// Dynamically import LangChain (may not be available in all environments)
const initLangChain = async () => {
  try {
    const openaiModule = await import('@langchain/openai');
    const promptsModule = await import('@langchain/core/prompts');
    const parsersModule = await import('@langchain/core/output_parsers');
    ChatOpenAI = openaiModule.ChatOpenAI;
    PromptTemplate = promptsModule.PromptTemplate;
    StringOutputParser = parsersModule.StringOutputParser;
    return true;
  } catch (e) {
    console.log('LangChain not available - using gateway only');
    return false;
  }
};

class AIClient {
  constructor() {
    this.initialized = false;
    this.mode = null; // 'gateway', 'local-gateway', 'openai'
    this.model = null;
    this.gatewayUrl = null;
  }

  async initialize() {
    // Priority 1: AI Gateway URL (Vercel deployment)
    if (process.env.AI_GATEWAY_URL) {
      this.gatewayUrl = process.env.AI_GATEWAY_URL;
      this.mode = 'gateway';
      this.initialized = true;
      console.log('AI client initialized with Gateway:', this.gatewayUrl);
      return true;
    }

    // Priority 2: Local AI Gateway (K8s deployment with USE_LOCAL_AI=true)
    if (process.env.USE_LOCAL_AI === 'true') {
      this.gatewayUrl = process.env.LOCAL_AI_URL || 'http://shared-ai-gateway:8002';
      this.mode = 'local-gateway';
      this.initialized = true;
      console.log('AI client initialized with Local Gateway:', this.gatewayUrl);
      return true;
    }

    // Priority 3: Direct OpenAI via LangChain
    if (process.env.OPENAI_API_KEY) {
      const langChainAvailable = await initLangChain();
      if (langChainAvailable) {
        try {
          this.model = new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
          });
          this.mode = 'openai';
          this.initialized = true;
          console.log('AI client initialized with OpenAI directly');
          return true;
        } catch (error) {
          console.error('Failed to initialize OpenAI:', error);
        }
      }
    }

    console.warn('No AI backend configured - AI features disabled');
    console.warn('Set AI_GATEWAY_URL, USE_LOCAL_AI=true, or OPENAI_API_KEY');
    return false;
  }

  async generateCompletion(prompt, context) {
    if (!this.initialized) {
      throw new Error('AI client not initialized');
    }

    // Replace template variables in the prompt
    let filledPrompt = prompt;
    for (const [key, value] of Object.entries(context)) {
      filledPrompt = filledPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
    }

    // Gateway modes (both remote and local)
    if (this.mode === 'gateway' || this.mode === 'local-gateway') {
      return this._generateViaGateway(filledPrompt, context);
    }

    // Direct OpenAI mode
    if (this.mode === 'openai') {
      return this._generateViaOpenAI(prompt, context);
    }

    throw new Error(`Unknown AI mode: ${this.mode}`);
  }

  async _generateViaGateway(filledPrompt, context) {
    // Check if this is a bookmark tagging request
    const isTaggingRequest = context.title && context.url;

    try {
      if (isTaggingRequest) {
        // Use specialized tags endpoint
        const response = await fetch(`${this.gatewayUrl}/api/ai/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: context.title,
            url: context.url,
            description: context.description || '',
            useAI: true,
            backend: 'auto'
          })
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Gateway error ${response.status}: ${error}`);
        }

        const data = await response.json();
        return data.tags.join(', ');
      }

      // General generation endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const response = await fetch(`${this.gatewayUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: filledPrompt,
          app: 'bookmarks',
          maxTokens: parseInt(process.env.AI_MAX_TOKENS || '500'),
          backend: 'auto'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gateway error ${response.status}: ${error}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI Gateway error:', error.message);
      if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('AI Gateway is not available');
      }
      throw error;
    }
  }

  async _generateViaOpenAI(prompt, context) {
    try {
      const promptTemplate = PromptTemplate.fromTemplate(prompt);
      const chain = promptTemplate.pipe(this.model).pipe(new StringOutputParser());
      return await chain.invoke(context);
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  isAvailable() {
    return this.initialized;
  }

  getMode() {
    return this.mode;
  }
}

// Singleton instance
const client = new AIClient();

export default client;
