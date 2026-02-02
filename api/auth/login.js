import { usersDB, refreshTokensDB, hashToken } from '../_lib-auth/db.js';
import { comparePassword } from '../_lib-auth/password.js';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../_lib-auth/jwt.js';
import { setAuthCookies } from '../_lib-auth/cookies.js';
import { handleCors } from '../_lib-auth/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
}
