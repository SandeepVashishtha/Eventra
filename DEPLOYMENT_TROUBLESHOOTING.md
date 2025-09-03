# Deployment Troubleshooting Guide

## The "Network Error" Issue

The "Network error. Please check your connection and try again." message typically occurs when:

1. **Frontend can't reach the backend API**
2. **CORS configuration mismatch**
3. **Wrong API URL configuration**

## Quick Fix Steps

### 1. Update Your Environment Variables

**For Vercel Deployment:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/Update:
   ```
   REACT_APP_API_URL = https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net/api
   ```

**For Backend (Azure App Service):**
Make sure these environment variables are set:
```
CORS_ALLOWED_ORIGINS = https://eventra-psi.vercel.app
```

### 2. Replace Placeholder URLs

In these files, replace:
- `https://your-backend-app.azurewebsites.net/api` with your actual Azure backend URL
- `https://eventra-psi.vercel.app` with your actual Vercel frontend URL

Files to update:
- `.env.production`
- `vercel.json`
- `frontend/src/config/api.js`
- `backend/src/main/resources/application-azure.properties`

### 3. Test the Connection

1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to login
4. Check for the actual error messages and API call URLs

### 4. Verify Backend is Running

Visit your backend health endpoint:
```
https://eventra-backend-dgcae3etebbag8ft.centralindia-01.azurewebsites.net/api/health
```

### 5. Common Issues and Solutions

**Issue**: CORS error in browser console
**Solution**: Update CORS_ALLOWED_ORIGINS in Azure App Service

**Issue**: 404 error on API calls
**Solution**: Check if backend is deployed and API endpoints are correct

**Issue**: API calls to localhost
**Solution**: Verify REACT_APP_API_URL environment variable is set correctly

## Environment Variables Checklist

### Frontend (Vercel)
- [ ] `REACT_APP_API_URL` points to your Azure backend
- [ ] Environment variable is in Production scope

### Backend (Azure)
- [ ] `CORS_ALLOWED_ORIGINS` includes your Vercel frontend URL
- [ ] Database connection variables are set
- [ ] JWT_SECRET is configured

## Deployment Commands

### Frontend (Vercel)
```bash
# Deploy manually
vercel --prod

# Set environment variable
vercel env add REACT_APP_API_URL
```

### Backend (Azure)
```bash
# Deploy using Azure CLI
az webapp deployment source config-zip --resource-group <rg-name> --name <app-name> --src target/<app-name>.jar
```

## Need Help?

1. Check the browser console for specific error messages
2. Verify both frontend and backend URLs are accessible
3. Test API endpoints directly using Postman or curl
4. Check Azure App Service logs for backend errors
