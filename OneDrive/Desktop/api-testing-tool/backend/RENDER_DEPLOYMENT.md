# Deploy Backend to Render

## Prerequisites
- GitHub repository connected to Render
- Supabase account with credentials (SUPABASE_URL, SUPABASE_KEY)
- Frontend URL (will be hosted on Vercel)

## Step-by-Step Deployment

### Step 1: Go to Render
Navigate to https://render.com and sign in with your GitHub account.

### Step 2: Create New Web Service
1. Click **"Create New"** → **"Web Service"**
2. Click **"Connect GitHub repository"**
3. Select your repository: `kinjan13/API_Testing_Tool_backend`

### Step 3: Configure Service
- **Name**: `api-testing-tool-backend` (or your preferred name)
- **Root Directory**: `backend/`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Add Environment Variables
In the **"Environment Variables"** section, add:

| Key | Value |
|-----|-------|
| `PORT` | `10000` (or leave empty for Render auto-assign) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | `your_service_role_key` |
| `FRONTEND_URL` | `https://api-testing-tool-frontend-umber.vercel.app/` |

⚠️ **Important**: Keep `SUPABASE_URL`, `SUPABASE_KEY`, and `FRONTEND_URL` unchanged from your local `.env`

### Step 5: Deploy
Click **"Create Web Service"** and wait for the deployment to complete.

Render will automatically:
- Pull from GitHub
- Install dependencies (`npm install`)
- Start the server (`npm start`)

### Step 6: Get Your Backend URL
Once deployed, Render will provide a URL like:
```
https://api-testing-tool-backend-xxxxx.onrender.com
```

**Save this URL** — you'll need it when configuring the frontend.

## Health Check
Test your backend by visiting:
```
https://api-testing-tool-backend-xxxxx.onrender.com/
```

You should see:
```
API Testing Tool Backend READY
```

## Troubleshooting

### Logs not showing
- Go to **"Logs"** tab in Render dashboard
- Check for errors in build or startup

### Port mismatch
- Render auto-assigns a port via `process.env.PORT`
- Your `server.js` correctly uses: `const PORT = process.env.PORT || 5000`

### Environment variables not loading
- Verify all env vars are added in Render dashboard
- Redeploy after adding/changing env vars

## Next Steps
1. Share the Render backend URL with frontend team
2. Update frontend `.env` with `REACT_APP_BACKEND_URL=<your-render-url>`
3. Deploy frontend to Vercel
