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
import { validateBody, registerSchema, loginSchema } from '../lib/validation/index.js';

const router = express.Router();

// Hash refresh token for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /auth/register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { login, password } = req.body;

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
