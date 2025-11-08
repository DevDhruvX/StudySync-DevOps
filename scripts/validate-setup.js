#!/usr/bin/env node

// Simple script to validate GitHub secrets setup
console.log('🔍 GitHub Secrets Validation Guide\n');

console.log('📋 ESSENTIAL SECRETS CHECKLIST:');
console.log('');

const essentialSecrets = [
  'JWT_SECRET',
  'NODE_ENV', 
  'DOCKER_USERNAME',
  'DOCKER_PASSWORD',
  'MONGODB_URI'
];

essentialSecrets.forEach((secret, index) => {
  console.log(`${index + 1}. ${secret}`);
});

console.log('\n🎯 HOW TO VERIFY:');
console.log('1. Go to your GitHub repo');
console.log('2. Settings > Secrets and variables > Actions');
console.log('3. You should see all 5 secrets listed above');
console.log('');

console.log('💡 TESTING LOCALLY:');
console.log('Create a .env file in backend/ directory with:');
console.log('');
console.log('JWT_SECRET=c63143fce243480a29b6dcdf91113bf5fb3b772fa6756233ab070a5a2e7df7a7');
console.log('NODE_ENV=development');
console.log('MONGODB_URI=mongodb://localhost:27017/studysync');
console.log('PORT=5000');
console.log('');

console.log('🚀 QUICK TEST:');
console.log('Run: npm test');
console.log('This will verify your JWT secret is working!');
console.log('');

// Show current status
const fs = require('fs');
const path = require('path');

try {
  const backendEnv = path.join(__dirname, '..', 'backend', '.env');
  if (fs.existsSync(backendEnv)) {
    console.log('✅ Found backend/.env file');
  } else {
    console.log('⚠️  No backend/.env file found (create one for local testing)');
  }
} catch (error) {
  console.log('ℹ️  Run from studysync root directory for file checks');
}

console.log('\n🎉 Once secrets are set up, we can build monitoring stack!');