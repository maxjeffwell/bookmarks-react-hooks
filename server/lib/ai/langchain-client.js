    2 import { ChatOpenAI } from '@langchain/openai';
    3 import { PromptTemplate } from '@langchain/core/prompts';
    4 import { StringOutputParser } from '@langchain/core/output_parsers';
    5 
    6 class LangChainClient {
    7   constructor() {
    8     this.model = null;
    9     this.initialized = false;
   10     this.useLocalAI = process.env.USE_LOCAL_AI === 'true';
   11     this.localAIUrl = process.env.LOCAL_AI_URL || 'http://bookmarked-ai-engine:8001';
   12   }
   13 
   14   initialize() {
   15     if (this.useLocalAI) {
   16       console.log('Using Local OpenVINO AI Engine at ' + this.localAIUrl);
   17       this.initialized = true;
   18       return true;
   19     }
   20 
   21     if (!process.env.OPENAI_API_KEY) {
   22       console.warn('OpenAI API key not found - AI features disabled');
   23       return false;
   24     }
   25 
   26     try {
   27       this.model = new ChatOpenAI({
   28         openAIApiKey: process.env.OPENAI_API_KEY,
   29         modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
   30         temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
   31         maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
   32       });
   33 
   34       this.initialized = true;
   35       console.log('LangChain client initialized with OpenAI successfully');
   36       return true;
   37     } catch (error) {
   38       console.error('Failed to initialize LangChain client:', error);
   39       return false;
   40     }
   41   }
   42 
   43   async generateCompletion(prompt, context) {
   44     if (!this.initialized) {
   45       throw new Error('LangChain client not initialized');
   46     }
   47 
   48     const filledPrompt = prompt.replace(/{(\w+)}/g, (_, key) => context[key] || '');
   49 
   50     if (this.useLocalAI) {
   51       try {
   52         console.log('Sending request to local AI: ' + this.localAIUrl);
   53         const controller = new AbortController();
   54         const timeoutId = setTimeout(() => controller.abort(), 180000);
   55 
   56         const response = await fetch(this.localAIUrl + '/generate', {
   57           method: 'POST',
   58           headers: { 'Content-Type': 'application/json' },
   59           body: JSON.stringify({
   60             prompt: filledPrompt,
   61             max_new_tokens: 200
   62           }),
   63           signal: controller.signal
   64         });
   65         
   66         clearTimeout(timeoutId);
   67         
   68         if (!response.ok) {
   69           throw new Error('HTTP error! status: ' + response.status);
   70         }
   71         
   72         const data = await response.json();
   73         return data.response;
   74       } catch (error) {
   75         console.error('Local AI generation error: ' + error.message);
   76         throw new Error('Local AI failed to respond');
   77       }
   78     }
   79 
   80     try {
   81       const promptTemplate = PromptTemplate.fromTemplate(prompt);
   82       const chain = promptTemplate.pipe(this.model).pipe(new StringOutputParser());
   83 
   84       const response = await chain.invoke(context);
   85       return response;
   86     } catch (error) {
   87       console.error('LangChain generation error:', error);
   88       throw error;
   89     }
   90   }
   91 
   92   isAvailable() {
   93     return this.initialized;
   94   }
   95 }
   96 
   97 const client = new LangChainClient();
   98 export default client;
