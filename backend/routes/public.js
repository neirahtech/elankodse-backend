import express from 'express';
import { getPublicPosts } from '../controllers/publicPostController.js';

const router = express.Router();

router.get('/posts', getPublicPosts); // This maps to /api/public/posts

export default router;
