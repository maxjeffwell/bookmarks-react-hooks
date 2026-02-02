# JWT Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add JWT authentication with httpOnly cookies, bcrypt password hashing, and complete user data isolation.

**Architecture:** Express middleware-based auth with dual JWT tokens (access + refresh) stored in httpOnly cookies. All bookmark and AI routes protected with user ownership verification. Demo account created with existing data.

**Tech Stack:** jsonwebtoken, bcryptjs, cookie-parser, Neon PostgreSQL, React Context

---

## Task 1: Install Server Dependencies

**Files:**
- Modify: `server/package.json`

**Step 1: Install auth packages**

Run:
```bash
cd server && npm install bcryptjs@2.4.3 jsonwebtoken@9.0.2 cookie-parser@1.4.6
```

Expected: Packages added to package.json dependencies

**Step 2: Verify installation**

Run:
```bash
cd server && npm ls bcryptjs jsonwebtoken cookie-parser
```

Expected: All three packages listed

**Step 3: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "feat(server): add auth dependencies (bcryptjs, jsonwebtoken, cookie-parser)"
```

---

## Task 2: Create Database Migration Script

**Files:**
- Create: `server/db/migrations/001-add-auth.js`

**Step 1: Create migrations directory**

Run:
```bash
mkdir -p server/db/migrations
```

**Step 2: Create migration file**

Create `server/db/migrations/001-add-auth.js`:

```javascript
import bcrypt from 'bcryptjs';

export async function runAuthMigration(sql) {
  console.log('Running auth migration...');

  // 1. Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'USER',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log('Users table created');

  // 2. Create refresh_tokens table
  await sql`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log('Refresh tokens table created');

  // 3. Create indexes for refresh_tokens
  await sql`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at)
  `;

  // 4. Add user_id to bookmarks (nullable initially)
  try {
    await sql`ALTER TABLE bookmarks ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    console.log('Added user_id to bookmarks');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('bookmarks.user_id already exists');
    } else {
      throw e;
    }
  }

  // 5. Add user_id to tags (nullable initially)
  try {
    await sql`ALTER TABLE tags ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    console.log('Added user_id to tags');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('tags.user_id already exists');
    } else {
      throw e;
    }
  }

  // 6. Create demo account
  const existingDemo = await sql`SELECT id FROM users WHERE username = 'demo'`;

  let demoUserId;
  if (existingDemo.length === 0) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const result = await sql`
      INSERT INTO users (username, email, password, role)
      VALUES ('demo', 'demo@example.com', ${hashedPassword}, 'USER')
      RETURNING id
    `;
    demoUserId = result[0].id;
    console.log('Demo account created');
  } else {
    demoUserId = existingDemo[0].id;
    console.log('Demo account already exists');
  }

  // 7. Assign existing bookmarks to demo user
  await sql`UPDATE bookmarks SET user_id = ${demoUserId} WHERE user_id IS NULL`;
  console.log('Existing bookmarks assigned to demo user');

  // 8. Assign existing tags to demo user
  await sql`UPDATE tags SET user_id = ${demoUserId} WHERE user_id IS NULL`;
  console.log('Existing tags assigned to demo user');

  // 9. Create indexes for user_id columns
  await sql`CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id)`;

  // 10. Update tags unique constraint (user-scoped)
  try {
    await sql`ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key`;
    await sql`ALTER TABLE tags ADD CONSTRAINT tags_user_name_unique UNIQUE (user_id, name)`;
    console.log('Tags unique constraint updated to user-scoped');
  } catch (e) {
    console.log('Tags constraint update skipped:', e.message);
  }

  console.log('Auth migration complete');
}
```

**Step 3: Commit**

```bash
git add server/db/migrations/001-add-auth.js
git commit -m "feat(db): add auth migration script with users, refresh_tokens, demo account"
```

---

## Task 3: Create Password Utility

**Files:**
- Create: `server/lib/auth/password.js`

**Step 1: Create auth lib directory**

Run:
```bash
mkdir -p server/lib/auth
```

**Step 2: Create password.js**

Create `server/lib/auth/password.js`:

