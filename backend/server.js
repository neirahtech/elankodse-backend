import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import config from './config/environment.js';
import authorRoutes from './routes/author.js';
import postRoutes from './routes/posts.js';
import utilityRoutes from './routes/utility.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import libraryRoutes from './routes/library.js';
import settingsRoutes from './routes/settings.js';
import notificationRoutes from './routes/notifications.js';
import commentRoutes from './routes/comments.js';
import postInteractionRoutes from './routes/postInteractions.js';

dotenv.config();
connectDB();

const app = express();

// Configure CORS with environment-specific settings
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/author', authorRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', utilityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/post', postInteractionRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running!',
    environment: config.nodeEnv,
    serverUrl: config.getServerUrl(),
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: config.nodeEnv,
    serverUrl: config.getServerUrl(),
    timestamp: new Date().toISOString()
  });
});

const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Server URL: ${config.getServerUrl()}`);
  console.log(`Allowed Origins: ${config.allowedOrigins.join(', ')}`);
}); 