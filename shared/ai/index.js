// Shared AI module - consolidated AI services
// Used by both Vercel serverless (/api) and Express server (/server)

export { default as AIService } from './AIService.js';
export { default as EmbeddingService } from './EmbeddingService.js';
export { default as AICache } from './cache.js';
export { default as aiClient } from './ai-client.js';
export { PROMPTS } from './prompts.js';
export { initializeAITables } from './migrations.js';
