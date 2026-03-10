import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import redis from './config/redis';
import pool from './config/database';
import logger from './config/logger';
import { setupSocketIO } from './sockets/handlers';
import { errorHandler } from './middleware/error';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import dotenv from 'dotenv';

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
app.use('/api/messages', messageRoutes);

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
