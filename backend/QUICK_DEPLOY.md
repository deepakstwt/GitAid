# ⚡ Quick Deployment Guide

## 🚀 Fastest Way: Deploy to Vercel (5 minutes)

### Prerequisites Checklist
- [ ] GitHub repository with your code
- [ ] PostgreSQL database (Supabase/Neon/Railway - free tiers available)
- [ ] Clerk account (free tier available)
- [ ] Google Gemini API key
- [ ] GitHub Personal Access Token

### Step-by-Step:

1. **Set up Database** (2 minutes)
   - Go to [Supabase](https://supabase.com) or [Neon](https://neon.tech)
   - Create a new PostgreSQL project
   - Copy the connection string (DATABASE_URL)
   - Run this SQL in the database SQL editor:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```

2. **Get API Keys** (2 minutes)
   - **Clerk**: https://dashboard.clerk.com → Create app → Copy keys
   - **Gemini**: https://makersuite.google.com/app/apikey → Create API key
   - **GitHub**: https://github.com/settings/tokens → Generate token (repo scope)

3. **Deploy to Vercel** (1 minute)
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add these environment variables:
     ```
     DATABASE_URL=your-postgres-connection-string
     GITHUB_TOKEN=your-github-token
     GEMINI_API_KEY=your-gemini-key
     CLERK_SECRET_KEY=your-clerk-secret
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
     NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
     ```
   - Click "Deploy"

4. **Run Database Migrations** (1 minute)
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Pull environment variables
   vercel env pull .env.local
   
   # Run migrations
   npx prisma migrate deploy
   ```

5. **Configure Clerk** (1 minute)
   - Go to Clerk Dashboard → Your App → Paths
   - Set Sign-in redirect URL: `https://your-project.vercel.app/dashboard`
   - Set Sign-up redirect URL: `https://your-project.vercel.app/dashboard`

**Done! 🎉** Your app is live at `https://your-project.vercel.app`

---

## 🐳 Alternative: Docker Deployment

### Quick Start with Docker Compose

1. **Create `.env` file** with all required variables (see DEPLOYMENT.md)

2. **Start everything**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Access your app**: http://localhost:3000

---

## ✅ Pre-Deployment Check

Run this script to verify everything is ready:
```bash
./scripts/deploy-check.sh
```

---

## 📚 Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

---

## 🆘 Common Issues

**Build fails?**
- Check all environment variables are set
- Verify DATABASE_URL format is correct
- Ensure Node.js 20+ is used

**Database connection error?**
- Verify DATABASE_URL is correct
- Check database firewall allows connections
- Ensure pgvector extension is installed

**Authentication not working?**
- Verify Clerk keys match
- Check redirect URLs in Clerk dashboard
- Ensure NEXT_PUBLIC_APP_URL matches your domain

---

**Happy Deploying! 🚀**

