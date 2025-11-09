Deploying to Fly.io

Prerequisites
- Install flyctl: https://fly.io/docs/getting-started/installing-flyctl/
- Install Docker (optional for building locally).

Steps (quick)
1. Login to Fly: flyctl auth login
2. Create app (or use existing name in fly.toml):
   flyctl apps create <your-app-name>
3. Build and deploy with flyctl (it will build your Dockerfile):
   flyctl deploy --remote-only

Notes
- The app reads the $PORT environment variable (set in `application.yaml`). Fly will provide the correct port.
- If your app calls external services, set secrets with `flyctl secrets set KEY=value`.
- To tail logs: `flyctl logs -a <your-app-name>`
- To scale instances: `flyctl scale count 1 -a <your-app-name>`

Troubleshooting
- If the build fails on Fly, run `flyctl deploy --build-only` to get a more detailed error.
- If you need persistent storage, configure volumes in `fly.toml`.


