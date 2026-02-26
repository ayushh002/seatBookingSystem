const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/db');

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany({});

    const users = [];
    const password = await bcrypt.hash('password123', 10);

    // Admin
    users.push({
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      squad: 1,
      batch: 1,
      role: 'admin'
    });

    // 80 employees (10 squads × 8 members)
    for (let squad = 1; squad <= 10; squad++) {
      const batch = squad <= 5 ? 1 : 2;
      for (let member = 1; member <= 8; member++) {
        users.push({
          name: `Employee S${squad} M${member}`,
          email: `emp.s${squad}.m${member}@example.com`,
          password,
          squad,
          batch,
          role: 'employee'
        });
      }
    }

    await User.insertMany(users);
    console.log('80 employees + admin seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();