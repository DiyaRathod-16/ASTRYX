# ASTRYX Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

Railway offers a generous free tier and easy deployment.

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ASTRYX.git
git push -u origin main
```

#### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your ASTRYX repository

#### Step 3: Add Database
1. In your project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL`

#### Step 4: Add Redis (Optional)
1. Click **"New"** → **"Database"** → **"Redis"**
2. Railway automatically sets `REDIS_URL`

#### Step 5: Configure Backend
1. Click on your backend service
2. Go to **"Variables"** tab
3. Add these environment variables:
   - `PORT`: 3001
   - `NODE_ENV`: production
   - `JWT_SECRET`: (generate a random string)
   - `GEMINI_API_KEY`: (your Gemini API key)
   - `CORS_ORIGIN`: (your frontend URL after deployment)

#### Step 6: Configure Frontend
1. Click on your frontend service
2. Go to **"Variables"** tab
3. Add: `VITE_API_URL`: (your backend URL, e.g., https://astryx-backend.up.railway.app)

#### Step 7: Get Your URLs
- Railway provides URLs like: `https://astryx-xxx.up.railway.app`
- Update CORS_ORIGIN in backend with your frontend URL

---

### Option 2: Vercel (Frontend) + Railway (Backend)

Best performance for frontend.

#### Frontend on Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL`
5. Deploy!

#### Backend on Railway:
Follow steps 1-5 from Option 1.

---

### Option 3: Render

#### Backend:
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Add environment variables

#### Frontend:
1. New → Static Site
2. Connect GitHub repo
3. Root Directory: `frontend`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`

#### Database:
1. New → PostgreSQL
2. Copy the connection string to backend env vars

---

### Option 4: Docker (Any Cloud Provider)

If you have a VPS (DigitalOcean, AWS, etc.):

```bash
# Clone your repo on the server
git clone https://github.com/YOUR_USERNAME/ASTRYX.git
cd ASTRYX

# Create .env file
cp backend/.env.example backend/.env
# Edit .env with your values

# Start with Docker Compose
docker-compose up -d

# Your app is now running!
# Frontend: http://your-server-ip
# Backend: http://your-server-ip:3001
```

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | production |
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@host:5432/db |
| REDIS_URL | Redis connection | redis://localhost:6379 |
| JWT_SECRET | Secret for JWT tokens | random-string-here |
| GEMINI_API_KEY | Google Gemini API key | AIza... |
| CORS_ORIGIN | Frontend URL | https://astryx.vercel.app |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://api.astryx.com |

---

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is running and accessible
- [ ] Database is connected
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Gemini API key is working
- [ ] Test file upload and analysis
- [ ] Test authentication (if applicable)

---

## Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly
- Include the protocol (https://)

### Database Connection Failed
- Check `DATABASE_URL` format
- Ensure database service is running
- Check firewall/security groups

### Gemini API Not Working
- Verify API key is correct
- Check quota at https://ai.google.dev/

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly
- Rebuild frontend after changing env vars
- Check backend logs for errors

---

## Custom Domain (Optional)

### On Railway:
1. Go to your service → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### On Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records

---

## Monitoring

- **Railway**: Built-in logs and metrics
- **Vercel**: Analytics dashboard
- **UptimeRobot**: Free uptime monitoring (uptimerobot.com)
