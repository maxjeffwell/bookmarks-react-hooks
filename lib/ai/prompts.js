// Centralized prompt templates for AI features

export const PROMPTS = {
  // Auto-tagging prompt
  AUTO_TAG: `You are a bookmark categorization assistant. Analyze the following bookmark and generate 3-5 relevant tags.

Bookmark Information:
- Title: {title}
- URL: {url}
- Description: {description}

Requirements:
1. Tags should be lowercase, single words or short phrases (max 2 words)
2. Focus on: technology/tools mentioned, topic/domain, content type
3. Be specific but general enough to group similar bookmarks
4. Return ONLY a comma-separated list, no explanation
5. If the bookmark is about a programming language or framework, include that as a tag
6. If the bookmark is a tutorial, documentation, or article, mention the content type

Example output: javascript, tutorial, web-development, react, frontend

Tags:`,

  // Smart search (future feature)
  SMART_SEARCH: `Given the user's search query and bookmark content, determine relevance score.

Query: {query}
Bookmark: {title} - {description}

Return ONLY a number from 0-100 indicating relevance.`,

  // Duplicate detection (future feature)
  DUPLICATE_DETECTION: `Analyze if these two bookmarks are duplicates or very similar.

Bookmark 1: {title1} - {url1}
Bookmark 2: {title2} - {url2}

Return ONLY: DUPLICATE, SIMILAR, or DIFFERENT`,

  // Content summarization (future feature)
  SUMMARIZE_CONTENT: `Summarize the following bookmark content in 2-3 sentences.

Title: {title}
Description: {description}
Content: {content}

Provide a concise summary that captures the main points.`
};

export default PROMPTS;