```javascript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

**Step 3: Commit**

```bash
git add server/lib/auth/password.js
git commit -m "feat(auth): add password hashing utility with bcrypt"
```

---

## Task 4: Create JWT Utility

**Files:**
- Create: `server/lib/auth/jwt.js`

**Step 1: Create jwt.js**

Create `server/lib/auth/jwt.js`:

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export function generateAccessToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
    issuer: 'bookmarks-api',
    audience: 'bookmarks-client'
  });
}

export function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    username: user.username
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
    issuer: 'bookmarks-api',
    audience: 'bookmarks-client'
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'bookmarks-api',
      audience: 'bookmarks-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    throw err;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'bookmarks-api',
      audience: 'bookmarks-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Refresh token expired');
      err.code = 'REFRESH_TOKEN_EXPIRED';
      throw err;
    }
    const err = new Error('Invalid refresh token');
    err.code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }
}

export function getRefreshTokenExpiry() {
  // 7 days from now
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}
```

**Step 2: Commit**

```bash
git add server/lib/auth/jwt.js
git commit -m "feat(auth): add JWT token generation and verification utilities"
```

---

## Task 5: Create Cookie Utility

**Files:**
- Create: `server/lib/auth/cookies.js`

**Step 1: Create cookies.js**

Create `server/lib/auth/cookies.js`:

```javascript
const isProduction = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/'
};

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_OPTIONS);
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
}
```

**Step 2: Commit**

```bash
git add server/lib/auth/cookies.js
git commit -m "feat(auth): add httpOnly cookie utilities for secure token storage"
```

---

## Task 6: Create Auth Middleware

**Files:**
- Create: `server/middleware/auth.js`

**Step 1: Create middleware directory**

Run:
```bash
mkdir -p server/middleware
```

**Step 2: Create auth.js middleware**

Create `server/middleware/auth.js`:

```javascript
import { verifyAccessToken } from '../lib/auth/jwt.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}
```

**Step 3: Commit**

```bash
git add server/middleware/auth.js
git commit -m "feat(auth): add requireAuth and requireAdmin middleware"
```

---

## Task 7: Add User Database Functions

**Files:**
- Modify: `server/db.js`

**Step 1: Add usersDB object to db.js**

Add the following after the `bookmarksDB` object (before the export):

```javascript
// User database operations
const usersDB = {
  // Find user by username or email
  async findByLogin(login) {
    const result = await sql`
      SELECT id, username, email, password, role, created_at, updated_at
      FROM users
      WHERE username = ${login} OR email = ${login}
    `;
    return result[0] || null;
  },

  // Find user by ID
  async findById(id) {
    const result = await sql`
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `;
    return result[0] || null;
  },

  // Create new user
  async create({ username, email, password }) {
    const result = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${password})
      RETURNING id, username, email, role, created_at, updated_at
    `;
    return result[0];
  },

  // Check if username exists
  async usernameExists(username) {
    const result = await sql`SELECT id FROM users WHERE username = ${username}`;
    return result.length > 0;
  },

  // Check if email exists
  async emailExists(email) {
    const result = await sql`SELECT id FROM users WHERE email = ${email}`;
    return result.length > 0;
  }
};

// Refresh token operations
const refreshTokensDB = {
  // Store refresh token hash
  async create(userId, tokenHash, expiresAt) {
    await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt})
    `;
  },

  // Find valid refresh token
  async findValid(userId, tokenHash) {
    const result = await sql`
      SELECT id FROM refresh_tokens
      WHERE user_id = ${userId}
        AND token_hash = ${tokenHash}
        AND expires_at > NOW()
    `;
    return result[0] || null;
  },

  // Delete user's refresh tokens (logout)
  async deleteForUser(userId) {
    await sql`DELETE FROM refresh_tokens WHERE user_id = ${userId}`;
  },

  // Delete expired tokens (cleanup)
  async deleteExpired() {
    await sql`DELETE FROM refresh_tokens WHERE expires_at < NOW()`;
  }
};
```

**Step 2: Update export statement**

Change the export from:
```javascript
export { initializeDatabase, bookmarksDB };
```

