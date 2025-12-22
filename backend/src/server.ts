import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';
import { config } from './config/config';

/**
 * Server Entry Point
 *
 * Why it exists: Handles application startup, database connection,
 * and graceful shutdown procedures.
 *
 * Security considerations:
 * - Proper database connection handling
 * - Graceful shutdown on signals
 * - Error logging without sensitive information
 *
 * Scalability concerns:
 * - Connection pooling for database
 * - Proper error handling during startup
 * - Environment-aware configuration
 */

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    const mongoUri = config.NODE_ENV === 'test' ? (config.MONGODB_TEST_URI || config.MONGODB_URI) : config.MONGODB_URI;

    await mongoose.connect(mongoUri, {
      // Modern MongoDB connection options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    // Start the server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`📚 API Documentation: http://localhost:${config.PORT}/api/docs`);
      console.log(`💚 Health Check: http://localhost:${config.PORT}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during database shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit in production, just log
      if (config.NODE_ENV === 'development') {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      // Don't exit in production, just log
      if (config.NODE_ENV === 'development') {
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
