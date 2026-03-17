# VoteRakshak - Distributed Blockchain E-Voting System

> **A secure, transparent, and tamper-proof electronic voting platform combining biometric authentication with blockchain immutability**

![Project Status](https://img.shields.io/badge/Status-Active%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node Version](https://img.shields.io/badge/Node-v18%2B-brightgreen)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Descriptions](#component-descriptions)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the System](#running-the-system)
- [API Documentation](#api-documentation)
- [Voting Workflow](#voting-workflow)
- [Smart Contract](#smart-contract)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

**VoteRakshak** (also known as **Votraction**) is an innovative, decentralized electronic voting system designed to eliminate election fraud and ensure democratic integrity. The system leverages cutting-edge technologies including **blockchain**, **biometric authentication**, and **real-time WebSocket communication** to create a voting platform that is:

- **Transparent**: All votes are recorded immutably on the blockchain
- **Secure**: Multi-layer security with biometric verification and hashed voter data
- **Tamper-Proof**: Distributed architecture prevents single points of failure
- **Privacy-Preserving**: Aadhaar numbers are hashed using keccak256, never stored in plaintext
- **Fraud-Resistant**: Hardware-based fingerprint scanning and centralized officer verification prevent impersonation and double voting

### Problem Statement

Traditional electronic voting systems face critical challenges:
- **Booth Capturing**: Unauthorized control of polling stations
- **Double Voting**: Voters casting multiple votes
- **Impersonation**: Fraudulent individuals voting as someone else
- **Data Tampering**: Vote counts modified after casting
- **Lack of Transparency**: No way for voters to verify their vote was counted

### Solution

VoteRakshak solves these problems through:
1. **Hardware Biometrics**: SecuGen fingerprint scanners verify voter identity
2. **Blockchain Immutability**: Votes recorded on Ethereum blockchain cannot be altered
3. **Centralized Authorization**: Election officers authorize voting sessions
4. **Real-time Control**: WebSocket ensures instant booth-to-officer communication
5. **Privacy by Design**: Voters remain anonymous; only their vote choice is linked to their hashed identifier

---

## ✨ Key Features

### For Voters
- 📱 **Online Registration Portal**: Easy voter registration with fingerprint capture
- 🔍 **Booth Locator**: Find nearest polling station
- 👤 **Voter Profile**: View registration status and voting history
- 🔐 **Secure Voting**: Biometric + blockchain secured voting process

### For Election Officers
- 👨‍💼 **Officer Dashboard**: Manage voters and booths from a central location
- ✅ **Voter Verification**: Search and verify voter identity
- 🔓 **Booth Control**: Remotely unlock/lock polling station booths
- 📊 **Audit Logs**: Complete activity logs for transparency and accountability
- 📈 **Real-time Monitoring**: Live status of all active booths

### For Polling Booths
- 🖥️ **Touchscreen Interface**: User-friendly voting screen
- 🔒 **Idle-State Security**: Booths locked when unauthorized
- 🎯 **Candidate Selection**: Visual party/candidate selection
- 👆 **Biometric Capture**: Integrated fingerprint scanning
- ✨ **Instant Confirmation**: Transaction hash display for vote verification

### System-Wide
- ⛓️ **Blockchain Integration**: Ethereum smart contracts for vote storage
- 🌐 **Real-time Communication**: WebSocket for instant booth control
- 🔐 **End-to-End Encryption**: Secure data transmission
- 📊 **Comprehensive Analytics**: Vote counting and results
- 🚀 **Scalable Architecture**: Microservices design for easy expansion

---

## 🏗️ System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   PUBLIC ZONE                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Landing Page / Marketing Website                 │  │
│  │    - Project information                      (5173) │  │
│  │    - Features & team details                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   VOTING ZONE                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │    Voter Portal                                    │    │
│  │    - Register/Login                        (5173) │    │
│  │    - View profile & voting status                  │    │
│  │    - Find polling booths                          │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓ (REST API + WebSocket)           │
│  ┌────────────────────────────────────────────────────┐    │
│  │    Polling Booth Interface                         │    │
│  │    - Idle screen (waiting for authorization)  (5175) │  │
│  │    - Vote selection screen                         │    │
│  │    - Biometric fingerprint capture                 │    │
│  │    - Vote submission & confirmation                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 OFFICER ZONE (Secure)                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │    Officer Dashboard                               │    │
│  │    - Officer login & authentication           (5174) │   │
│  │    - Search voters by Aadhaar                      │    │
│  │    - Verify voter identity                        │    │
│  │    - Unlock booth for voting                       │    │
│  │    - View booth status & activity logs             │    │
│  │    - Generate voting reports                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │    Backend Server (REST API + WebSocket)      (5000) │   │
│  │    - Authentication (JWT)                         │    │
│  │    - Voter registration processing                │    │
│  │    - Vote submission validation                   │    │
│  │    - Biometric verification                       │    │
│  │    - Blockchain transaction handling              │    │
│  │    - Real-time booth control via WebSocket        │    │
│  │    - Database operations (Supabase)               │    │
│  └────────────────────────────────────────────────────┘    │
│           ↓ (Ethers.js to Smart Contract)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │    Ganache Blockchain (Local Ethereum)        (7545) │   │
│  │    - DecentralizedVoting Smart Contract            │    │
│  │    - Immutable vote recording                      │    │
│  │    - Double-voting prevention                      │    │
│  │    - Vote counting                                 │    │
│  │    - Time-lock mechanism                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BIOMETRIC HARDWARE INTEGRATION                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │    SecuGen Hamster Pro 20 Fingerprint Scanner      │    │
│  │    - Captures fingerprint at registration          │    │
│  │    - Captures fingerprint at voting                │    │
│  │    - SGIBioSrv service (Port 8000)                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. REGISTRATION PHASE
   Voter Portal → Backend (REST) → Supabase Database
                              → Fingerprint Template Storage
                              → Aadhaar Hash (keccak256 + salt)

2. VERIFICATION PHASE
   Officer Dashboard → Backend (REST) → Supabase (Voter Lookup)
                                     → Backend confirms officer permission

3. BOOTH UNLOCK PHASE
   Backend (Authorized) → WebSocket → Polling Booth
   Polling Booth: Transits from "Idle" to "Voting Mode"

4. VOTING PHASE
   Voter selects party → Fingerprint capture → Backend verification
                      → Blockchain check (hasVoted?)
                      → Biometric matching
                      → Smart Contract execution
                      → Vote recorded immutably

5. CONFIRMATION PHASE
   Smart Contract emits VoteCast event
   Backend notifies Booth → Booth displays transaction hash
                        → Booth resets to Idle
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite 7** - Lightning-fast bundler
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time WebSocket communication
- **Axios** - HTTP client
- **React Router** - Navigation between pages

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time, bidirectional communication
- **Ethers.js** - Ethereum blockchain interaction
- **JWT** - Authentication & authorization
- **bcryptjs** - Password hashing
- **Cors** - Cross-origin resource sharing
- **Multer** - File upload handling (fingerprints)

### Blockchain
- **Solidity 0.8.19** - Smart contract language
- **Ethereum** - Blockchain network
- **Ganache** - Local blockchain emulator
- **Hardhat** - Smart contract development (optional)

### Database & Services
- **Supabase** - PostgreSQL database (primary)
- **JSON Files** - Local fallback storage
- **SecuGen SDK** - Biometric fingerprint hardware integration

### DevOps & Infrastructure
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment (optional)
- **Docker** - Containerization (optional)
- **Nodemon** - Development auto-reload
- **ESLint** - Code quality & linting

---

## 📁 Project Structure

```
VoteRakshak/
├── landing-page/           # Marketing & information website
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Team, etc.)
│   │   ├── assets/         # Images & media files
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── voter-portal/           # Voter registration & profile portal
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Registration & login
│   │   │   ├── Profile.jsx     # Voter profile
│   │   │   └── Register.jsx    # Registration form
│   │   ├── utils/
│   │   │   └── api.js          # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── officer-dashboard/      # Election officer control interface
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Officer authentication
│   │   │   ├── Dashboard.jsx   # Main control panel
│   │   │   ├── VoterSearch.jsx # Search voters
│   │   │   ├── BoothStatus.jsx # Booth monitoring
│   │   │   └── AuditLogs.jsx   # Activity logs
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── polling-booth/          # Voting interface (booth hardware)
│   ├── src/
│   │   ├── components/
│   │   │   ├── IdleScreen.jsx        # Waiting state
│   │   │   ├── VotingScreen.jsx      # Vote selection
│   │   │   └── SuccessModal.jsx      # Confirmation
│   │   ├── utils/
│   │   │   ├── api.js               # Backend API calls
│   │   │   └── socket.js            # WebSocket connection
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Backend API & WebSocket server
│   ├── routes/
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── voting.js       # Voting endpoints
│   │   ├── officer.js      # Officer verification & booth unlock
│   │   └── debug.js        # Debug/testing endpoints
│   ├── utils/
│   │   ├── blockchain.js   # Blockchain integration
│   │   ├── supabaseClient.js  # Database connection
│   │   └── biometric.js    # Biometric verification
│   ├── data/
│   │   ├── users.json      # Local user storage
│   │   ├── booths.json     # Booth data
│   │   └── logs.json       # Activity logs
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env                # Environment variables
│
├── contracts/              # Smart contracts
│   ├── DecentralizedVoting.sol  # Main voting contract
│   ├── deploy.js           # Deployment script
│   └── package.json
│
├── scripts/                # Utility scripts
│   ├── seed_user.js        # Generate test users
│   └── simulate_booth.js   # Test booth scenarios
│
├── sql/                    # Database schemas
│   └── supabase_migration.sql  # SQL setup scripts
│
├── Presentation/           # Documentation & research
│   ├── Literature_Survey.csv
│   └── Literature_Survey - Copy.csv
│
├── docs/
│   ├── QUICK_START.md      # Quick start guide
│   ├── DEPLOYMENT_GUIDE.md # Deployment instructions
│   ├── PRODUCTION_CHECKLIST.md
│   └── context.md          # Project context
│
└── README.md               # This file
```

---

## 🎯 Component Descriptions

### 1. **Landing Page** (Port 5173)

**Purpose**: Public-facing marketing website and project information portal

**Features**:
- 🎨 Modern, responsive design
- 📝 Project overview and vision
- ✨ Feature showcase
- 👥 Team information
- 📚 Documentation links
- 📧 Contact/Newsletter signup
- 🌐 Multi-language support (optional)

**Technology**: React + Vite + Tailwind CSS

**Key Components**:
- `Header.jsx` - Navigation header
- `Hero.jsx` - Hero section with CTA
- `Features.jsx` - Feature cards
- `Team.jsx` - Team member profiles
- `CTA.jsx` - Call-to-action sections
- `Footer.jsx` - Footer with links
- `BlockchainVisualizer.jsx` - Animated blockchain demo

**Routes**:
- `/` - Home page
- `/features` - Feature details
- `/team` - Team page
- `/docs` - Documentation

---

### 2. **Voter Portal** (Port 5173/5174)

**Purpose**: Voter registration, authentication, and profile management

**Features**:
- ✍️ **Registration**: Collect voter information
  - First/Last Name
  - Age verification
  - Aadhaar number (hashed on backend)
  - Address & contact info
  - Fingerprint capture & template generation
- 🔐 **Login**: Aadhaar-based authentication
- 👤 **Profile Page**: View registration status
  - Voting eligibility
  - Polling booth assignment
  - Previous voting history
  - Pending verifications
- 🔍 **Booth Finder**: Locate nearest polling station
  - Distance calculation
  - Operating hours
  - Directions

**Technology**: React + Vite + Tailwind CSS + Axios

**Key Pages**:
- `Home.jsx` - Dashboard & navigation
- `Register.jsx` - Registration form with biometric capture
- `Profile.jsx` - Voter profile & status display

**API Endpoints Used**:
- `POST /api/auth/register` - Register new voter
- `POST /api/auth/login` - Voter login
- `GET /api/voter/profile` - Get voter profile
- `GET /api/booths/nearby` - Find nearby booths
- `POST /api/biometric/enroll` - Capture fingerprint

---

### 3. **Officer Dashboard** (Port 5174)

**Purpose**: Election officer control center for voter verification and booth management

**Features**:
- 🔐 **Officer Authentication**
  - Officer ID verification
  - Password authentication
  - Session management
- 🔍 **Voter Search & Verification**
  - Search by Aadhaar number
  - View voter details (redacted PII)
  - Verify voter eligibility
  - Check voting status
- 🔓 **Booth Control**
  - View all polling booth status (Online/Offline/Idle)
  - Real-time booth activity
  - Unlock booth for specific voter
  - Lock booth when done
- 📊 **Audit & Monitoring**
  - Activity logs with timestamps
  - Who verified which voter
  - Booth activity history
  - Vote count progression
  - Real-time alerts
- 📈 **Reports**
  - Voter turnout by booth
  - Verification statistics
  - System performance metrics

**Technology**: React + Vite + Tailwind CSS + Socket.io

**Key Pages**:
- `Login.jsx` - Officer authentication
- `Dashboard.jsx` - Main control panel with booth status
- Additional pages for voter search, audit logs, etc.

**WebSocket Events**:
- `emit 'officer_login'` - Officer authentication
- `emit 'unlock_booth'` - Unlock polling booth
- `on 'booth_status'` - Real-time booth updates
- `on 'vote_cast'` - Vote confirmation notifications

**API Endpoints Used**:
- `POST /api/officer/login` - Officer authentication
- `GET /api/officer/voters/:aadhar` - Search voter
- `POST /api/officer/unlock-booth` - Unlock booth for voting
- `GET /api/officer/booths` - Get booth status
- `GET /api/officer/logs` - Fetch activity logs

---

### 4. **Polling Booth Interface** (Port 5175)

**Purpose**: Actual voting interface running on polling station hardware

**Features**:
- 🔒 **Idle State**
  - Locked by default
  - Displays "Waiting for Officer Authorization"
  - Shows booth ID and status
  - Prevents unauthorized access
- 🎯 **Voting Mode** (Unlocked by Officer)
  - Displays voter greeting
  - Party/Candidate selection with images
  - Clear candidate information
  - Large touchscreen buttons for accessibility
- 👆 **Biometric Capture**
  - Integrated fingerprint scanner hardware
  - Live capture feedback
  - Quality assessment
  - Retry mechanism
- ✅ **Vote Confirmation**
  - Display selected candidate confirmation
  - Blockchain transaction hash
  - QR code for verification
  - Success/failure messages
- 🔄 **Auto-Reset**
  - Returns to idle state after vote submission
  - 30-second timeout for next voter
  - Safety checks

**Technology**: React + Vite + Socket.io Client

**Key Components**:
- `IdleScreen.jsx` - Waiting state UI
- `VotingScreen.jsx` - Vote selection interface
- `SuccessModal.jsx` - Vote confirmation popup
- `BiometricCapture.jsx` - Fingerprint capture UI

**WebSocket Events**:
- `register_booth` - Initial booth registration
- `on 'booth_unlocked'` - Authorization from officer
- `on 'voting_allowed'` - Permission to proceed
- `emit 'vote_submitted'` - Send selected party/vote
- `on 'vote_confirmed'` - Blockchain confirmation
- `on 'reset_booth'` - Reset to idle

**Environment Variables**:
- `VITE_BOOTH_ID` - Unique booth identifier
- `VITE_BACKEND_URL` - Backend server address

---

### 5. **Backend Server** (Port 5000)

**Purpose**: Central REST API and WebSocket hub managing all system logic

**Architecture**:
```
┌─────────────────┐
│   HTTP Server   │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴─────────────────┐
    │                      │
┌───▼────────┐    ┌───────▼──────┐
│ REST API   │    │ WebSocket    │
│ Endpoints  │    │ (Socket.io)  │
└───┬────────┘    └───────┬──────┘
    │                     │
    ├─────┬───────────────┤
    │     │               │
┌───▼──┐  │  ┌─────────┐  │
│ JWT  │  │  │ Ethers  │  │
│Auth  │  │  │  Blockchain
└───┬──┘  │  └────┬────┘
    │     │       │
    │ ┌───▼───────▼──┐
    └─►Supabase DB  │
      │ + JSON Files│
      └────────────┘
```

**Core Routes**:

#### Authentication (`/api/auth`)
- `POST /register` - Voter registration
  - Input: Name, Aadhaar, age, address, fingerprint
  - Output: Voter ID, JWT token
  - Security: Aadhaar hashed with salt
- `POST /login` - Voter login
  - Input: Aadhaar (hashed), password
  - Output: JWT token + voter details
- `POST /logout` - Session termination

#### Voting (`/api/voting`)
- `POST /cast-vote` - Submit a vote
  - Input: Voter hash, party ID, fingerprint template
  - Validation:
    - Check if voter already voted (blockchain)
    - Verify fingerprint matches registration
    - Verify voting window (smart contract timelock)
  - Output: Transaction hash
- `GET /results` - Get vote count (admin only)
- `GET /vote-status/:voterHash` - Check if voted

#### Officer Operations (`/api/officer`)
- `POST /login` - Officer authentication
  - Input: Officer ID, password
  - Output: JWT token with officer permissions
- `GET /voters/:aadhar` - Search voter by Aadhaar
  - Returns: Voter details (redacted) + verification status
- `POST /unlock-booth` - Unlock booth for voting
  - Input: Booth ID, officer ID, voter Aadhaar
  - Triggers: WebSocket broadcast to booth
  - Returns: Unlock confirmation
- `GET /booths` - List all booths with status
- `GET /logs` - Fetch audit logs

#### Debug (`/api/debug`)
- `GET /health` - Server health check
- `POST /simulate-vote` - Test vote without biometric
- `GET /test-blockchain` - Test blockchain connection
- `POST /seed-data` - Populate test data

**WebSocket Handlers**:
```javascript
// Booth Registration
socket.on('register_booth', (boothId) => {
  // Store booth connection
  // Join room booth_${boothId}
})

// Officer Unlock
socket.on('unlock_booth', (data) => {
  // Verify officer permissions
  // Send 'booth_unlocked' to polling booth
})

// Vote Submission
socket.on('vote_received', (data) => {
  // Process vote on blockchain
  // Send result back to booth
})

// Real-time Status
socket.on('booth_status_request', () => {
  // Send live booth status updates
})
```

**Middleware & Utilities**:
- **Auth Middleware**: JWT verification
- **CORS**: Multi-origin support for three frontends
- **Error Handling**: Centralized error responses
- **Logging**: Activity & transaction logging
- **Rate Limiting**: DDoS protection (optional)

---

### 6. **Smart Contract** (Solidity/Ganache)

**File**: `contracts/DecentralizedVoting.sol`

**Purpose**: Immutable vote storage and tallying on blockchain

**Key Features**:
- 🔐 **Privacy**: Uses keccak256 hashes of Aadhaar, not actual IDs
- ✅ **Double-Voting Prevention**: `mapping(bytes32 => bool) hasVoted`
- ⏰ **Time-Lock**: `startTime` and `endTime` modifiers
- 📊 **Vote Counting**: `mapping(uint256 => uint256) voteCounts`
- 📢 **Events**: Emits `VoteCast` events for transparency

**State Variables**:
```solidity
address public admin;                    // Contract owner
uint256 public startTime;               // Voting starts
uint256 public endTime;                 // Voting ends
mapping(bytes32 => bool) hasVoted;      // Voter → Already Voted?
mapping(uint256 => uint256) voteCounts; // Party ID → Vote Count
uint256 public totalVotes;              // Total votes cast
```

**Core Functions**:
```solidity
// Cast vote (called by backend)
function castVote(bytes32 voterHash, uint256 partyId) 
  public 
  withinVotingPeriod 
  returns (bool)

// Get party vote count (public, transparent)
function getVoteCount(uint256 partyId) 
  public 
  view 
  returns (uint256)

// Update voting period (admin only)
function updateVotingPeriod(uint256 newStart, uint256 newEnd) 
  public 
  onlyAdmin

// Check if voter already voted
function checkVoterStatus(bytes32 voterHash) 
  public 
  view 
  returns (bool)
```

**Events**:
```solidity
event VoteCast(
  bytes32 indexed voterHash,
  uint256 indexed partyId,
  uint256 timestamp
);

event VotingPeriodUpdated(
  uint256 newStartTime,
  uint256 newEndTime
);
```

**Deployment**:
- Deployed on Ganache (local blockchain for development)
- Deployment script: `contracts/deploy.js`
- Admin: First Ganache account
- Voting Period: Set during deployment

---

## 📋 Prerequisites

Before setting up the project, ensure you have:

### Required Software
- **Node.js** v18 or higher ([download](https://nodejs.org/))
  ```bash
  node --version  # Should be v18.0.0+
  ```
- **npm** 8+ or **yarn** (comes with Node.js)
  ```bash
  npm --version
  ```
- **Git** for cloning the repository
- **Ganache** for local blockchain
  ```bash
  # Install globally
  npm install -g ganache-cli
  ```

### Optional but Recommended
- **Visual Studio Code** - Code editor
- **Solidity Extension** - For smart contract development (VS Code)
- **MetaMask** - Ethereum wallet (for testing)
- **Postman** - API testing tool
- **Docker** - For containerized deployment

### Hardware Requirements (For Full Testing)
- **SecuGen Hamster Pro 20** Fingerprint Scanner
  - Driver: SGIBioSrv (Must be running on localhost:8000)
  - Without this, biometric verification will fail

### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **SSD**: 500MB free space
- **Network**: Internet connection for Supabase

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
# Clone from GitHub (replace with your repo URL)
git clone https://github.com/Arsan-sk/VoteRakshak.git

# Navigate to project directory
cd VoteRakshak

# List all components
ls -la
```

### Step 2: Install Dependencies for All Components

```bash
# Backend dependencies
cd server
npm install
cd ..

# Landing Page dependencies
cd landing-page
npm install
cd ..

# Voter Portal dependencies
cd voter-portal
npm install
cd ..

# Officer Dashboard dependencies
cd officer-dashboard
npm install
cd ..

# Polling Booth dependencies
cd polling-booth
npm install
cd ..

# Smart Contract dependencies
cd contracts
npm install ethers solc
cd ..
```

### Step 3: Set Up Ganache Blockchain

```bash
# Option A: Use Ganache CLI (easy for development)
ganache-cli -p 7545 --accounts 10

# Option B: Use Ganache GUI
# Download from https://www.trufflesuite.com/ganache
# Click "New Workspace Ethereum"
# Set port to 7545
# Click "Start"
```

Keep Ganache running in a separate terminal window.

### Step 4: Deploy Smart Contract

```bash
# In a new terminal
cd contracts

# Deploy contract to Ganache
node deploy.js

# You should see:
# ✅ Contract deployed at: 0x...
# ✅ Admin address: 0x...
# ✅ Contract ABI saved
```

**⚠️ Important**: Save the contract address from the output. You'll need it for configuration.

---

## ⚙️ Configuration

### Environment Variables Setup

#### Backend Server (`server/.env`)

```bash
# Create .env file in server directory
cd server
touch .env  # On Windows: type nul > .env
```

**Contents**:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Blockchain Configuration
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=0x...  # From deploy.js output
PRIVATE_KEY=0x...       # Ganache account private key

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Biometric Configuration
BIOMETRIC_API_URL=https://localhost:8000
AADHAAR_SALT=voting_system_salt_2024_change_this

# Frontend URLs (for CORS)
VOTER_PORTAL_URL=http://localhost:5173
OFFICER_DASHBOARD_URL=http://localhost:5174
POLLING_BOOTH_URL=http://localhost:5175
LANDING_PAGE_URL=http://localhost:5176

# Optional: Analytics & Logging
LOG_LEVEL=info
ENABLE_DEBUG_ROUTES=true
```

#### Polling Booth (`polling-booth/.env`)

```bash
cd polling-booth
touch .env
```

**Contents**:
```env
VITE_BOOTH_ID=BOOTH_001
VITE_BACKEND_URL=http://localhost:5000
VITE_BLOCKCHAIN_URL=http://127.0.0.1:7545
```

#### Voter Portal (`voter-portal/.env`)

```bash
cd voter-portal
touch .env
```

**Contents**:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=VoteRakshak
```

#### Officer Dashboard (`officer-dashboard/.env`)

```bash
cd officer-dashboard
touch .env
```

**Contents**:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=OfficeRakshak
```

### Database Setup (Supabase)

If using Supabase (recommended for production):

1. **Create Supabase account** at https://supabase.com
2. **Create new project** (select region closest to you)
3. **Run SQL migrations**:
   ```bash
   # In Supabase Dashboard → SQL Editor
   # Execute the contents of sql/supabase_migration.sql
   ```
4. **Get credentials** from Supabase Dashboard → Settings → API
   - Copy `SUPABASE_URL`
   - Copy `anon public` key → `SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_KEY`
5. **Add to `server/.env`**

---

## 🎬 Running the System

### Development Mode (Local Testing)

**Terminal 1: Start Ganache**
```bash
ganache-cli -p 7545 --accounts 10 --mnemonic "your seed phrase"
```

**Terminal 2: Start Backend Server**
```bash
cd server
npm run dev
# You should see: ✅ Server running on http://localhost:5000
```

**Terminal 3: Start Polling Booth**
```bash
cd polling-booth
npm run dev
# You should see: http://localhost:5175
```

**Terminal 4: Start Voter Portal**
```bash
cd voter-portal
npm run dev
# You should see: http://localhost:5173
```

**Terminal 5: Start Officer Dashboard**
```bash
cd officer-dashboard
npm run dev
# You should see: http://localhost:5174
```

**Terminal 6: Start Landing Page (Optional)**
```bash
cd landing-page
npm run dev
# You should see: http://localhost:5176
```

### Quick Verification

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-03-17T10:30:25Z",
  "activeBooths": ["BOOTH_001"]
}

# Check if blockchain is accessible
curl http://localhost:7545
```

### Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Landing Page | http://localhost:5176 | Marketing site |
| Voter Portal | http://localhost:5173 | Register & profile |
| Officer Dashboard | http://localhost:5174 | Officer control |
| Polling Booth | http://localhost:5175 | Vote interface |
| Backend API | http://localhost:5000 | REST endpoints |
| Ganache | http://localhost:7545 | Blockchain RPC |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register Voter
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "age": 25,
  "aadhar": "123456789012",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "fingerprintTemplate": "base64_encoded_fingerprint_template",
  "phone": "+1234567890"
}

# Response
{
  "success": true,
  "voterId": "VOTER_12345",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Registration successful"
}
```

#### Voter Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "aadhar": "123456789012",
  "password": "voter_password"
}

# Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "voter": {
    "id": "VOTER_12345",
    "firstName": "John",
    "lastName": "Doe",
    "hasVoted": false
  }
}
```

### Voting Endpoints

#### Cast Vote
```http
POST /api/voting/cast-vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "voterHash": "0x1234567890abcdef...",
  "partyId": 1,
  "fingerprintTemplate": "base64_encoded_current_fingerprint",
  "boothId": "BOOTH_001"
}

# Response
{
  "success": true,
  "transactionHash": "0xabcd1234...",
  "message": "Vote cast successfully",
  "blockNumber": 12345
}
```

#### Check Voting Status
```http
GET /api/voting/status?aadhar=123456789012
Authorization: Bearer {token}

# Response
{
  "hasVoted": true,
  "votedAt": "2024-03-17T10:30:25Z",
  "boothId": "BOOTH_001"
}
```

### Officer Endpoints

#### Officer Login
```http
POST /api/officer/login
Content-Type: application/json

{
  "officerId": "OFFICER_001",
  "password": "officer_password"
}

# Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "permissions": ["unlock_booth", "verify_voter", "view_logs"]
}
```

#### Unlock Booth for Voting
```http
POST /api/officer/unlock-booth
Authorization: Bearer {officer_token}
Content-Type: application/json

