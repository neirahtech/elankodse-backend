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
import imageRoutes from './routes/images.js';
import { fetchAndCacheBloggerData } from './controllers/utilityController.js';
import './models/index.js'; // Import all models and set up associations
import './models/Author.js';
import './models/Post.js';

dotenv.config();

connectDB().then(async () => {
  // Import sequelize after models are loaded
  const { sequelize } = await import('./config/db.js');
  await sequelize.sync(); // This will create all tables if they don't exist

  // Now run Blogger sync
  try {
    await fetchAndCacheBloggerData();
  } catch (err) {
    console.error('Blogger sync failed:', err);
  }

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
  
  // Serve static files for uploaded images
  app.use('/uploads', express.static('uploads'));

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
  app.use('/api/images', imageRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend API is running!',
      environment: config.nodeEnv,
      serverUrl: config.getServerUrl(),
      timestamp: new Date().toISOString()
    });
  });

  // Test endpoint to verify posts are available
  app.get('/api/test/posts', async (req, res) => {
    try {
      const { Post } = await import('./models/index.js');
      const postCount = await Post.count();
      const samplePosts = await Post.findAll({
        limit: 5,
        attributes: ['id', 'postId', 'title']
      });
      res.json({
        message: 'Posts test endpoint',
        totalPosts: postCount,
        samplePosts: samplePosts.map(p => ({ id: p.id, postId: p.postId, title: p.title }))
      });
    } catch (error) {
      console.error('Test endpoint error:', error);
      res.status(500).json({ error: 'Database test failed', details: error.message });
    }
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

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // 404 handler for undefined routes
  app.use('*', (req, res) => {
    console.log('404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({
      error: 'Route not found',
      method: req.method,
      url: req.originalUrl
    });
  });

  const PORT = config.port;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Server URL: ${config.getServerUrl()}`);
    console.log(`Allowed Origins: ${config.allowedOrigins.join(', ')}`);
  });
}); 