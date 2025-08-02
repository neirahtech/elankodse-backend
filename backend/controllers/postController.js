import Post from '../models/Post.js';

export const getPostCount = async (req, res) => {
  try {
    const count = await Post.count({
      where: { 
        status: 'published',
        hidden: false 
      }
    });
    res.json({ count });
  } catch (err) {
    console.error('Error getting post count:', err);
    res.status(500).json({ error: 'Failed to get post count' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    console.log('Fetching all posts...');
    
    // Build where clause - only authors can see hidden posts
    const whereClause = {};
    if (!req.user || !req.user.isAuthor) {
      whereClause.hidden = false;
    }
    
    const posts = await Post.findAll({
      where: whereClause,
      attributes: [
        'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt', 'hidden'
      ],
      order: [['date', 'DESC']]
    });
    
    // Add userLiked field to each post
    const userId = req.user ? req.user.id : `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'anonymous'}`;
    const postsWithUserLiked = posts.map(post => {
      const postData = post.toJSON();
      const likedByArray = Array.isArray(postData.likedBy) ? postData.likedBy : [];
      const hasLiked = likedByArray.some(id => id.toString() === userId.toString());
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
    
    // Build where clause - only published and not hidden posts for non-authors
    const whereClause = { status: 'published' };
    if (!req.user || !req.user.isAuthor) {
      whereClause.hidden = false;
    }
    
    const posts = await Post.findAll({
      where: whereClause,
      attributes: [
        'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt', 'hidden'
      ],
      order: [['date', 'DESC']]
    });
    
    // Add userLiked field to each post
    const userId = req.user ? req.user.id : `${req.ip}-${req.get('User-Agent')?.slice(0, 50) || 'anonymous'}`;
    const postsWithUserLiked = posts.map(post => {
      const postData = post.toJSON();
      const likedByArray = Array.isArray(postData.likedBy) ? postData.likedBy : [];
      const hasLiked = likedByArray.some(id => id.toString() === userId.toString());
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
    const whereClause = { postId: id };
    // Add hidden filter for non-authors
    if (!req.user || !req.user.isAuthor) {
      whereClause.hidden = false;
    }
    
    let post = await Post.findOne({ 
      where: whereClause,
      attributes: [
        'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt', 'hidden'
      ]
    });
    console.log('Search by postId result:', post ? 'Found' : 'Not found');
    
    if (!post) {
      // If not found by postId, try by numeric id
      const numericId = parseInt(id);
      console.log('Trying numeric ID:', numericId);
      if (!isNaN(numericId)) {
        const numericWhereClause = { id: numericId };
        // Add hidden filter for non-authors
        if (!req.user || !req.user.isAuthor) {
          numericWhereClause.hidden = false;
        }
        
        post = await Post.findOne({
          where: numericWhereClause,
          attributes: [
            'id', 'postId', 'title', 'date', 'category', 'coverImage', 'authorId', 'author', 'comments', 'likes', 'updatedAt', 'excerpt', 'likedBy', 'status', 'subtitle', 'content', 'tags', 'views', 'publishedAt', 'hidden'
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
    const likedByArray = Array.isArray(postData.likedBy) ? postData.likedBy : [];
    const hasLiked = likedByArray.some(id => id.toString() === userId.toString());
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