{
  "boothId": "BOOTH_001",
  "voterAadhar": "123456789012",
  "voterName": "John Doe",
  "officerId": "OFFICER_001"
}

# Response
{
  "success": true,
  "message": "Booth unlocked successfully",
  "boothStatus": "voting_mode",
  "timeoutSeconds": 300
}
```

#### Search Voter
```http
GET /api/officer/voters/123456789012
Authorization: Bearer {officer_token}

# Response
{
  "success": true,
  "voter": {
    "id": "VOTER_12345",
    "firstName": "John",
    "lastName": "Doe",
    "age": 25,
    "address": "123 Main St",
    "registeredAt": "2024-03-16T15:30:00Z",
    "hasVoted": false,
    "verificationStatus": "pending"
  }
}
```

#### Get Booth Status
```http
GET /api/officer/booths
Authorization: Bearer {officer_token}

# Response
{
  "success": true,
  "booths": [
    {
      "boothId": "BOOTH_001",
      "status": "idle",
      "lastActivity": "2024-03-17T10:30:00Z",
      "currentVoter": null,
      "totalVotersSeen": 45
    }
  ]
}
```

#### Get Audit Logs
```http
GET /api/officer/logs?limit=50&offset=0
Authorization: Bearer {officer_token}

# Response
{
  "success": true,
  "logs": [
    {
      "timestamp": "2024-03-17T10:30:25Z",
      "action": "voter_verified",
      "officer": "OFFICER_001",
      "voter": "VOTER_12345",
      "boothId": "BOOTH_001"
    }
  ]
}
```

### Debug Endpoints (Development Only)

```http
# Health Check
GET /api/health

