# Project Architecture

## High-Level Overview
```mermaid
graph TD
    Client[Client: React/Vite] --> Assets[Assets: public/]
    Client --> State[State: Context/Hooks]
    Client --> API[API: Serverless Helpers]
    API --> Backend[Backend: Spring Boot API]
