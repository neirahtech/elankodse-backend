import Post from '../models/Post.js';

export const getAllPosts = async (req, res) => {
  try {
    console.log('Fetching all posts...');
    const posts = await Post.findAll({
      attributes: [
        'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt'
      ],
      order: [['date', 'DESC']]
    });
    
    // Add userLiked field to each post
    const userId = req.user ? req.user.id : `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'anonymous'}`;
    const postsWithUserLiked = posts.map(post => {
      const postData = post.toJSON();
      const hasLiked = postData.likedBy && postData.likedBy.some(id => id.toString() === userId.toString());
      return {
        ...postData,
        userLiked: hasLiked
      };
    });
    
    console.log(`Found ${posts.length} posts`);
    res.json(postsWithUserLiked);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPublishedPosts = async (req, res) => {
  try {
    console.log('Fetching published posts...');
    const posts = await Post.findAll({
      where: {
        status: 'published'
      },
      attributes: [
        'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt'
      ],
      order: [['date', 'DESC']]
    });
    
    // Add userLiked field to each post
    const userId = req.user ? req.user.id : `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'anonymous'}`;
    const postsWithUserLiked = posts.map(post => {
      const postData = post.toJSON();
      const hasLiked = postData.likedBy && postData.likedBy.some(id => id.toString() === userId.toString());
      return {
        ...postData,
        userLiked: hasLiked
      };
    });
    
    console.log(`Found ${posts.length} published posts`);
    res.json(postsWithUserLiked);
  } catch (err) {
    console.error('Error fetching published posts:', err);
    res.status(500).json({ error: 'Failed to fetch published posts' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching post with ID:', id);
    
    if (!id) {
      console.log('No ID provided');
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Try to find by postId first, then by id
    let post = await Post.findOne({ 
      where: { postId: id },
      attributes: [
        'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt'
      ]
    });
    console.log('Search by postId result:', post ? 'Found' : 'Not found');
    
    if (!post) {
      // If not found by postId, try by numeric id
      const numericId = parseInt(id);
      console.log('Trying numeric ID:', numericId);
      if (!isNaN(numericId)) {
        post = await Post.findByPk(numericId, {
          attributes: [
            'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt'
          ]
        });
        console.log('Search by numeric ID result:', post ? 'Found' : 'Not found');
      }
    }

    if (!post) {
      console.log('Post not found for ID:', id);
      return res.status(404).json({ error: 'Post not found' });
    }

    // Add userLiked field to the post
    const userId = req.user ? req.user.id : `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'anonymous'}`;
    const postData = post.toJSON();
    const hasLiked = postData.likedBy && postData.likedBy.some(id => id.toString() === userId.toString());
    const postWithUserLiked = {
      ...postData,
      userLiked: hasLiked
    };

    console.log('Post found:', post.title);
    res.json(postWithUserLiked);
  } catch (err) {
    console.error('Error fetching post by id:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}; 