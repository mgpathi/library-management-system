/**
 * Database Seed Data
 * Run once to populate initial data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Models
const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const BorrowRecord = require('../models/BorrowRecord');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Book.deleteMany({});
    await BorrowRecord.deleteMany({});

    // Create Admin User
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@library.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      address: {
        street: '123 Admin St',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    });
    console.log('✅ Created Admin user');

    // Create Librarian User
    const librarianUser = await User.create({
      firstName: 'Librarian',
      lastName: 'Staff',
      email: 'librarian@library.com',
      phone: '9876543211',
      password: 'librarian123',
      role: 'librarian',
      status: 'active',
      address: {
        street: '456 Library Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    });
    console.log('✅ Created Librarian user');

    // Create Student Users
    const student1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@student.com',
      phone: '9876543212',
      password: 'student123',
      role: 'student',
      status: 'active',
      address: {
        street: '789 Student Ave',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      }
    });
    console.log('✅ Created Student user 1');

    const student2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@student.com',
      phone: '9876543213',
      password: 'student123',
      role: 'student',
      status: 'active',
      address: {
        street: '321 College Rd',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001'
      }
    });
    console.log('✅ Created Student user 2');

    const student3 = await User.create({
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@student.com',
      phone: '9876543214',
      password: 'student123',
      role: 'student',
      status: 'active',
      address: {
        street: '654 University St',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      }
    });
    console.log('✅ Created Student user 3');

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Fiction',
        description: 'Fictional stories and novels',
        icon: '📖',
        color: '#FF6B6B',
        slug: 'fiction'
      },
      {
        name: 'Non-Fiction',
        description: 'Educational and informative books',
        icon: '📚',
        color: '#4ECDC4',
        slug: 'non-fiction'
      },
      {
        name: 'Science',
        description: 'Science and scientific discoveries',
        icon: '🔬',
        color: '#45B7D1',
        slug: 'science'
      },
      {
        name: 'History',
        description: 'Historical books and chronicles',
        icon: '📜',
        color: '#FFA500',
        slug: 'history'
      },
      {
        name: 'Self-Help',
        description: 'Personal development books',
        icon: '🌟',
        color: '#FFD700',
        slug: 'self-help'
      },
      {
        name: 'Technology',
        description: 'Technology and programming books',
        icon: '💻',
        color: '#00FF00',
        slug: 'technology'
      }
    ]);
    console.log('✅ Created 6 categories');

    // Create Books
    const books = await Book.insertMany([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        category: categories[0]._id,
        description: 'A classic American novel set in the Jazz Age.',
        publisher: 'Scribner',
        publishedYear: 1925,
        language: 'English',
        totalCopies: 5,
        availableCopies: 3,
        borrowedCopies: 2,
        damagedCopies: 0,
        replacementCost: 500,
        status: 'available'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        category: categories[0]._id,
        description: 'A gripping tale of racial injustice and childhood innocence.',
        publisher: 'J.B. Lippincott',
        publishedYear: 1960,
        language: 'English',
        totalCopies: 4,
        availableCopies: 2,
        borrowedCopies: 2,
        damagedCopies: 0,
        replacementCost: 400,
        status: 'available'
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0-553-38016-3',
        category: categories[2]._id,
        description: 'Exploring the mysteries of the universe and black holes.',
        publisher: 'Bantam Books',
        publishedYear: 1988,
        language: 'English',
        totalCopies: 3,
        availableCopies: 1,
        borrowedCopies: 2,
        damagedCopies: 0,
        replacementCost: 600,
        status: 'available'
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '978-0-06-231609-7',
        category: categories[1]._id,
        description: 'A brief history of humankind from the Stone Age to modern times.',
        publisher: 'HarperCollins',
        publishedYear: 2011,
        language: 'English',
        totalCopies: 6,
        availableCopies: 4,
        borrowedCopies: 2,
        damagedCopies: 0,
        replacementCost: 550,
        status: 'available'
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0-13-235088-4',
        category: categories[5]._id,
        description: 'A Handbook of Agile Software Craftsmanship.',
        publisher: 'Prentice Hall',
        publishedYear: 2008,
        language: 'English',
        totalCopies: 4,
        availableCopies: 2,
        borrowedCopies: 2,
        damagedCopies: 0,
        replacementCost: 700,
        status: 'available'
      },
      {
        title: 'The Art of War',
        author: 'Sun Tzu',
        isbn: '978-1-59308-595-7',
        category: categories[3]._id,
        description: 'Ancient Chinese military treatise and philosophy.',
        publisher: 'Dover Publications',
        publishedYear: 500,
        language: 'English',
        totalCopies: 5,
        availableCopies: 5,
        borrowedCopies: 0,
        damagedCopies: 0,
        replacementCost: 300,
        status: 'available'
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '978-0-7352-1129-3',
        category: categories[4]._id,
        description: 'An Easy and Proven Way to Build Good Habits and Break Bad Ones.',
        publisher: 'Avery',
        publishedYear: 2018,
        language: 'English',
        totalCopies: 7,
        availableCopies: 3,
        borrowedCopies: 4,
        damagedCopies: 0,
        replacementCost: 480,
        status: 'available'
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-28423-4',
        category: categories[0]._id,
        description: 'A dystopian novel about totalitarianism.',
        publisher: 'Penguin Books',
        publishedYear: 1949,
        language: 'English',
        totalCopies: 4,
        availableCopies: 2,
        borrowedCopies: 2,
        damagedCopies: 0,
        replacementCost: 450,
        status: 'available'
      },
      {
        title: 'The Selfish Gene',
        author: 'Richard Dawkins',
        isbn: '978-0-19-288723-0',
        category: categories[2]._id,
        description: 'A revolutionary look at evolution and natural selection.',
        publisher: 'Oxford University Press',
        publishedYear: 1976,
        language: 'English',
        totalCopies: 3,
        availableCopies: 3,
        borrowedCopies: 0,
        damagedCopies: 0,
        replacementCost: 520,
        status: 'available'
      },
      {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        isbn: '978-0-57-507-7',
        category: categories[0]._id,
        description: 'A journey through infinite possibilities and alternate lives.',
        publisher: 'Viking',
        publishedYear: 2020,
        language: 'English',
        totalCopies: 5,
        availableCopies: 2,
        borrowedCopies: 3,
        damagedCopies: 0,
        replacementCost: 500,
        status: 'available'
      }
    ]);
    console.log('✅ Created 10 sample books');

    // Create Sample Borrow Records
    const borrowRecords = await BorrowRecord.insertMany([
      {
        user: student1._id,
        book: books[0]._id,
        borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: 'active',
        issuedBy: librarianUser._id,
        renewalCount: 0
      },
      {
        user: student2._id,
        book: books[1]._id,
        borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days overdue
        status: 'overdue',
        issuedBy: librarianUser._id,
        renewalCount: 0
      },
      {
        user: student3._id,
        book: books[2]._id,
        borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        status: 'active',
        issuedBy: librarianUser._id,
        renewalCount: 0
      }
    ]);
    console.log('✅ Created 3 sample borrow records');

    // Update book available copies
    await Book.findByIdAndUpdate(books[0]._id, { borrowedCopies: 2 });
    await Book.findByIdAndUpdate(books[1]._id, { borrowedCopies: 2 });
    await Book.findByIdAndUpdate(books[2]._id, { borrowedCopies: 2 });

    // Update category book counts
    const categories_update = [
      { _id: categories[0]._id, count: 4 }, // Fiction
      { _id: categories[1]._id, count: 1 }, // Non-Fiction
      { _id: categories[2]._id, count: 2 }, // Science
      { _id: categories[3]._id, count: 1 }, // History
      { _id: categories[4]._id, count: 1 }, // Self-Help
      { _id: categories[5]._id, count: 1 }  // Technology
    ];

    for (const cat of categories_update) {
      await Category.findByIdAndUpdate(cat._id, { bookCount: cat.count });
    }

    console.log('✅ Updated category book counts');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@library.com / admin123');
    console.log('Librarian: librarian@library.com / librarian123');
    console.log('Student 1: john.doe@student.com / student123');
    console.log('Student 2: jane.smith@student.com / student123');
    console.log('Student 3: michael.j@student.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
