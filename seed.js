const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");

const User = require('./models/User'); // Adjust the path based on your project structure
dotenv.config();

async function seedDatabase() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URL);

  // Define sample users with hashed passwords
  const users = [
    {
      username: 'adminUser',
      email: 'admin@example.com',
      password: await bcrypt.hash('adminPassword', 10),
      isAdmin: true,
    },
    {
      username: 'user1',
      email: 'user1@example.com',
      password: await bcrypt.hash('user1Password', 10),
      isAdmin: false,
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: await bcrypt.hash('user2Password', 10),
      isAdmin: false,
    },
    {
      username: 'user3',
      email: 'user3@example.com',
      password: await bcrypt.hash('user3Password', 10),
      isAdmin: false,
    },
    {
      username: 'user4',
      email: 'user4@example.com',
      password: await bcrypt.hash('user4Password', 10),
      isAdmin: false,
    },
  ];

  // Insert users into the 'Users' collection
  await User.insertMany(users);

  // Disconnect from MongoDB
  await mongoose.disconnect();

  console.log('Database seeded successfully.');
}

// Run the seeder function
seedDatabase();
