# 🚀 Deployment Guide

This guide will help you deploy GitAid to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **PostgreSQL Database** with pgvector extension
   - Local PostgreSQL 14+ or cloud provider (Supabase, Neon, Railway, etc.)
   - pgvector extension installed

2. **API Keys & Tokens**:
   - Clerk authentication keys
   - Google Gemini API key
   - GitHub Personal Access Token

3. **Environment Variables** (see below)

---

## 🔑 Required Environment Variables

### Server-Side Variables (Required)
```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
GITHUB_TOKEN="ghp_your-github-token"
GEMINI_API_KEY="your-gemini-api-key"
CLERK_SECRET_KEY="sk_test_..."
NODE_ENV="production"
```

### Client-Side Variables (Required)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/dashboard"
```

### Optional Variables
```bash
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_FIREBASE_API_KEY="..."
# ... other Firebase variables if using Firebase
```

---

## 🌐 Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

### Step 1: Prepare Your Repository
1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure all environment variables are documented

### Step 2: Set Up Database
1. Create a PostgreSQL database with pgvector:
   - **Supabase**: https://supabase.com (free tier available)
   - **Neon**: https://neon.tech (free tier available)
   - **Railway**: https://railway.app
   - **Vercel Postgres**: Available in Vercel dashboard

2. Install pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. Get your `DATABASE_URL` connection string

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

### Step 4: Add Environment Variables
In Vercel dashboard → Project Settings → Environment Variables, add:

```
DATABASE_URL
GITHUB_TOKEN
GEMINI_API_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL
NEXT_PUBLIC_APP_URL (your Vercel URL)
```

### Step 5: Run Database Migrations
After first deployment, run migrations:

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: Using Prisma Studio (via Vercel CLI)**
```bash
vercel env pull .env.local
npx prisma studio
```

**Option C: Direct database connection**
Connect to your production database and run:
```bash
npx prisma migrate deploy
```

### Step 6: Deploy
1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

---

## 🐳 Option 2: Deploy with Docker

### Step 1: Build Docker Image
```bash
# Build the image
DOCKER_BUILD=true docker build -t git-gud-manager .

# Or use docker-compose (see docker-compose.yml below)
docker-compose build
```

### Step 2: Run Database Migrations
```bash
# Set environment variables
export DATABASE_URL="your-database-url"

# Run migrations
docker run --rm --env-file .env git-gud-manager npx prisma migrate deploy
```

### Step 3: Run Container
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name git-gud-manager \
  git-gud-manager
```

### Docker Compose Example
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      args:
        DOCKER_BUILD: "true"
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gitgud
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

---

## 🚂 Option 3: Deploy to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### Step 3: Add PostgreSQL Database
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create a PostgreSQL instance
3. Copy the `DATABASE_URL` from the database service

### Step 4: Install pgvector
1. Go to your PostgreSQL service
2. Click "Query" tab
3. Run: `CREATE EXTENSION IF NOT EXISTS vector;`

### Step 5: Configure Environment Variables
In Railway dashboard → Variables, add all required environment variables.

### Step 6: Deploy
Railway will automatically deploy on every push to your main branch.

### Step 7: Run Migrations
Add a one-time command in Railway:
```bash
npx prisma migrate deploy
```

Or use Railway CLI:
```bash
railway run npx prisma migrate deploy
```

---

## ☁️ Option 4: Deploy to AWS/Google Cloud/Azure

### General Steps:
1. **Set up PostgreSQL database** with pgvector extension
2. **Build Docker image** and push to container registry
3. **Deploy container** to:
   - AWS: ECS, EKS, or App Runner
   - Google Cloud: Cloud Run, GKE
   - Azure: Container Instances, AKS
4. **Configure environment variables** in your platform
5. **Run database migrations** using Prisma CLI
6. **Set up domain and SSL** certificates

---

## 🔧 Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] All environment variables configured
- [ ] pgvector extension installed in database
- [ ] Clerk authentication working
- [ ] GitHub token has correct permissions
- [ ] Gemini API key is valid
- [ ] Application URL configured in Clerk dashboard
- [ ] SSL certificate active (HTTPS)
- [ ] Database backups configured
- [ ] Monitoring/logging set up

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database firewall rules
- Ensure pgvector extension is installed
- Test connection: `npx prisma db pull`

### Build Failures
- Check all environment variables are set
- Verify Node.js version (20+)
- Check build logs for specific errors
- Ensure `prisma generate` runs during build

### Migration Issues
- Run `npx prisma migrate deploy` manually
- Check database connection
- Verify schema matches migrations
- Use `npx prisma migrate status` to check state

### Authentication Issues
- Verify Clerk keys are correct
- Check redirect URLs in Clerk dashboard
- Ensure `NEXT_PUBLIC_APP_URL` matches your domain
- Check browser console for errors

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [Railway Documentation](https://docs.railway.app/)

---

## 🆘 Need Help?

If you encounter issues during deployment:
1. Check the build logs
2. Verify all environment variables
3. Test database connection
4. Review error messages in browser console
5. Check application logs

---

**Happy Deploying! 🚀**

