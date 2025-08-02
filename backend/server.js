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
import aboutRoutes from './routes/about.js';
import bookRoutes from './routes/books.js';
import socialRoutes from './routes/social.js';
import subscriptionRoutes from './routes/subscription.js';
import footerRoutes from './routes/footer.js';
import publicRoutes from './routes/public.js';
import metaRoutes from './routes/meta.js';
import { fetchAndCacheBloggerData } from './controllers/utilityController.js';
import { seedAboutContent } from './scripts/seedAbout.js';
import { seedBooks } from './scripts/seedBooks.js';
import './models/index.js'; // Import all models and set up associations
import './models/Author.js';
import './models/Post.js';
import './models/About.js';
import './models/Book.js';

dotenv.config();

connectDB().then(async () => {
  // Import sequelize after models are loaded
  const { sequelize } = await import('./config/db.js');
  await sequelize.sync(); // This will create all tables if they don't exist

  // RESOURCE OPTIMIZATION: Commented out automatic Blogger sync for production
  // This was causing high CPU/memory usage on startup
  // Use 'npm run sync' to manually sync data when needed
  // try {
  //   await fetchAndCacheBloggerData();
  // } catch (err) {
  //   console.error('Blogger sync failed:', err);
  // }

  // Check existing posts count
  const { Post } = await import('./models/index.js');
  const postCount = await Post.count();
  console.log(`📊 Posts in database: ${postCount}`);
  if (postCount === 0) {
    console.log('💡 No posts found. Run "npm run sync" to populate data from Blogger.');
  }

  // Seed default about content
  try {
    await seedAboutContent();
    await seedBooks();
  } catch (err) {
    console.error('Content seeding failed:', err);
  }

  const app = express();

  // Debug CORS configuration
  console.log('🔧 CORS Configuration:');
  console.log('Allowed Origins:', config.allowedOrigins);
  console.log('Node Environment:', process.env.NODE_ENV);

  // Configure CORS with environment-specific settings
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      console.log('🌐 CORS Request from origin:', origin);
      
      if (config.allowedOrigins.includes(origin)) {
        console.log('✅ CORS allowed for:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked for:', origin);
        console.log('Allowed origins:', config.allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  app.use(cors(corsOptions));

  // Add explicit preflight handling
  app.options('*', cors(corsOptions));

  // RESOURCE OPTIMIZATION: Reduced payload limits to save memory (2MB vs 10MB)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  
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
  app.use('/api/about', aboutRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/newsletter', subscriptionRoutes);
  app.use('/api/footer', footerRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/meta', metaRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend API is running!',
      environment: config.nodeEnv,
      serverUrl: config.getServerUrl(),
      timestamp: new Date().toISOString()
    });
  });

  // Manual sync endpoints (use only when needed to refresh Blogger data)
  
  // GET endpoint for easy browser testing
  app.get('/api/admin/sync', async (req, res) => {
    try {
      console.log('🔄 Manual Blogger sync requested via GET...');
      const { fetchAndCacheBloggerData } = await import('./controllers/utilityController.js');
      
      // Run sync in background to prevent timeout
      setImmediate(async () => {
        try {
          await fetchAndCacheBloggerData();
          console.log('✅ Background sync completed');
        } catch (error) {
          console.error('❌ Background sync failed:', error);
        }
      });
      
      res.json({
        success: true,
        message: 'Blogger sync started in background. Check server logs for progress.',
        method: 'GET',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Sync failed to start:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start sync',
        details: error.message
      });
    }
  });

  // POST endpoint for API calls
  app.post('/api/admin/sync', async (req, res) => {
    try {
      console.log('🔄 Manual Blogger sync requested via POST...');
      const { fetchAndCacheBloggerData } = await import('./controllers/utilityController.js');
      
      // Run sync in background to prevent timeout
      setImmediate(async () => {
        try {
          await fetchAndCacheBloggerData();
          console.log('✅ Background sync completed');
        } catch (error) {
          console.error('❌ Background sync failed:', error);
        }
      });
      
      res.json({
        success: true,
        message: 'Blogger sync started in background. Check server logs for progress.',
        method: 'POST',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Sync failed to start:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start sync',
        details: error.message
      });
    }
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
    console.log('');
    console.log('🎉 Server started successfully (Resource Optimized)!');
    console.log(`🌐 Port: ${PORT}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Server URL: ${config.getServerUrl()}`);
    console.log(`🛡️  CORS Origins: ${config.allowedOrigins.join(', ')}`);
    console.log('');
    console.log('🚨 OPTIMIZATIONS ACTIVE:');
    console.log('  ✅ No automatic Blogger sync on startup');
    console.log('  ✅ Reduced memory limits (2MB vs 10MB)');
    console.log('  ✅ Manual sync available: POST /api/admin/sync');
    console.log('  ✅ Or use: npm run sync');
    console.log('');
  });
}); 