# AGENTS.md

# Project Overview

## Summary

**Bookmarked** is a full-stack bookmark manager application built with React Hooks and powered by Neon's serverless PostgreSQL database. The application provides an intelligent, seamless single-page experience for creating, editing, organizing, and searching bookmarks with AI-powered automatic tagging using OpenAI GPT-4o-mini.

## Purpose and Goals

The primary purpose of Bookmarked is to provide a seamless, intelligent bookmark management solution that addresses the needs of modern knowledge workers.

### Key Goals

- Enable users to create, edit, organize, and search bookmarks efficiently
- Leverage AI to automatically categorize and tag bookmarks
- Support browser bookmark import from all major browsers (Chrome, Firefox, Safari, Edge)
- Deliver responsive, mobile-first user experience
- Demonstrate modern React patterns and serverless architecture

## Target Audience

### Primary Audience
Developers and power users who save numerous web resources and need intelligent organization

### Secondary Audience
Anyone needing organized bookmark management

### Use Cases

- Developers saving technical documentation and tutorials
- Researchers organizing reference materials
- Content curators managing resource collections
- Students bookmarking educational resources

## Project Metadata

- **Version:** 1.0.0
- **License:** GNU GPLv3
- **Author:** Jeff Maxwell (maxjeffwell@gmail.com)
- **Repository:** https://github.com/maxjeffwell/bookmarks-react-hooks
- **Live Demo:** https://bookmarks-react-hooks.vercel.app
- **Domain:** Personal Productivity / Knowledge Management
- **Category:** Web Application
- **Industry:** Developer Tools / SaaS

# Technology Stack

## Frontend Technologies

### Core Framework
- **React 18.3.1** - Modern UI library with Hooks
  - Functional components only (no class components)
  - Built-in Hooks: useState, useEffect, useReducer, useContext
  - Custom hooks for reusable logic

### Routing
- **React Router DOM 6.30.1** - Client-side routing
  - Routes: `/` (Landing), `/bookmarks` (List), `/bookmarks/new` (Form)

### Styling
- **Emotion 11.14.x** - CSS-in-JS library with theme provider
  - Dynamic theming capabilities
  - Component-scoped styles
  - CSS Grid for responsive layouts
  - Mobile-first responsive design

### HTTP Client
- **Axios 1.10.0** - Promise-based HTTP client for API requests

### UI Components
- **React Collapsible 2.10.0** - Collapsible UI components

### Utilities
- **UUID 9.0.1** - Generate unique identifiers
- **DOMPurify 3.2.6** - XSS sanitization for user input
- **PropTypes 15.7.2** - Component prop validation
- **WebFontLoader 1.6.28** - Custom font loading

### Build Tools
- **React Scripts 5.0.1** - Build tooling via Create React App
- **Webpack** - Module bundler (via React Scripts)

## Backend Technologies

### Runtime
- **Node.js 14+** - JavaScript runtime

### Framework
- **Express 4.18.2** - Web application framework (for local/Docker development)

### Database
- **Neon Serverless PostgreSQL** - Serverless, auto-scaling database
  - **Driver:** @neondatabase/serverless 1.0.1
  - Features: Full-text search, UUID primary keys, automatic timestamps, cascading deletes

### Serverless Platform
- **Vercel Serverless Functions** - API endpoints as serverless functions
  - **@vercel/analytics 1.5.0** - Performance and user insights
  - **@vercel/speed-insights 1.2.0** - Speed monitoring

### AI Integration
- **LangChain 1.1.2** - AI/LLM framework and orchestration
- **@langchain/openai 1.1.3** - OpenAI integration
- **@langchain/core 1.1.1** - Core LangChain functionality
- **OpenAI GPT-4o-mini** - AI model for bookmark tagging

### Additional Backend
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 17.2.0** - Environment variable management

## Development Tools

### Testing
- **Jest** - Testing framework with jsdom environment
  - React component testing
  - Command: `npm test`

