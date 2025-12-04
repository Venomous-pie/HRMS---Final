import { sequelize } from '../models/index.js';

async function addBookingSourceColumn() {
  try {
    console.log('🔧 Adding bookingSource column to Reservations table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      PRAGMA table_info(Reservations);
    `);
    
    const columnExists = results.some(column => column.name === 'bookingSource');
    
    if (columnExists) {
      console.log('✅ bookingSource column already exists');
      return;
    }
    
    // Add the column
    await sequelize.query(`
      ALTER TABLE Reservations 
      ADD COLUMN bookingSource TEXT DEFAULT 'Direct Booking';
    `);
    
    console.log('✅ Successfully added bookingSource column');
    
    // Update existing records to have a default value
    await sequelize.query(`
      UPDATE Reservations 
      SET bookingSource = 'Direct Booking' 
      WHERE bookingSource IS NULL;
    `);
    
    console.log('✅ Updated existing records with default booking source');
    
  } catch (error) {
    console.error('❌ Error adding bookingSource column:', error);
    throw error;
  }
}

// Run if called directly
console.log('🚀 Starting migration script...');
addBookingSourceColumn()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

export { addBookingSourceColumn };
