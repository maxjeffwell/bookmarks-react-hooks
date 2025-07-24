# Bookmarked
![React](https://img.shields.io/badge/React-badge.svg?style=for-the-badge&logo=react&labelColor=fa625f&logoColor=EDEDED&color=393939) &nbsp;![CSS3](https://img.shields.io/badge/CSS3-badge.svg?style=for-the-badge&logo=css3&labelColor=fa625f&logoColor=EDEDED&color=393939) &nbsp;![PostgreSQL](https://img.shields.io/badge/PostgreSQL-badge.svg?style=for-the-badge&logo=postgresql&labelColor=fa625f&logoColor=EDEDED&color=393939)

>**Bookmarked** is a full-stack bookmark manager application built with React Hooks and powered by Neon's serverless PostgreSQL database. The application provides a seamless single-page experience for creating, editing, and organizing bookmarks with advanced filtering capabilities. The frontend leverages React's Context API with useReducer for state management, while the backend utilizes Vercel serverless functions connected to a Neon database for persistent, scalable data storage.

## Build Status

>[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-393939.svg?style=style-for-the-badge&logo=appveyor&labelColor=fa625f&logoColor=EDEDED&color=393939)](https://github.com/maxjeffwell/bookmarks-react-hooks)
>>[![npm version](https://img.shields.io/badge/npm%20package-6.4.1-ededed.svg?logo=npm&style=style-for-the-badge&labelColor=fa625f&logoColor=EDEDED&color=393939)](https://badge.fury.io/js/npm)
>>
>>>[![Live Demo](https://img.shields.io/badge/demo-online-393939.svg?style=style-for-the-badge&logo=heroku&logoColor=EDEDED&labelColor=fa625f&color=393939)](https://jmaxwell-bookmark-manager.herokuapp.com/)
>
>
>

## Screenshots

[![Bookmarked Desktop View Landing Page](https://i.gyazo.com/abee754487f39b7b32185a227e1fe4ae.png)](https://gyazo.com/abee754487f39b7b32185a227e1fe4ae)

[![Bookmarked Desktop View Main Page Bookmarks_Expanded](https://i.gyazo.com/5fdf1017422df4223688a46c23d2e637.png)](https://gyazo.com/5fdf1017422df4223688a46c23d2e637)

[![Bookmarked Desktop View Main Page Bookmarks_Partially_Expanded](https://i.gyazo.com/bf4fcc11a68c7c50fe4ac83efc38a320.png)](https://gyazo.com/bf4fcc11a68c7c50fe4ac83efc38a320)

[![Bookmarked Desktop View Main Page Bookmarks_Unexpanded](https://i.gyazo.com/177e8c0c74485d9b986d4ae49970b604.png)](https://gyazo.com/177e8c0c74485d9b986d4ae49970b604)

[![Bookmarked Mobile View Main Page](https://i.gyazo.com/04f8ecfdb1e1fadc76bf3d643f860bb6.png)](https://gyazo.com/04f8ecfdb1e1fadc76bf3d643f860bb6)

[![Bookmarked Mobile View Main Page Bookmarks_Partially_Expanded](https://i.gyazo.com/60fa21a906abe23cd12a6a6bbcbb9f4a.png)](https://gyazo.com/60fa21a906abe23cd12a6a6bbcbb9f4a)

[![Bookmarked Mobile View Main Page Bookmarks_Expanded](https://i.gyazo.com/e3eb48b37f8afeb36c698e1f63c8df5f.png)](https://gyazo.com/e3eb48b37f8afeb36c698e1f63c8df5f)

## Technology Stack

### Frontend
* **React 16.14** with Hooks (useState, useEffect, useReducer, useContext)
* **React Router DOM** for client-side routing
* **Emotion** for CSS-in-JS styling
* **CSS Grid** for responsive layouts
* **Axios** for API communication

### Backend
* **Neon Serverless PostgreSQL** - Serverless, auto-scaling PostgreSQL database
* **Vercel Serverless Functions** - API endpoints deployed as serverless functions
* **@neondatabase/serverless** - Neon's optimized PostgreSQL driver for serverless environments

## Architecture

### Database Schema
The application uses a PostgreSQL database hosted on Neon with the following schema:

```sql
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
```

### API Endpoints
The backend provides RESTful API endpoints through Vercel serverless functions:

* `GET /api/bookmarks-simple` - Retrieve all bookmarks
* `POST /api/bookmarks-simple` - Create a new bookmark
* `PATCH /api/bookmarks-simple/[id]` - Update a bookmark
* `DELETE /api/bookmarks-simple/[id]` - Delete a bookmark

### Key Features of Neon Integration
* **Serverless Architecture** - No need to manage database servers or connections
* **Auto-scaling** - Database scales automatically based on demand
* **Connection Pooling** - Built-in connection management for serverless environments
* **PostgreSQL Compatibility** - Full PostgreSQL feature set with ACID compliance

## Setup and Configuration

### Prerequisites
* Node.js 14+
* A Neon account (sign up at [neon.tech](https://neon.tech))
* Vercel account for deployment (optional)

### Environment Variables
Create a `.env` file in the root directory:
```bash
DATABASE_URL=your_neon_database_connection_string
```

### Local Development
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

### Database Setup
The application automatically creates the required database table on first run. No manual setup is needed beyond providing the Neon connection string.

## Deployment

The application is configured for deployment on Vercel:
1. Connect your GitHub repository to Vercel
2. Add your `DATABASE_URL` environment variable in Vercel's dashboard
3. Deploy - Vercel will automatically detect and configure the serverless functions

## Next Steps

* Add user authentication and authorization with JWT tokens
* Implement bookmark search functionality with PostgreSQL full-text search
* Add bookmark import/export features (support for browser bookmarks)
* Create bookmark collections/folders for better organization
* Implement sharing functionality for public bookmark lists
* Add bookmark tagging system with autocomplete
* Create browser extension for quick bookmark saving
* Implement dark mode theme support
* Add bookmark thumbnail/screenshot capture
* Create mobile app using React Native

## Meta
>by Jeff Maxwell
>
>[maxjeffwell@gmail.com](mailto:maxjeffwell@gmail.com) |
>[https://github.com/maxjeffwell](https://github.com/maxjeffwell) | [https://www.el-jefe.me](https://www.el-jefe.me)

>[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-393939.svg?style=for-the-badge&labelColor=fa625f&logoColor=393939&color=393939)](https://www.gnu.org/licenses/gpl-3.0)

    Distributed under the GNU GPLv3 License.
    See ``LICENSE`` for more information.