### Linting
- **ESLint** - JavaScript linter
  - Config: react-app preset
  - **eslint-plugin-react-hooks 4.6.2** - React Hooks linting
  - Command: `npm run lint`

### Development Server
- **http-proxy-middleware 3.0.5** - Webpack dev server proxy
- **Nodemon 3.0.1** - Development server watcher

## Deployment Platforms

### Primary Deployment
- **Vercel** - Serverless deployment platform
  - Automatic Git deployments
  - Serverless function hosting
  - Edge network CDN
  - Environment variable management

### Alternative Deployments
- **Heroku** - Cloud application platform
- **Docker** - Containerization
  - Docker Compose 3.x
  - Nginx - Reverse proxy and static file serving

## Version Control and CI/CD

- **Git** - Version control system
- **GitHub Actions** - Continuous integration and deployment
  - CI workflow - Automated testing and linting
  - Docker Build & Push workflow

# Coding Standards

## Architecture Patterns

### Component-Based Architecture
All UI elements are functional components using React Hooks. No class components are used in this project.

### State Management Pattern
The application uses **React Context API + useReducer** for global state management:

- **BookmarksContext** - Provides global state container for bookmarks and filters
- **bookmarksReducer** - Handles bookmark CRUD operations (GET, ADD, UPDATE, DELETE, TOGGLE_FAVORITE)
- **filterReducer** - Manages filtering state (ALL, FAVORITES, RATING)

### Custom Hooks Pattern
Reusable logic is encapsulated in custom hooks, such as the `useAPI` hook for data fetching.

### Serverless Architecture
Backend is implemented as Vercel serverless functions for zero-configuration scaling.

## React Development Standards

### Components (Required)
- Use functional components with Hooks instead of class components
- Component names must match file names
- Use PascalCase for component file names (e.g., BookmarkForm.js)

### React Hooks (Required)
Follow React Hooks best practices enforced by eslint-plugin-react-hooks:
- Use `useState` for local state
- Use `useEffect` for side effects
- Use `useReducer` for complex state logic
- Use `useContext` for consuming context
- Create custom hooks for reusable logic

### State Management (Required)
- Use Context API for global state
- Use useReducer for complex state logic
- Avoid prop drilling by leveraging context

## Styling Standards

### CSS-in-JS (Required)
- Use Emotion for all styling with theme provider
- Maintain theme configuration in a centralized location
- Leverage dynamic theming capabilities

### Layout (Preferred)
- Use CSS Grid for responsive layouts
- Follow mobile-first design approach

### Responsive Design (Required)
- Implement mobile-first responsive design
- Use defined breakpoints for consistency
- Test across multiple device sizes

## Code Quality Standards

### Linting (Required)
- Follow react-app ESLint configuration
- Run `npm run lint` before committing
- Fix all linting errors before merging

### Testing (Recommended)
- Write tests using Jest with jsdom environment
- Run `npm test` to execute tests
- Aim for good test coverage of critical components

### Type Validation (Recommended)
- Use PropTypes for component prop validation
- Define prop types for all component props

## API Development Standards

### HTTP Requests (Required)
- Use Axios for all API requests
- Implement proper error handling
- Use async/await pattern for cleaner code

### RESTful API Design (Required)
Follow RESTful conventions for all API endpoints:
- `GET /api/bookmarks` - Retrieve all bookmarks with search
- `POST /api/bookmarks` - Create new bookmark
- `PATCH /api/bookmarks/[id]` - Update bookmark
- `DELETE /api/bookmarks/[id]` - Delete bookmark
- `POST /api/ai/tags` - Generate AI-powered tags
- `GET /api/ai/tags?bookmarkId=[id]` - Retrieve tags for bookmark
- `POST /api/import` - Import bookmarks from browser export

## Security Standards

### Input Sanitization (Required)
- Use DOMPurify to sanitize all user input
- Prevent XSS attacks through proper sanitization

