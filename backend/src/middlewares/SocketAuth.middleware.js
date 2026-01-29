import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const SocketAuth = (socket, next) => {
  try {
    console.log('SocketAuth middleware');

    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      socket.role = 'visitor';
      return next();
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.accessToken; // ✅ correct cookie name

    if (!token) {
      socket.role = 'visitor';
      return next();
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    socket.user = decoded;
    socket.role = decoded.role;
    next();
  } catch (err) {
    console.error('SocketAuth error:', err.message);
    next(new Error('Invalid authentication'));
  }
};
