import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://dev:Dev403lank0ds3@cluster0.vnyqss5.mongodb.net/tamilwriter?retryWrites=true&w=majority',
  
  // Server
  port: process.env.PORT || 8084,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'https://elankodse.com', 'https://dev-backend.elankodse.com'],
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Production URL
  productionUrl: process.env.PRODUCTION_URL || 'https://dev-backend.elankodse.com',
  
  // Check if running in production
  isProduction: process.env.NODE_ENV === 'production',
  
  // Get the appropriate server URL based on environment
  getServerUrl: () => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.PRODUCTION_URL || 'https://dev-backend.elankodse.com';
    }
    return `http://localhost:${process.env.PORT || 8084}`;
  }
};

export default config; 