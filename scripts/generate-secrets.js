#!/usr/bin/env node

const crypto = require('crypto');
const os = require('os');

console.log('🔐 StudySync GitHub Secrets Generator\n');
console.log('Copy these values to your GitHub repository secrets:\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('');

// Environment configurations
console.log('ENVIRONMENT SECRETS:');
console.log('NODE_ENV: production');
console.log('FRONTEND_URL: https://your-domain.com');
console.log('BACKEND_URL: https://api.your-domain.com');
console.log('CORS_ORIGINS: https://your-domain.com,https://www.your-domain.com');
console.log('');

// Docker configuration
console.log('DOCKER SECRETS (get from Docker Hub):');
console.log('DOCKER_USERNAME: your-dockerhub-username');
console.log('DOCKER_PASSWORD: your-dockerhub-access-token');
console.log('');

// Database configuration
console.log('DATABASE SECRETS:');
console.log('MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/studysync?retryWrites=true&w=majority');
console.log('');

// Deployment configuration
console.log('DEPLOYMENT SECRETS:');
console.log('DEPLOY_HOST: your-server-ip-or-domain');
console.log('DEPLOY_USER: ubuntu');
console.log('DEPLOY_PATH: /home/ubuntu/studysync');
console.log('');

// SSH Key generation instructions
console.log('📋 SSH KEY GENERATION:');
console.log('Run these commands in Git Bash or WSL:');
console.log('');
console.log('# Generate SSH key pair');
console.log('ssh-keygen -t rsa -b 4096 -f ~/.ssh/studysync_deploy -N ""');
console.log('');
console.log('# Display public key (add to your server)');
console.log('cat ~/.ssh/studysync_deploy.pub');
console.log('');
console.log('# Display private key (use as DEPLOY_SSH_KEY secret)');
console.log('cat ~/.ssh/studysync_deploy');
console.log('');

console.log('🎯 NEXT STEPS:');
console.log('1. Go to GitHub > Settings > Secrets and variables > Actions');
console.log('2. Add each secret with the exact name shown above');
console.log('3. Set up Docker Hub access token');
console.log('4. Configure MongoDB Atlas or your database');
console.log('5. Generate and configure SSH keys for deployment');