import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
// import Author from './Author.js'; // Remove to avoid circular dependency

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.STRING,
    unique: true,
  },
  title: DataTypes.STRING,
  subtitle: DataTypes.STRING,
  date: DataTypes.STRING,
  excerpt: DataTypes.STRING,
  content: DataTypes.TEXT,
  category: DataTypes.STRING,
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  coverImage: DataTypes.STRING,
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  url: DataTypes.STRING,
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likedBy: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('published', 'draft', 'scheduled'),
    defaultValue: 'published',
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  authorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    references: {
      model: 'Authors',
      key: 'id'
    }
  },
  author: DataTypes.STRING, // Add this field to match the database schema
  publishedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: DataTypes.DATE,
}, {
  timestamps: true,
});

export default Post; 