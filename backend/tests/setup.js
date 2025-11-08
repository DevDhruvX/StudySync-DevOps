// tests/setup.js - Test environment setup
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Setup before all tests
beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 Setting up test environment...');
    
    // Start in-memory MongoDB for testing
    if (!process.env.MONGODB_URI) {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      process.env.MONGODB_URI = uri;
      console.log('🗄️ In-memory MongoDB started at:', uri);
    }
  }
}, 60000);

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  
  if (mongod) {
    await mongod.stop();
    console.log('🗄️ In-memory MongoDB stopped');
  }
}, 60000);

// Set test timeout
jest.setTimeout(30000);

// Global test configuration
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};