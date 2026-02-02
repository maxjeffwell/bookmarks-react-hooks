import { usersDB, refreshTokensDB, hashToken } from '../_lib-auth/db.js';
import { hashPassword, comparePassword } from '../_lib-auth/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiry
} from '../_lib-auth/jwt.js';
import {
  parseCookies,
  setAuthCookies,
  clearAuthCookies,
  setAccessTokenCookie
} from '../_lib-auth/cookies.js';
import { handleCors } from '../_lib-auth/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { action } = req.query;

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'register':
        return await handleRegister(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'refresh':
        return await handleRefresh(req, res);
      case 'me':
        return await handleMe(req, res);
      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error(`Auth ${action} error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  const user = await usersDB.findByLogin(login.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await refreshTokensDB.create(user.id, hashToken(refreshToken), getRefreshTokenExpiry());

  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    user: { id: user.id, username: user.username, email: user.email }
  });
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Username must be 3-50 characters' });
  }

  if (password.length < 7 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 7-72 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (await usersDB.usernameExists(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  if (await usersDB.emailExists(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = await hashPassword(password);
  const user = await usersDB.create({
    username,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await refreshTokensDB.create(user.id, hashToken(refreshToken), getRefreshTokenExpiry());

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json({
    user: { id: user.id, username: user.username, email: user.email }
  });
}

async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await refreshTokensDB.deleteForUser(decoded.id);
    } catch (e) {
      // Token invalid, still clear cookies
    }
  }

  clearAuthCookies(res);
  return res.json({ success: true });
}

async function handleRefresh(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const validToken = await refreshTokensDB.findValid(decoded.id, hashToken(refreshToken));

  if (!validToken) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token revoked or expired' });
  }

  const user = await usersDB.findById(decoded.id);

  if (!user) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'User not found' });
  }

  const accessToken = generateAccessToken(user);
  setAccessTokenCookie(res, accessToken);

  return res.json({ success: true });
}

async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await usersDB.findById(decoded.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: { id: user.id, username: user.username, email: user.email }
  });
}
