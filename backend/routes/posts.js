import express from 'express';
import { getAllPosts, getPublishedPosts, getPostById, getPostCount } from '../controllers/postController.js';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import requireAuthor from '../middleware/author.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to clean HTML tags
const cleanHtmlTags = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

// Image upload endpoint
router.post('/upload-image', auth, requireAuthor, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/', optionalAuth, getAllPosts);
router.get('/published', optionalAuth, getPublishedPosts);
router.get('/count', getPostCount);
router.get('/categories', async (req, res) => {
  try {
    // Check if Post model is available
    if (!Post) {
      console.error('Post model not available');
      return res.json([]);
    }
    
    const categoriesRaw = await Post.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      raw: true,
      where: {
        category: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      }
    });
    const categories = categoriesRaw.map(row => row.category).filter(Boolean);
    console.log('Categories found:', categories);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
});
router.get('/:id', optionalAuth, getPostById);

// Create post (author only)
router.post('/', auth, requireAuthor, async (req, res) => {
  try {
    const { title, subtitle, content, category, coverImage, tags, status, publishDate } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const cleanContent = cleanHtmlTags(content);
    const excerpt = cleanContent.slice(0, 120) + (cleanContent.length > 120 ? '...' : '');
    
    // Determine status based on publish date if not explicitly set
    let finalStatus = status;
    if (!finalStatus && publishDate) {
      const now = new Date();
      const publishDateTime = new Date(publishDate);
      finalStatus = publishDateTime > now ? 'scheduled' : 'published';
    } else if (!finalStatus) {
      finalStatus = 'published';
    }
    
    const post = await Post.create({
      postId: String(Date.now()),
      title,
      subtitle,
      content,
      category: category || 'Uncategorized',
      tags: Array.isArray(tags) ? tags : [],
      coverImage,
      status: finalStatus,
      authorId: req.user.id, // Use authorId instead of author
      author: req.user.name || 'Elanko-Dse', // Add author name
      date: new Date().toISOString().slice(0, 10),
      excerpt,
      comments: 0,
      likes: 0,
      publishedAt: publishDate ? new Date(publishDate) : new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
});

// Edit post (author only)
router.put('/:id', auth, requireAuthor, async (req, res) => {
  try {
    const { title, subtitle, content, category, coverImage, tags, status, publishDate } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const cleanContent = cleanHtmlTags(content);
    const excerpt = cleanContent.slice(0, 120) + (cleanContent.length > 120 ? '...' : '');
    
    // Find the post first - try by postId first, then by numeric id
    let post = await Post.findOne({
      where: { postId: req.params.id }
    });
    
    if (!post) {
      // If not found by postId, try by numeric id
      const numericId = parseInt(req.params.id);
      if (!isNaN(numericId)) {
        post = await Post.findOne({
          where: { id: numericId }
        });
      }
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Determine status based on publish date if not explicitly set
    let finalStatus = status;
    if (!finalStatus && publishDate) {
      const now = new Date();
      const publishDateTime = new Date(publishDate);
      finalStatus = publishDateTime > now ? 'scheduled' : 'published';
    } else if (!finalStatus) {
      finalStatus = 'published';
    }
    
    // Update the post
    await post.update({
      title, 
      subtitle,
      content, 
      category: category || 'Uncategorized', 
      tags: Array.isArray(tags) ? tags : [],
      coverImage, 
      status: finalStatus,
      publishedAt: publishDate ? new Date(publishDate) : post.publishedAt,
      author: req.user.name || 'Elanko-Dse', // Update author name
      excerpt,
      updatedAt: new Date()
    });
    
    // Return the updated post
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (author only)
router.delete('/:id', auth, requireAuthor, async (req, res) => {
  try {
    // Find the post first - try by postId first, then by numeric id
    let post = await Post.findOne({
      where: { postId: req.params.id }
    });
    
    if (!post) {
      // If not found by postId, try by numeric id
      const numericId = parseInt(req.params.id);
      if (!isNaN(numericId)) {
        post = await Post.findOne({
          where: { id: numericId }
        });
      }
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Delete the post
    await post.destroy();
    
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Check and publish scheduled posts (no auth required for auto-publish)
router.post('/publish-scheduled', async (req, res) => {
  try {
    console.log('Publish scheduled endpoint called');
    const now = new Date();
    console.log('Checking for scheduled posts to publish at:', now);
    
    // Find all scheduled posts that should be published
    const scheduledPosts = await Post.findAll({
      where: {
        status: 'scheduled',
        publishedAt: {
          [Op.lte]: now
        }
      }
    });
    
    console.log(`Found ${scheduledPosts.length} scheduled posts to publish`);
    
    let publishedCount = 0;
    
    for (const post of scheduledPosts) {
      console.log(`Publishing post: ${post.title} (ID: ${post.id})`);
      await post.update({
        status: 'published',
        updatedAt: new Date()
      });
      publishedCount++;
      console.log(`Successfully published post: ${post.title}`);
    }
    
    res.json({ 
      message: `Published ${publishedCount} scheduled posts`,
      publishedCount,
      totalScheduled: scheduledPosts.length
    });
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to publish scheduled posts', details: error.message });
  }
});

export default router; 