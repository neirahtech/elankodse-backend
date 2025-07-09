import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  postId: { type: String, unique: true },
  title: String,
  date: String,
  excerpt: String,
  content: String,
  category: String,
  tags: [String],
  coverImage: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: Number,
  views: { type: Number, default: 0 },
  viewedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ip: String,
    lastViewed: Date
  }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updatedAt: Date,
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  subtitle: String,
});

PostSchema.index({ date: -1 });
PostSchema.index({ category: 1 });
PostSchema.index({ postId: 1 }, { unique: true });

const Post = mongoose.model('Post', PostSchema);
export default Post; 