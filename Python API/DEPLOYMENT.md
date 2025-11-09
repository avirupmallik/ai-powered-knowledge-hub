# Deployment Guide for Fly.io

This guide will help you deploy the AI Research Knowledge Hub API to Fly.io.

## Prerequisites

1. **Install Fly.io CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Or using curl
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up / Login to Fly.io**
   ```bash
   flyctl auth signup
   # or
   flyctl auth login
   ```

## Deployment Steps

### 1. Initialize Fly App (First Time Only)

```bash
# Launch the app (this will use the existing fly.toml)
flyctl launch --no-deploy
```

When prompted:
- Choose app name: `ai-research-knowledge-hub` (or your preferred name)
- Choose region: Select closest to you (e.g., `iad` for US East)
- Don't create a Postgres database (we're using Qdrant Cloud)
- Don't deploy yet

### 2. Set Environment Variables (Secrets)

Set your sensitive environment variables as secrets:

```bash
# OpenAI API Key
flyctl secrets set OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Cloud Configuration
flyctl secrets set QDRANT_URL=https://09d60ddd-3860-465c-a6ea-cef5d34ae57d.us-east-1-1.aws.cloud.qdrant.io:6333
flyctl secrets set QDRANT_API_KEY=your_qdrant_api_key_here

# Optional: OpenAI Model Configuration
flyctl secrets set OPENAI_MODEL=gpt-4-turbo-preview
flyctl secrets set OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Qdrant Configuration
flyctl secrets set QDRANT_COLLECTION_NAME=ai_research_knowledge
flyctl secrets set QDRANT_VECTOR_SIZE=3072
```

### 3. Deploy the Application

```bash
flyctl deploy
```

This will:
- Build your Docker image
- Push it to Fly.io
- Deploy your application
- Set up health checks

### 4. Verify Deployment

```bash
# Check app status
flyctl status

# View logs
flyctl logs

# Check health
flyctl checks

# Open your app in browser
flyctl open
```

### 5. Access Your API

Your API will be available at:
```
https://ai-research-knowledge-hub.fly.dev
```

Test endpoints:
- Health: `https://ai-research-knowledge-hub.fly.dev/health`
- Docs: `https://ai-research-knowledge-hub.fly.dev/docs`
- Query: `https://ai-research-knowledge-hub.fly.dev/query`
- Upload: `https://ai-research-knowledge-hub.fly.dev/upload`

## Scaling

### Scale VM Resources

```bash
# Scale to more memory (recommended for production)
flyctl scale memory 2048

# Scale CPU
flyctl scale vm shared-cpu-2x
```

### Auto-Scaling

The current configuration uses auto-scaling:
- `min_machines_running = 0`: Scales down to 0 when idle (saves costs)
- `auto_start_machines = true`: Automatically starts when receiving requests
- `auto_stop_machines = true`: Stops after inactivity

To keep at least 1 machine always running:
```bash
flyctl scale count 1
```

## Monitoring

```bash
# View real-time logs
flyctl logs -a ai-research-knowledge-hub

# Monitor metrics
flyctl metrics -a ai-research-knowledge-hub

# SSH into the running machine
flyctl ssh console
```

## Updating Your App

After making code changes:

```bash
# Deploy updates
flyctl deploy

# Or force rebuild without cache
flyctl deploy --no-cache
```

## Environment Variables

To view or update secrets:

```bash
# List all secrets
flyctl secrets list

# Update a secret
flyctl secrets set OPENAI_API_KEY=new_key_here

# Remove a secret
flyctl secrets unset SECRET_NAME
```

## Costs

Fly.io pricing:
- Free tier: 3 shared-cpu-1x VMs with 256MB RAM
- This app uses 1 VM with 1GB RAM (paid tier)
- Auto-scaling to 0 helps minimize costs
- Estimate: ~$5-15/month depending on usage

## Troubleshooting

### View logs for errors
```bash
flyctl logs --app ai-research-knowledge-hub
```

### SSH into the machine
```bash
flyctl ssh console
```

### Restart the app
```bash
flyctl apps restart ai-research-knowledge-hub
```

### Check health status
```bash
flyctl checks list
```

### Scale up if running out of memory
```bash
flyctl scale memory 2048
```

## Custom Domain (Optional)

To use a custom domain:

```bash
# Add certificate for your domain
flyctl certs add yourdomain.com

# Add DNS records as instructed
# Then verify
flyctl certs show yourdomain.com
```

## Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Python Guide](https://fly.io/docs/languages-and-frameworks/python/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
