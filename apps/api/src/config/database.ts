import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';
import { logger } from './logger';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connecting', () => logger.info('Connecting to MongoDB...'));
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));

  const connectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    if (config.MONGODB_URI) {
      await mongoose.connect(config.MONGODB_URI, connectOptions);
      return;
    }
  } catch (error) {
    logger.warn('Primary MongoDB connection failed, falling back to in-memory MongoDB', {
      error: (error as Error).message,
    });
  }

  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri, connectOptions);
  logger.info('Using in-memory MongoDB fallback');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}