### Input Validation (Required)
- Validate all user inputs and API responses
- Use ajv library for schema validation

### Environment Variables (Required)
- Use environment variables for all sensitive configuration
- Never commit API keys or secrets to version control
- Use .env files for local development

## Performance Standards

### Code Splitting (Recommended)
- Utilize React lazy loading where appropriate
- Implement code splitting for better performance

### AI Response Caching (Required)
- Cache AI responses to minimize OpenAI API costs
- Use content-based hashing for cache keys (SHA-256)
- Track cache hit statistics

### Analytics (Enabled)
- Monitor performance with Vercel Analytics
- Track speed insights with Vercel Speed Insights

## Naming Conventions

### File Names (Required)
- Component files: PascalCase (e.g., BookmarkForm.js)
- Utility files: camelCase (e.g., bookmarkParser.js)
- Component names must match file names

## Git Practices

### Commit Messages (Required)
- Use clear, descriptive commit messages
- Follow conventional commit format when possible

### Branch Strategy (Recommended)
- Use feature branches for new development
- Merge to master through pull requests
- Keep master branch stable

# Project Structure

```
/home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks
├── api/                          # Vercel Serverless Functions
│   ├── ai/
│   │   └── tags.js              # AI-powered tagging endpoint
│   ├── bookmarks/
│   │   └── [id].js              # Single bookmark operations
│   ├── bookmarks.js             # Bookmarks collection endpoint
│   ├── import.js                # Browser import endpoint
│   ├── search.js                # Search endpoint
│   ├── _lib-ai/                 # Shared AI utilities
│   │   ├── AIService.js         # Main AI service facade
│   │   ├── cache.js             # AI response caching
│   │   ├── langchain-client.js  # LangChain integration
│   │   ├── prompts.js           # AI prompt templates
│   │   └── migrations.js        # AI database migrations
│   └── migrations/
│       ├── 001_add_search.sql
│       └── 002-add-tags.sql
├── src/                         # Frontend React Application
│   ├── components/              # React Components
│   │   ├── App.js              # Main app with routing & context
│   │   ├── BookmarksList.js    # Main bookmarks display
│   │   ├── BookmarkForm.js     # Add/edit bookmark form
│   │   ├── BookmarkAIFeatures.js # AI tagging interface
│   │   ├── BookmarkImport.js   # Browser import interface
│   │   ├── Landing.js          # Landing page
│   │   ├── Header.js           # App header
│   │   ├── Footer.js           # App footer
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   └── Breakpoints.js      # Responsive breakpoints
│   ├── reducers/               # State Management
│   │   ├── bookmarksReducer.js # Bookmark CRUD operations
│   │   └── filterReducer.js    # Filter state management
│   ├── utils/
│   │   └── bookmarkParser.js   # Bookmark parsing utilities
│   ├── context.js              # React Context definition
│   ├── theme.js                # Emotion theme configuration
│   ├── config.js               # Environment configuration
│   ├── setupProxy.js           # Webpack dev proxy
│   └── index.js                # App entry point
├── server/                      # Optional Express Backend
│   ├── lib/ai/                 # AI service implementation
│   ├── routes/
│   │   └── ai-routes.js        # AI endpoint routes
│   ├── server.js               # Express server
│   ├── db-ai.js                # Database AI utilities
│   └── package.json
├── lib/                        # Shared Libraries
│   └── ai/                     # AI services (shared)
│       ├── AIService.js
│       ├── cache.js
│       ├── langchain-client.js
│       ├── migrations.js
│       └── prompts.js
├── public/                     # Static Assets
│   ├── fonts/                  # Custom fonts
│   │   ├── GaramondPremrPro-MedDisp.otf
│   │   ├── HelveticaNeueLTStd-BdCn.otf
│   │   ├── HelveticaNeueLTStd-Roman.otf
│   │   └── ITCAvantGardeStd-Demi.otf
│   ├── index.html
│   ├── manifest.json
│   └── favicon files
├── screenshots/                # App screenshots
├── .artiforge/                 # Artiforge reports
├── CLAUDE.md                   # AI assistant instructions
├── GEMINI.md                   # AI assistant instructions
├── README.md                   # Project documentation
├── SETUP.md                    # Setup instructions
├── DEPLOYMENT-DEBUG.md         # Deployment troubleshooting
├── NAS-DEPLOYMENT.md           # NAS deployment guide
├── DOCKER.md                   # Docker documentation
├── docker-compose.yml          # Docker compose configuration
├── Dockerfile                  # Docker configuration
├── nginx.conf                  # Nginx configuration
├── vercel.json                 # Vercel configuration
├── package.json                # Frontend dependencies
└── package-lock.json
```