To:
```javascript
export { initializeDatabase, bookmarksDB, usersDB, refreshTokensDB };
```

**Step 3: Commit**

```bash
git add server/db.js
git commit -m "feat(db): add user and refresh token database operations"
```

---

## Task 8: Create Auth Routes

**Files:**
- Create: `server/routes/auth-routes.js`

**Step 1: Create auth-routes.js**

Create `server/routes/auth-routes.js`:

```javascript
import express from 'express';
import crypto from 'crypto';
import { usersDB, refreshTokensDB } from '../db.js';
import { hashPassword, comparePassword } from '../lib/auth/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry
} from '../lib/auth/jwt.js';
import { setAuthCookies, clearAuthCookies } from '../lib/auth/cookies.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Hash refresh token for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters' });
    }

    if (password.length < 7 || password.length > 72) {
      return res.status(400).json({ error: 'Password must be 7-72 characters' });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if username or email already exists
    if (await usersDB.usernameExists(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    if (await usersDB.emailExists(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await usersDB.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash
    await refreshTokensDB.create(
      user.id,
      hashToken(refreshToken),
      getRefreshTokenExpiry()
    );

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    // Find user by username or email
    const user = await usersDB.findByLogin(login.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash
    await refreshTokensDB.create(
      user.id,
      hashToken(refreshToken),
      getRefreshTokenExpiry()
    );

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check token exists in database
    const validToken = await refreshTokensDB.findValid(
      decoded.id,
      hashToken(refreshToken)
    );

    if (!validToken) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh token revoked or expired' });
    }

    // Get fresh user data
    const user = await usersDB.findById(decoded.id);

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token only
    const accessToken = generateAccessToken(user);

    // Update access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        // Delete all refresh tokens for this user
        await refreshTokensDB.deleteForUser(decoded.id);
      } catch (e) {
        // Token invalid, still clear cookies
      }
    }

    clearAuthCookies(res);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    clearAuthCookies(res);
    res.json({ success: true });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await usersDB.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
```

**Step 2: Commit**

```bash
git add server/routes/auth-routes.js
git commit -m "feat(auth): add auth routes (register, login, refresh, logout, me)"
```

---

## Task 9: Update Server.js with Auth

**Files:**
- Modify: `server/server.js`

**Step 1: Add imports at top of server.js**

After existing imports, add:

```javascript
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth-routes.js';
import { runAuthMigration } from './db/migrations/001-add-auth.js';
import { requireAuth } from './middleware/auth.js';
```

**Step 2: Add cookie-parser middleware**

After `app.use(express.json());`, add:

```javascript
app.use(cookieParser());
```

**Step 3: Update CORS for credentials**

Replace `app.use(cors());` with:

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://bookmarks-react-hooks.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Step 4: Update initializeDatabase call**

Replace:
```javascript
initializeDatabase().catch(console.error);
```

With:
```javascript
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

initializeDatabase()
  .then(() => runAuthMigration(sql))
  .catch(console.error);
```

**Step 5: Register auth routes**

After the health check endpoint, add:

```javascript
// Auth routes
app.use('/auth', authRoutes);
```

**Step 6: Add requireAuth to bookmark routes**

Update GET /bookmarks to filter by user:
```javascript
app.get('/bookmarks', requireAuth, async (req, res) => {
  // ... existing timing code ...

  // Update cache key to be user-specific
  const cacheKey = `${CACHE_KEYS.BOOKMARKS_ALL}:${req.user.id}`;

  // Update getAll call to filter by user
  const bookmarks = await bookmarksDB.getAll(req.user.id);

  // ... rest of existing code with updated cacheKey ...
});
```

Update POST /bookmarks to include user_id:
```javascript
app.post('/bookmarks', requireAuth, async (req, res) => {
  // ... existing code ...

  const newBookmark = await bookmarksDB.create({
    title,
    url,
    description: description || '',
    rating: rating || 0,
    toggledRadioButton: toggledRadioButton || false,
    checked: checked || false,
    userId: req.user.id  // Add this
  });

  // ... rest of existing code ...
});
```

