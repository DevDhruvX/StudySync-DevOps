# 🚀 DevOps Setup Guide for Beginners

## Current Progress ✅

- [x] **Step 1: Containerization** - Docker containers created
- [ ] **Step 2: CI/CD Pipeline** - GitHub Actions (In Progress)
- [ ] **Step 3: Database Setup** - MongoDB configuration
- [ ] **Step 4: Deployment** - Cloud deployment (Coming Soon)

## 📋 Prerequisites Checklist

### Required Software:

- [ ] **Git** - For version control
- [ ] **Docker Desktop** - For containerization
- [ ] **Node.js** - For running the application
- [ ] **GitHub Account** - For CI/CD pipeline

## 🛠️ Installation Steps

### 1. Install Docker Desktop

```
1. Download: https://docs.docker.com/desktop/install/windows-install/
2. Install and restart computer
3. Start Docker Desktop
4. Verify: docker --version
```

### 2. Install Git (if not installed)

```
1. Download: https://git-scm.com/download/win
2. Install with default settings
3. Verify: git --version
```

### 3. Install Node.js

```
1. Download: https://nodejs.org/en/download/
2. Install LTS version
3. Verify: node --version && npm --version
```

## 🗄️ Database Setup Process

### Step 1: Start MongoDB Container

```powershell
# Navigate to project
cd "c:\Users\Dhruv choudhary\Desktop\DevOps Project\studysync"

# Start only database
docker compose up -d mongodb

# Check if it's running
docker compose ps
```

### Step 2: Verify Database Connection

```powershell
# Check MongoDB logs
docker compose logs mongodb

# Connect to MongoDB (optional)
docker exec -it studysync-mongodb mongosh -u admin -p password123
```

### Step 3: Start Full Application

```powershell
# Start all services
docker compose up -d

# Check all containers
docker compose ps

# View application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 🔄 CI/CD Pipeline Setup

### Step 1: GitHub Repository Setup

1. Your GitHub repo is already created ✅
2. Push your code to GitHub
3. GitHub Actions will automatically run

### Step 2: Configure Secrets (For Advanced CI/CD)

In your GitHub repository settings:

```
Settings → Secrets and Variables → Actions → New repository secret

Add these secrets:
- DOCKER_USERNAME: your-dockerhub-username
- DOCKER_PASSWORD: your-dockerhub-password
```

### Step 3: Monitor Pipeline

- Go to your GitHub repo
- Click "Actions" tab
- Watch your pipeline run automatically

## 🚨 Common Issues & Solutions

### Docker Issues:

```
Error: "docker command not found"
Solution: Install Docker Desktop and restart terminal

Error: "Cannot connect to Docker daemon"
Solution: Start Docker Desktop application
```

### Container Issues:

```
Error: "Port already in use"
Solution: docker compose down && docker compose up -d

Error: "Container won't start"
Solution: Check logs with docker compose logs [service-name]
```

### Git Issues:

```
Error: "Permission denied"
Solution: Set up SSH keys or use HTTPS with token

Error: "Repository not found"
Solution: Check repository URL and permissions
```

## 📊 What Each Step Does

### Containerization (Step 1) ✅

- **Purpose**: Package application into containers
- **Benefits**: Consistent environment, easy deployment
- **Files**: `Dockerfile`, `docker-compose.yml`

### CI/CD Pipeline (Step 2) 🔄

- **Purpose**: Automate testing and deployment
- **Benefits**: Catch bugs early, faster releases
- **Files**: `.github/workflows/*.yml`

### Database Setup (Step 2.5)

- **Purpose**: Persistent data storage
- **Benefits**: Data survives container restarts
- **Files**: `init-mongo.js`, database models

### Deployment (Step 3) 📅

- **Purpose**: Make application available online
- **Benefits**: Real users can access your app
- **Platforms**: AWS, Azure, Google Cloud, etc.

## 🎯 Next Steps After Installation

1. **Install Docker Desktop** (Most Important!)
2. **Test database connection**
3. **Run the application locally**
4. **Push code to GitHub**
5. **Watch CI/CD pipeline run**
6. **Plan deployment strategy**

## 📞 Need Help?

If you encounter any issues:

1. Check this guide first
2. Look at container logs: `docker compose logs [service]`
3. Verify all prerequisites are installed
4. Make sure Docker Desktop is running

Remember: DevOps is a journey, not a destination! 🚀