# Blockchain Connection Test
GET /api/debug/blockchain-health

# Simulate Vote (without biometric)
POST /api/debug/simulate-vote
{
  "voterAadhar": "123456789012",
  "partyId": 1
}

# Seed Test Data
POST /api/debug/seed-data
{
  "numVoters": 10,
  "numBooths": 5
}
```

---

## 🗳️ Voting Workflow

### Complete End-to-End Voting Process

```
┌─────────────────────────────────────────────────────────────┐
│                  VOTING PROCESS FLOWCHART                    │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION PHASE
   ┌─────────────────────────────────┐
   │ Voter visits Voter Portal       │
   │ (Port 5173)                     │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Enters personal details:        │
   │ - Name, Age, Address            │
   │ - Aadhaar number                │
   │ - Phone, Email                  │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Captures fingerprint in portrait│
   │ (via SecuGen hardware)          │
   │ Template stored securely        │
   └──────────────┬──────────────────┘
                  │
    ──────────────┴──────────────────
    │ BACKEND PROCESSING
    │
    ▼
   ┌─────────────────────────────────┐
   │ Backend receives registration   │
   │ - Hashes Aadhaar with salt      │
   │   using keccak256               │
   │ - Stores fingerprint template   │
   │ - Creates voter record          │
   │ - Sends confirmation email      │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ ✅ Voter registration complete  │
   │    Status: Eligible to Vote     │
   └─────────────────────────────────┘