Update PATCH /bookmarks/:id to verify ownership:
```javascript
app.patch('/bookmarks/:id', requireAuth, async (req, res) => {
  // ... existing code ...

  const updatedBookmark = await bookmarksDB.update(id, {
    // ... existing fields ...
  }, req.user.id);  // Add userId for ownership check

  if (!updatedBookmark) {
    return res.status(404).json({ error: 'Bookmark not found or not authorized' });
  }

  // ... rest of existing code ...
});
```

Update DELETE /bookmarks/:id to verify ownership:
```javascript
app.delete('/bookmarks/:id', requireAuth, async (req, res) => {
  // ... existing code ...

  const deletedBookmark = await bookmarksDB.delete(id, req.user.id);  // Add userId

  if (!deletedBookmark) {
    return res.status(404).json({ error: 'Bookmark not found or not authorized' });
  }

  // ... rest of existing code ...
});
```

**Step 7: Commit**

```bash
git add server/server.js
git commit -m "feat(server): integrate auth middleware, routes, and user-scoped bookmarks"
```

---

## Task 10: Update bookmarksDB for User Scoping

**Files:**
- Modify: `server/db.js`

**Step 1: Update getAll to accept userId**

```javascript
async getAll(userId) {
  const result = await sql`
    SELECT
      b.id, b.title, b.url, b.description, b.rating,
      b.toggled_radio_button, b.checked, b.created_at, b.updated_at,
      (b.embedding IS NOT NULL) as has_embedding,
      COALESCE(
        array_agg(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
        ARRAY[]::text[]
      ) as tags
    FROM bookmarks b
    LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE b.user_id = ${userId}
    GROUP BY b.id, b.title, b.url, b.description, b.rating,
             b.toggled_radio_button, b.checked, b.created_at, b.updated_at, b.embedding
    ORDER BY b.created_at DESC
  `;
  // ... rest of mapping code unchanged ...
}
```

**Step 2: Update create to include userId**

```javascript
async create(bookmarkData) {
  const { title, url, description = '', rating = '', toggledRadioButton = false, checked = false, userId } = bookmarkData;

  const result = await sql`
    INSERT INTO bookmarks (title, url, description, rating, toggled_radio_button, checked, user_id)
    VALUES (${title}, ${url}, ${description}, ${rating}, ${toggledRadioButton}, ${checked}, ${userId})
    RETURNING *
  `;
  // ... rest unchanged ...
}
```

**Step 3: Update update to verify ownership**

```javascript
async update(id, bookmarkData, userId) {
  const { title, url, description, rating, toggledRadioButton, checked } = bookmarkData;

  const result = await sql`
    UPDATE bookmarks
    SET
      title = COALESCE(${title}, title),
      url = COALESCE(${url}, url),
      description = COALESCE(${description}, description),
      rating = COALESCE(${rating}, rating),
      toggled_radio_button = COALESCE(${toggledRadioButton}, toggled_radio_button),
      checked = COALESCE(${checked}, checked),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  // ... rest unchanged ...
}
```

**Step 4: Update delete to verify ownership**

```javascript
async delete(id, userId) {
  const result = await sql`
    DELETE FROM bookmarks
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  // ... rest unchanged ...
}
```

**Step 5: Add getById with ownership check**

```javascript
async getById(id, userId) {
  const result = await sql`
    SELECT * FROM bookmarks WHERE id = ${id} AND user_id = ${userId}
  `;
  if (result.length === 0) return null;
  const bookmark = result[0];
  return {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: bookmark.rating,
    toggledRadioButton: bookmark.toggled_radio_button,
    checked: bookmark.checked,
    userId: bookmark.user_id,
    createdAt: bookmark.created_at,
    updatedAt: bookmark.updated_at
  };
}
```

**Step 6: Commit**

```bash
git add server/db.js
git commit -m "feat(db): update bookmarksDB for user-scoped operations with ownership checks"
```

---

## Task 11: Update AI Routes with Auth

**Files:**
- Modify: `server/routes/ai-routes.js`

**Step 1: Add auth import and middleware**

At the top, add:
```javascript
import { requireAuth } from '../middleware/auth.js';
```

**Step 2: Add requireAuth to all routes and ownership checks**

Update POST /ai/tags:
```javascript
app.post('/ai/tags', requireAuth, async (req, res) => {
  // ... after getting bookmarkData ...

  // Verify ownership if bookmarkId provided
  if (bookmarkId) {
    const ownerCheck = await sql`
      SELECT id FROM bookmarks WHERE id = ${bookmarkId} AND user_id = ${req.user.id}
    `;
    if (ownerCheck.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found or not authorized' });
    }
  }

  // When storing tags, ensure they're user-scoped
  for (const tagName of tags) {
    await sql`
      INSERT INTO tags (name, user_id)
      VALUES (${tagName}, ${req.user.id})
      ON CONFLICT (user_id, name) DO NOTHING
    `;
  }

  // Update bookmark_tags to use user-scoped tags
  for (const tagName of tags) {
    await sql`
      INSERT INTO bookmark_tags (bookmark_id, tag_id)
      SELECT ${id}, t.id FROM tags t
      WHERE t.name = ${tagName} AND t.user_id = ${req.user.id}
      ON CONFLICT DO NOTHING
    `;
  }

  // ... rest of code ...
});
```

Update GET /ai/tags/:bookmarkId:
```javascript
app.get('/ai/tags/:bookmarkId', requireAuth, async (req, res) => {
  // Verify ownership
  const ownerCheck = await sql`
    SELECT id FROM bookmarks WHERE id = ${req.params.bookmarkId} AND user_id = ${req.user.id}
  `;
  if (ownerCheck.length === 0) {
    return res.status(404).json({ error: 'Bookmark not found or not authorized' });
  }
  // ... rest unchanged ...
});
```

Update GET /ai/tags (all tags):
```javascript
app.get('/ai/tags', requireAuth, async (req, res) => {
  const tags = await sql`
    SELECT ... FROM tags t
    LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
    WHERE t.user_id = ${req.user.id}
    GROUP BY ...
  `;
  // ... rest unchanged ...
});
```

Update DELETE /ai/tags/:tagId:
```javascript
app.delete('/ai/tags/:tagId', requireAuth, async (req, res) => {
  const result = await sql`
    DELETE FROM tags
    WHERE id = ${req.params.tagId} AND user_id = ${req.user.id}
    RETURNING name
  `;
  // ... rest unchanged ...
});
```

Update semantic search routes similarly with requireAuth and user_id filtering.

**Step 3: Commit**

```bash
git add server/routes/ai-routes.js
git commit -m "feat(ai): add auth and user-scoped ownership checks to all AI routes"
```

---

## Task 12: Create Client AuthContext

**Files:**
- Create: `src/components/Auth/AuthContext.js`

**Step 1: Create Auth directory**

Run:
```bash
mkdir -p src/components/Auth
```

**Step 2: Create AuthContext.js**

Create `src/components/Auth/AuthContext.js`:

```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiUrl } from '../../config';

const AuthContext = createContext(null);

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/me`);
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      // Try refresh if access token expired
      if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
        try {
          await axios.post(`${apiUrl}/auth/refresh`);
          const response = await axios.get(`${apiUrl}/auth/me`);
          setUser(response.data.user);
          setError(null);
          return;
        } catch (refreshErr) {
          // Refresh failed, user needs to login
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (login, password) => {
    setError(null);
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { login, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, { username, email, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout`);
    } catch (err) {
      // Logout anyway even if request fails
    }
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      await axios.post(`${apiUrl}/auth/refresh`);
      return true;
    } catch (err) {
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
```

**Step 3: Commit**

```bash
git add src/components/Auth/AuthContext.js
git commit -m "feat(client): add AuthContext with login, register, logout, and token refresh"
```

---

## Task 13: Create Login Component

**Files:**
- Create: `src/components/Auth/Login.js`

**Step 1: Create Login.js**

Create `src/components/Auth/Login.js`:

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from './AuthContext';
import * as style from '../Breakpoints';

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #005995;
  padding: 1rem;
`;

const StyledForm = styled.form`
  font-family: ${props => props.theme.fonts.secondary};
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: 2rem;
  border-radius: 5px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  h1 {
    font-family: ${props => props.theme.fonts.primary};
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
  }

  @media (max-width: ${style.breakpoint.tablet}) {
    padding: 1.5rem;
    max-width: 100%;
  }
`;

const StyledInput = styled.input`
  font-family: ${props => props.theme.fonts.quinary};
  font-size: 1.5rem;
  color: ${props => props.theme.colors.white};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 5px;
  background: ${props => props.theme.colors.secondary};
  padding: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: ${props => props.theme.colors.white};
    opacity: 0.4;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 72, 52, 0.2);
  }

  @media (max-width: ${style.breakpoint.tablet}) {
    font-size: 1.2rem;
    min-height: 44px;
  }
`;

const StyledButton = styled.button`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: box-shadow 0.2s ease;

  &:hover, &:focus {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${style.breakpoint.tablet}) {
    font-size: 1.2rem;
    min-height: 44px;
  }
`;

const StyledError = styled.div`
  background: ${props => props.theme.colors.tertiary};
  color: ${props => props.theme.colors.white};
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.white};
  text-align: center;
  display: block;
  margin-top: 1.5rem;

  &:hover {
    color: ${props => props.theme.colors.tertiary};
  }
`;

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await authLogin(login, password);
      navigate('/bookmarks');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledContainer>
      <StyledForm onSubmit={handleSubmit}>
        <h1>Login</h1>

        {error && <StyledError>{error}</StyledError>}

        <StyledInput
          type="text"
          placeholder="Username or Email"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          autoComplete="username"
        />

        <StyledInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <StyledButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </StyledButton>

        <StyledLink to="/register">
          Don't have an account? Register
        </StyledLink>
      </StyledForm>
    </StyledContainer>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Auth/Login.js
git commit -m "feat(client): add Login component with styled form"
```

---

## Task 14: Create Register Component

**Files:**
- Create: `src/components/Auth/Register.js`

**Step 1: Create Register.js**

Create `src/components/Auth/Register.js`:

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from './AuthContext';
import * as style from '../Breakpoints';

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #005995;
  padding: 1rem;
`;

const StyledForm = styled.form`
  font-family: ${props => props.theme.fonts.secondary};
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: 2rem;
  border-radius: 5px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  h1 {
    font-family: ${props => props.theme.fonts.primary};
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
  }

  @media (max-width: ${style.breakpoint.tablet}) {
    padding: 1.5rem;
    max-width: 100%;
  }
`;

const StyledInput = styled.input`
  font-family: ${props => props.theme.fonts.quinary};
  font-size: 1.5rem;
  color: ${props => props.theme.colors.white};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 5px;
  background: ${props => props.theme.colors.secondary};
  padding: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: ${props => props.theme.colors.white};
    opacity: 0.4;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 72, 52, 0.2);
  }

  @media (max-width: ${style.breakpoint.tablet}) {
    font-size: 1.2rem;
    min-height: 44px;
  }
