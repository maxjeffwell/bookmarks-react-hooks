import { usersDB, refreshTokensDB, hashToken } from '../_lib-auth/db.js';
import { hashPassword } from '../_lib-auth/password.js';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../_lib-auth/jwt.js';
import { setAuthCookies } from '../_lib-auth/cookies.js';
import { handleCors } from '../_lib-auth/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
}
