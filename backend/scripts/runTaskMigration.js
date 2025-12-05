import { sequelize } from '../models/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTaskMigration() {
  try {
    console.log('🚀 Starting Task table migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if Tasks table already exists
    const [results] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Tasks'
    `);
    
    if (results.length > 0) {
      console.log('⚠️  Tasks table already exists. Skipping migration.');
      console.log('   If you want to recreate it, drop the table first.');
      return;
    }
    
    // Read and execute the migration
    const migrationPath = join(__dirname, '../migrations/20241215000000-create-tasks-table.js');
    const migrationModule = await import(migrationPath);
    const migration = migrationModule.default;
    
    // Get queryInterface from sequelize
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = sequelize.constructor;
    
    // Run the up migration
    await migration.up(queryInterface, Sequelize);
    
    console.log('✅ Task table created successfully');
    console.log('📊 Migration completed successfully');
    
    // Verify the table was created
    const [verifyResults] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Tasks'
    `);
    
    if (verifyResults.length > 0) {
      console.log('✅ Verified: Tasks table exists');
      
      // Show table structure
      const [columns] = await sequelize.query(`
        PRAGMA table_info(Tasks)
      `);
      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('💥 Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

runTaskMigration();