`;

const StyledButton = styled.button`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: box-shadow 0.2s ease;

  &:hover, &:focus {
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${style.breakpoint.tablet}) {
    font-size: 1.2rem;
    min-height: 44px;
  }
`;

const StyledError = styled.div`
  background: ${props => props.theme.colors.tertiary};
  color: ${props => props.theme.colors.white};
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.white};
  text-align: center;
  display: block;
  margin-top: 1.5rem;

  &:hover {
    color: ${props => props.theme.colors.tertiary};
  }
`;

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 7) {
      setError('Password must be at least 7 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(username, email, password);
      navigate('/bookmarks');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledContainer>
      <StyledForm onSubmit={handleSubmit}>
        <h1>Register</h1>

        {error && <StyledError>{error}</StyledError>}

        <StyledInput
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
        />

        <StyledInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <StyledInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={7}
          autoComplete="new-password"
        />

        <StyledInput
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <StyledButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </StyledButton>

        <StyledLink to="/login">
          Already have an account? Login
        </StyledLink>
      </StyledForm>
    </StyledContainer>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Auth/Register.js
git commit -m "feat(client): add Register component with validation"
```

---

## Task 15: Create ProtectedRoute Component

**Files:**
- Create: `src/components/Auth/ProtectedRoute.js`

