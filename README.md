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

  <p>
    <a href="https://bookmarks-react-hooks.vercel.app/"><strong>Live Demo →</strong></a>
  </p>

  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maxjeffwell/bookmarks-react-hooks)

</div>

---

## 🚀 Overview

**Bookmarked** is a full-stack bookmark manager application built with React Hooks and powered by Neon's serverless PostgreSQL database. The application provides a seamless single-page experience for creating, editing, and organizing bookmarks with advanced filtering capabilities. The frontend leverages React's Context API with useReducer for state management, while the backend utilizes Vercel serverless functions connected to a Neon database for persistent, scalable data storage.

<div align="center">

### Build Status

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
- **Vercel Analytics** - Performance and user insights

</td>
</tr>
</table>

## 🏗️ Architecture

### 📊 Database Schema

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

### 🔌 API Endpoints

The backend provides RESTful API endpoints through Vercel serverless functions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookmarks-simple` | Retrieve all bookmarks |
| `POST` | `/api/bookmarks-simple` | Create a new bookmark |
| `PATCH` | `/api/bookmarks-simple/[id]` | Update a bookmark |
| `DELETE` | `/api/bookmarks-simple/[id]` | Delete a bookmark |

### ⚡ Key Features of Neon Integration

<div align="center">

| Feature | Benefit |
|---------|---------|
| **Serverless Architecture** | No database server management needed |
| **Auto-scaling** | Database scales automatically with demand |
| **Connection Pooling** | Built-in connection management |
| **PostgreSQL Compatibility** | Full PostgreSQL feature set with ACID compliance |

</div>

## 🚀 Setup and Configuration

### 📋 Prerequisites

- Node.js 14+
- A Neon account (sign up at [neon.tech](https://neon.tech))
- Vercel account for deployment (optional)

### 🔧 Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL=your_neon_database_connection_string
```

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

## 🚀 Deployment

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maxjeffwell/bookmarks-react-hooks)

</div>

The application is configured for deployment on Vercel:

1. **Connect** your GitHub repository to Vercel
2. **Add** your `DATABASE_URL` environment variable in Vercel's dashboard  
3. **Deploy** - Vercel will automatically detect and configure the serverless functions

## 🎯 Next Steps

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based user auth and authorization |
| 🔍 **Search** | PostgreSQL full-text search functionality |
| 📥 **Import/Export** | Browser bookmark import/export support |
| 📁 **Collections** | Bookmark folders and organization |
| 🤝 **Sharing** | Public bookmark list sharing |
| 🏷️ **Tagging** | Autocomplete tagging system |
| 🌐 **Browser Extension** | Quick bookmark saving extension |
| 🌙 **Dark Mode** | Theme switching support |
| 📸 **Thumbnails** | Bookmark screenshot capture |
| 📱 **Mobile App** | React Native mobile application |

</div>

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