## Structure Overview

### Frontend (`src/`)
Contains all React components, state management, utilities, and configuration for the frontend application.

### API (`api/`)
Vercel serverless functions that handle all backend operations including bookmark CRUD, AI tagging, and browser import.

### Server (`server/`)
Optional Express backend for local development and Docker deployments. Mirrors the serverless function structure.

### Shared Libraries (`lib/`)
Reusable AI services shared between serverless functions and the Express server.

### Static Assets (`public/`)
Public assets including HTML, fonts, icons, and manifest files.

### Documentation
Multiple documentation files for different purposes (setup, deployment, Docker, AI assistants).

# External Resources

## APIs

### OpenAI API
- **URL:** https://api.openai.com
- **Purpose:** AI-powered bookmark tagging and analysis
- **Model:** gpt-4o-mini
- **Documentation:** https://platform.openai.com/docs
- **Authentication:** API Key

### Neon Database API
- **URL:** https://neon.tech
- **Purpose:** Serverless PostgreSQL database hosting
- **Documentation:** https://neon.tech/docs
- **Driver:** @neondatabase/serverless

## Libraries

### React
- **Version:** 18.3.1
- **Documentation:** https://react.dev
- **Purpose:** Frontend UI framework

### React Router DOM
- **Version:** 6.30.1
- **Documentation:** https://reactrouter.com
- **Purpose:** Client-side routing

### Emotion
- **Version:** 11.14.x
- **Documentation:** https://emotion.sh
- **Purpose:** CSS-in-JS styling and theming

### Axios
- **Version:** 1.10.0
- **Documentation:** https://axios-http.com
- **Purpose:** HTTP client for API requests

### LangChain
- **Version:** 1.1.2
- **Documentation:** https://js.langchain.com
- **Purpose:** AI/LLM framework and orchestration

### UUID
- **Version:** 9.0.1
- **Documentation:** https://github.com/uuidjs/uuid
- **Purpose:** Generate unique identifiers

### DOMPurify
- **Version:** 3.2.6
- **Documentation:** https://github.com/cure53/DOMPurify
- **Purpose:** XSS sanitization for user input

### WebFontLoader
- **Version:** 1.6.28
- **Documentation:** https://github.com/typekit/webfontloader
- **Purpose:** Custom font loading

### React Collapsible
- **Version:** 2.10.0
- **Documentation:** https://github.com/glennflanagan/react-collapsible
- **Purpose:** Collapsible UI components

## Services

### Vercel
- **URL:** https://vercel.com
- **Purpose:** Hosting, serverless functions, and deployment
- **Documentation:** https://vercel.com/docs
- **Features:**
  - Serverless function hosting
  - Automatic Git deployments
  - Edge network CDN
  - Analytics and insights

### GitHub
- **URL:** https://github.com
- **Purpose:** Version control and CI/CD
- **Repository:** https://github.com/maxjeffwell/bookmarks-react-hooks

### Docker Hub
- **URL:** https://hub.docker.com
- **Purpose:** Container image registry
- **Documentation:** https://docs.docker.com

## Development Tools

### Create React App
- **Purpose:** React application bootstrapping and build tooling
- **Documentation:** https://create-react-app.dev

