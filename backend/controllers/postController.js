import Post from '../models/Post.js';

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}, {
      postId: 1,
      title: 1,
      date: 1,
      category: 1,
      coverImage: 1,
      author: 1,
      comments: 1,
      likes: 1,
      updatedAt: 1,
      excerpt: 1,
      likedBy: 1,
      status: 1,
      subtitle: 1
    }).populate('author', 'firstName lastName').sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.id }).populate('author', 'firstName lastName');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post by id:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}; 