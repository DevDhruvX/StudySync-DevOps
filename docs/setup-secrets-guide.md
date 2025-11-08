# 🚀 GitHub Secrets Setup Guide - Step by Step

## 📋 Essential Secrets (Start with these)

### 1. JWT_SECRET ✅

```
c63143fce243480a29b6dcdf91113bf5fb3b772fa6756233ab070a5a2e7df7a7
```

### 2. NODE_ENV

```
production
```

### 3. Docker Hub Setup 🐳

**Step 1**: Go to [Docker Hub](https://hub.docker.com/)
**Step 2**: Sign in/Create account
**Step 3**: Go to Account Settings > Security > New Access Token
**Step 4**: Create token with "Read & Write" permissions
**Step 5**: Copy your username and token

```
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-access-token-here
```

### 4. MongoDB Atlas Setup 🍃

**Option A - Free MongoDB Atlas:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create cluster (choose free tier)
4. Get connection string from "Connect" button
5. Replace `<password>` with your database password

**Option B - Local MongoDB (for testing):**

```
MONGODB_URI: mongodb://localhost:27017/studysync
```

## 🔧 How to Add Secrets to GitHub

### Step 1: Navigate to Repository

1. Go to your GitHub repository
2. Click **Settings** tab (top right)
3. In left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret

For each secret below, click **New repository secret**:

| Secret Name       | Value                                                              | Notes             |
| ----------------- | ------------------------------------------------------------------ | ----------------- |
| `JWT_SECRET`      | `c63143fce243480a29b6dcdf91113bf5fb3b772fa6756233ab070a5a2e7df7a7` | ✅ Generated      |
| `NODE_ENV`        | `production`                                                       | ✅ Ready          |
| `DOCKER_USERNAME` | Your Docker Hub username                                           | 🔄 Need to create |
| `DOCKER_PASSWORD` | Your Docker Hub access token                                       | 🔄 Need to create |
| `MONGODB_URI`     | Your MongoDB connection string                                     | 🔄 Need to setup  |

## 🎯 Quick Setup Commands

### Copy these exact values for GitHub secrets:

```bash
# Essential secrets (copy-paste ready)
JWT_SECRET=c63143fce243480a29b6dcdf91113bf5fb3b772fa6756233ab070a5a2e7df7a7
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000
```

## ✅ Validation Checklist

- [ ] JWT_SECRET added to GitHub (32+ characters)
- [ ] NODE_ENV set to "production"
- [ ] Docker Hub account created
- [ ] DOCKER_USERNAME and DOCKER_PASSWORD added
- [ ] MongoDB URI configured and tested
- [ ] All secrets show up in GitHub Actions secrets list

## 🚨 Common Issues & Solutions

**Issue**: Docker push fails
**Solution**: Make sure you used Access Token, not password

**Issue**: MongoDB connection fails  
**Solution**: Check network access in MongoDB Atlas

**Issue**: Secrets not working in Actions
**Solution**: Secret names are case-sensitive, check exact spelling

---

## 🎉 Once Done...

After adding these 5 essential secrets, your CI/CD pipeline will be able to:

- ✅ Build and test your application
- ✅ Push Docker images to Docker Hub
- ✅ Connect to your database
- ✅ Deploy securely with JWT authentication

**Next**: Let's build the monitoring stack (Prometheus + Grafana)! 📊
