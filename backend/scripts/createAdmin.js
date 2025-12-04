#!/usr/bin/env node

import { sequelize, User } from '../models/index.js';
import { seedAdminUser, createCustomAdmin } from '../services/adminSeedService.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function createAdminAccount() {
  console.log('\n🏨 Grand Resort - Admin Account Setup');
  console.log('=====================================\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync models (create tables if they don't exist)
    await sequelize.sync();
    console.log('✓ Database synchronized');

    const choice = await question(`
Choose an option:
1. Create default admin account
2. Create custom admin account
3. Exit

Enter your choice (1-3): `);

    switch (choice.trim()) {
      case '1':
        await createDefaultAdmin();
        break;
      case '2':
        await createCustomAdminInteractive();
        break;
      case '3':
        console.log('Goodbye! 👋');
        break;
      default:
        console.log('Invalid choice. Please run the script again.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

async function createDefaultAdmin() {
  try {
    const admin = await seedAdminUser();
    if (admin) {
      console.log('\n🎉 Default admin account created successfully!');
      console.log('\n📧 You can now login with:');
      console.log('   • Username: admin');
      console.log('   • Email: admin@grandresort.com');
      console.log('   • Password: Admin@123');
      console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log('\n⚠️  Default admin account could not be created (credentials may be taken)');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}

async function createCustomAdminInteractive() {
  try {
    console.log('\n📝 Enter admin account details:');
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const phone = await question('Phone (optional): ');
    const department = await question('Department (optional): ');

    if (!username || !email || !password || !firstName || !lastName) {
      console.log('❌ All required fields must be filled!');
      return;
    }

    const adminData = {
      username,
      email,
      password,
      firstName,
      lastName,
      phone: phone || null,
      department: department || 'Management'
    };

    const admin = await createCustomAdmin(adminData);
    
    console.log('\n🎉 Custom admin account created successfully!');
    console.log('\n📧 Login credentials:');
    console.log(`   • Username: ${username}`);
    console.log(`   • Email: ${email}`);
    console.log('   • Password: [as entered]');

  } catch (error) {
    console.error('❌ Error creating custom admin:', error.message);
  }
}

// Run the script
createAdminAccount();