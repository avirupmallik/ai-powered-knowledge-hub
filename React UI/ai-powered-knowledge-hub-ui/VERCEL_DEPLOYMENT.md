# Deploying React UI to Vercel

## Prerequisites

1. **Install Vercel CLI** (Optional - you can also deploy via web interface)
   ```bash
   npm install -g vercel
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub, GitLab, or Bitbucket (recommended for auto-deployments)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Push Code to GitHub

```bash
cd "/Users/avirupmallik/Developer/AI Project/AI Powered Knowledge Hub/React UI/ai-powered-knowledge-hub-ui"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-knowledge-hub-ui.git
git branch -M main
git push -u origin main
```

#### Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Step 3: Add Environment Variables

In the Vercel dashboard, add:

| Name | Value |
|------|-------|
| `VITE_GATEWAY_URL` | `https://your-backend-api.com` |

**Important**: Replace with your actual backend URL (e.g., your Spring Boot Gateway URL)

#### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete (usually 1-2 minutes).

Your app will be live at: `https://your-project-name.vercel.app`

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Login to Vercel

```bash
vercel login
```

#### Step 2: Navigate to Project

```bash
cd "/Users/avirupmallik/Developer/AI Project/AI Powered Knowledge Hub/React UI/ai-powered-knowledge-hub-ui"
```

#### Step 3: Deploy

```bash
# First deployment (development)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ai-knowledge-hub-ui (or your choice)
# - Directory? ./ (press enter)
# - Override settings? No
```

#### Step 4: Set Environment Variables

```bash
# Set production environment variable
vercel env add VITE_GATEWAY_URL production

# When prompted, enter your backend URL:
# https://your-backend-api.com
```

#### Step 5: Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://your-project-name.vercel.app`

---

## Environment Variables

### Set Environment Variables via CLI

```bash
# Production
vercel env add VITE_GATEWAY_URL production
# Enter value: https://your-backend.com

# Preview (for pull requests)
vercel env add VITE_GATEWAY_URL preview
# Enter value: https://staging-backend.com

# Development
vercel env add VITE_GATEWAY_URL development
# Enter value: http://localhost:8080
```

### Set Environment Variables via Dashboard

1. Go to your project dashboard
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add variable:
   - **Key**: `VITE_GATEWAY_URL`
   - **Value**: Your backend URL
   - **Environment**: Production, Preview, Development

### View Environment Variables

```bash
vercel env ls
```

### Remove Environment Variable

```bash
vercel env rm VITE_GATEWAY_URL production
```

---

## Automatic Deployments (GitHub Integration)

Once connected to GitHub:

- **Push to `main` branch** → Automatic production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Preview Deployments

Each pull request gets a unique preview URL:
```
https://your-project-git-branch-name.vercel.app
```

---

## Custom Domain

### Add Custom Domain via Dashboard

1. Go to project **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `myapp.com`)
4. Follow DNS configuration instructions

### Add Domain via CLI

```bash
vercel domains add myapp.com
```

### DNS Configuration

Add these records to your domain provider:

**For root domain (myapp.com)**:
- **Type**: A
- **Name**: @
- **Value**: 76.76.21.21

**For www subdomain**:
- **Type**: CNAME
- **Name**: www
- **Value**: cname.vercel-dns.com

Vercel automatically handles SSL certificates.

---

## Managing Your Deployment

### View Deployments

```bash
# List all deployments
vercel ls

# View deployment details
vercel inspect <deployment-url>
```

### View Logs

```bash
vercel logs <deployment-url>

# Follow logs in real-time
vercel logs <deployment-url> -f
```

### Rollback to Previous Deployment

1. Go to your project dashboard
2. Click **"Deployments"**
3. Find the deployment you want to restore
4. Click **"⋯"** → **"Promote to Production"**

Or via CLI:
```bash
vercel promote <deployment-url>
```

### Redeploy

```bash
# Redeploy latest commit to production
vercel --prod

# Force rebuild
vercel --prod --force
```

### Remove Deployment

```bash
vercel rm <deployment-url>
```

---

## Project Configuration

