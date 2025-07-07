# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bookmarked** is a React-based bookmark manager application built with React Hooks, focusing on modern React patterns including Context API, useReducer, and custom hooks. The application allows users to create, edit, filter, and manage bookmarks with features like favorites and rating systems.

## Commands

### Development
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests with Jest
- `npm run lint` - Run ESLint on src directory

### Testing
- Tests use Jest with jsdom environment
- Run single test: `npm test -- --testNamePattern="test name"`

## Architecture

### State Management
The application uses a combination of React Context API and useReducer for global state management:

- **BookmarksContext** (`src/context.js`): Provides global state container
- **bookmarksReducer** (`src/reducers/bookmarksReducer.js`): Manages bookmark CRUD operations with actions:
  - `GET_BOOKMARKS` - Load bookmarks from API
  - `ADD_BOOKMARK` - Add new bookmark
  - `UPDATE_BOOKMARK` - Edit existing bookmark
  - `DELETE_BOOKMARK` - Remove bookmark
  - `ADD_BOOKMARK_TO_FAVORITES` - Toggle favorite status
  - `SET_CURRENT_BOOKMARK` - Set bookmark for editing
- **filterReducer** (`src/reducers/filterReducer.js`): Manages filtering state (ALL, FAVORITES, RATING)

### Component Structure
- **App.js** - Main application component with routing, context provider, and custom useAPI hook
- **Landing.js** - Landing page component
- **BookmarksList.js** - Main bookmarks display with filtering
- **BookmarkForm.js** - Add/edit bookmark form
- **Header.js**, **Footer.js**, **Sidebar.js** - Layout components

### Custom Hooks
- **useAPI** (in App.js): Custom hook for API data fetching using axios

### Styling
- **Emotion** for CSS-in-JS styling with theme provider
- **CSS Grid** for responsive layout
- Custom font loading with WebFont loader
- Responsive breakpoints defined in `src/components/Breakpoints.js`

### API Integration
- External API endpoint: `https://hooks-api.maxjeffwell.now.sh/bookmarks`
- Uses axios for HTTP requests
- RESTful operations for bookmark CRUD

## Key Technologies

- **React 16.14.0** with Hooks (useState, useEffect, useReducer, useContext)
- **React Router DOM** for client-side routing
- **Emotion** for styling and theming
- **Axios** for API calls
- **React Collapsible** for UI interactions
- **UUID** for unique ID generation

## Development Notes

- All components are functional components using React Hooks
- Global state managed through Context API + useReducer pattern
- Responsive design with mobile-first approach
- Font files located in `public/fonts/` directory
- ESLint configured for React and React Hooks
- Deployed on Heroku with live demo available

## Project Structure
```
src/
├── components/
│   ├── App.js              # Main app with routing & context
│   ├── BookmarksList.js    # Main bookmarks display
│   ├── BookmarkForm.js     # Add/edit form
│   ├── Landing.js          # Landing page
│   ├── Header.js           # App header
│   ├── Footer.js           # App footer
│   ├── Sidebar.js          # Navigation sidebar
│   └── Breakpoints.js      # Responsive breakpoints
├── reducers/
│   ├── bookmarksReducer.js # Bookmark state management
│   └── filterReducer.js    # Filter state management
├── context.js              # React Context definition
└── index.js               # App entry point with theme
```