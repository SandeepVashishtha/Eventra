# Google Sheets Export Integration Guide

## Overview

This document describes the Google Sheets export functionality implemented in Eventra, which allows organizers to directly export attendee and event data to Google Sheets with a single click.

## Feature Summary

The Google Sheets export feature provides:

- **One-click export**: Direct export of attendee/event data to a new Google Spreadsheet
- **OAuth 2.0 authentication**: Secure authentication using Google's OAuth 2.0 with PKCE flow
- **Automatic sharing**: Generated spreadsheets are automatically made world-readable for easy sharing with external vendors (caterers, etc.)
- **Real-time sync**: Live headcounts visible to external parties without requiring Eventra accounts

## Architecture

### Components

1. **`src/utils/exportGoogleSheets.js`** - Core utility module
   - OAuth 2.0 authentication with PKCE
   - Google Sheets API client
   - Data sanitization and conversion
   - Export functions for attendees and events

2. **`src/components/auth/GoogleSheetsCallback.jsx`** - OAuth callback handler
   - Processes Google's OAuth 2.0 callback
   - Exchanges authorization code for access tokens
   - Handles errors and redirects users

3. **`src/components/AppRoutes.js`** - Routing configuration
   - Added route for `/google-sheets-callback`

4. **`src/components/common/EventCreation/EventCreation.jsx`** - UI Integration
   - Added "Export to Sheets" button next to CSV download

### OAuth Flow

```
1. User clicks "Export to Sheets" button
2. System checks for existing valid tokens
3. If no tokens, initiates OAuth 2.0 flow:
   - Generates PKCE code verifier and challenge
   - Opens popup to Google's authorization endpoint
   - Stores state and PKCE verifier in sessionStorage
4. User authenticates and grants permissions
5. Google redirects to `/google-sheets-callback?code=...&state=...`
6. Callback page exchanges code for tokens
7. Tokens stored in sessionStorage
8. User redirected back to original page
9. Export proceeds with valid tokens
```

### Security Features

- **PKCE (Proof Key for Code Exchange)**: Prevents authorization code interception attacks
- **State parameter validation**: Prevents CSRF attacks
- **SessionStorage**: Tokens stored in sessionStorage (cleared when browser closes)
- **Formula injection prevention**: Sanitizes data to prevent CSV/formula injection in Sheets
- **Minimal scopes**: Requests only necessary permissions (`spreadsheets` and `drive.file`)

## Setup Instructions

### Prerequisites

1. **Google Cloud Project**: Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Enable both Google Sheets API and Google Drive API
3. **Configure OAuth Consent Screen**: Set up the OAuth consent screen with required scopes

### Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Google Sheets API Client ID
VITE_GOOGLE_SHEETS_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_SHEETS_CLIENT_ID=your_client_id_here
```

### Creating OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. Select "Web application" as the application type
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (e.g., `https://eventra.example.com`)
6. Add authorized redirect URIs:
   - `http://localhost:5173/google-sheets-callback` (for development)
   - `https://eventra.example.com/google-sheets-callback` (for production)
7. Copy the Client ID and add to your environment variables

### Required Scopes

The application requests the following OAuth scopes:

- `https://www.googleapis.com/auth/spreadsheets` - Read/write access to Google Sheets
- `https://www.googleapis.com/auth/drive.file` - Create files in Google Drive

## Usage Examples

### Exporting Attendees

```javascript
import { exportAttendeesToGoogleSheets } from "utils/exportGoogleSheets";

// Basic usage
const result = await exportAttendeesToGoogleSheets(attendees, "My Event Attendees");

if (result.success) {
  console.log("Spreadsheet created:", result.spreadsheetUrl);
  // Share URL with caterers or other external vendors
} else {
  console.error("Export failed:", result.error);
}
```

### Exporting Events

```javascript
import { exportEventsToGoogleSheets } from "utils/exportGoogleSheets";

const result = await exportEventsToGoogleSheets(events, "My Events");

if (result.success) {
  console.log("Events exported:", result.spreadsheetUrl);
}
```

### Checking Authentication Status

```javascript
import { isGoogleSheetsExportAvailable } from "utils/exportGoogleSheets";

const isAvailable = await isGoogleSheetsExportAvailable();
console.log("Google Sheets export available:", isAvailable);
```

### Manual Token Management

```javascript
import {
  getAccessToken,
  revokeGoogleSheetsAccess,
  initiateGoogleOAuthFlow
} from "utils/exportGoogleSheets";

// Get current access token
const accessToken = await getAccessToken();

// Initiate OAuth flow manually
const newAccessToken = await initiateGoogleOAuthFlow();

// Revoke access
await revokeGoogleSheetsAccess();
```

## API Functions

### `exportAttendeesToGoogleSheets(attendees, sheetName?)`

Exports an array of attendee objects to a new Google Spreadsheet.

