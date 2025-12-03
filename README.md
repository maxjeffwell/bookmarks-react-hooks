<div align="center">
  <h1>
    <img src="https://vercel.com/api/www/avatar/vercel?s=64" alt="Vercel" width="24" height="24" style="vertical-align: middle; margin-right: 8px;">
    Bookmarked
  </h1>

  <p><strong>Full-Stack React Hooks Bookmark Manager</strong></p>

  ![React](https://img.shields.io/badge/React-000000?style=flat&logo=react&logoColor=white)
  ![Emotion](https://img.shields.io/badge/Emotion-000000?style=flat&logo=emotion&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/Neon-000000?style=flat&logo=postgresql&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
  ![OpenAI](https://img.shields.io/badge/OpenAI-000000?style=flat&logo=openai&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-000000?style=flat&logo=docker&logoColor=white)

  <p>
    <a href="https://bookmarks-react-hooks.vercel.app/"><strong>Live Demo →</strong></a>
  </p>

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maxjeffwell/bookmarks-react-hooks)

</div>

---

## 🚀 Overview

**Bookmarked** is a full-stack bookmark manager application built with React Hooks and powered by Neon's serverless PostgreSQL database. The application provides a seamless single-page experience for creating, editing, and organizing bookmarks with advanced filtering capabilities and **AI-powered automatic tagging using OpenAI**. The frontend leverages React's Context API with useReducer for state management, while the backend utilizes Vercel serverless functions connected to a Neon database for persistent, scalable data storage.

<div align="center">

### Build Status

![CI](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/CI/badge.svg)
![Docker Build & Push](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/Docker%20Build%20%26%20Push/badge.svg)

![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-000000?style=flat&logoColor=white)
![npm version](https://img.shields.io/badge/npm-v6.4.1-000000?style=flat&logoColor=white)
![Demo Status](https://img.shields.io/badge/demo-online-000000?style=flat&logoColor=white)

</div>


## 🛠️ Technology Stack

<table align="center">
<tr>
<td align="center" width="50%">

### Frontend
- **React 18.3** with Hooks (useState, useEffect, useReducer, useContext)
- **React Router DOM** for client-side routing
- **Emotion** for CSS-in-JS styling
- **CSS Grid** for responsive layouts
- **Axios** for API communication

</td>
<td align="center" width="50%">

### Backend
- **Neon Serverless PostgreSQL** - Serverless, auto-scaling database
- **Vercel Serverless Functions** - API endpoints as serverless functions
- **@neondatabase/serverless** - Neon's optimized PostgreSQL driver
- **LangChain + OpenAI** - AI-powered bookmark tagging
- **Vercel Analytics** - Performance and user insights

</td>
</tr>
</table>

## 🏗️ Architecture

### 📊 Database Schema

The application uses a PostgreSQL database hosted on Neon with the following schema:

```sql
-- Main bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  rating TEXT,
  toggled_radio_button BOOLEAN DEFAULT FALSE,
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-generated tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many relationship between bookmarks and tags
CREATE TABLE bookmark_tags (
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (bookmark_id, tag_id)
);

-- AI response cache for cost optimization
CREATE TABLE ai_tag_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash VARCHAR(64) NOT NULL UNIQUE,
  tags TEXT[] NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_count INTEGER DEFAULT 1
);
```

### 🔌 API Endpoints

The backend provides RESTful API endpoints through Vercel serverless functions:

#### Bookmark Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookmarks` | Retrieve all bookmarks with full-text search |
| `POST` | `/api/bookmarks` | Create a new bookmark |
| `PATCH` | `/api/bookmarks/[id]` | Update a bookmark |
| `DELETE` | `/api/bookmarks/[id]` | Delete a bookmark |

#### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/tags` | Generate AI-powered tags for a bookmark |
| `GET` | `/api/ai/tags?bookmarkId=[id]` | Retrieve tags for a specific bookmark |

#### Browser Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/import` | Import bookmarks from browser export files |

### ⚡ Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Powered Tagging** | Automatic bookmark categorization using OpenAI GPT-4o-mini |
| 🔍 **Full-Text Search** | PostgreSQL-powered search across titles, URLs, and descriptions |
| 📥 **Browser Import** | Import bookmarks from Chrome, Firefox, Safari, and Edge |
| ⭐ **Star Ratings** | 5-star rating system for bookmarks |
| 💾 **Smart Caching** | AI response caching to minimize API costs |
| 🎨 **Modern UI** | Clean, responsive design with Emotion CSS-in-JS |
| ⚡ **Serverless Architecture** | Zero server management with Vercel + Neon |
| 🔄 **Real-Time Updates** | Instant UI updates with optimistic rendering |

</div>

## 🤖 AI-Powered Features

Bookmarked leverages **LangChain** and **OpenAI's GPT-4o-mini** to provide intelligent bookmark management:

### Auto-Tagging System
- **Smart Analysis**: Analyzes bookmark title, URL, and description to generate relevant tags
- **Technology Detection**: Automatically identifies programming languages, frameworks, and tools
- **Content Classification**: Categorizes by content type (tutorial, documentation, article, etc.)
- **Topic Recognition**: Extracts domain-specific topics and keywords
- **Cost Optimization**: Built-in caching system reduces API calls and costs

### How It Works
1. User creates or selects a bookmark
2. Clicks "Generate Tags" button
3. AI analyzes the bookmark content using a custom prompt template
4. Returns 3-5 relevant, lowercase tags
5. Tags are stored in PostgreSQL and cached for future use
6. Tags can be regenerated at any time

### Future AI Capabilities
- **Smart Recommendations**: Suggest related bookmarks based on content similarity
- **Duplicate Detection**: Identify duplicate or similar bookmarks automatically
- **Enhanced Search**: AI-powered query expansion and semantic search
- **Auto-Summarization**: Generate concise summaries of bookmark content

### Technical Implementation
```javascript
// AI Service Architecture
lib/ai/
├── AIService.js         # Main service facade
├── langchain-client.js  # LangChain + OpenAI integration
├── prompts.js          # Prompt templates
├── cache.js            # PostgreSQL caching layer
└── migrations.js       # Database schema for AI features
```

## 🚀 Setup and Configuration

### 📋 Prerequisites

- Node.js 14+
- A Neon account (sign up at [neon.tech](https://neon.tech))
- Vercel account for deployment (optional)

### 🔧 Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration (Required)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=500

# AI Feature Flags (Optional)
AI_FEATURES_ENABLED=true
AI_CACHE_ENABLED=true
```

Get your API keys:
- **Neon Database**: [console.neon.tech](https://console.neon.tech/)
- **OpenAI API**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### 🗄️ Database Setup

The application automatically creates the required database table on first run. No manual setup is needed beyond providing the Neon connection string.

## 📸 Screenshots

<div align="center">

### Application Demo
https://github.com/user-attachments/assets/Video_2025-08-16_01-47-22.mp4

*Complete walkthrough of the Bookmarked application showcasing all key features and functionality*

### Landing Page
![Landing Page](screenshots/Screen%20Shot%202025-08-16%20at%2006.24.24.png)
*Welcome screen introducing the Bookmarked application with elegant design and clear call-to-action*

### Create Bookmark Form
![Create Bookmark](screenshots/Screen%20Shot%202025-08-16%20at%2006.24.59.png)
*Comprehensive bookmark creation form featuring title, URL, description, and star rating system*

### Bookmarks Management Interface
![Bookmarks List](screenshots/Screen%20Shot%202025-08-16%20at%2006.25.18.png)
*Main interface showing bookmark collection with filtering options, favorites toggle, and organized list view*

</div>

## 🚀 Deployment

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maxjeffwell/bookmarks-react-hooks)

</div>

The application is configured for deployment on Vercel:

1. **Connect** your GitHub repository to Vercel
2. **Add** environment variables in Vercel's dashboard:
   - `DATABASE_URL` - Your Neon database connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `OPENAI_MODEL` - (Optional) Model to use (defaults to gpt-4o-mini)
3. **Deploy** - Vercel will automatically detect and configure the serverless functions

For troubleshooting deployment issues, see [DEPLOYMENT-DEBUG.md](DEPLOYMENT-DEBUG.md)

## 🎯 Features & Roadmap

<div align="center">

| Status | Feature | Description |
|--------|---------|-------------|
| ✅ | **AI-Powered Tagging** | Automatic bookmark categorization using OpenAI |
| ✅ | **Full-Text Search** | PostgreSQL-powered search functionality |
| ✅ | **Browser Import** | Import bookmarks from all major browsers |
| ✅ | **Star Ratings** | 5-star rating system for bookmarks |
| ✅ | **Favorites** | Mark and filter favorite bookmarks |
| 🚧 | **Authentication** | JWT-based user auth and authorization |
| 🚧 | **Collections** | Bookmark folders and organization |
| 🚧 | **Sharing** | Public bookmark list sharing |
| 🔜 | **AI Recommendations** | Smart bookmark suggestions based on content |
| 🔜 | **Duplicate Detection** | AI-powered duplicate bookmark detection |
| 🔜 | **Browser Extension** | Quick bookmark saving extension |
| 🔜 | **Dark Mode** | Theme switching support |
| 🔜 | **Thumbnails** | Bookmark screenshot capture |
| 🔜 | **Mobile App** | React Native mobile application |

</div>

**Legend:** ✅ Completed | 🚧 In Progress | 🔜 Planned

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

<div align="center">

| Step | Action |
|------|--------|
| 1️⃣ | Fork the project |
| 2️⃣ | Create feature branch (`git checkout -b feature/AmazingFeature`) |
| 3️⃣ | Commit changes (`git commit -m 'Add AmazingFeature'`) |
| 4️⃣ | Push to branch (`git push origin feature/AmazingFeature`) |
| 5️⃣ | Open a Pull Request |

</div>

---

<div align="center">

## 👨‍💻 Author

**Jeff Maxwell**

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat&logo=vercel&logoColor=white)](https://www.el-jefe.me)
[![GitHub](https://img.shields.io/badge/GitHub-000000?style=flat&logo=github&logoColor=white)](https://github.com/maxjeffwell)
[![Email](https://img.shields.io/badge/Email-000000?style=flat&logo=thunderbird&logoColor=white)](mailto:jeff@el-jefe.me)

## 📄 License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-000000?style=flat&logoColor=white)](https://www.gnu.org/licenses/gpl-3.0)

Distributed under the GNU GPLv3 License. See `LICENSE` for more information.

</div>