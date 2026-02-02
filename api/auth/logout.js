import { refreshTokensDB } from '../_lib-auth/db.js';
import { verifyRefreshToken } from '../_lib-auth/jwt.js';
import { parseCookies, clearAuthCookies } from '../_lib-auth/cookies.js';
import { handleCors } from '../_lib-auth/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    clearAuthCookies(res);
    res.json({ success: true });
  }
}
