import Post from '../models/Post.js';

export const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        status: 'published',
        hidden: false
      },
      attributes: [
        'id', 'postId', 'title', 'excerpt', 'coverImage', 'author', 'category',
        'date', 'publishedAt', 'tags', 'likes', 'comments'
      ],
      order: [['publishedAt', 'DESC']],
     
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching public posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
