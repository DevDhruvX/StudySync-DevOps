# 🚀 StudySync DevOps Setup - Complete Guide

## 📋 Current Status

- ✅ Code is ready with Docker containers and CI/CD pipelines
- ✅ JWT secrets generated
- ❌ No GitHub repository yet
- ❌ No MongoDB database setup
- ❌ No Docker Hub account

---

## 🎯 Step 1: GitHub Repository Setup

### Initialize Git Repository

```bash
# Run in your project root directory
git init
git add .
git commit -m "Initial commit: StudySync DevOps project with Docker and CI/CD"
```

### Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"** (+ button)
3. Repository name: **`studysync-devops`**
4. Description: **"StudySync Notes App with Complete DevOps Pipeline"**
5. Set to **Public** (for educational/portfolio purposes)
6. ✅ **DO NOT** initialize with README (we already have files)
7. Click **"Create repository"**

### Connect Local to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/studysync-devops.git
git branch -M main
git push -u origin main
```

---

## 🍃 Step 2: MongoDB Atlas Setup (FREE)

### Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Click **"Try Free"**
3. Sign up with email or Google account
4. Choose **"M0 Sandbox"** (FREE tier - 512 MB)

### Setup Cluster

1. **Cluster Name**: `studysync-cluster`
2. **Cloud Provider**: AWS (default)
3. **Region**: Choose closest to you
4. Click **"Create Cluster"** (takes 3-5 minutes)

### Configure Database Access

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. **Username**: `studysync_user`
4. **Password**: Generate secure password (save it!)
5. **Database User Privileges**: "Read and write to any database"
6. Click **"Add User"**

### Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Get Connection String

1. Go to **"Database"** → **"Connect"**
2. Click **"Connect your application"**
3. **Driver**: Node.js, **Version**: 4.1 or later
4. Copy connection string (looks like):
   ```
   mongodb+srv://studysync_user:<password>@studysync-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

---

## 🐳 Step 3: Docker Hub Setup

### Create Docker Hub Account

1. Go to [Docker Hub](https://hub.docker.com)
2. Sign up (free account)
3. **Username**: Choose something like `yourusername` or `yourname-dev`

### Generate Access Token

1. Go to **Account Settings** → **Security**
2. Click **"New Access Token"**
3. **Description**: `StudySync CI/CD Pipeline`
4. **Permissions**: **Read & Write**
5. Click **"Generate"**
6. **COPY THE TOKEN** immediately (you won't see it again!)

---

## 🔐 Step 4: GitHub Secrets Configuration

Once your repo is created, go to:
**Your Repo** → **Settings** → **Secrets and variables** → **Actions**

Add these secrets one by one:

| Secret Name       | Value                                                              | Source       |
| ----------------- | ------------------------------------------------------------------ | ------------ |
| `JWT_SECRET`      | `c63143fce243480a29b6dcdf91113bf5fb3b772fa6756233ab070a5a2e7df7a7` | ✅ Generated |
| `NODE_ENV`        | `production`                                                       | ✅ Ready     |
| `MONGODB_URI`     | Your Atlas connection string                                       | 🔄 Step 2    |
| `DOCKER_USERNAME` | Your Docker Hub username                                           | 🔄 Step 3    |
| `DOCKER_PASSWORD` | Your Docker Hub access token                                       | 🔄 Step 3    |

### Optional (for later deployment):

| Secret Name    | Value                        | Notes            |
| -------------- | ---------------------------- | ---------------- |
| `FRONTEND_URL` | `https://yourdomain.com`     | Your website URL |
| `BACKEND_URL`  | `https://api.yourdomain.com` | Your API URL     |

---

## ✅ Verification Steps

### Test Local Setup

```bash
# Test MongoDB connection
npm run start

# Run tests
npm test

# Build Docker images
docker-compose build

# Start full stack
docker-compose up
```

### Test GitHub Actions

1. Make any small change to README.md
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push
   ```
3. Go to your repo → **Actions** tab
4. Watch the CI/CD pipeline run! 🎉

---

## 🚨 Common Issues & Solutions

**Git push fails**: Check if remote URL is correct

```bash
git remote -v
```

**MongoDB connection fails**:

- Check username/password in connection string
- Verify IP whitelist includes 0.0.0.0/0

**Docker push fails**:

- Make sure you used Access Token, not password
- Check Docker Hub username is correct

**GitHub Actions fail**:

- Verify all 5 secrets are added with exact names
- Check secret values don't have extra spaces

---

## 🎯 Ready for Next Steps?

Once these 4 steps are complete:

- ✅ GitHub repo created and code pushed
- ✅ MongoDB Atlas cluster running
- ✅ Docker Hub account with access token
- ✅ All secrets configured in GitHub

We can then build the **Monitoring Stack** (Prometheus + Grafana) and **Production Deployment**! 📊🚀
