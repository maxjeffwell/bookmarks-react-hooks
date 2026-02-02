# JWT Authentication Design

**Date:** 2026-02-02
**Status:** Approved
**Pattern Reference:** code-talk GraphQL server

---

## Overview

Add JWT authentication with bcrypt password hashing to the bookmarks app. Tokens stored in httpOnly cookies for security. All bookmark and AI operations require authentication with complete user data isolation.

### Key Decisions

| Decision | Choice |
|----------|--------|
| Token storage | httpOnly cookies with SameSite=Strict |
| Access token TTL | 15 minutes |
| Refresh token TTL | 7 days |
| Password hashing | bcrypt (10 salt rounds) |
| Existing data | Assigned to demo account |
| Registration | Open to anyone |
| Authorization | All operations require auth, users see only their data |
| Tags | User-scoped (complete isolation) |

---

## Database Schema

### New Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### Existing Table Changes

```sql
-- Add user_id to bookmarks
ALTER TABLE bookmarks
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Add user_id to tags
ALTER TABLE tags
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key;
ALTER TABLE tags ADD CONSTRAINT tags_user_name_unique UNIQUE (user_id, name);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

### Migration Strategy

1. Create users table
2. Create refresh_tokens table
3. Add user_id column to bookmarks (nullable initially)
4. Add user_id column to tags (nullable initially)
5. Create demo account (username: 'demo', password: 'demo123', role: 'USER')
6. UPDATE bookmarks SET user_id = <demo_user_id> WHERE user_id IS NULL
7. UPDATE tags SET user_id = <demo_user_id> WHERE user_id IS NULL
8. Make user_id NOT NULL on both tables

---

## API Endpoints

### Auth Routes

| Method | Endpoint | Body | Response | Cookies Set |
|--------|----------|------|----------|-------------|
| POST | `/auth/register` | `{ username, email, password }` | `{ user: { id, username, email } }` | accessToken, refreshToken |
| POST | `/auth/login` | `{ login, password }` | `{ user: { id, username, email } }` | accessToken, refreshToken |
| POST | `/auth/refresh` | - | `{ success: true }` | new accessToken |
| POST | `/auth/logout` | - | `{ success: true }` | clears cookies |
| GET | `/auth/me` | - | `{ user: { id, username, email } }` | - |

### Cookie Configuration

```javascript
// Access token
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,  // 15 minutes
  path: '/'
}

// Refresh token
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/auth/refresh'
}
```

### Protected Routes

All bookmark routes require authentication and filter by user_id:
- GET /bookmarks - Returns only current user's bookmarks
- POST /bookmarks - Creates bookmark with current user's ID
- PATCH /bookmarks/:id - Only works if user owns the bookmark
- DELETE /bookmarks/:id - Only works if user owns the bookmark

All AI routes require authentication and verify bookmark ownership:
- POST /ai/tags - Only for user's own bookmarks
- GET /ai/tags/:bookmarkId - Only if user owns bookmark
- GET /ai/tags - Returns only user's tags
- DELETE /ai/tags/:tagId - Only if user owns associated bookmarks
- GET/POST /ai/semantic-search - Searches only user's bookmarks

---

## File Structure

### New Server Files

```
server/
├── routes/
│   └── auth-routes.js        # Auth endpoints
├── middleware/
│   └── auth.js               # requireAuth, requireAdmin
├── lib/
│   └── auth/
│       ├── jwt.js            # generateTokens, verifyToken
│       ├── password.js       # hashPassword, comparePassword
│       └── cookies.js        # setAuthCookies, clearAuthCookies
└── db/
    └── migrations/
        └── 001-add-auth.js   # Schema changes + demo account
```

### New Client Files

```
src/
└── components/
    └── Auth/
        ├── AuthContext.js    # Auth state provider
        ├── Login.js          # Login form
        ├── Register.js       # Registration form
        └── ProtectedRoute.js # Route guard
