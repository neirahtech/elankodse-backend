#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

// Default environment configuration
const defaultEnv = {
  NODE_ENV: 'development',
  PORT: '8084',
  MONGODB_URI: 'mongodb+srv://dev:Dev403lank0ds3@cluster0.vnyqss5.mongodb.net/tamilwriter?retryWrites=true&w=majority',
  JWT_SECRET: 'your_jwt_secret_here_change_this_in_production',
  JWT_EXPIRES_IN: '7d',
  ALLOWED_ORIGINS: 'http://localhost:5173,https://elankodse.com,http://dev-server.elankodse.com',
  PRODUCTION_URL: 'http://dev-server.elankodse.com'
};

// Production environment configuration
const productionEnv = {
  NODE_ENV: 'production',
  PORT: '8084',
  MONGODB_URI: 'mongodb+srv://dev:Dev403lank0ds3@cluster0.vnyqss5.mongodb.net/tamilwriter?retryWrites=true&w=majority',
  JWT_SECRET: 'your_jwt_secret_here_change_this_in_production',
  JWT_EXPIRES_IN: '7d',
  ALLOWED_ORIGINS: 'http://localhost:5173,https://elankodse.com,http://dev-server.elankodse.com',
  PRODUCTION_URL: 'http://dev-server.elankodse.com'
};

function createEnvFile(envConfig, isProduction = false) {
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, envContent);
  
  console.log(`Environment file created at: ${envPath}`);
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`Production URL: ${envConfig.PRODUCTION_URL}`);
  console.log(`Allowed Origins: ${envConfig.ALLOWED_ORIGINS}`);
  console.log('\n IMPORTANT: Please update the JWT_SECRET in production!');
}

function main() {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--production') || args.includes('-p');

  if (fs.existsSync(envPath)) {
    console.log('  .env file already exists. Do you want to overwrite it? (y/N)');
    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        createEnvFile(isProduction ? productionEnv : defaultEnv, isProduction);
      } else {
        console.log(' Environment file creation cancelled.');
      }
      process.exit(0);
    });
  } else {
    createEnvFile(isProduction ? productionEnv : defaultEnv, isProduction);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 