**Parameters:**
- `attendees`: Array of attendee objects with `name`, `email`, `registrationDate`, `ticketType`
- `sheetName`: Optional name for the spreadsheet (default: "Eventra Attendees")

**Returns:**
```javascript
{
  success: boolean,
  spreadsheetId: string,    // Google Sheets spreadsheet ID
  spreadsheetUrl: string,  // Full URL to the spreadsheet
  error?: string           // Error message if failed
}
```

### `exportEventsToGoogleSheets(events, sheetName?)`

Exports an array of event objects to a new Google Spreadsheet.

**Parameters:**
- `events`: Array of event objects with various properties
- `sheetName`: Optional name for the spreadsheet (default: "Eventra Events")

**Returns:** Same structure as `exportAttendeesToGoogleSheets`

### `initiateGoogleOAuthFlow()`

Initiates the OAuth 2.0 authentication flow. Opens a popup window for user authentication.

**Returns:** Promise that resolves with the access token

### `exchangeCodeForToken(code)`

Exchanges an authorization code for access tokens. Used internally by the callback handler.

**Parameters:**
- `code`: Authorization code from Google's OAuth 2.0 callback

**Returns:** Promise that resolves with token data

### `getAccessToken()`

Gets a valid access token, automatically refreshing if expired.

**Returns:** Promise that resolves with the access token

### `isGoogleSheetsExportAvailable()`

Checks if Google Sheets export is available (configured and authenticated).

**Returns:** Promise that resolves with boolean

### `revokeGoogleSheetsAccess()`

Revokes the current access token and clears all stored tokens.

## Data Sanitization

The export functions automatically sanitize all data to prevent:

1. **Formula injection**: Values starting with `=`, `+`, `-`, `@`, tab, or carriage return are prefixed with a single quote
2. **CSV injection**: Same protection as formula injection
3. **Type safety**: All values are converted to strings

## Error Handling

All functions return structured error information:

```javascript
{
  success: false,
  error: "Error message here",
  reason?: "empty" | "authentication_failed" | "api_error"
}
```

Common error scenarios:

- **Empty data**: Returns `{ success: false, reason: "empty" }`
- **No client ID configured**: Returns error about missing configuration
- **Authentication failed**: Returns error with details from OAuth flow
- **API errors**: Returns error messages from Google APIs

## Troubleshooting

### Common Issues

1. **Popup blocked**: Ensure popups are allowed for the site
2. **Redirect URI mismatch**: Verify the callback URL matches exactly what's configured in Google Cloud Console
3. **Missing scopes**: Ensure both Sheets and Drive APIs are enabled
4. **Token expiration**: Tokens are valid for 1 hour; refresh tokens are used automatically

### Debugging

Enable debug logging by checking the browser's console for:

- OAuth flow progress
- API request/response details
- Error stack traces

## Testing

Run the test suite:

```bash
npm test -- tests/exportGoogleSheets.test.mjs
```

The test suite covers:

- Empty data handling
- Token exchange
- Access token retrieval
- Availability checking
- Sanitization
- Utility functions

## Performance Considerations

- **Token caching**: Tokens are cached in sessionStorage and reused for 1 hour
- **Automatic refresh**: Access tokens are automatically refreshed when expired
- **Minimal API calls**: Only necessary API calls are made
- **Efficient data transfer**: Data is converted to 2D arrays for optimal Sheets API performance

## Browser Compatibility

The implementation uses modern web APIs:

- `fetch()` for HTTP requests
- `crypto.getRandomValues()` for secure random number generation
- `crypto.subtle.digest()` for PKCE code challenge generation
- `sessionStorage` for token persistence

Fallbacks are provided for environments without full crypto support, though with reduced security for the PKCE flow.

## Security Best Practices

1. **Keep client ID secret**: Never commit the client ID to version control (it's in `.gitignore`)
2. **Use separate credentials**: Use different OAuth client IDs for development and production
3. **Monitor API usage**: Set up alerts in Google Cloud Console for unusual activity
4. **Review permissions**: Regularly review the OAuth consent screen configuration
5. **Rotate credentials**: Rotate client IDs periodically as part of security maintenance

## Future Enhancements

Potential improvements for future versions:

- **Sheet updating**: Allow updating existing spreadsheets instead of always creating new ones
- **Template support**: Use predefined spreadsheet templates with formatting
- **Batch export**: Export multiple events/attendee lists in a single operation
- **Custom columns**: Allow users to select which columns to export
- **Real-time sync**: Periodically sync data to keep spreadsheets up-to-date
- **Collaboration features**: Allow multiple users to collaborate on the same sheet

## References

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [PKCE for OAuth](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce)
- [Google API Client Libraries](https://github.com/googleapis/google-api-javascript-client)

---

**Last Updated**: 2026-08-13
**Feature Request**: #12133
**Implementation Status**: ✅ Complete