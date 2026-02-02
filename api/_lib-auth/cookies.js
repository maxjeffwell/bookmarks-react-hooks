const isProduction = process.env.NODE_ENV === 'production';

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  });
  return cookies;
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const accessCookie = [
    `accessToken=${accessToken}`,
    'HttpOnly',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${15 * 60}` // 15 minutes
  ].filter(Boolean).join('; ');

  const refreshCookie = [
    `refreshToken=${refreshToken}`,
    'HttpOnly',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${7 * 24 * 60 * 60}` // 7 days
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
}

export function clearAuthCookies(res) {
  const clearAccess = 'accessToken=; HttpOnly; Path=/; Max-Age=0';
  const clearRefresh = 'refreshToken=; HttpOnly; Path=/; Max-Age=0';
  res.setHeader('Set-Cookie', [clearAccess, clearRefresh]);
}

export function setAccessTokenCookie(res, accessToken) {
  const accessCookie = [
    `accessToken=${accessToken}`,
    'HttpOnly',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${15 * 60}`
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', accessCookie);
}
