## 📋 README.md Addition Snippet

**Location:** Insert after the existing "Environment Variables" section or after "Getting Started"

---

```markdown
## 🔧 Environment Setup & Configuration

Setting up your local development environment is crucial for contributing to Eventra. Our comprehensive environment setup guide covers everything from basic configuration to advanced debugging.

### Quick Start

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env

# Start development
npm start
```

### Complete Setup Guide

For **detailed configuration instructions**, **troubleshooting help**, and **deployment guidelines**, refer to:

📖 **[⚙️ Eventra Environment Setup Guide](docs/ENV_SETUP_GUIDE.md)**

This guide includes:
- ✅ Local development architecture (React + Spring Boot)
- ✅ Complete environment variables reference
- ✅ Required vs optional integrations
- ✅ Real API vs Mock API mode
- ✅ Step-by-step setup instructions
- ✅ Common issues and solutions
- ✅ Security best practices
- ✅ Deployment configuration

### Key Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:8080/api` |
| `REACT_APP_USE_REAL_API` | Toggle real/mock API | `true` or `false` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth (optional) | `123456789.apps.googleusercontent.com` |
| `REACT_APP_EMAILJS_*` | Email service (optional) | See ENV setup guide |

**For complete documentation on all 8+ environment variables, security guidelines, and troubleshooting, see [Environment Setup Guide](docs/ENV_SETUP_GUIDE.md).**
```

---

## 📝 How to Add This to README.md

**Option 1: Add after current "Environment Variables" section**

Find the section in README.md that mentions `.env` and insert the snippet there.

**Option 2: Add in Table of Contents**

Add this line to the Table of Contents:
```markdown
- [Environment Setup & Configuration](#-environment-setup--configuration)
```

**Option 3: Alternative Compact Version**

If you prefer a more concise version:

```markdown
## ⚙️ Quick Setup Guide

👉 **[See Complete Environment Setup Guide →](docs/ENV_SETUP_GUIDE.md)** for detailed configuration, troubleshooting, and deployment steps.

```bash
cp .env.example .env
# Edit .env with your local values
npm start  # Development server on http://localhost:3000
```
```

---

## 📊 Recommended Placement in README

Based on typical README structure, insert after:

```markdown
### Installation & Setup
1. Clone the Repository
2. Install Dependencies  
3. Configure Environment Variables  ← INSERT SNIPPET HERE
4. Run the Development Server
```

Or as a standalone section before "Project Structure".

---

## ✅ Verification Checklist

After adding the snippet to README.md:

- [ ] Link works correctly: `[Text](docs/ENV_SETUP_GUIDE.md)`
- [ ] Table of Contents updated (if applicable)
- [ ] Snippet formatting matches existing README style
- [ ] Preview on GitHub to ensure markdown renders correctly
- [ ] All links are relative paths (not absolute URLs)

---

**Done!** Your documentation is now complete and ready for contributors. 🎉