─────────────────────────────────────────────────────────────

2. POLLING DAY - VOTER ARRIVES
   ┌─────────────────────────────────┐
   │ Voter arrives at polling booth  │
   │ (Port 5175 - Idle Screen)       │
   │ Sees: "Awaiting Authorization"  │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Voter meets Election Officer    │
   │ (at Officer Dashboard)          │
   │ Officer asks for ID/documents   │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Officer searches voter by       │
   │ Aadhaar in Officer Dashboard    │
   │ (Port 5174)                     │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Verifies voter details match ID │
   │ - Checks name, age, address     │
   │ - Confirms voting eligibility   │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Officer clicks "UNLOCK BOOTH"   │
   |  button for this voter          │
   └──────────────┬──────────────────┘
                  │
    ──────────────┴──────────────────
    │ WebSocket Communication
    │
    ▼
   ┌─────────────────────────────────┐
   │ Backend receives unlock request │
   │ - Verifies officer authorization│
   │ - Validates voter eligibility   │
   │ - Broadcasts to booth via       │
   │   WebSocket: 'booth_unlocked'   │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Polling Booth receives signal   │
   │ Screen transitions:             │
   │ Idle → Voting Mode              │
   │ Displays selected voter name    │
   │ Shows party/candidate list      │
   └──────────────┬──────────────────┘

