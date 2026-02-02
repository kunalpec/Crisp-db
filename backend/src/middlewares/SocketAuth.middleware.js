import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const SocketAuth = (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    // No cookies → visitor
    if (!rawCookie) {
      socket.role = 'visitor';
      return next();
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.accessToken;

    // Cookies but no auth token → visitor
    if (!token) {
      socket.role = 'visitor';
      return next();
    }

    // Token present → must be valid
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    socket.user = decoded;
    socket.role = decoded.role || 'employee';

    return next();
  } catch (err) {
    // Token exists but invalid/expired
    return next(
      new Error(
        err.name === 'TokenExpiredError'
          ? 'COOKIE_EXPIRED'
          : 'INVALID_TOKEN'
      )
    );
  }
};
