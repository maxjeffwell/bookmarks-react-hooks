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
