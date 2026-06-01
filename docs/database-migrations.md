# Database Migrations Guide

This guide explains how database schema modifications are tracked, tested, and executed in Eventra.

## Workflow
1. Schema migrations are declared using XML/SQL changelog files.
2. Do NOT modify previously executed migration steps; always declare a new schema file for revisions.
3. Run validation scripts locally to ensure no lockouts occur during production deployment.