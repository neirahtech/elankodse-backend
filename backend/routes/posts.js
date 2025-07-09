import express from 'express';
import { getAllPosts, getPostById } from '../controllers/postController.js';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';
import requireAuthor from '../middleware/author.js';

const router = express.Router();

// Helper function to clean HTML tags
const cleanHtmlTags = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

router.get('/', getAllPosts);
router.get('/categories', async (req, res) => {
  try {
    const categories = await Post.distinct('category');
    res.json(categories.filter(Boolean));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
router.get('/:id', getPostById);

// Create post (author only)
router.post('/', auth, requireAuthor, async (req, res) => {
  try {
    const { title, subtitle, content, category, coverImage, tags, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const cleanContent = cleanHtmlTags(content);
    const excerpt = cleanContent.slice(0, 120) + (cleanContent.length > 120 ? '...' : '');
    
    const post = await Post.create({
      postId: String(Date.now()),
      title,
      subtitle,
      content,
      category: category || 'Uncategorized',
      tags: Array.isArray(tags) ? tags : [],
      coverImage,
      status: status || 'published',
      author: req.user.id,
      date: new Date().toISOString().slice(0, 10),
      excerpt,
      comments: 0,
      likes: 0,
      updatedAt: new Date(),
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Edit post (author only)
router.put('/:id', auth, requireAuthor, async (req, res) => {
  try {
    const { title, subtitle, content, category, coverImage, tags, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const cleanContent = cleanHtmlTags(content);
    const excerpt = cleanContent.slice(0, 120) + (cleanContent.length > 120 ? '...' : '');
    
    const post = await Post.findOneAndUpdate(
      { postId: req.params.id },
      { 
        title, 
        subtitle,
        content, 
        category: category || 'Uncategorized', 
        tags: Array.isArray(tags) ? tags : [],
        coverImage, 
        status: status || 'published',
        excerpt,
        updatedAt: new Date() 
      },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (author only)
router.delete('/:id', auth, requireAuthor, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ postId: req.params.id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router; 