### ESLint
- **Purpose:** JavaScript linting and code quality
- **Documentation:** https://eslint.org
- **Config:** react-app preset

### Jest
- **Purpose:** Testing framework
- **Documentation:** https://jestjs.io
- **Environment:** jsdom

### Docker
- **Purpose:** Containerization for development and deployment
- **Documentation:** https://docs.docker.com

### Nginx
- **Purpose:** Reverse proxy and static file serving
- **Documentation:** https://nginx.org/en/docs

## API Endpoints

### Production API
- **URL:** https://bookmarks-react-hooks.vercel.app/api
- **Type:** Production serverless API endpoints

### Development API
- **URL:** http://localhost:3001
- **Type:** Local Express development server

## Databases

### Neon PostgreSQL
- **Provider:** Neon
- **Type:** Serverless PostgreSQL
- **Documentation:** https://neon.tech/docs/introduction
- **Features:**
  - Automatic scaling
  - Connection pooling
  - Branching for development
  - Point-in-time recovery

## Project Resources

### Live Demo
- **URL:** https://bookmarks-react-hooks.vercel.app
- **Description:** Production deployment of the application

### GitHub Repository
- **URL:** https://github.com/maxjeffwell/bookmarks-react-hooks
- **Description:** Source code repository

### Author Portfolio
- **URL:** https://www.el-jefe.me
- **Description:** Developer portfolio

# Additional Context

## Key Architectural Decisions

### React Hooks over Class Components
**Rationale:** Modern React pattern provides cleaner code, better performance, and easier testing.

### Context API + useReducer over Redux
**Rationale:** Simpler setup with less boilerplate, sufficient for application complexity without introducing Redux overhead.

### Emotion over CSS Modules
**Rationale:** Enables dynamic theming, provides better developer experience, and maintains component-scoped styles.

### Neon Serverless PostgreSQL
**Rationale:** Serverless scaling with built-in connection pooling provides cost-effective, auto-scaling database solution.

### Vercel Serverless Functions
**Rationale:** Zero configuration deployment with automatic scaling and edge network distribution.

### LangChain + OpenAI
**Rationale:** Flexible AI framework with easy prompt management and model-agnostic architecture.

### AI Response Caching
**Rationale:** Minimizes OpenAI API costs and improves response times through intelligent caching.

## State Management Architecture

### BookmarksContext
Provides global state container for bookmarks and filters, accessible throughout the component tree.

### bookmarksReducer Actions
- `GET_BOOKMARKS` - Load bookmarks from API
- `ADD_BOOKMARK` - Add new bookmark
- `UPDATE_BOOKMARK` - Edit existing bookmark
- `DELETE_BOOKMARK` - Remove bookmark
- `ADD_BOOKMARK_TO_FAVORITES` - Toggle favorite status
- `SET_CURRENT_BOOKMARK` - Set bookmark for editing

### filterReducer
Manages filtering state with options: ALL, FAVORITES, RATING.

## Database Schema

### bookmarks table
Main bookmarks storage with UUID primary key, title, URL, description, rating, favorite status, and automatic timestamps.

### tags table
AI-generated tag definitions with unique names.

### bookmark_tags table
Many-to-many relationship table connecting bookmarks to tags.

### ai_tag_cache table
Cache for AI responses including content hash, tags array, model version, and usage statistics.

## AI Integration Features

### Auto-Tagging System
- Analyzes bookmark title, URL, and description
- Generates 3-5 relevant, lowercase tags
- Uses OpenAI GPT-4o-mini model
- Implements smart caching with SHA-256 content hashing

### Smart Caching Strategy
- Content-based hashing to identify similar requests
- Tracks cache hit statistics for cost analysis
- Reduces API calls and associated costs

### Future AI Capabilities
- Smart bookmark recommendations based on content similarity
- Duplicate bookmark detection
- Enhanced semantic search with query expansion
- Auto-summarization of bookmark content

