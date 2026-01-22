import dotenv from 'dotenv';
import connectDB from './db/db.js';
import app from './app.js';

// Load environment variables before anything else
dotenv.config();

/**
 * Initialize and Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connected successfully');

    // Handle Express application errors
    app.on('error', (error) => {
      console.error('Express application error:', error.message);
      throw error;
    });

    // Start HTTP server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
