# 🔐 GitHub Secrets Configuration Checklist

## Required for CI/CD Pipeline

### Docker Registry Secrets

```
DOCKER_USERNAME          # Your Docker Hub username
DOCKER_PASSWORD          # Your Docker Hub access token (not password!)
DOCKER_REGISTRY          # Optional: defaults to docker.io
```

### AWS Deployment Secrets (if using AWS)

```
AWS_ACCESS_KEY_ID        # AWS IAM user access key
AWS_SECRET_ACCESS_KEY    # AWS IAM user secret key
AWS_REGION              # e.g., us-east-1
AWS_ECR_REPOSITORY      # ECR repository URI (if using ECR)
```

### Server Deployment Secrets

```
DEPLOY_HOST             # Your production server IP/domain
DEPLOY_USER             # SSH username for deployment
DEPLOY_SSH_KEY          # Private SSH key for server access
DEPLOY_PATH             # Path on server where app will be deployed
```

### Database & Environment

```
MONGODB_URI             # Production MongoDB connection string
JWT_SECRET              # JWT signing secret (generate strong random string)
NODE_ENV               # Set to "production"
```

### Security & Monitoring

```
SNYK_TOKEN              # Snyk security scanning token
SLACK_WEBHOOK           # Slack notifications webhook (optional)
SENTRY_DSN             # Error monitoring (optional)
```

### Application Configuration

```
FRONTEND_URL            # Production frontend URL
BACKEND_URL            # Production backend URL
CORS_ORIGINS           # Allowed CORS origins (comma-separated)
```

## 🛠️ How to Add These Secrets

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with exact name and value

## 🔒 Security Best Practices

### For Docker Hub Token:

1. Go to Docker Hub > Account Settings > Security
2. Create **New Access Token** with **Read & Write** permissions
3. Use this token as `DOCKER_PASSWORD`, NOT your account password

### For SSH Key:

```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/studysync_deploy

# Add public key to server's authorized_keys
ssh-copy-id -i ~/.ssh/studysync_deploy.pub user@your-server.com

# Use private key content as DEPLOY_SSH_KEY secret
cat ~/.ssh/studysync_deploy
```

### For JWT Secret:

```bash
# Generate secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🎯 Environment-Specific Secrets

You can also create **Environment secrets** for staging vs production:

### Staging Environment

- `STAGING_MONGODB_URI`
- `STAGING_DEPLOY_HOST`
- `STAGING_FRONTEND_URL`

### Production Environment

- `PROD_MONGODB_URI`
- `PROD_DEPLOY_HOST`
- `PROD_FRONTEND_URL`

## ✅ Verification Checklist

- [ ] Docker Hub credentials tested
- [ ] SSH key can connect to deployment server
- [ ] MongoDB URI connection works
- [ ] JWT secret is 32+ characters
- [ ] All URLs are accessible
- [ ] Security tokens are valid

## 🚨 Common Issues

1. **Docker Push Fails**: Check Docker Hub token permissions
2. **SSH Connection Fails**: Verify SSH key format and server access
3. **MongoDB Connection**: Ensure connection string includes credentials
4. **CORS Errors**: Add all frontend domains to CORS_ORIGINS

---

**Next**: Once secrets are configured, we'll build the monitoring stack! 📊