## Key Features

### Completed Features
- **AI-Powered Tagging** - Automatic categorization using OpenAI GPT-4o-mini
- **Full-Text Search** - PostgreSQL tsvector and tsquery implementation
- **Browser Import** - Support for Chrome, Firefox, Safari, Edge (Netscape Bookmark File Format)
- **Star Ratings** - 5-star rating system
- **Favorites** - Mark and filter favorite bookmarks
- **Responsive Design** - Mobile-first CSS Grid layout

### Planned Features
- JWT-based authentication and authorization
- Bookmark collections and folders
- Public bookmark list sharing
- Browser extension for quick saving
- Dark mode theme switching
- Bookmark thumbnail capture
- React Native mobile application

## Deployment Environments

### Production (Vercel)
- **URL:** https://bookmarks-react-hooks.vercel.app
- Automatic deployments from Git
- Serverless function hosting
- Edge network CDN
- Environment variable management

### Development (Local)
- React dev server: `npm start`
- Express backend: `npm run server`
- Webpack dev server proxy configuration

### Docker
- Frontend served by Nginx on port 3000
- Backend Express server on port 3001
- Docker Compose for orchestration

## Environment Variables

### Required Variables
- `DATABASE_URL` - Neon PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features

### Optional Variables
- `OPENAI_MODEL` - OpenAI model to use (defaults to gpt-4o-mini)
- `OPENAI_TEMPERATURE` - Model temperature (defaults to 0.3)
- `OPENAI_MAX_TOKENS` - Max tokens per request (defaults to 500)
- `AI_FEATURES_ENABLED` - Enable/disable AI features
- `AI_CACHE_ENABLED` - Enable/disable AI response caching
- `REACT_APP_API_BASE_URL` - Override API base URL

# Testing Instructions

## Running Tests

### Execute All Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- --testNamePattern="test name"
```

### Test Environment
- **Framework:** Jest
- **Environment:** jsdom
- **Coverage:** React component testing

## Test Development

### Writing Tests
- Use Jest testing framework
- Write tests for React components
- Ensure good coverage of critical paths
- Test user interactions and state changes

### Before Committing
- Run full test suite
- Ensure all tests pass
- Fix any failing tests

# Build Steps

## Development Setup

### Prerequisites
- Node.js 14+
- npm 6.4.1+
- Neon account for database
- OpenAI API key for AI features

### Initial Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the root directory:
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=500
AI_FEATURES_ENABLED=true
AI_CACHE_ENABLED=true
```

3. **Start Development Server**
```bash
npm start
```

The application will open at http://localhost:3000

### Running Backend Server (Optional)

For local development with Express backend:

```bash
# Install server dependencies
npm run server:install

# Start Express server
npm run server
```

Server will run at http://localhost:3001

## Production Build

### Build Application

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Build Output
- Minified JavaScript bundles
- Optimized CSS
- Static assets
- Service worker (if configured)

## Code Quality

### Run Linter

```bash
npm run lint
```

Fix any linting errors before committing code.

## Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on Git push

### Docker Deployment

```bash
# Build Docker image
docker build -t bookmarked .

# Run with Docker Compose
docker-compose up
```

### Manual Deployment

1. Build the application: `npm run build`
2. Deploy the `build/` directory to your hosting provider
3. Configure API endpoints as serverless functions
4. Set environment variables on the hosting platform

## Database Setup

The application automatically creates required database tables on first run. Ensure the `DATABASE_URL` environment variable is correctly configured.

## Troubleshooting

Refer to project documentation for deployment issues:
- `DEPLOYMENT-DEBUG.md` - Common deployment issues
- `DOCKER.md` - Docker-specific setup
- `NAS-DEPLOYMENT.md` - Network-attached storage deployment
- `SETUP.md` - Detailed setup instructions

---

**Last Updated:** 2025-12-08

**Generated by:** Artiforge Documentation Tool
