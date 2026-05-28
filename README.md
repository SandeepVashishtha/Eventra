# Eventra

**A Modern Event Management Platform for Builders and Communities**

Eventra is a comprehensive, open-source platform designed to empower organizers to create, manage, and track events seamlessly. Built with a modern tech stack featuring a React frontend and Spring Boot backend, Eventra provides a full suite of tools for running successful events, from initial creation to post-event analytics.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [API Reference](#api-reference)
- [Architecture & Roles](#-architecture--roles)
- [Project Insights](#project-insights)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [🔧 Environment Setup](#-environment-setup--configuration)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contributors](#contributors)

## Overview

Eventra helps communities and organizers run events end-to-end, including registrations, dashboards, hackathon workflows, and feedback collection.

This repository contains the React frontend application for Eventra. The backend services are maintained separately in the Eventra-Backend repository using Spring Boot and Java.

## Live Demo

- **Website**: [https://eventra.sandeepvashishtha.in/](https://eventra.sandeepvashishtha.in/)
- **Backend Repo**: [https://github.com/SandeepVashishtha/Eventra-Backend](https://github.com/SandeepVashishtha/Eventra-Backend)
- **Backend API**: [https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net](https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net)
- **API Documentation**: [Swagger UI](https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html)

## API Reference

- **Base URL**: [https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net](https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net)
- **Swagger**: [https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html](https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html)
- Capacity and registration availability endpoints are documented in Swagger UI.

### Backend API Setup Note

The frontend communicates with the Spring Boot backend through `/api` routes. For local full-stack testing, run the backend service separately and configure the frontend API URL accordingly.

Backend repository: https://github.com/SandeepVashishtha/Eventra-Backend

## 🏗️ Architecture & Roles

**New to Eventra?** Understand the complete system architecture, user roles, event lifecycle, and how everything works together:

📖 **[Architecture & Roles Guide](docs/ARCHITECTURE_AND_ROLES.md)** – Comprehensive guide covering:
- 👥 Role-Based Access Control (RBAC) with 5 roles
- 🎟️ Event lifecycle stages and state transitions
- 🏆 Hackathon workflow integration
- 🔐 Authentication & route protection
- 💬 Permission scopes and access control
- 🌐 Real-time & offline features
- 🧠 Contributor code map and implementation guide

Perfect for new contributors and maintainers onboarding! 🚀

## Project Insights

<table align="center">
  <thead align="center">
    <tr>
      <td><b>Stars</b></td>
      <td><b>Forks</b></td>
      <td><b>Issues</b></td>
      <td><b>Open PRs</b></td>
      <td><b>Closed PRs</b></td>
      <td><b>Languages</b></td>
      <td><b>Contributors</b></td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img alt="Stars" src="https://img.shields.io/github/stars/SandeepVashishtha/Eventra?style=flat&logo=github"/></td>
      <td><img alt="Forks" src="https://img.shields.io/github/forks/SandeepVashishtha/Eventra?style=flat&logo=github"/></td>
      <td><img alt="Issues" src="https://img.shields.io/github/issues/SandeepVashishtha/Eventra?style=flat&logo=github"/></td>
      <td><img alt="Open PRs" src="https://img.shields.io/github/issues-pr/SandeepVashishtha/Eventra?style=flat&logo=github"/></td>
      <td><img alt="Closed PRs" src="https://img.shields.io/github/issues-pr-closed/SandeepVashishtha/Eventra?style=flat&color=critical&logo=github"/></td>
      <td><img alt="Languages Count" src="https://img.shields.io/github/languages/count/SandeepVashishtha/Eventra?style=flat&color=green&logo=github"></td>
      <td><img alt="Contributors Count" src="https://img.shields.io/github/contributors/SandeepVashishtha/Eventra?style=flat&color=blue&logo=github"/></td>
    </tr>
  </tbody>
</table>

## Features

### Core Functionality

- **Event Creation & Management**: Easily create and customize events with rich details.
- **User Authentication**: Secure JWT-based authentication with role-based access control.
- **Admin & User Dashboards**: Personalized dashboards for seamless management and tracking.
- **Real-time Analytics**: Track event performance and attendee engagement.

### Platform Features

- **Hackathon Hub**: Specialized features for managing hackathons.
- **Project Gallery**: Showcase community projects and foster collaboration.
- **Community Leaderboards**: Gamify participation and recognize top contributors.
- **Feedback System**: Collect valuable post-event feedback through surveys.
- **Responsive Design**: A mobile-first interface for a great experience on any device.

## Tech Stack

| Frontend                         | DevOps & Infrastructure              |
| :------------------------------- | :----------------------------------- |
| **React 19.2**                   | **Git & GitHub** for Version Control |
| **React Router** for Routing     | **Vercel** for Frontend Hosting      |
| **Framer Motion** for Animations | **npm** for Package Management       |
| **Tailwind CSS** for Styling     |                                      |
| **Create React App**             |                                      |

> **Note:** This repository strictly contains the frontend React application. The backend APIs, databases (MySQL/H2), and Java/Spring Boot services are maintained separately in the [Eventra-Backend](https://github.com/SandeepVashishtha/Eventra-Backend) repository.

## Getting Started

Follow these steps to set up and run the frontend application on your local machine.

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: (usually comes with Node.js)
- **Git**

### Installation & Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/SandeepVashishtha/Eventra.git
    cd Eventra
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    See the [Environment Setup & Configuration](#-environment-setup--configuration) section below.

> **Note:** For the backend setup instructions, please refer to the [backend repository's README](https://github.com/SandeepVashishtha/Eventra-Backend).

4.  **Run the Development Server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## 🔧 Environment Setup & Configuration

### Quick Start

```bash
cp .env.example .env
# Edit .env with your local values
npm start
```

### Complete Setup Guide

For **comprehensive configuration instructions**, **troubleshooting**, **optional integrations**, and **deployment guidelines**, refer to:

📖 **[⚙️ Eventra Environment Setup Guide](docs/ENV_SETUP_GUIDE.md)**

This professional guide covers:
- ✅ Local development architecture (React + Spring Boot)
- ✅ Complete environment variables reference table (8+ variables)
- ✅ Required vs optional integrations (Google OAuth, EmailJS, SSE)
- ✅ Real API vs Mock API development workflows
- ✅ Step-by-step frontend & backend setup
- ✅ 8+ detailed troubleshooting scenarios with solutions
- ✅ Security best practices & deployment configuration
- ✅ Developer workflow recommendations

### Key Environment Variables

| Variable | Purpose | Required | Example |
|----------|---------|----------|----------|
| `REACT_APP_API_URL` | Backend API endpoint | ✅ Yes | `http://localhost:8080/api` |
| `REACT_APP_USE_REAL_API` | Toggle real/mock API | ❌ Optional | `true` or `false` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth (optional) | ❌ Optional | `123456789.apps.googleusercontent.com` |
| `REACT_APP_EMAILJS_*` | Email service (optional) | ❌ Optional | See ENV guide for details |

⚠️ **Security Reminder:** Variables prefixed with `REACT_APP_` are exposed in the frontend bundle. Never commit `.env` to Git (it's gitignored). See [Deployment & Security](docs/ENV_SETUP_GUIDE.md#-deployment--security-guidelines) in the environment guide for more details.

## Project Structure

The repository is organized into modular frontend components, contexts, configuration files, and utility helpers.

```text
Eventra/
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- common/
|   |   |-- Layout/
|   |   |-- routes/
|   |   |-- styles/
|   |   `-- user/
|   |-- config/
|   |-- jhalak/
|   |   |-- FluidCursor.js   # Fluid cursor animation effect (navbar)
|   |   `-- RespawningText.js # Animated respawning/typewriter text effect
|   |-- context/
|   |-- Pages/
|   |-- utils/
|   |-- App.js
|   |-- App.css
|   |-- index.js
|   `-- index.css
|-- tests/
|-- .env.example
|-- package.json
|-- tailwind.config.js
`-- README.md
```

## Deployment

This project is configured for easy deployment on **Vercel**.

1.  **Fork the repository** and connect it to your Vercel account.
2.  **Configure the build settings**:
    - **Build Command**: `npm run build`
    - **Output Directory**: `build`
3.  **Add Environment Variables** in the Vercel project settings:
    - `REACT_APP_API_URL`: The URL of your deployed backend API.
4.  Click **Deploy**. That's it!

## Contributing

We welcome contributions from the community! To get started, please follow these guidelines.

### Development Workflow

1.  **Fork** the repository.
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-amazing-feature
    ```
3.  **Make your changes** and commit them with a meaningful message:
    ```bash
    git commit -m "feat: Add amazing new feature"
    ```
4.  **Push** your changes to your forked repository:
    ```bash
    git push origin feature/your-amazing-feature
    ```
5.  **Open a Pull Request** to the `master` branch of the original repository.

### Issue Assignment Policy

- To ensure active development, issues are **automatically unassigned after 7 days** of inactivity.
- To keep your assignment, please **open a draft Pull Request** within the 7-day period to show progress.
- For more details, see our [Auto-unassign Documentation](.github/AUTO_UNASSIGN.md).

### Automatic PR Labels

This repository uses GitHub Actions with `actions/labeler`
to automatically apply labels to pull requests based on changed files.

Examples:
- `docs/**` → `type:docs`
- `tests/**` → `type:testing`
- `.github/**` → `type:devops`
- `src/**` → `type:refactor`
- `public/**` → `type:design`

The workflow runs automatically whenever a pull request is opened,
updated, or reopened.

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

## Star History

<a href="https://www.star-history.com/?repos=sandeepvashishtha%2Feventra&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&legend=top-left" />
 </picture>
</a>

## Contributors

A huge thank you to everyone who has contributed to Eventra! Your efforts make this project possible.

<p align="left">
  <a href="https://github.com/SandeepVashishtha/Eventra/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=SandeepVashishtha/Eventra&max=1000" alt="Contributors" />
  </a>
</p>

### Maintainers

<table>
<tr>
<td align="center">
<a href="https://github.com/sandeepvashishtha">
  <img src="https://avatars.githubusercontent.com/u/64915843?v=4" height="140px" width="140px" alt="Sandeep">
</a><br>
<sub><b>Sandeep Vashishtha</b><br>
<a href="https://www.linkedin.com/in/sandeepvashishtha/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" width="20" height="20" alt="LinkedIn"/>
</a>
</sub>
</td>
<td align="center">
<a href="https://github.com/RhythmPahwa14">
  <img src="https://avatars.githubusercontent.com/u/170720661?v=4" height="140px" width="140px" alt="Rhythm">
</a><br>
<sub><b>Rhythm</b><br>
<a href="https://www.linkedin.com/in/rhythmpahwa14/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" width="20" height="20" alt="LinkedIn"/>
</a>
</sub>
</td>
</tr>
</table>

---

## Environment Variables Setup

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Then replace the placeholder values with your own local configuration.

Example:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_USE_REAL_API=false
GITHUB_TOKEN=your_github_token
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id_here
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
DAYS_THRESHOLD=30
```

### Required Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Yes | Application environment |
| `REACT_APP_API_URL` | Yes | Backend API base URL |
| `REACT_APP_USE_REAL_API` | No | Enables real API calls in selected development flows |
| `DAYS_THRESHOLD` | No | Threshold days configuration used by date-based features |
| `GITHUB_TOKEN` | No | GitHub API token for higher rate limits on contributor and repository stats (configured in Vercel environment variables, not exposed to the client) |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | No | EmailJS public key for event registration emails |
| `REACT_APP_EMAILJS_SERVICE_ID` | No | EmailJS service ID for event registration emails |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | No | EmailJS template ID for event registration emails |
| `REACT_APP_FACEBOOK_APP_ID` | No | Facebook authentication/share dialog app ID |
| `REACT_APP_GOOGLE_CLIENT_ID` | No | Google authentication client ID |

The `.env.example` file contains all required environment variable names needed to run the project locally.

---

## SSE Mock Server (Development Only)

For testing real-time leaderboard rank updates and analytics stream features in development, a local mock Server-Sent Events (SSE) server is provided.

### 1. Start the SSE Server
Run the following command to start the mock server:
```bash
node sse-mock-server.js
```

### 2. Configure Environment Variables (Optional)
The SSE mock server reads configuration from the environment:
- `SSE_MOCK_PORT` (or `PORT`): The port the server listens on (default: `4001`).
- `ALLOWED_ORIGIN`: Allowed CORS request origin (default: `http://localhost:3000`).
- `SSE_DEBUG`: Set to `true` to print real-time logging for connections and events (default: `false` to reduce console noise).

Example with custom settings:
```bash
# Windows PowerShell
$env:SSE_MOCK_PORT="4005"; $env:ALLOWED_ORIGIN="http://localhost:3000"; $env:SSE_DEBUG="true"; node sse-mock-server.js

# Linux/macOS
SSE_MOCK_PORT=4005 ALLOWED_ORIGIN=http://localhost:3000 SSE_DEBUG=true node sse-mock-server.js
```

### 3. Configure the React Application
Update `.env.local` to point to the mock server. You have two options:
- **Option A (Recommended)**: Set `REACT_APP_SSE_URL` to route only real-time connections to the mock server, keeping the rest of the application pointing to the real API:
  ```env
  REACT_APP_SSE_URL=http://localhost:4001
  ```
- **Option B (Not Recommended)**: Set the general `REACT_APP_API_URL` to point to the mock server port (this routes all endpoints through port 4001):
  ```env
  REACT_APP_API_URL=http://localhost:4001
  ```
  > [!WARNING]
  > **Side-effects of Option B:** Setting the general `REACT_APP_API_URL` to the mock server port will break standard REST API calls (like fetching events, logging in, etc.) because the mock server does not proxy these requests. Use Option A for standard local development to prevent breaking your local environment.


---

Built with care by the Eventra Team