─────────────────────────────────────────────────────────────

3. VOTING PHASE
   ┌─────────────────────────────────┐
   │ Voter reviews candidates on     │
   │ touch screen                    │
   │ Party information displayed     │
   │ (symbols, names, manifesto)     │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Voter selects preferred party   │
   │ by touching screen button       │
   │ Selection highlighted/confirmed │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Display: "Place finger to       │
   │ confirm your vote"              │
   │ Voter places finger on          │
   │ SecuGen scanner                 │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Scanner captures fingerprint    │
   │ Quality check performed         │
   │ Success → Proceed               │
   │ Failure → Retry (max 3 times)   │
   └──────────────┬──────────────────┘
                  │
    ──────────────┴──────────────────
    │ VOTE SUBMISSION
    │
    ▼
   ┌─────────────────────────────────┐
   │ Booth sends to backend:         │
   │ - voterHash (hashed Aadhaar)    │
   │ - partyId (selected party)      │
   │ - fingerprint (captured now)    │
   │ - boothId (location ID)         │
   │ - timestamp                     │
   └──────────────┬──────────────────┘

─────────────────────────────────────────────────────────────

4. BACKEND VALIDATION
   ┌─────────────────────────────────┐
   │ Backend receives vote           │
   │ Performs 5 security checks:     │
   └──────────────┬──────────────────┘
                  │
      ┌───────────┴──────────┬──────────────────┐
      │                      │                  │
      ▼                      ▼                  ▼
   ┌──────────┐        ┌──────────┐      ┌──────────┐
   │ Check 1: │        │ Check 2: │      │ Check 3: │
   │ Voting   │        │ Already  │      │ Voter    │
   │ Window   │        │ Voted?   │      │ Eligible?│
   │ (within  │        │ Query    │      │ Status   │
   │ timelock)│        │blockchain│      │ check    │
   └────┬─────┘        └─────┬────┘      └────┬─────┘
        │ Pass               │ Pass            │ Pass
        └────────────────────┴────────────────┘
                     │
                     ▼
      ┌──────────────────────────────────┐
      │ Check 4: Biometric Verification  │
      │ Compare captured fingerprint     │
      │ against registered template      │
      │ Match % > 85% ? Proceed : Error  │
      └────────────┬─────────────────────┘
                   │ Pass
                   ▼
      ┌──────────────────────────────────┐
      │ Check 5: Booth Authorization     │
      │ Verify booth is authorized to    │
      │ accept votes (unlocked status)   │
      └────────────┬─────────────────────┘
                   │ Pass All Checks
                   ▼
   
   ┌────────────────────────────────────┐
   │ ✅ ALL VALIDATIONS PASSED          │
   │ Proceed to blockchain transaction  │
   └────────────┬──────────────────────┘

─────────────────────────────────────────────────────────────

5. BLOCKCHAIN RECORDING
   ┌─────────────────────────────────┐
   │ Backend calls Smart Contract:   │
   │ castVote(voterHash, partyId)    │
   │ Via Ethers.js on Ganache        │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Smart Contract execution:       │
   │ - Verify voting period okay     │
   │ - Mark voter as voted           │
   │ - Increment party vote count    │
   │ - Emit VoteCast event           │
   │ - Return transaction hash       │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ ✅ Transaction confirmed        │
   │ Block: #12345                   │
   │ TxHash: 0xabc123def...          │
   │ Status: 1 (Success)             │
   └──────────────┬──────────────────┘

─────────────────────────────────────────────────────────────

6. VOTE CONFIRMATION
   ┌─────────────────────────────────┐
   │ Polling Booth receives           │
   │ blockchain confirmation          │
   │ Screen displays:                 │
   │ "Vote Recorded Successfully"     │
   │ TxHash: 0xabc123def...          │
   │ Block: #12345                   │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Optional: Show QR code          │
   │ for voter to verify             │
   │ on blockchain explorer          │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Booth logs event to local DB    │
   │ Backend updates last activity   │
   │ Officer Dashboard shows update  │
   └──────────────┬──────────────────┘
                  │
                  ▼ (Auto after 30 sec or manual)
   ┌─────────────────────────────────┐
   │ Booth resets to IDLE STATE      │
   │ Ready for next voter            │
   │ "Awaiting Authorization"        │
   │ ✅ VOTING COMPLETE              │
   └─────────────────────────────────┘

─────────────────────────────────────────────────────────────

7. RESULT PHASE (After Voting Ends)
   ┌─────────────────────────────────┐
   │ Officer Dashboard shows         │
   │ real-time vote counts           │
   │ (from blockchain queries)       │
   │ Party A: 1,234 votes            │
   │ Party B: 1,567 votes            │
   │ Turnout: 92.3%                  │
   └──────────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────┐
   │ Results can be audited by       │
   │ querying blockchain directly    │
   │ Immutable record of all votes   │
   │ Double-voting impossible        │
   └─────────────────────────────────┘
