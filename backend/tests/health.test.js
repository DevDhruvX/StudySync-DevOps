// tests/health.test.js - Sample test for CI/CD pipeline
const request = require('supertest');
const mongoose = require('mongoose');

// Mock Express app for testing
const express = require('express');
const healthRoutes = require('../routes/health');

const app = express();
app.use('/api/health', healthRoutes);

describe('Health Check Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    if (process.env.NODE_ENV === 'test') {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/studysync_test?authSource=admin';
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'StudySync Backend API');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('memory');
    });

    it('should return database connection status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.database).toHaveProperty('status');
      expect(response.body.database).toHaveProperty('responsive');
      
      if (process.env.NODE_ENV === 'test') {
        expect(response.body.database.status).toBe('connected');
      }
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(Array.isArray(response.body.checks)).toBe(true);
      
      // Check that we have expected health checks
      const checkNames = response.body.checks.map(check => check.name);
      expect(checkNames).toContain('database');
      expect(checkNames).toContain('memory');
      expect(checkNames).toContain('disk_space');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      
      if (process.env.NODE_ENV === 'test' && mongoose.connection.readyState === 1) {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ready');
      }
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
    });
  });
});

// Integration test for the full API
describe('API Integration Tests', () => {
  it('should handle basic API endpoint', async () => {
    // This would test actual API endpoints
    // For now, just test that the health endpoint works
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBeTruthy();
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should respond to health check within reasonable time', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/health')
      .expect(200);
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });
});