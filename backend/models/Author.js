import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  quote: String,
  updatedAt: Date,
});

const Author = mongoose.model('Author', AuthorSchema);
export default Author; 