The `vercel.json` file configures:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- **rewrites**: Ensures React Router works correctly (all routes serve index.html)
- **outputDirectory**: Vite builds to `dist` folder
- **framework**: Auto-detects Vite optimizations

---

## Advanced Configuration

### Performance Optimizations

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Environment-Specific Builds

Create environment files:
- `.env.production` - Production variables
- `.env.preview` - Preview variables
- `.env.development` - Development variables

---

## CI/CD with GitHub Actions (Alternative)

Create `.github/workflows/vercel-deploy.yml`:

```yaml
name: Vercel Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Get your Vercel token:
```bash
vercel token create
```

Add to GitHub Secrets as `VERCEL_TOKEN`.

---

## CORS Configuration (Backend)

If your backend is on a different domain, configure CORS:

**Spring Boot Example**:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "https://your-app.vercel.app",
                        "http://localhost:5173"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Test build locally**:
   ```bash
   npm run build
   ```
3. **Check Node version** (Vercel uses Node 18 by default)

### Environment Variables Not Working

- Vercel requires `VITE_` prefix for public variables
- Redeploy after adding environment variables
- Variables are build-time, not runtime (Vite limitation)

### React Router 404s

- Ensure `vercel.json` has the rewrites configuration
- All routes should return `index.html`

### Slow Build Times

- Use Vercel's build cache (enabled by default)
- Consider upgrading to Vercel Pro for faster builds

---

## Cost

**Free Tier Includes**:
- Unlimited deployments
- 100 GB bandwidth per month
- Automatic SSL
- Preview deployments
- Serverless functions (100 GB-hours)

**Pro Plan** ($20/month):
- More bandwidth
- Faster builds
- Priority support
- Analytics

Most apps stay within free tier limits.

---

## Useful Commands

```bash
# Deployment
vercel                  # Deploy to preview
vercel --prod           # Deploy to production
vercel --force          # Force rebuild

# Environment
vercel env ls           # List environment variables
vercel env add KEY ENV  # Add environment variable
vercel env rm KEY ENV   # Remove environment variable

# Project Management
vercel ls               # List deployments
vercel inspect URL      # Inspect deployment
vercel logs URL         # View logs
vercel promote URL      # Promote to production
vercel rm URL           # Remove deployment

# Domains
vercel domains ls       # List domains
vercel domains add      # Add domain
vercel domains rm       # Remove domain

# Project Info
vercel projects ls      # List projects
vercel projects rm      # Remove project
```

---

## Complete Deployment Checklist

- [ ] Create Vercel account
- [ ] Push code to GitHub (optional but recommended)
- [ ] Create project on Vercel
- [ ] Configure build settings (auto-detected for Vite)
- [ ] Set `VITE_GATEWAY_URL` environment variable
- [ ] Deploy application
- [ ] Test deployment
- [ ] Configure custom domain (optional)
- [ ] Set up CORS on backend
- [ ] Test all features (upload, search, navigation)
- [ ] Monitor analytics

---

## Quick Start (Fastest Method)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project directory)
cd "/Users/avirupmallik/Developer/AI Project/AI Powered Knowledge Hub/React UI/ai-powered-knowledge-hub-ui"
vercel

# Set environment variable
vercel env add VITE_GATEWAY_URL production
# Enter your backend URL when prompted

# Deploy to production
vercel --prod
```

Done! Your app is now live at `https://your-project.vercel.app`

---

## Support Resources

- **Documentation**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Status**: https://vercel-status.com
- **Support**: support@vercel.com (Pro plan)

---

## Comparison: Vercel vs Fly.io

| Feature | Vercel | Fly.io |
|---------|--------|--------|
| Best For | Static sites, React, Next.js | Full-stack apps, containers |
| Deployment | Git-based, automatic | Docker-based, manual/CI |
| SSL | Automatic | Automatic |
| CDN | Global edge network | Global Anycast |
| Build Time | Fast (optimized for frontend) | Slower (full container build) |
| Free Tier | Generous for frontend | Limited VM hours |
| Pricing | $20/mo Pro | $5-10/mo typical |
| Learning Curve | Easiest | Moderate |

**Recommendation**: Use **Vercel** for this React app - it's optimized for frontend frameworks and requires minimal configuration.
