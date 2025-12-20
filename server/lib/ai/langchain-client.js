import { ChatOpenAI } from '@langchain/openai';
    2 import { PromptTemplate } from '@langchain/core/prompts';
    3 import { StringOutputParser } from '@langchain/core/output_parsers';
    4 
    5 class LangChainClient {
    6   constructor() {
    7     this.model = null;
    8     this.initialized = false;
    9     this.useLocalAI = process.env.USE_LOCAL_AI === 'true';
   10     this.localAIUrl = process.env.LOCAL_AI_URL || 'http://bookmarked-ai-engine:8001';
   11   }
   12 
   13   initialize() {
   14     if (this.useLocalAI) {
   15       console.log('Using Local OpenVINO AI Engine at ' + this.localAIUrl);
   16       this.initialized = true;
   17       return true;
   18     }
   19 
   20     if (!process.env.OPENAI_API_KEY) {
   21       console.warn('OpenAI API key not found - AI features disabled');
   22       return false;
   23     }
   24 
   25     try {
   26       this.model = new ChatOpenAI({
   27         openAIApiKey: process.env.OPENAI_API_KEY,
   28         modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
   29         temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
   30         maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
   31       });
   32 
   33       this.initialized = true;
   34       console.log('LangChain client initialized with OpenAI successfully');
   35       return true;
   36     } catch (error) {
   37       console.error('Failed to initialize LangChain client:', error);
   38       return false;
   39     }
   40   }
   41 
   42   async generateCompletion(prompt, context) {
   43     if (!this.initialized) {
   44       throw new Error('LangChain client not initialized');
   45     }
   46 
   47     const filledPrompt = prompt.replace(/{(\w+)}/g, (_, key) => context[key] || '');
   48 
   49     if (this.useLocalAI) {
   50       try {
   51         console.log('Sending request to local AI: ' + this.localAIUrl);
   52         const controller = new AbortController();
   53         const timeoutId = setTimeout(() => controller.abort(), 180000);
   54 
   55         const response = await fetch(this.localAIUrl + '/generate', {
   56           method: 'POST',
   57           headers: { 'Content-Type': 'application/json' },
   58           body: JSON.stringify({
   59             prompt: filledPrompt,
   60             max_new_tokens: 200
   61           }),
   62           signal: controller.signal
   63         });
   64         
   65         clearTimeout(timeoutId);
   66         
   67         if (!response.ok) {
   68           throw new Error('HTTP error! status: ' + response.status);
   69         }
   70         
   71         const data = await response.json();
   72         return data.response;
   73       } catch (error) {
   74         console.error('Local AI generation error: ' + error.message);
   75         throw new Error('Local AI failed to respond');
   76       }
   77     }
   78 
   79     try {
   80       const promptTemplate = PromptTemplate.fromTemplate(prompt);
   81       const chain = promptTemplate.pipe(this.model).pipe(new StringOutputParser());
   82 
   83       const response = await chain.invoke(context);
   84       return response;
   85     } catch (error) {
   86       console.error('LangChain generation error:', error);
   87       throw error;
   88     }
   89   }
   90 
   91   isAvailable() {
   92     return this.initialized;
   93   }
   94 }
   95 
   96 const client = new LangChainClient();
   97 export default client;

