# Eventra 🎉

**A Modern Event Management Platform for Builders and Communities**

Eventra is a comprehensive, open-source platform designed to empower organizers to create, manage, and track events seamlessly. Built with a modern tech stack featuring a React frontend and Spring Boot backend, Eventra provides a full suite of tools for running successful events, from initial creation to post-event analytics.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.1-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)

---

## Table of Contents

- [Live Demo](#-live-demo)
- [Project Insights](#-project-insights)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contributors](#-contributors)

## Live Demo

## 🌐 Live Demo

- **Frontend**: [https://eventra-psi.vercel.app/](https://eventra-psi.vercel.app/)
- **Backend Repo**: https://github.com/SandeepVashishtha/Eventra-Backend
- **Backend API**: [https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net](https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net)
- **API Documentation**: [Backend Swagger UI](https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net/swagger-ui.html)


## Project Insights

<table align="center">
  <thead align="center">
    <tr>
      <td><b>🌟 Stars</b></td>
      <td><b>🍴 Forks</b></td>
      <td><b>🐛 Issues</b></td>
      <td><b>🔔 Open PRs</b></td>
      <td><b>🔕 Closed PRs</b></td>
      <td><b>🛠️ Languages</b></td>
      <td><b>👥 Contributors</b></td>
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

| Frontend | Backend | DevOps & Infrastructure |
| :--- | :--- | :--- |
| **React 18.2** | **Spring Boot 3.3.1** | **Git & GitHub** for Version Control |
| **React Router** for Routing | **Java 17** | **Vercel** for Frontend Hosting |
| **Framer Motion** for Animations | **Spring Security & JWT** | **Maven** for Build Automation |
| **Tailwind CSS** (or CSS) for Styling | **MySQL & H2** Databases | **OpenAPI 3.0** for API Docs |
| **Create React App** | **Spring Data JPA** | |

## Getting Started

Follow these steps to set up and run the frontend application on your local machine.

### Prerequisites
- **Node.js**: Version 16.x or higher
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
    Create a `.env` file in the root of the project and add the backend API URL. The backend server runs on port `8080` by default.

    ```bash
    # .env
    REACT_APP_API_URL=http://localhost:8080/api
    ```
    > **Note:** For the backend setup instructions, please refer to the [backend repository's README](https://github.com/SandeepVashishtha/Eventra-Backend).

4.  **Run the Development Server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## Google OAuth Setup

Follow these steps to enable Google Sign-In for the project:

1. **Create Google Client ID**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (or use existing one).
   - Navigate to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth 2.0 Client IDs**.
   - Select **Web application**.
   - Add your frontend URL in **Authorized JavaScript origins** (e.g., http://localhost:3000).
   - Add redirect URI if using redirect flow (optional).
   - Copy the **Client ID**.

2. **Add Client ID to Environment**
   - Open `.env` or create `.env` in the root of the project.
   - Add the following line:
     ```env
     REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
     ```

3. **Run the App**
   - Install dependencies: `npm install`  
   - Start frontend: `npm start`
   - Go to Signup/Login page and you should see **Sign in with Google** button.
   - Test signing in with your Google account.

4. **Notes**
   - Ensure your Google account allows OAuth for the given project.
   - For production, add your deployed domain in **Authorized JavaScript origins**.


## 🏗️ Project Structure
```
The frontend codebase is organized to be scalable and maintainable.

Eventra/
├── public/                  # Static assets and index.html
└── src/
├── assets/              # Images, fonts, etc.
├── components/          # Reusable UI components (common, layout, etc.)
│   ├── auth/            # Login, Signup, ProtectedRoute
│   ├── common/          # Buttons, Modals, Loading spinners
│   └── layout/          # Navbar, Footer
├── context/             # React Context providers (AuthContext, ThemeContext)
├── hooks/               # Custom React hooks
├── pages/               # Top-level page components (HomePage, EventsPage, etc.)
├── services/            # API calls and external service integrations
├── styles/              # Global CSS files
├── utils/               # Utility functions
├── App.js               # Main application component with routing
└── index.js             # Entry point of the React application
```

## ☁️ Deployment

This project is configured for easy deployment on **Vercel**.

1.  **Fork the repository** and connect it to your Vercel account.
2.  **Configure the build settings**:
    - **Build Command**: `npm run build`
    - **Output Directory**: `build`
3.  **Add Environment Variables** in the Vercel project settings:
    - `REACT_APP_API_URL`: The URL of your deployed backend API.
4.  Click **Deploy**. That's it!

## 🤝 Contributing

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
5.  **Open a Pull Request** to the `main` branch of the original repository.

### Issue Assignment Policy
- To ensure active development, issues are **automatically unassigned after 7 days** of inactivity.
- To keep your assignment, please **open a draft Pull Request** within the 7-day period to show progress.
- For more details, see our [Auto-unassign Documentation](.github/AUTO_UNASSIGN.md).

## 📄 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

## 👥 Contributors

A huge thank you to everyone who has contributed to Eventra! Your efforts make this project possible.

<p align="left">
  <a href="https://github.com/SandeepVashishtha/Eventra/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=SandeepVashishtha/Eventra" alt="Contributors" />
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
**Built with ❤️ by the Eventra Team**
