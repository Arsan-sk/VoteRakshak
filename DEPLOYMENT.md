# 🚀 Production Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Repository Strategy](#repository-strategy)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployments](#frontend-deployments)
5. [Environment Variables](#environment-variables)
6. [Testing Deployment](#testing-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Your VoteRakshak system consists of **4 independent modules** that need to be deployed separately:

| Module | Type | Recommended Platform | Port (Local) |
|--------|------|---------------------|--------------|
| Backend Server | Node.js API + WebSocket | Railway / Render / Heroku | 5000 |
| Voter Portal | React (Vite) | Vercel / Netlify | 5173 |
| Officer Dashboard | React (Vite) | Vercel / Netlify | 5174 |
| Polling Booth | React (Vite) | Vercel / Netlify | 5175 |

**Important Notes:**
- ❌ **Vercel does NOT support WebSockets** - Backend must be deployed elsewhere
- ✅ **Vercel is perfect** for the 3 React frontends
- 🔗 All modules connect via environment variables

---

## 📁 Repository Strategy

### Option 1: Monorepo (Current Structure) ✅ RECOMMENDED

Keep everything in one repository but deploy each module separately.

**Advantages:**
- Easier to manage
- Single source of truth
- Simpler version control

**Structure:**
```
VoteRakshak/
├── server/              → Deploy to Railway
├── voter-portal/        → Deploy to Vercel
├── officer-dashboard/   → Deploy to Vercel
├── polling-booth/       → Deploy to Vercel
└── contracts/           → Not deployed (local only)
```

### Option 2: Separate Repositories

Create 4 separate repositories.

**Only do this if you need:**
- Different teams managing different modules
- Independent release cycles
- Separate access controls

---

## 🖥️ Backend Deployment (Railway)

### Why Railway?
- ✅ Supports WebSockets
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Environment variables support

### Step-by-Step:

#### 1. Prepare Backend for Deployment

Create `server/package.json` start script (already done):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### 2. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### 3. Deploy from GitHub

**If using monorepo:**
1. Click "Deploy from GitHub repo"
2. Select your `VoteRakshak` repository
3. Click "Add variables" and set:
   - `ROOT_PATH` = `server`
   - `NODE_ENV` = `production`
4. Railway will auto-detect Node.js

**If using separate repos:**
1. Select your `voterakshak-backend` repository
2. Railway will auto-detect Node.js

#### 4. Configure Environment Variables

In Railway dashboard, add these variables:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_production_key_min_32_chars
GANACHE_URL=http://127.0.0.1:7545
BIOMETRIC_API_URL=https://localhost:8000
AADHAAR_SALT=production_salt_change_this_random_string
VOTER_PORTAL_URL=https://your-voter-portal.vercel.app
OFFICER_DASHBOARD_URL=https://your-officer-dashboard.vercel.app
POLLING_BOOTH_URL=https://your-polling-booth.vercel.app
```

**⚠️ IMPORTANT:**
- Replace `your-voter-portal.vercel.app` with actual Vercel URLs (you'll get these after deploying frontends)
- Change `JWT_SECRET` to a random 32+ character string
- Change `AADHAAR_SALT` to a random string

#### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Copy your Railway URL (e.g., `https://voterakshak-backend.up.railway.app`)

---

## 🎨 Frontend Deployments (Vercel)

### Deploy Each Frontend Separately

You'll deploy 3 separate Vercel projects:
1. Voter Portal
2. Officer Dashboard  
3. Polling Booth

### Step-by-Step for Each Frontend:

#### 1. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

#### 2. Deploy Voter Portal

1. Click "Add New Project"
2. Import your GitHub repository
3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `voter-portal` (if monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_BACKEND_URL=https://your-backend.up.railway.app
   ```
   Replace with your actual Railway URL from step above.

5. Click "Deploy"
6. Copy the Vercel URL (e.g., `https://voterakshak-voter.vercel.app`)

#### 3. Deploy Officer Dashboard

Repeat the same process:
1. New Project → Import repository
2. **Root Directory:** `officer-dashboard`
3. **Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend.up.railway.app
   ```
4. Deploy
5. Copy URL (e.g., `https://voterakshak-officer.vercel.app`)

#### 4. Deploy Polling Booth

Repeat again:
1. New Project → Import repository
2. **Root Directory:** `polling-booth`
3. **Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend.up.railway.app
   VITE_BOOTH_ID=BOOTH_001
   ```
   **Note:** For multiple booths, deploy multiple times with different `VITE_BOOTH_ID` values

4. Deploy
5. Copy URL (e.g., `https://voterakshak-booth-001.vercel.app`)

---

## 🔄 Update Backend CORS

After deploying all frontends, go back to Railway:

1. Open your backend project
2. Go to "Variables"
3. Update these with your actual Vercel URLs:
   ```
   VOTER_PORTAL_URL=https://voterakshak-voter.vercel.app
   OFFICER_DASHBOARD_URL=https://voterakshak-officer.vercel.app
   POLLING_BOOTH_URL=https://voterakshak-booth-001.vercel.app
   ```
4. Click "Redeploy" to apply changes

---

## 📝 Environment Variables Summary

### Backend (Railway)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<random-32-char-string>
GANACHE_URL=http://127.0.0.1:7545
BIOMETRIC_API_URL=https://localhost:8000
AADHAAR_SALT=<random-string>
VOTER_PORTAL_URL=<vercel-url-1>
OFFICER_DASHBOARD_URL=<vercel-url-2>
POLLING_BOOTH_URL=<vercel-url-3>
```

### Voter Portal (Vercel)
```env
VITE_BACKEND_URL=<railway-backend-url>
```

### Officer Dashboard (Vercel)
```env
VITE_BACKEND_URL=<railway-backend-url>
```

### Polling Booth (Vercel)
```env
VITE_BACKEND_URL=<railway-backend-url>
VITE_BOOTH_ID=BOOTH_001
```

---

## 🧪 Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend.up.railway.app/api/health
```
Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "activeBooths": []
}
```

### 2. Test Voter Portal
1. Open `https://your-voter-portal.vercel.app`
2. Should see landing page
3. Click "Register to Vote"
4. Should see registration form

### 3. Test Officer Dashboard
1. Open `https://your-officer-dashboard.vercel.app`
2. Should see login page
3. Login with `admin` / `admin`
4. Should see dashboard

### 4. Test Polling Booth
1. Open `https://your-polling-booth.vercel.app`
2. Should see "Waiting for Officer Authorization"
3. Check browser console - should see WebSocket connection

### 5. Test Complete Flow
1. Register a voter (Voter Portal)
2. Login to Officer Dashboard
3. Search for voter
4. Unlock booth
5. Polling booth should switch to voting screen

---

## ⚠️ Important Blockchain Considerations

### Current Setup (Ganache - Local Only)

Your smart contract is deployed to **Ganache** which runs **locally**. This means:

❌ **Production deployment will NOT work** with current blockchain setup because:
- Ganache runs on `http://127.0.0.1:7545` (your computer)
- Railway server cannot access your local Ganache
- Votes cannot be recorded

### Solutions:

#### Option 1: Deploy Ganache to a Server (Not Recommended)
- Complex setup
- Security risks
- Not production-ready

#### Option 2: Use a Test Network (Recommended for Testing)
1. Deploy contract to **Sepolia** or **Goerli** testnet
2. Update `GANACHE_URL` to Infura/Alchemy endpoint:
   ```
   GANACHE_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   ```
3. Update contract deployment script to use testnet

#### Option 3: Use Mainnet (Production)
1. Deploy to Ethereum mainnet
2. **Costs real ETH** for transactions
3. Only for actual production use

### Quick Fix for Demo:
For now, you can:
1. Deploy everything except blockchain
2. Comment out blockchain calls in `server/routes/voting.js`
3. Just store votes in `data/users.json`
4. Add blockchain later when ready

---

## 🐛 Troubleshooting

### Frontend shows "Network Error"
- Check `VITE_BACKEND_URL` is correct
- Check backend is running (visit `/api/health`)
- Check CORS settings in backend

### WebSocket not connecting
- Polling booth console shows connection errors
- Check Railway logs for WebSocket errors
- Verify `POLLING_BOOTH_URL` in Railway matches Vercel URL

### "Booth not found" error
- Booth hasn't connected to backend yet
- Refresh polling booth page
- Check backend logs for booth registration

### CORS errors
- Update `VOTER_PORTAL_URL`, `OFFICER_DASHBOARD_URL`, `POLLING_BOOTH_URL` in Railway
- Redeploy backend after changing CORS settings

---

## 📚 Additional Resources

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/concepts/projects/environment-variables

### Railway Documentation
- https://docs.railway.app
- https://docs.railway.app/deploy/deployments

### Ethereum Testnets
- Sepolia Faucet: https://sepoliafaucet.com
- Infura: https://infura.io
- Alchemy: https://www.alchemy.com

---

## ✅ Deployment Checklist

### Before Deployment
- [ ] All `.env.example` files created
- [ ] Hardcoded URLs replaced with environment variables
- [ ] Smart contract deployed (local or testnet)
- [ ] Test locally one more time

### Backend Deployment
- [ ] Railway account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] `/api/health` endpoint working

### Frontend Deployments
- [ ] Voter Portal deployed to Vercel
- [ ] Officer Dashboard deployed to Vercel
- [ ] Polling Booth deployed to Vercel
- [ ] All environment variables set correctly

### Post-Deployment
- [ ] Backend CORS updated with Vercel URLs
- [ ] Backend redeployed
- [ ] All frontends can connect to backend
- [ ] WebSocket connection working
- [ ] Complete flow tested

---

## 🎉 Success!

Once all checkboxes are complete, your distributed e-voting system is live!

**Your URLs:**
- Voter Portal: `https://your-voter-portal.vercel.app`
- Officer Dashboard: `https://your-officer-dashboard.vercel.app`
- Polling Booth: `https://your-polling-booth.vercel.app`
- Backend API: `https://your-backend.up.railway.app`

**Next Steps:**
1. Set up custom domains (optional)
2. Deploy smart contract to testnet/mainnet
3. Add monitoring and logging
4. Set up CI/CD for automatic deployments
