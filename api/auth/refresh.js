import { usersDB, refreshTokensDB, hashToken } from '../_lib-auth/db.js';
import { verifyRefreshToken, generateAccessToken } from '../_lib-auth/jwt.js';
import { parseCookies, clearAuthCookies, setAccessTokenCookie } from '../_lib-auth/cookies.js';
import { handleCors } from '../_lib-auth/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    res.json({ success: true });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
}
