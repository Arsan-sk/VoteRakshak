# 🚀 Complete Setup Instructions

## ✅ What's Been Created

### 1. Officer Dashboard (Port 5174) ✅
- Login page (admin/admin)
- Voter search by Aadhaar
- Voter details display with photo
- Booth selection dropdown
- "Unlock Booth" button
- Real-time active booths monitoring

### 2. Voter Portal (Port 5173) ✅
- Basic structure created
- Ready for registration and profile pages

### 3. Polling Booth (Port 5175) ✅
- Already working!

## 📦 Installation Steps

### Step 1: Install Officer Dashboard
```bash
cd officer-dashboard
npm install
```

### Step 2: Install Voter Portal  
```bash
cd ../voter-portal
npm install
```

## 🎯 Running the Complete System

Open **4 separate terminals**:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
**Expected**: Server running on port 5000

### Terminal 2: Officer Dashboard
```bash
cd officer-dashboard
npm run dev
```
**Expected**: http://localhost:5174

### Terminal 3: Polling Booth
```bash
cd polling-booth
npm run dev
```
**Expected**: http://localhost:5175

### Terminal 4: Voter Portal (Optional for now)
```bash
cd voter-portal
npm run dev
```
**Expected**: http://localhost:5173

## 🧪 Testing the Complete Flow

### 1. Open Officer Dashboard
- Go to http://localhost:5174
- Login with: **admin** / **admin**
- You should see the dashboard

### 2. Open Polling Booth (in another browser window/tab)
- Go to http://localhost:5175
- You should see "Waiting for Officer Authorization"

### 3. Unlock the Booth
In Officer Dashboard:
1. Enter Aadhaar: **123456789012** (test number)
2. Click "Search"
3. You'll see "Voter not found" (that's okay for now)
4. Or register a voter first (see below)

### 4. Register a Test Voter (PowerShell)
```powershell
$body = @{
    firstName = "John"
    lastName = "Doe"
    age = 25
    aadhar = "123456789012"
    phone = "9876543210"
    photo = ""
    fingerprintTemplate = "dGVzdF90ZW1wbGF0ZV9kYXRh"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 5. Now Search and Unlock
1. In Officer Dashboard, search for Aadhaar: **123456789012**
2. You should see John Doe's details
3. Select a booth from dropdown (BOOTH_001)
4. Click "🔓 Unlock Booth"
5. **Watch the Polling Booth window** - it should immediately switch to voting screen!

## 🎨 What Each Module Does

| Port | Module | Features |
|------|--------|----------|
| 5000 | Backend | API + WebSocket server |
| 5173 | Voter Portal | Registration, Profile (basic structure) |
| 5174 | Officer Dashboard | **Login, Search, Unlock Booth** ✅ |
| 5175 | Polling Booth | **Idle → Voting → Success** ✅ |

## ✅ Officer Dashboard Features

### Login Page
- Username/Password authentication
- Dev credentials displayed
- Token-based session management

### Dashboard
- **Voter Search**: Enter 12-digit Aadhaar
- **Voter Details**: Shows photo, name, age, phone, voting status
- **Booth Selection**: Dropdown of all available booths
- **Unlock Button**: Sends WebSocket signal to selected booth
- **Active Booths Panel**: Real-time list of connected booths
- **Auto-refresh**: Active booths update every 5 seconds

## 🔧 Troubleshooting

### "Cannot find voter"
Register a voter first using the PowerShell command above, or build the Voter Portal registration page.

### "Booth not connected"
Make sure the polling booth is running and has connected to the backend. Check the backend console for "Booth registered" message.

### Officer Dashboard shows blank page
1. Make sure you ran `npm install` in officer-dashboard
2. Check browser console for errors
3. Restart the dev server

## 📝 Next Steps

### To Complete Voter Portal:
The voter portal structure is created. You can add:
1. Registration page (reuse code from old VoteRakshak/src/pages/Register.jsx)
2. Profile page (reuse code from old VoteRakshak/src/pages/Profile.jsx)
3. Find Booth page
4. Landing page

### Current Status:
- ✅ Smart Contract Deployed
- ✅ Backend Server Running
- ✅ **Officer Dashboard Complete**
- ✅ **Polling Booth Complete**
- ⚠️ Voter Portal (Structure only, needs pages)

## 🎉 Success Criteria

You've successfully set up the system when:
1. ✅ Officer Dashboard shows login page
2. ✅ Can login with admin/admin
3. ✅ Dashboard shows voter search and booth selection
4. ✅ Polling booth shows "Waiting for Authorization"
5. ✅ Clicking "Unlock Booth" makes polling booth switch to voting screen
6. ✅ Active booths panel shows BOOTH_001 as connected

**The core officer-to-booth WebSocket communication is now fully functional!**
