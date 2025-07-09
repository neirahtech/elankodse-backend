import express from 'express';
import auth from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many comments, please try again later.' },
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    // Find the post by postId
    const post = await Post.findOne({ postId: req.params.postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comments = await Comment.find({ post: post._id })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a post
router.post('/:postId', auth, commentLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    // Find the post by postId
    const post = await Post.findOne({ postId: req.params.postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = await Comment.create({
      post: post._id,
      user: req.user.id,
      text: text.trim()
    });
    
    // Populate user info for the response
    await comment.populate('user', 'firstName lastName avatar');
    
    // Update post comment count
    post.comments = (post.comments || 0) + 1;
    await post.save();
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate('user', 'firstName lastName')
      .populate('post', 'author');
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if user is the comment author or the post author
    const isCommentAuthor = comment.user._id.toString() === req.user.id;
    const isPostAuthor = comment.post.author && comment.post.author.toString() === req.user.id;
    
    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    // Update post comment count
    const post = await Post.findById(comment.post._id);
    if (post) {
      post.comments = Math.max(0, (post.comments || 0) - 1);
      await post.save();
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(req.params.commentId);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router; 