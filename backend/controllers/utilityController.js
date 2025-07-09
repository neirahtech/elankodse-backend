import axios from 'axios';
import Author from '../models/Author.js';
import Post from '../models/Post.js';

export const fetchAndCacheBloggerData = async (req, res) => {
  // Fetch all posts (paginated)
  let allPosts = [];
  let pageToken = null;
  let firstPostAuthor = null;
  do {
    let url = 'https://www.googleapis.com/blogger/v3/blogs/9143217/posts?key=AIzaSyD44Q_YctTPOndoPWrXZsBDJ1jNcOs4B1w&maxResults=500';
    if (pageToken) url += `&pageToken=${pageToken}`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.items) {
      allPosts = allPosts.concat(data.items);
      if (!firstPostAuthor && data.items[0] && data.items[0].author) {
        firstPostAuthor = data.items[0].author;
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Fetch blog description for quote
  let blogQuote = '';
  try {
    const blogRes = await axios.get('https://www.googleapis.com/blogger/v3/blogs/9143217?key=AIzaSyD44Q_YctTPOndoPWrXZsBDJ1jNcOs4B1w');
    blogQuote = blogRes.data.description || '';
  } catch {}

  // Only save author if not already present
  const authorExists = await Author.exists({});
  if (!authorExists && firstPostAuthor) {
    await Author.findOneAndUpdate(
      {},
      {
        name: firstPostAuthor.displayName,
        avatar: firstPostAuthor.image.url,
        quote: blogQuote,
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  }

  // Only insert new posts
  const existingPostIds = new Set((await Post.find({}, { postId: 1 })).map(p => p.postId));
  const newPosts = allPosts.filter(item => !existingPostIds.has(item.id));
  if (newPosts.length === 0) {
    if (res) return res.json({ status: 'no new posts' });
    return;
  }

  // Save posts in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < newPosts.length; i += BATCH_SIZE) {
    const batch = newPosts.slice(i, i + BATCH_SIZE).map(item => ({
      postId: item.id,
      title: item.title,
      date: item.published?.slice(0, 10),
      excerpt: item.content?.replace(/<[^>]+>/g, '').slice(0, 120) + '...',
      content: item.content,
      category: item.labels && item.labels.length > 0 ? item.labels[0] : 'Uncategorized',
      coverImage: item.images && item.images.length > 0 ? item.images[0].url : '',
      comments: item.replies?.totalItems || 0,
      likes: Math.floor(Math.random() * 200),
      updatedAt: new Date(),
    }));
    try {
      await Post.insertMany(batch, { ordered: false });
    } catch (err) {
      // Ignore duplicate errors
    }
  }
  if (res) return res.json({ status: 'refreshed' });
};

export const fixCoverImages = async (req, res) => {
  const posts = await Post.find({ $or: [ { coverImage: { $exists: false } }, { coverImage: '' }, { coverImage: null } ] });
  let updatedCount = 0;
  for (const post of posts) {
    if (!post.content) continue;
    const match = post.content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (match && match[1]) {
      post.coverImage = match[1];
      await post.save();
      updatedCount++;
    }
  }
  res.json({ updated: updatedCount, totalChecked: posts.length });
}; 