**Step 1: Create ProtectedRoute.js**

Create `src/components/Auth/ProtectedRoute.js`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#005995',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

**Step 2: Create index.js for cleaner imports**

Create `src/components/Auth/index.js`:

```javascript
export { AuthProvider, useAuth } from './AuthContext';
export { default as Login } from './Login';
export { default as Register } from './Register';
export { default as ProtectedRoute } from './ProtectedRoute';
```

**Step 3: Commit**

```bash
git add src/components/Auth/ProtectedRoute.js src/components/Auth/index.js
git commit -m "feat(client): add ProtectedRoute component and Auth index exports"
```

---

## Task 16: Update App.js with Auth

**Files:**
- Modify: `src/components/App.js`

**Step 1: Add auth imports**

Add at top:
```javascript
import { AuthProvider, ProtectedRoute } from './Auth';
import Login from './Auth/Login';
import Register from './Auth/Register';
```

**Step 2: Wrap app with AuthProvider and add routes**

Update the return statement:

```javascript
return (
  <AuthProvider>
    <BrowserRouter>
      <Global styles={globalStyles} />
      <BookmarksContext.Provider value={{ state, dispatch, loading, error }}>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route
            path='/bookmarks'
            element={
              <ProtectedRoute>
                <BookmarksList />
              </ProtectedRoute>
            }
          />
        </Routes>
        <SpeedInsights />
        <Analytics />
      </BookmarksContext.Provider>
    </BrowserRouter>
  </AuthProvider>
);
```

