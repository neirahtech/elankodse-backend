import express from 'express';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';

const router = express.Router();

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
  const post = await Post.findOne({ postId: req.params.id });
  if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userId = req.user.id; // Use req.user.id instead of req.user._id
    const hasLiked = post.likedBy && post.likedBy.some(id => id.toString() === userId.toString());
    
    if (hasLiked) {
      return res.json({ likes: post.likes });
    }
    
    post.likes = (post.likes || 0) + 1;
    if (!post.likedBy) post.likedBy = [];
  post.likedBy.push(userId);
  await post.save();
    
  res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// View a post (increment views, prevent abuse)
router.post('/:id/view', async (req, res) => {
  try {
  const post = await Post.findOne({ postId: req.params.id });
  if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userId = req.user ? req.user.id : null;
  const ip = req.ip;
  const now = new Date();
  let canIncrement = true;
    
  // Check if user or IP has viewed in last 6 hours
  if (userId) {
    const last = post.viewedBy.find(v => v.user && v.user.toString() === userId);
    if (last && now - new Date(last.lastViewed) < 6*60*60*1000) canIncrement = false;
  } else {
    const last = post.viewedBy.find(v => v.ip === ip);
    if (last && now - new Date(last.lastViewed) < 6*60*60*1000) canIncrement = false;
  }
    
  if (canIncrement) {
      post.views = (post.views || 0) + 1;
      if (!post.viewedBy) post.viewedBy = [];
      
    if (userId) {
      const idx = post.viewedBy.findIndex(v => v.user && v.user.toString() === userId);
        if (idx >= 0) {
          post.viewedBy[idx].lastViewed = now;
        } else {
          post.viewedBy.push({ user: userId, lastViewed: now });
        }
    } else {
      const idx = post.viewedBy.findIndex(v => v.ip === ip);
        if (idx >= 0) {
          post.viewedBy[idx].lastViewed = now;
        } else {
          post.viewedBy.push({ ip, lastViewed: now });
        }
    }
    await post.save();
  }
    
    res.json({ views: post.views || 0 });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// Unlike a post
router.delete('/:id/like', auth, async (req, res) => {
  try {
  const post = await Post.findOne({ postId: req.params.id });
  if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userId = req.user.id; // Use req.user.id instead of req.user._id
    const hasLiked = post.likedBy && post.likedBy.some(id => id.toString() === userId.toString());
    
    if (!hasLiked) {
      return res.json({ likes: post.likes || 0 });
    }
    
    post.likes = Math.max(0, (post.likes || 0) - 1);
    post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
  await post.save();
    
  res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

export default router; 