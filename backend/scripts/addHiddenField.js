import { sequelize } from '../config/db.js';

async function addHiddenField() {
  try {
    console.log('Adding hidden field to posts table...');
    
    // Check if the column already exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'Posts' 
      AND COLUMN_NAME = 'hidden'
    `);
    
    if (results[0].count === 0) {
      // Add the hidden column if it doesn't exist
      await sequelize.query(`
        ALTER TABLE Posts 
        ADD COLUMN hidden BOOLEAN DEFAULT FALSE
      `);
      
      console.log('✅ Hidden field added successfully to posts table');
    } else {
      console.log('ℹ️ Hidden field already exists in posts table');
    }
    
    // Update all existing posts to have hidden = false by default
    await sequelize.query(`
      UPDATE Posts 
      SET hidden = FALSE 
      WHERE hidden IS NULL
    `);
    
    console.log('✅ All existing posts updated with hidden = false');
    
  } catch (error) {
    console.error('❌ Error adding hidden field:', error);
  } finally {
    await sequelize.close();
  }
}

addHiddenField();