```

### Key Security Checkpoints

1. **Voter Registration**
   - ✅ Aadhaar hashed (never stored plaintext)
   - ✅ Fingerprint template encrypted
   - ✅ Email verification

2. **Officer Authorization**
   - ✅ Officer JWT token required
   - ✅ Voter eligibility checked
   - ✅ All actions logged

3. **Vote Casting**
   - ✅ Fingerprint must match registration (85%+ confidence)
   - ✅ Blockchain check: voter hasn't voted yet
   - ✅ Time-lock: voting window enforced
   - ✅ Booth must be unlocked by officer

4. **Blockchain Recording**
   - ✅ Smart contract enforces double-voting prevention
   - ✅ All votes immutable after recording
   - ✅ Time-lock prevents voting outside window
   - ✅ Event emission for auditability

---

## ⛓️ Smart Contract

### DecentralizedVoting.sol - Technical Details

**Location**: `contracts/DecentralizedVoting.sol`

**Solidity Version**: 0.8.19

**Key Characteristics**:
- Immutable voting record on blockchain
- No voter PII stored (only keccak256 hashes)
- Time-lock mechanism for voting window
- Double-voting prevention via state mapping
- Admin-controlled (deployment owner)

**State Variables**:
```solidity
address public admin;                    // Contract owner
uint256 public startTime;               // Voting starts (Unix timestamp)
uint256 public endTime;                 // Voting ends (Unix timestamp)
mapping(bytes32 => bool) hasVoted;      // Track voted voters
mapping(uint256 => uint256) voteCounts; // Vote counts per party
uint256 public totalVotes;              // Total votes cast
```

**Functions**:

1. **castVote()** - Submit a vote
   ```solidity
   function castVote(bytes32 voterHash, uint256 partyId) 
     public 
     withinVotingPeriod 
     returns (bool)
   ```
   - Requires: Voting window active
   - Requires: Voter hasn't voted yet
   - Updates: `hasVoted[voterHash] = true`
   - Updates: `voteCounts[partyId]++`
   - Emits: `VoteCast(voterHash, partyId, block.timestamp)`

2. **getVoteCount()** - Get party's vote total (transparent)
   ```solidity
   function getVoteCount(uint256 partyId) 
     public 
     view 
     returns (uint256)
   ```

3. **checkVoterStatus()** - Check if voter already voted
   ```solidity
   function checkVoterStatus(bytes32 voterHash) 
     public 
     view 
     returns (bool)
   ```

4. **updateVotingPeriod()** - Change voting times (admin only)
   ```solidity
   function updateVotingPeriod(uint256 newStart, uint256 newEnd) 
     public 
     onlyAdmin
   ```

**Events**:
```solidity
event VoteCast(
  bytes32 indexed voterHash,
  uint256 indexed partyId,
  uint256 timestamp
);

event VotingPeriodUpdated(
  uint256 newStartTime,
  uint256 newEndTime
);
```

**Deployment Process**:
```bash
# 1. Ensure Ganache running on port 7545
ganache-cli -p 7545

# 2. Run deployment script
cd contracts
node deploy.js

# Expected output:
# ✅ Deploying DecentralizedVoting contract...
# ✅ Contract deployed at: 0x1234567890AbCdEFF
# ✅ Admin address: 0xabcdef1234567890
# ✅ Voting period set from: 1710768000 to 1710854400
# ✅ ABI saved to deployedABI.json
```

---

## 🚀 Deployment

### Local/Development Deployment

**Already Covered**: See "Running the System" section above.

### Production Deployment (Testnet/Mainnet)

#### Step 1: Prepare Environment

```bash
# Create production .env
cp server/.env.example server/.env.production

# Edit with production values
nano server/.env.production
```

**Production Environment Variables**:
```env
NODE_ENV=production
PORT=5000

# IMPORTANT: Use environment variable, not hardcoded!
JWT_SECRET=${JWT_SECRET_PROD}

# Use testnet or mainnet RPC
GANACHE_URL=https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}
# OR for mainnet:
# GANACHE_URL=https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}

CONTRACT_ADDRESS=${CONTRACT_ADDRESS_PROD}
PRIVATE_KEY=${PRIVATE_KEY_PROD}

# Production database
SUPABASE_URL=${SUPABASE_URL_PROD}
SUPABASE_ANON_KEY=${SUPABASE_KEY_PROD}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY_PROD}

# Security
BIOMETRIC_API_URL=https://yourserver.com/biometric
AADHAAR_SALT=${AADHAAR_SALT_PROD}
```

#### Step 2: Deploy Smart Contract to Testnet

```bash
# Deploy to Sepolia testnet
cd contracts
NETWORK=sepolia node deploy.js

# Update CONTRACT_ADDRESS in .env.production
```

#### Step 3: Build Frontend Apps

```bash
# Build all frontend apps for production
cd landing-page && npm run build && cd ..
cd voter-portal && npm run build && cd ..
cd officer-dashboard && npm run build && cd ..
cd polling-booth && npm run build && cd ..
```

#### Step 4: Deploy to Hosting Platforms

**Backend (Railway or Vercel)**:
```bash
# Using Railway
railway link
railway deploy

# Using Vercel
vercel --prod
```

**Frontend (Vercel)**:
```bash
# Each frontend app
vercel --prod
```

### Docker Deployment (Optional)

**Dockerfile** for backend:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

EXPOSE 5000

CMD ["npm", "start"]
```

**Build and run**:
```bash
docker build -t voterakshak-backend .
docker run -p 5000:5000 --env-file .env.production voterakshak-backend
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use

**Problem**: "EADDRINUSE: address already in use :::5000"

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :5000
kill -9 <PID>
```

#### 2. Ganache Connection Failed

**Problem**: "Error: could not detect network"

**Solution**:
```bash
# Verify Ganache running
curl http://localhost:7545

# Should return RPC response, not "Connection refused"

# Restart Ganache
ganache-cli -p 7545 --deterministic
```

#### 3. Smart Contract Not Deployed

**Problem**: "ContractAddress: undefined"

**Solution**:
```bash
# Ensure Ganache running first
ganache-cli -p 7545

# Then deploy in new terminal
cd contracts
node deploy.js

# Check if deploy.js uses correct PRIVATE_KEY from terminal
```

#### 4. Biometric Scanner Not Detected

**Problem**: "Biometric service unavailable"

**Solution**:
- Ensure SecuGen hardware connected via USB
- Start SGIBioSrv on localhost:8000
- If not available, votes will fail at biometric verification
- Use debug endpoint to bypass biometric for testing

#### 5. WebSocket Connection Failed

**Problem**: "WebSocket connection denied"

**Solution**:
```bash
# Check CORS configuration in server.js
# Ensure booth URL in CORS allowedOrigins
# Restart backend server

npm run dev  # In server directory
```

#### 6. Fingerprint Verification Fails

**Problem**: "Fingerprint match % too low"

**Solution**:
- Capture fingerprint image:
  - Ensure good lighting
  - Press firmly on scanner
  - Don't move finger during capture
  - Retry up to 3 times
- If still failing, use debug endpoint for testing

#### 7. JWT Token Expired

**Problem**: "jwt malformed" or "jwt expired"

**Solution**:
```bash
# Login again to get fresh token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"aadhar":"123456789012","password":"password"}'

# Use new token in Authorization header
```

#### 8. Database Connection Error

**Problem**: "Connection to Supabase failed"

**Solution**:
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` correct
- Check internet connection
- Fallback to local JSON storage (set in backend)
- Or create local PostgreSQL instance

#### 9. Booth Shows "Cannot Connect to Backend"

**Problem**: Booth UI displays connection error

**Solution**:
```bash
# Ensure backend running
npm run dev  # In server directory

