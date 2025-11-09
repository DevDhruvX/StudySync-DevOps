# 🔐 GitHub Secrets Setup Guide

## What are GitHub Secrets?

GitHub Secrets are encrypted environment variables that you create for your repository. They're used to store sensitive information like passwords, API keys, and tokens that your CI/CD pipeline needs but shouldn't be visible in your code.

## 🎯 Required Secrets for StudySync CI/CD

### For Basic CI/CD (Optional):

- Currently no secrets needed for the simple pipeline!

### For Advanced CI/CD with Docker Hub (Recommended):

1. **DOCKER_USERNAME** - Your Docker Hub username
2. **DOCKER_PASSWORD** - Your Docker Hub password or access token

## 📋 Step-by-Step Setup

### Step 1: Create Docker Hub Account (Optional but Recommended)

1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up for a free account
3. Verify your email
4. Remember your username and password

### Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository: `https://github.com/DevDhruvX/DevOps-Project`
2. Click **Settings** tab (top right of repo)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Step 3: Add Each Secret

#### Add DOCKER_USERNAME:

- **Name**: `DOCKER_USERNAME`
- **Secret**: `your-dockerhub-username`
- Click **Add secret**

#### Add DOCKER_PASSWORD:

- **Name**: `DOCKER_PASSWORD`
- **Secret**: `your-dockerhub-password`
- Click **Add secret**

## 🔧 Alternative: Using Access Tokens (More Secure)

Instead of your Docker Hub password, you can use an access token:

1. Login to Docker Hub
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Give it a name: "GitHub Actions"
5. Set permissions: **Read, Write, Delete**
6. Copy the generated token
7. Use this token as your `DOCKER_PASSWORD` secret

## 🚀 Testing Your Setup

After adding secrets, your CI/CD pipeline will:

1. **Simple CI/CD** (works immediately):

   - ✅ Run tests on every push
   - ✅ Build Docker images
   - ✅ No secrets required

2. **Advanced CI/CD** (after adding secrets):
   - ✅ Run tests on every push
   - ✅ Build Docker images
   - ✅ Push images to Docker Hub
   - ✅ Security scanning
   - ✅ Deployment preparation

## 🎯 Which Pipeline Should You Use?

### For Beginners (Recommended):

- Use `simple-ci.yml`
- No secrets needed
- Perfect for learning
- Builds and tests your code

### For Advanced Users:

- Use `ci-cd.yml`
- Requires Docker Hub secrets
- Pushes images to registry
- Production-ready pipeline

## 🔍 Verifying Secrets are Working

1. Push code to your main branch
2. Go to **Actions** tab in GitHub
3. Click on the latest workflow run
4. If secrets are working: ✅ Green checkmarks
5. If secrets missing: ❌ Red X with error messages

## 🚨 Troubleshooting

### Common Issues:

#### "Error: Could not login to Docker Hub"

- **Cause**: Wrong username/password in secrets
- **Fix**: Double-check your Docker Hub credentials

#### "Error: denied: requested access to the resource is denied"

- **Cause**: Repository name doesn't match Docker Hub repo
- **Fix**: Check repository names match exactly

#### "Secrets not found"

- **Cause**: Secret names don't match exactly
- **Fix**: Ensure secret names are `DOCKER_USERNAME` and `DOCKER_PASSWORD` (case-sensitive)

## 📊 Current Status

- [x] GitHub repository created
- [x] CI/CD workflows created
- [ ] Docker Hub account created (optional)
- [ ] GitHub secrets configured (optional)
- [ ] First pipeline run successful

## 🎯 Next Steps

1. **Install Docker Desktop** (if not done)
2. **Test application locally**
3. **Push code to trigger CI/CD**
4. **Add Docker Hub secrets** (optional)
5. **Plan deployment strategy**

Remember: You can start with the simple CI/CD pipeline (no secrets required) and upgrade to the advanced one later! 🚀
