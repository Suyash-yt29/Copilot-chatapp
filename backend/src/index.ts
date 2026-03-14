import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import redis from './config/redis.js';
import pool from './config/database.js';
import logger from './config/logger.js';
import { setupSocketIO } from './sockets/handlers.js';
import { errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/user.js';
import friendRoutes from './routes/friend.js';
import groupRoutes from './routes/group.js';
import msgRoutes from './routes/message.js';
import dotenv from 'dotenv';
import mediaRoutes from './routes/media.js';
import statusRoutes from './routes/status.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg) } }));
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes); // legacy
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/groups', groupRoutes);

app.use('/api/media', mediaRoutes);
app.use('/api/status', statusRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

setupSocketIO(io);

// Error handler
app.use(errorHandler);

// Initialize connections
const initializeConnections = async () => {
  // Database connection test
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');
  } catch (err) {
    logger.error('Database connection error:', err);
  }

  // Redis connection
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
    logger.info('Redis connected successfully');
  } catch (err) {
    logger.error('Redis connection error:', err);
  }
};

initializeConnections();

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