# Check backend URL in polling-booth/.env
VITE_BACKEND_URL=http://localhost:5000  # Should be correct

# Restart polling booth
npm run dev  # In polling-booth directory
```

#### 10.Voter Registration Shows Blank Page

**Problem**: Voter portal page not loading

**Solution**:
```bash
# Stop current process
Ctrl+C

# Clear cache
rm -rf node_modules/.vite  # Linux/macOS
rmdir /s /q node_modules\.vite  # Windows

# Restart
npm run dev
```

### Debug Mode

**Enable detailed logging**:

1. **Backend Debug**:
   ```bash
   # Set environment variable
   LOG_LEVEL=debug npm run dev
   
   # Or in .env
   LOG_LEVEL=debug
   ```

2. **Frontend Debug**:
   ```javascript
   // In React component
   console.log('Action:', action);  // Browser DevTools
   // F12 → Console tab
   ```

3. **Blockchain Debug**:
   ```bash
   # Check Ganache logs
   # Look for:
   # ✓ Transaction hash: 0x...
   # ✓ Block number: ...
   ```

### Getting Help

- **GitHub Issues**: Check existing issues first
- **Documentation**: Review QUICK_START.md, DEPLOYMENT_GUIDE.md
- **Code Comments**: Check comments in source files
- **Debug Endpoints**: Use `/api/debug/*` endpoints

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/Arsan-sk/VoteRakshak.git
   cd VoteRakshak
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly before committing

4. **Commit Changes**
   ```bash
   git commit -m "feat: brief description of changes"
   # Use conventional commits:
   # feat: new feature
   # fix: bug fix
   # docs: documentation
   # refactor: code refactoring
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe your changes
   - Reference any related issues
   - Wait for review

### Code Standards

- **JavaScript/JSX**: Use ES6+ syntax, follow ESLint config
- **Solidity**: Use Solidity 0.8.19, follow OpenZeppelin standards
- **Comments**: Document complex logic, functions, and edge cases
- **Testing**: Write tests for critical functionality
- **Security**: Never commit private keys or secrets

### Reporting Issues

1. Check if issue already exists
2. Provide:
   - Environment (Node version, OS, etc.)
   - Steps to reproduce
   - Expected vs. actual behavior
   - Error messages/logs
   - Screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

**MIT License Summary**:
- ✅ You can use, modify, distribute the code
- ✅ You can use it for commercial purposes
- ✅ You must include license notice
- ❌ No warranty or liability

---

## 📞 Contact & Support

- **Author**: [@Arsan-sk](https://github.com/Arsan-sk)
- **GitHub**: [VoteRakshak Repository](https://github.com/Arsan-sk/VoteRakshak)
- **Email**: [Your Email]
- **Issues**: [GitHub Issues](https://github.com/Arsan-sk/VoteRakshak/issues)

---

## 🎓 Project Context & Vision

### What is VoteRakshak?

VoteRakshak means "Vote Protector" in Hindi. It's a revolutionary approach to electronic voting that combines:

1. **Blockchain Technology** - Immutable record of votes
2. **Biometric Authentication** - Secure voter identity verification
3. **Real-time Control** - Officers can authorize voting in real-time
4. **Privacy Preservation** - Voters anonymous, votes secure
5. **Distributed Architecture** - No single point of failure

### Problem We're Solving

Traditional voting systems face critical vulnerabilities:
- **Booth Capturing**: Unauthorized control
- **Double Voting**: Same person voting multiple times
- **Impersonation**: Fraudulent voters
- **Data Tampering**: Vote counts modified
- **Lack of Transparency**: No audit trail

### Our Solution

VoteRakshak solves these through a multi-layered approach:
- **Hardware Biometrics**: Physical fingerprint verification
- **Blockchain Immutability**: Votes cannot be altered after recording
- **Centralized Authorization**: Officers approve each vote
- **Real-time Communication**: WebSocket ensures instant updates
- **Hashed Privacy**: Voter identity hashed, votes anonymous

### Current Status (March 2024)

**✅ Implemented:**
- Smart contract deployment & interaction
- Backend API with WebSocket support
- Polling booth UI (idle & voting screens)
- Biometric framework (mock implementation)
- Database schema & migrations

**🚧 In Progress:**
- Officer Dashboard UI
- Voter Portal UI
- Advanced biometric matching
- Production deployment

**📋 Planned:**
- Mainnet deployment
- Advanced analytics dashboard
- Multi-language support
- Accessibility improvements

### Future Roadmap

- **Phase 1** (Current): Local blockchain with mock biometrics
- **Phase 2**: Testnet integration (Sepolia/Goerli)
- **Phase 3**: Production hardening & security audits
- **Phase 4**: Mainnet deployment & pilot rollout
- **Phase 5**: Scaling & optimization for large elections

---

## 📚 Additional Resources

- **[Ethereum Docs](https://ethereum.org/developers)** - Blockchain fundamentals
- **[Solidity Documentation](https://docs.soliditylang.org/)** - Smart contract language
- **[Express.js Guide](https://expressjs.com/)** - Backend framework
- **[React Documentation](https://react.dev/)** - Frontend framework
- **[Socket.io](https://socket.io/)** - Real-time communication
- **[Ethers.js](https://docs.ethers.org/)** - Blockchain interaction

---

## 🎯 Summary

VoteRakshak is a comprehensive, blockchain-based electronic voting system designed to eliminate fraud and ensure democratic integrity. It combines cutting-edge technologies with a focus on security, transparency, and user experience.

Whether you're a developer, election official, or voting advocate, VoteRakshak provides a foundation for secure, verifiable voting systems worldwide.

**Get started now**: Follow the [Installation & Setup](#-installation--setup) section above to run the system locally.

**Have questions?** Check the troubleshooting section or open a GitHub issue.

**Want to contribute?** See our [Contributing](#-contributing) guidelines.

---

**Last Updated**: March 17, 2024  
**Maintainer**: [@Arsan-sk](https://github.com/Arsan-sk)  
**Version**: 1.0.0 (Active Development)

---

> **🚀 VoteRakshak - Protecting Democracy Through Technology**
cd polling-booth
npm run dev
```

The polling booth will be available at `http://localhost:5175`.

## 📋 Module Details

### Module C: Polling Station Interface ✅ IMPLEMENTED

**Location**: `polling-booth/`  
**Port**: 5175  
**Status**: Fully implemented

#### Features
- ✅ **Idle State**: Displays "Waiting for Officer Authorization" with booth ID
- ✅ **WebSocket Integration**: Listens for `allow_vote` events from officer dashboard
- ✅ **Voting Screen**: Shows authorized voter info and party selection
- ✅ **Fingerprint Capture**: Integrates with SecuGen scanner for vote confirmation
- ✅ **Blockchain Integration**: Casts vote via backend API to smart contract
- ✅ **Success Modal**: Displays transaction hash and auto-resets booth
- ✅ **Auto-Reset**: Returns to idle state after 5 seconds

#### Key Files
- `src/App.jsx` - Main app with state management
- `src/components/IdleScreen.jsx` - Locked booth UI
- `src/components/VotingScreen.jsx` - Ballot and fingerprint capture
- `src/components/SuccessModal.jsx` - Vote confirmation
- `src/utils/socket.js` - WebSocket client
- `src/utils/api.js` - HTTP API client

### Backend Server ✅ IMPLEMENTED

**Location**: `server/`  
**Port**: 5000

#### Features
- ✅ **Express Server**: RESTful API endpoints
- ✅ **Socket.io**: WebSocket server with room-based communication
- ✅ **Authentication**: JWT-based auth for voters and officers
- ✅ **Biometric Integration**: SecuGen fingerprint registration and verification
- ✅ **Blockchain**: Ethers.js integration with Ganache
- ✅ **Audit Logging**: All booth unlock events logged to `data/logs.json`

#### API Endpoints

**Authentication**
- `POST /api/auth/register` - Register voter with fingerprint
- `POST /api/auth/login` - Login (voter or officer)

**Voting**
- `POST /api/voting/cast` - Cast vote with fingerprint verification
- `GET /api/voting/voter/:aadhar` - Get voter info and vote status
- `GET /api/voting/booths` - Get polling booth locations

**Officer Operations**
- `POST /api/officer/unlock-booth` - Unlock booth via WebSocket
- `POST /api/officer/reset-booth` - Reset booth to idle
- `GET /api/officer/audit-logs` - View audit trail
- `GET /api/officer/stats` - Dashboard statistics

**System**
- `GET /api/health` - Health check
- `GET /api/booths/active` - List connected booths

#### WebSocket Events

**From Booth to Server**
- `register_booth` - Booth registration with ID
- `booth_status` - Status updates (idle, active, voting_complete)

**From Server to Booth**
- `registration_confirmed` - Booth registered successfully
- `allow_vote` - Officer authorized voter (unlocks booth)
- `reset_booth` - Reset booth to idle state

### Smart Contract ✅ IMPLEMENTED

**Location**: `contracts/DecentralizedVoting.sol`

#### Features
- ✅ **Time-Lock**: Voting only allowed within configured time window
- ✅ **Double-Voting Prevention**: `hasVoted` mapping with hashed Aadhaar
- ✅ **Privacy**: Only accepts keccak256 hashed Aadhaar (never plaintext)
- ✅ **Events**: `VoteCast` event with voter hash, party ID, and timestamp
- ✅ **Vote Tallying**: `voteCounts` mapping for each party

#### Key Functions
- `castVote(bytes32 voterHash, uint256 partyId)` - Record vote
- `checkIfVoted(bytes32 voterHash)` - Check voting status
- `getVoteCount(uint256 partyId)` - Get party vote count
- `getVotingStatus()` - Check if voting is active

## 🔐 Security Features

### Implemented
1. ✅ **Aadhaar Hashing**: keccak256(aadhar + salt) - never store plaintext
2. ✅ **Fingerprint Privacy**: Only store template ID, not raw images
3. ✅ **WebSocket Rooms**: Booth-specific channels prevent cross-booth interference
4. ✅ **JWT Authentication**: Secure API access
5. ✅ **Audit Logging**: All booth unlock events tracked with timestamp
6. ✅ **Blockchain Immutability**: Votes recorded on-chain, tamper-proof

### Coercion Resistance
- ✅ **Physical Separation**: Officer dashboard and polling booth are separate applications
- ✅ **Booth Locking**: Booth cannot be accessed without officer authorization
- ✅ **No Direct Voter Access**: Voters cannot unlock booth themselves

## 🧪 Testing the System

### 1. Test WebSocket Communication

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start polling booth
cd polling-booth && npm run dev

# Open booth in browser: http://localhost:5175
# You should see "Waiting for Officer Authorization"
```

### 2. Test Booth Unlock (Manual API Call)

```bash
# Use curl or Postman to unlock booth
curl -X POST http://localhost:5000/api/officer/unlock-booth \
  -H "Content-Type: application/json" \
  -d '{
    "boothId": "BOOTH_001",
    "voterAadhar": "123456789012",
    "voterName": "Test Voter",
    "officerId": "OFFICER_001"
  }'

# Booth should immediately switch to voting screen
```

### 3. Test Vote Casting

1. Select a party on the voting screen
2. Click "Confirm Vote"
3. Click "Scan Fingerprint" (requires SecuGen scanner)
4. Vote will be cast to blockchain
5. Success modal shows transaction hash
6. Booth auto-resets after 5 seconds

### 4. Check Blockchain

```bash
# Open Ganache GUI or check via CLI
# Look for transaction with contract interaction
# Verify VoteCast event was emitted
```

### 5. Check Audit Logs

```bash
curl http://localhost:5000/api/officer/audit-logs

# Should show unlock event with timestamp, booth ID, voter Aadhaar
```

## 📁 Project Structure

```
VoteRakshak/
├── contracts/
│   ├── DecentralizedVoting.sol    # Smart contract
│   └── deploy.js                  # Deployment script
├── server/
│   ├── server.js                  # Main Express app
│   ├── routes/
│   │   ├── auth.js               # Registration & login
│   │   ├── voting.js             # Vote casting
│   │   └── officer.js            # Booth unlock & logs
│   ├── utils/
│   │   ├── blockchain.js         # Ethers.js integration
│   │   └── biometric.js          # Fingerprint API
│   ├── data/
│   │   ├── users.json            # Voter database
│   │   ├── booths.json           # Booth locations
│   │   └── logs.json             # Audit trail
│   └── .env                      # Environment config
├── polling-booth/
│   ├── src/
│   │   ├── App.jsx               # Main app
│   │   ├── components/
│   │   │   ├── IdleScreen.jsx    # Locked state
│   │   │   ├── VotingScreen.jsx  # Ballot & fingerprint
│   │   │   └── SuccessModal.jsx  # Vote confirmation
│   │   └── utils/
│   │       ├── socket.js         # WebSocket client
│   │       └── api.js            # HTTP client
│   └── .env                      # Booth configuration
└── README.md                     # This file
```

## 🔧 Troubleshooting

### Booth Not Connecting to Server
- Check backend is running on port 5000
- Verify `VITE_BACKEND_URL` in `polling-booth/.env`
- Check browser console for WebSocket errors

### Fingerprint Scanner Not Working
- Ensure SGIBioSrv is running on port 8000
- Check HTTPS certificate is trusted
- Verify scanner is connected via USB

### Vote Casting Fails
- Check Ganache is running on port 7545
- Verify contract is deployed (check `server/contract-config.json`)
- Ensure voter hasn't already voted
- Check voting time window in smart contract

### Booth Doesn't Unlock
- Verify booth ID matches in `.env` and unlock request
- Check booth is connected (see backend logs)
- Ensure WebSocket connection is established

## 🚧 Next Steps (Not Yet Implemented)

### Module A: Public Voter Portal
- [ ] Landing page with project info
- [ ] Registration form (reuse existing backend endpoint)
- [ ] Find polling booth feature
- [ ] User profile with vote status

### Module B: Officer Dashboard
- [ ] Officer login page
- [ ] Voter search by Aadhaar
- [ ] Voter verification interface
- [ ] "Unlock Booth" button with booth selection
- [ ] Audit log viewer

## 📝 Development Notes

### Adding More Booths
1. Create new `.env` file with different `VITE_BOOTH_ID`
2. Run booth on different port (update `vite.config.js`)
3. Each booth joins its own WebSocket room

### Customizing Parties
Edit `PARTIES` array in `polling-booth/src/components/VotingScreen.jsx`:
```javascript
const PARTIES = [
    { id: 1, name: 'Your Party', symbol: '🎯', color: 'blue' },
    // Add more parties...
];
```

### Changing Voting Period
Update smart contract deployment in `contracts/deploy.js`:
```javascript
const VOTING_DURATION_HOURS = 24; // Change duration
```

## 📄 License

MIT

## 👥 Contributors

Built for secure, transparent, and accessible democratic elections.