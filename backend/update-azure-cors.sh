# Azure CLI commands to update CORS environment variables
# Replace YOUR_RESOURCE_GROUP and YOUR_APP_NAME with your actual values

az webapp config appsettings set --resource-group YOUR_RESOURCE_GROUP --name eventra-backend-dgcae3etebbag8ft --settings CORS_ALLOWED_ORIGINS="*"

az webapp config appsettings set --resource-group YOUR_RESOURCE_GROUP --name eventra-backend-dgcae3etebbag8ft --settings CORS_ALLOWED_METHODS="GET,POST,PUT,DELETE,OPTIONS,PATCH"

az webapp config appsettings set --resource-group YOUR_RESOURCE_GROUP --name eventra-backend-dgcae3etebbag8ft --settings CORS_ALLOWED_HEADERS="*"

az webapp config appsettings set --resource-group YOUR_RESOURCE_GROUP --name eventra-backend-dgcae3etebbag8ft --settings CORS_ALLOW_CREDENTIALS="true"