**Step 3: Add axios credentials config**

After the imports, add:
```javascript
import axios from 'axios';
axios.defaults.withCredentials = true;
```

**Step 4: Commit**

```bash
git add src/components/App.js
git commit -m "feat(client): integrate AuthProvider, protected routes, and login/register pages"
```

---

## Task 17: Add Environment Variables Template

**Files:**
- Create: `server/.env.example`

**Step 1: Create .env.example**

Create `server/.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-access-token-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars

# CORS (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Redis (optional, for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Cache invalidation
CACHE_INVALIDATION_API_KEY=your-cache-api-key
```

**Step 2: Update .gitignore if needed**

Verify `.env` is in `.gitignore`:
```bash
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

**Step 3: Commit**

```bash
git add server/.env.example
git commit -m "docs: add .env.example with auth configuration"
```

---

## Task 18: Final Integration Test

**Step 1: Start server**

```bash
cd server && npm start
```

Expected: Server starts on port 3001, migration runs

**Step 2: Test registration**

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}' \
  -c cookies.txt -b cookies.txt -v
```

Expected: 201 response with user object, Set-Cookie headers

**Step 3: Test login**

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"demo","password":"demo123"}' \
  -c cookies.txt -b cookies.txt -v
```

Expected: 200 response, cookies set

**Step 4: Test protected route**

```bash
curl http://localhost:3001/bookmarks -b cookies.txt -v
```

Expected: 200 response with user's bookmarks

**Step 5: Test without auth**

```bash
curl http://localhost:3001/bookmarks -v
```

Expected: 401 Authentication required

**Step 6: Start client and test UI**

```bash
npm start
```

Test:
1. Navigate to /bookmarks → redirects to /login
2. Login with demo/demo123 → redirects to /bookmarks
3. See existing bookmarks
4. Logout → redirects to /login

---

## Summary

Total tasks: 18
Estimated commits: 17

Key files created:
- `server/db/migrations/001-add-auth.js`
- `server/lib/auth/password.js`
- `server/lib/auth/jwt.js`
- `server/lib/auth/cookies.js`
- `server/middleware/auth.js`
- `server/routes/auth-routes.js`
- `src/components/Auth/AuthContext.js`
- `src/components/Auth/Login.js`
- `src/components/Auth/Register.js`
- `src/components/Auth/ProtectedRoute.js`

Key files modified:
- `server/package.json`
- `server/db.js`
- `server/server.js`
- `server/routes/ai-routes.js`
- `src/components/App.js`
