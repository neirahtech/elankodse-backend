import Author from './Author.js';
import Post from './Post.js';
import Comment from './Comment.js';
import User from './User.js';
import Image from './Image.js';

// Set up associations
Author.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(Author, { foreignKey: 'authorId', as: 'authorInfo' });

// Comment associations
Post.hasMany(Comment, { foreignKey: 'postId', as: 'postComments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { Author, Post, Comment, User, Image }; 