# 🔐 CVE Explorer

> **Nuit de l'Info 2025** - Explore, analyze, and visualize Common Vulnerabilities and Exposures (CVE) with real-time data from NVD, EPSS, and CISA KEV.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 🔍 **Single & Bulk CVE Analysis** - Analyze individual CVEs or upload files with multiple entries
- 📊 **Interactive Visualizations** - CVSS distribution, EPSS risk charts, timelines
- ⚡ **Real-time Data** - Integrates NVD, EPSS (FIRST), and CISA KEV APIs
- 🎯 **Threat Intelligence** - Keyword-based threat analysis with temporal filtering
- 🚀 **Fast & Responsive** - Built with React 19 and Vite for instant HMR
- 🔗 **Smart Links** - Direct links to NVD, MITRE CWE, and vulnerability details
- 💾 **Session Caching** - Reduces API calls with intelligent caching

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [Git Workflow](#git-workflow)
- [Project Structure](#project-structure)
- [API Configuration](#api-configuration)
- [Contributing](#contributing)

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 18.0+ | [Download](https://nodejs.org/) |
| **npm** | 9.0+ | Included with Node.js |
| **Git** | 2.30+ | [Download](https://git-scm.com/) |

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/AlexisSaysana/CVE_Explorer_2025.git

# OR clone via SSH (if you have SSH keys configured)
git clone git@github.com:AlexisSaysana/CVE_Explorer_2025.git

# Navigate to project directory
cd CVE_Explorer_2025
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- React 19.2
- React DOM 19.2
- Vite 7.2
- ESLint and plugins

### 3. Configure Environment (Optional)

For better NVD API rate limits, create a `.env` file:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your NVD API key:

```env
VITE_NVD_API_KEY=your_api_key_here
```

> **Note:** Get a free API key at [NVD Developers](https://nvd.nist.gov/developers/request-an-api-key)

---

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Local:** http://localhost:5173
- **Network:** Use `--host` flag to expose

Features:
- ⚡ **Hot Module Replacement (HMR)** - Instant updates without full reload
- 🔍 **Source Maps** - Easy debugging in browser DevTools
- ✅ **React Strict Mode** - Catches potential issues early

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

### Development Tips

- **Browser DevTools:** Press `F12` to open console and inspect elements
- **React DevTools:** Install the [React DevTools extension](https://react.dev/learn/react-developer-tools)
- **Clear Cache:** Use `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) for hard refresh

---

## 🏗️ Build & Deploy

### Production Build

```bash
npm run build
```

This creates an optimized bundle in the `dist/` directory:
- **Minified JS/CSS** - Reduces file size
- **Code Splitting** - Faster load times
- **Tree Shaking** - Removes unused code
- **Asset Optimization** - Compresses images and fonts

### Build Output

```
dist/
├── index.html          # Entry point (0.45 KB)
├── assets/
│   ├── index-*.css    # Styles (~20 KB gzipped)
│   └── index-*.js     # Scripts (~71 KB gzipped)
```

### Preview Build

```bash
npm run preview
```

Runs a local server to test the production build before deploying.

### Deploy

Deploy the `dist/` folder to any static hosting service:

- **Vercel:** `vercel --prod`
- **Netlify:** Drag & drop `dist/` folder
- **GitHub Pages:** Use `gh-pages` branch
- **Cloudflare Pages:** Connect your repo

---

## 🔄 Git Workflow

### Basic Commands

#### Check Status
```bash
# View modified files and current branch
git status
```

#### Stage Changes
```bash
# Stage all changes
git add .

# Stage specific file
git add src/path/to/file.js
```

#### Commit Changes
```bash
# Commit with message
git commit -m "feat: add CVSS distribution chart"

# Commit with detailed description
git commit -m "fix: resolve CWE link issue" -m "Updated cveDisplayLayout to use MITRE CWE URLs"
```

#### Push to Remote
```bash
# Push to main branch
git push origin main

# Push and set upstream (first time)
git push -u origin main
```

#### Pull Latest Changes
```bash
# Pull from main branch
git pull origin main

# Pull with rebase (cleaner history)
git pull --rebase origin main
```

### Branching Strategy

```bash
# Create new feature branch
git checkout -b feature/threat-analysis

# Switch between branches
git checkout main
git checkout feature/threat-analysis

# Merge feature into main
git checkout main
git merge feature/threat-analysis

# Delete branch after merge
git branch -d feature/threat-analysis
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Useful Git Commands

```bash
# View commit history
git log --oneline --graph

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# View diff of changes
git diff

# Stash changes temporarily
git stash
git stash pop
```

---

## 📂 Project Structure

```
CVE_Explorer_2025/
├── src/
│   ├── Application/              # Business Logic Layer
│   │   ├── constants/           # Constants and messages
│   │   ├── Normalizers/         # Data transformation
│   │   ├── Services/            # Business services
│   │   └── UseCases/            # Application orchestration
│   │
│   ├── Infrastructure/          # External Integrations
│   │   ├── Gateways/           # API clients (NVD, EPSS, KEV)
│   │   └── Utils/              # Retry logic, helpers
│   │
│   ├── UserInterface/           # Presentation Layer
│   │   ├── Components/         # React components
│   │   │   ├── Alerts/        # Alert components
│   │   │   ├── Cards/         # Card components
│   │   │   ├── Charts/        # Visualization components
│   │   │   ├── Display/       # CVE display components
│   │   │   ├── Input/         # Input components
│   │   │   └── Upload/        # File upload components
│   │   ├── Screens/           # Page-level components
│   │   └── Services/          # UI services (cache, validation)
│   │
│   ├── App.jsx                 # Root component
│   ├── main.jsx               # Entry point
│   └── App.css                # Global styles
│
├── public/                     # Static assets
├── dist/                       # Production build (generated)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

### Architecture Principles

**Clean Architecture** - Separation of concerns:
1. **Infrastructure** → External dependencies (APIs, storage)
2. **Application** → Business logic and use cases
3. **UserInterface** → React components and screens

**Benefits:**
- ✅ Testable code
- ✅ Independent layers
- ✅ Easy to maintain and extend

---

## 🔌 API Configuration

### NVD API (National Vulnerability Database)

**Base URL:** `https://services.nvd.nist.gov/rest/json/cves/2.0`

**Rate Limits:**
- Without API key: ~6 requests/second
- With API key: ~50 requests/second

**Features:**
- CVE details and descriptions
- CVSS scores (v2, v3.0, v3.1)
- CWE classifications
- Affected products

### EPSS API (Exploit Prediction Scoring System)

**Base URL:** `https://api.first.org/data/v1/epss`

**Features:**
- Exploitation probability (0-1)
- Percentile ranking
- Daily updates

### CISA KEV (Known Exploited Vulnerabilities)

**URL:** `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`

**Features:**
- Actively exploited CVEs
- Due dates for remediation
- Vendor and product info

---

## 🎨 Key Features Explained

### Single CVE Analysis

Enter a CVE ID (e.g., `CVE-2024-1234`) to get:
- **CVSS Score** - Severity rating with visual indicator
- **EPSS Score** - Exploitation probability
- **KEV Status** - Active exploitation alerts
- **CWE Classification** - Weakness types with MITRE links
- **Affected Products** - Vulnerable software versions
- **References** - External resources and advisories

### Bulk Analysis

Upload CSV/TXT files containing multiple CVE IDs:
- **Parallel Processing** - Analyzes 5 CVEs concurrently
- **Grid View** - Compact card layout for results
- **Color Coding** - Severity-based visual indicators
- **Export Ready** - Results cached for analysis

### Threat Intelligence

Search by keyword (e.g., "Apache", "Oracle"):
- **Temporal Analysis** - Filter by 1M, 3M, 6M, 1Y
- **Top CVEs** - Ranked by CVSS and EPSS
- **CWE Trends** - Most common weaknesses
- **Visualizations** - Timeline, distribution, risk charts
- **Session Cache** - 10-minute TTL to avoid re-fetching

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork the Repository

Click the **Fork** button on GitHub.

### 2. Create a Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes

- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 4. Commit Changes

```bash
git commit -m "feat: add amazing feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/amazing-feature
```

### 6. Open a Pull Request

Go to the original repository and click **New Pull Request**.

### Code Style Guidelines

- **ESLint:** Run `npm run lint` before committing
- **Comments:** Use concise, natural English
- **Naming:** Use descriptive variable and function names
- **Components:** One component per file
- **Imports:** Group by external → internal → relative

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Nuit de l'Info 2025** - CVE Explorer Team

---

## 🙏 Acknowledgments

- **NVD (NIST)** - CVE data and CVSS scores
- **FIRST** - EPSS exploitation predictions
- **CISA** - Known Exploited Vulnerabilities catalog
- **MITRE** - CWE weakness enumeration
- **React Team** - Amazing framework
- **Vite Team** - Lightning-fast build tool

---

## 📞 Support

Having issues? Here's how to get help:

1. **Check Documentation:** Read this README thoroughly
2. **Search Issues:** Look for existing [GitHub Issues](https://github.com/AlexisSaysana/CVE_Explorer_2025/issues)
3. **Open an Issue:** Create a new issue with details
4. **Browser Console:** Check for errors with `F12`

---

## 🚨 Troubleshooting

### Common Issues

**Problem:** Page is blank after `npm run dev`
```bash
# Solution: Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

**Problem:** Build fails
```bash
# Solution: Clean install dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Problem:** API rate limit errors
```bash
# Solution: Add NVD API key to .env
echo "VITE_NVD_API_KEY=your_key_here" > .env
```

**Problem:** Git push fails
```bash
# Solution: Pull latest changes first
git pull --rebase origin main
git push origin main
```

---

<div align="center">

**Made with ❤️ for Nuit de l'Info 2025**

⭐ Star this repo if you find it useful!

</div>
