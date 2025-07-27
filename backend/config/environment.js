import dotenv from 'dotenv';

dotenv.config();

const config = {
  // MySQL
  mysqlHost: process.env.MYSQL_HOST || 'localhost',
  mysqlUser: process.env.MYSQL_USER || 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD || '',
  mysqlDatabase: process.env.MYSQL_DATABASE || 'elankodse',
  mysqlPort: process.env.MYSQL_PORT || 3306,

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