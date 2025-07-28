import { sequelize } from '../config/db.js';
import About from '../models/About.js';

async function syncAboutModel() {
  try {
    console.log('Syncing About model with database...');
    
    // This will alter the table to match the model definition
    await About.sync({ alter: true });
    
    console.log('About model synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing About model:', error);
    process.exit(1);
  }
}

syncAboutModel();
