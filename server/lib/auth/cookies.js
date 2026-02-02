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
