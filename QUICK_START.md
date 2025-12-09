# 🚀 VoteRakshak - Quick Start Guide

## ✅ What You Have Running

### 1. Backend Server (Port 5000) - **NO UI, API ONLY**
- **Purpose**: REST API + WebSocket server
- **URL**: http://localhost:5000
- **What it does**: 
  - Handles voter registration
  - Processes vote casting
  - Manages WebSocket communication for booth unlocking
  - Connects to Ganache blockchain
- **How to test**: 
  ```bash
  # Check if it's running
  curl http://localhost:5000/api/health
  ```

### 2. Polling Booth (Port 5175) - **HAS UI**
- **Purpose**: Voting interface for booth
- **URL**: http://localhost:5175
- **What you should see**:
  - 🔒 **Idle Screen**: "Waiting for Officer Authorization" with booth ID
  - After unlock: Voting screen with party selection

## 🎯 Current System Status

### ✅ Implemented & Working
1. ✅ Smart Contract deployed to Ganache
2. ✅ Backend server running (API + WebSocket)
3. ✅ Polling Booth UI (just fixed!)

### ❌ Not Yet Implemented
1. ❌ **Officer Dashboard** (Port 5174) - To unlock booths
2. ❌ **Voter Portal** (Port 5173) - For registration and profile

## 🧪 How to Test Right Now

### Option 1: Test Booth Unlock via API (Manual)

Since the Officer Dashboard isn't built yet, you can unlock the booth manually:

```bash
# In a new terminal, run this curl command:
curl -X POST http://localhost:5000/api/officer/unlock-booth ^
  -H "Content-Type: application/json" ^
  -d "{\"boothId\":\"BOOTH_001\",\"voterAadhar\":\"123456789012\",\"voterName\":\"Test Voter\",\"officerId\":\"OFFICER_001\"}"
```

**What should happen**:
1. Open http://localhost:5175 in your browser
2. You should see "Waiting for Officer Authorization"
3. Run the curl command above
4. The booth should **immediately** switch to voting screen
5. You'll see "Test Voter" and party selection buttons

### Option 2: Test Full Flow (Requires Building Officer Dashboard)

To test the complete flow, we need to build the Officer Dashboard. This would be a simple React app with:
- Login page
- Voter search
- "Unlock Booth" button

## 📁 What Each Port Does

| Port | Name | Type | Status | Purpose |
|------|------|------|--------|---------|
| 5000 | Backend | API | ✅ Running | REST API + WebSocket server |
| 5173 | Voter Portal | UI | ❌ Not Built | Registration, Profile, Find Booth |
| 5174 | Officer Dashboard | UI | ❌ Not Built | Verify voters, Unlock booths |
| 5175 | Polling Booth | UI | ✅ Running | Vote casting interface |
| 7545 | Ganache | Blockchain | ✅ Running | Local Ethereum network |

## 🔧 Troubleshooting

### "I see a counter app on port 5175"
**Fixed!** Restart the polling booth server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd polling-booth
npm run dev
```

### "Port 5000 shows nothing"
**This is correct!** Port 5000 is a backend API, not a website. It has no UI.

To verify it's working:
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "activeBooths": ["BOOTH_001"]
}
```

### "How do I register a voter?"
You need to either:
1. Build the Voter Portal (React app on port 5173)
2. Or use curl to call the API directly:
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"age\":25,\"aadhar\":\"123456789012\",\"fingerprintTemplate\":\"base64_template_here\"}"
```

## 🎯 Next Steps

### To Complete the System:

1. **Build Officer Dashboard** (Highest Priority)
   - Simple React app with login
   - Voter search by Aadhaar
   - "Unlock Booth" button
   - Uses existing backend API: `POST /api/officer/unlock-booth`

2. **Build Voter Portal** (Medium Priority)
   - Registration form (backend endpoint exists)
   - Profile page (backend endpoint exists)
   - Find booth feature

3. **Test Complete Flow**
   - Register voter via Voter Portal
   - Officer verifies and unlocks booth via Officer Dashboard
   - Voter casts vote at Polling Booth
   - Check blockchain in Ganache

## 📝 Summary

**What's Working:**
- ✅ Smart contract deployed
- ✅ Backend API running (no UI, that's normal)
- ✅ Polling booth UI showing idle screen
- ✅ WebSocket communication ready

**What You Can Test Now:**
- Unlock booth manually via curl command (see above)
- See booth switch from idle to voting screen
- Select a party (fingerprint scan will fail without SecuGen scanner)

**What's Missing:**
- Officer Dashboard UI (to unlock booths easily)
- Voter Portal UI (to register voters easily)

The backend is complete and working! We just need to build the frontend UIs for the Officer Dashboard and Voter Portal.
