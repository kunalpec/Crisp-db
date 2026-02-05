import dotenv from 'dotenv';
import connectDB from './db/db.js';
import app from './app.js';
import { createServer } from 'http';
// import { initSocket } from './socket/index.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');

    const server = createServer(app);

    // initSocket(server); // 🔥 Socket.IO attached here

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port : ${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