```

### Files to Modify

**Server:**
- `server/server.js` - Add cookie-parser, register auth routes
- `server/db.js` - Add user queries
- `server/routes/ai-routes.js` - Add requireAuth, ownership checks

**Client:**
- `src/components/App.js` - Add AuthContext, protected routes
- `src/config.js` - Auth endpoints

### New Dependencies

```json
// server/package.json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6"
}
```

---

## Demo Account

| Field | Value |
|-------|-------|
| Username | demo |
| Password | demo123 |
| Role | USER |
| Data | All existing bookmarks and tags |

---

## Client Auth Context

```javascript
const AuthContext = {
  user: { id, username, email } | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  login: (login, password) => Promise,
  register: (username, email, password) => Promise,
  logout: () => Promise,
  refreshToken: () => Promise
}
```

### Route Structure

```
/               → Landing (public)
/login          → Login form (public, redirects if logged in)
/register       → Register form (public, redirects if logged in)
/bookmarks      → BookmarksList (protected)
```

### Auto Token Refresh Flow

1. On app load: Call GET /auth/me
2. If 401: Try POST /auth/refresh
3. If refresh works: User stays logged in
4. If refresh fails: Redirect to /login

On API 401 responses:
1. Try refresh once
2. If works: Retry original request
3. If fails: Redirect to /login

---

## Styling Requirements

All new auth components must follow existing styling patterns.

### Theme Values

```javascript
// Colors
colors: {
  primary: '#393939',      // Dark gray (buttons, borders)
  secondary: '#343436',    // Slightly lighter dark gray
  tertiary: '#FF4834',     // Orange/red accent
  black: '#000000',
  white: '#ffffff'
}

// Fonts
fonts: {
  primary: 'ITCAvantGardeStd-Demi, monospace',        // Headers
  secondary: 'HelveticaNeueLTStd-Roman, sans-serif',  // Body text
  quinary: 'GaramondPremrPro-MedDisp, serif'          // Forms/content
}
```

### Input Styling Pattern

```javascript
input {
  font-family: ${props => props.theme.fonts.quinary};
  font-size: 1.5rem;
  color: ${props => props.theme.colors.white};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 5px;
  background: ${props => props.theme.colors.secondary};
  padding: 5px;
  margin-bottom: 1rem;
  width: 100%;
}

input::placeholder {
  color: ${props => props.theme.colors.white};
  opacity: 0.4;
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 72, 52, 0.2);
}
```

### Button Styling Pattern

```javascript
button {
  font-size: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

button:hover, button:focus {
  box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
}
```

### Responsive Breakpoints

```javascript
import * as style from './Breakpoints';

@media (max-width: ${style.breakpoint.tablet}) {
  font-size: 1.2rem;
  padding: 1rem;
  min-height: 44px;  // Touch target
}
```

### Auth Form Container Pattern

```javascript
const StyledAuthForm = styled.form`
  font-family: ${props => props.theme.fonts.secondary};
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: 2rem;
  border-radius: 5px;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: ${style.breakpoint.tablet}) {
    padding: 1rem;
    max-width: 100%;
  }
`;
```

---

## Security Features

1. **httpOnly cookies** - JavaScript cannot access tokens (XSS protection)
2. **SameSite=Strict** - Cookies only sent for same-site requests (CSRF protection)
3. **Secure flag** - HTTPS only in production
4. **Token hashing** - Refresh tokens stored hashed in database
5. **bcrypt** - 10 salt rounds for password hashing
6. **Ownership verification** - All operations check user owns the resource

---

## Environment Variables

New required variables:

```bash
JWT_SECRET=<random-string-for-access-tokens>
JWT_REFRESH_SECRET=<different-random-string-for-refresh-tokens>
```

---

## Implementation Order

1. Database migrations (users, refresh_tokens, alter bookmarks/tags)
2. Server auth library (jwt.js, password.js, cookies.js)
3. Auth middleware (requireAuth)
4. Auth routes (register, login, refresh, logout, me)
5. Update bookmark routes (add auth, filter by user_id)
6. Update AI routes (add auth, ownership checks)
7. Client AuthContext
8. Login/Register components
9. ProtectedRoute wrapper
10. Update App.js routing
