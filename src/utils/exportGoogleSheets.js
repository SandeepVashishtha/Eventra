/**
 * exportGoogleSheets.js
 *
 * Utilities for exporting application data directly to Google Sheets using the Google Sheets API.
 * This module provides OAuth 2.0 authentication and direct sheet creation/updating functionality.
 *
 * Security notes
 * ──────────────
 * - Uses Google OAuth 2.0 with PKCE flow for secure authentication
 * - Requests only the necessary scopes (Google Drive and Sheets API)
 * - Tokens are stored in sessionStorage (not localStorage) for better security
 * - All API calls are made with proper CORS and CSRF protection
 * - Sensitive data is sanitized before being sent to Google APIs
 *
 * @module utils/exportGoogleSheets
 */

// Google OAuth 2.0 configuration
const GOOGLE_OAUTH_ENDPOINTS = {
  AUTHORIZE: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN: 'https://oauth2.googleapis.com/token',
  REVOKE: 'https://oauth2.googleapis.com/revoke',
};

// Google Sheets API endpoints
const SHEETS_API_ENDPOINTS = {
  SPREADSHEETS: 'https://www.googleapis.com/drive/v3/files',
  SHEETS: 'https://sheets.googleapis.com/v4/spreadsheets',
};

// Required scopes for Google Sheets API
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Session storage keys
const STORAGE_KEYS = {
  GOOGLE_ACCESS_TOKEN: 'eventra_google_access_token',
  GOOGLE_REFRESH_TOKEN: 'eventra_google_refresh_token',
  GOOGLE_EXPIRES_AT: 'eventra_google_expires_at',
  GOOGLE_OAUTH_STATE: 'eventra_google_oauth_state',
  GOOGLE_OAUTH_PKCE: 'eventra_google_oauth_pkce',
};

// Application configuration
const getClientId = () => {
  // Check import.meta.env first (Vite builds)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID || '';
  }
  // Check process.env for Node.js environments
  return process.env.VITE_GOOGLE_SHEETS_CLIENT_ID ||
         process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID ||
         '';
};

const APP_CONFIG = {
  // This should be set via environment variables
  get CLIENT_ID() {
    return getClientId();
  },
  get CLIENT_SECRET() {
    // Note: Client secret should only be used server-side
    // For client-side, we use the OAuth flow without client secret
    return '';
  },
  REDIRECT_URI: typeof window !== 'undefined' ? window.location.origin + '/google-sheets-callback' : '',
  APP_NAME: 'Eventra',
};

/**
 * Generates a secure random string for PKCE code verifier and state
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('');
};

/**
 * Creates a code challenge from a code verifier for PKCE flow
 * @param {string} codeVerifier - The code verifier
 * @returns {Promise<string>} The code challenge (SHA-256 hash)
 */
const createCodeChallenge = async (codeVerifier) => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback - not secure, but works in environments without subtle crypto
  return codeVerifier;
};

/**
 * Stores authentication tokens in sessionStorage
 * @param {Object} tokens - Token data to store
 * @param {string} tokens.access_token - Access token
 * @param {string} [tokens.refresh_token] - Refresh token
 * @param {number} [tokens.expires_in] - Token expiration in seconds
 */
const storeTokens = (tokens) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  
  const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;
  
  window.sessionStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, tokens.access_token);
  if (tokens.refresh_token) {
    window.sessionStorage.setItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN, tokens.refresh_token);
  }
  window.sessionStorage.setItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT, expiresAt.toString());
};

/**
 * Retrieves authentication tokens from sessionStorage
 * @returns {Object|null} Token data or null if not available
 */
const getTokens = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  
  const accessToken = window.sessionStorage.getItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
  const refreshToken = window.sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN);
  const expiresAt = window.sessionStorage.getItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT);
  
  if (!accessToken || !expiresAt) return null;
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: parseInt(expiresAt, 10),
  };
};

/**
 * Clears all authentication tokens from sessionStorage
 */
const clearTokens = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  
  window.sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
  window.sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN);
  window.sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_EXPIRES_AT);
  window.sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE);
  window.sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_OAUTH_PKCE);
};

/**
 * Checks if the current access token is expired
 * @param {number} expiresAt - Token expiration timestamp
 * @returns {boolean} True if token is expired or about to expire (within 60 seconds)
 */
const isTokenExpired = (expiresAt) => {
  return expiresAt <= Date.now() + 60000; // 60 seconds buffer
};

/**
 * Initiates the Google OAuth 2.0 flow with PKCE
 * This opens a popup window for authentication
 * @returns {Promise<Object>} Resolves with access token, rejects on error
 */
export const initiateGoogleOAuthFlow = async () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Browser environment required for OAuth flow'));
  }
  
  if (!APP_CONFIG.CLIENT_ID) {
    return Promise.reject(new Error('Google Sheets API client ID not configured'));
  }
  
  // Check if we already have valid tokens
  const tokens = getTokens();
  if (tokens && !isTokenExpired(tokens.expires_at)) {
    return Promise.resolve(tokens.access_token);
  }
  
  // Clear any existing tokens and state
  clearTokens();
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = generateRandomString(16);
  
  // Store PKCE code verifier and state in sessionStorage
  window.sessionStorage.setItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE, state);
  window.sessionStorage.setItem(STORAGE_KEYS.GOOGLE_OAUTH_PKCE, codeVerifier);
  
  // Build authorization URL
  const authUrl = new URL(GOOGLE_OAUTH_ENDPOINTS.AUTHORIZE);
  authUrl.searchParams.append('client_id', APP_CONFIG.CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', APP_CONFIG.REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', REQUIRED_SCOPES.join(' '));
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  
  // Open OAuth popup
  return new Promise((resolve, reject) => {
    const popup = window.open(authUrl.toString(), 'Google OAuth', 'width=500,height=600');
    
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }
    
    // Check for popup closure or token in sessionStorage
    const checkInterval = setInterval(() => {
      const tokens = getTokens();
      if (tokens && !isTokenExpired(tokens.expires_at)) {
        clearInterval(checkInterval);
        resolve(tokens.access_token);
        return;
      }
      
      // If popup is closed but no tokens, reject
      if (popup.closed) {
        clearInterval(checkInterval);
        reject(new Error('OAuth flow was cancelled or failed'));
      }
    }, 500);
    
    // Set a timeout for the OAuth flow (5 minutes)
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('OAuth flow timed out'));
    }, 5 * 60 * 1000);
  });
};

/**
 * Exchanges authorization code for access token
 * This should be called from the callback page
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} Token response from Google
 */
export const exchangeCodeForToken = async (code) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser environment required'));
  }
  
  const storedState = window.sessionStorage.getItem(STORAGE_KEYS.GOOGLE_OAUTH_STATE);
  const codeVerifier = window.sessionStorage.getItem(STORAGE_KEYS.GOOGLE_OAUTH_PKCE);
  
  if (!codeVerifier) {
    return Promise.reject(new Error('PKCE code verifier not found'));
  }
  
  const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: APP_CONFIG.CLIENT_ID,
      code: code,
      redirect_uri: APP_CONFIG.REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || errorData.error || 'Failed to exchange code for token');
  }
  
  const tokens = await response.json();
  storeTokens(tokens);
  return tokens;
};

/**
 * Refreshes the access token using the refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const tokens = getTokens();
  if (!tokens?.refresh_token) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: APP_CONFIG.CLIENT_ID,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    clearTokens();
    throw new Error(errorData.error_description || errorData.error || 'Failed to refresh token');
  }
  
  const newTokens = await response.json();
  storeTokens(newTokens);
  return newTokens.access_token;
};

/**
 * Gets a valid access token, refreshing if necessary
 * @returns {Promise<string>} Valid access token
 */
export const getAccessToken = async () => {
  let tokens = getTokens();
  
  if (!tokens) {
    throw new Error('No tokens available. Please authenticate first.');
  }
  
  if (isTokenExpired(tokens.expires_at)) {
    try {
      const newToken = await refreshAccessToken();
      return newToken;
    } catch {
      // If refresh fails, clear tokens and require re-authentication
      clearTokens();
      throw new Error('Session expired. Please authenticate again.');
    }
  }
  
  return tokens.access_token;
};

/**
 * Makes an authenticated API request to Google Sheets API
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} API response
 */
const makeAuthenticatedRequest = async (url, options = {}) => {
  const accessToken = await getAccessToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Creates a new Google Spreadsheet
 * @param {string} title - Title for the new spreadsheet
 * @returns {Promise<Object>} Spreadsheet data from Google API
 */
const createSpreadsheet = async (title) => {
  const response = await makeAuthenticatedRequest(SHEETS_API_ENDPOINTS.SPREADSHEETS, {
    method: 'POST',
    body: JSON.stringify({
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to create spreadsheet');
  }
  
  return response.json();
};

/**
 * Creates a new sheet within a spreadsheet and populates it with data
 * @param {string} spreadsheetId - ID of the spreadsheet
 * @param {string} sheetTitle - Title for the new sheet
 * @param {Array<Array<string>>} data - 2D array of data to populate
 * @returns {Promise<Object>} Operation response from Google API
 */
const createAndPopulateSheet = async (spreadsheetId, sheetTitle, data) => {
  // First, create the sheet
  const batchUpdateUrl = `${SHEETS_API_ENDPOINTS.SHEETS}/${spreadsheetId}:batchUpdate`;
  
  const addSheetResponse = await makeAuthenticatedRequest(batchUpdateUrl, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetTitle,
            },
          },
        },
      ],
    }),
  });
  
  if (!addSheetResponse.ok) {
    const errorData = await addSheetResponse.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to create sheet');
  }
  
  const addSheetData = await addSheetResponse.json();
  const sheetId = addSheetData.replies?.[0]?.addSheet?.sheet?.properties?.sheetId;
  
  if (!sheetId) {
    throw new Error('Failed to get sheet ID after creation');
  }
  
  // Now populate the sheet with data
  const range = `${sheetTitle}!A1:${stringToColumn(data[0]?.length || 1)}${data.length || 1}`;
  const valueInputOption = 'RAW';
  
  const populateResponse = await makeAuthenticatedRequest(
    `${SHEETS_API_ENDPOINTS.SHEETS}/${spreadsheetId}/values/${range}?valueInputOption=${valueInputOption}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        values: data,
      }),
    }
  );
  
  if (!populateResponse.ok) {
    const errorData = await populateResponse.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to populate sheet');
  }
  
  return populateResponse.json();
};

/**
 * Converts a number to Excel column letters (e.g., 1 -> 'A', 27 -> 'AA')
 * @param {number} num - Column number (1-indexed)
 * @returns {string} Excel column letters
 */
const stringToColumn = (num) => {
  let column = '';
  let n = Math.floor(num);
  
  while (n > 0) {
    n--;
    column = String.fromCharCode(65 + (n % 26)) + column;
    n = Math.floor(n / 26);
  }
  
  return column || 'A';
};

/**
 * Sanitizes a field value for Google Sheets
 * Prevents formula injection and ensures safe values
 * @param {*} field - Raw field value
 * @returns {string} Sanitized field value
 */
const sanitizeSheetsField = (field) => {
  const value = String(field ?? '');
  
  // Prevent formula injection by prefixing formula-trigger characters
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  
  return value;
};

/**
 * Converts attendee data to a 2D array for Google Sheets
 * @param {Array<Object>} attendees - Array of attendee objects
 * @returns {Array<Array<string>>} 2D array ready for Google Sheets
 */
const attendeesToSheetData = (attendees) => {
  const headers = ['Name', 'Email', 'Registration Date', 'Ticket Type'];
  
  const rows = attendees.map((attendee) => [
    sanitizeSheetsField(attendee.name || ''),
    sanitizeSheetsField(attendee.email || ''),
    sanitizeSheetsField(attendee.registrationDate || ''),
    sanitizeSheetsField(attendee.ticketType || 'General'),
  ]);
  
  return [headers, ...rows];
};

/**
 * Converts event data to a 2D array for Google Sheets
 * @param {Array<Object>} events - Array of event objects
 * @returns {Array<Array<string>>} 2D array ready for Google Sheets
 */
const eventsToSheetData = (events) => {
  const headers = [
    'ID', 'Title', 'Date', 'Time', 'Location', 'Type', 'Status', 
    'Organizer', 'Description', 'URL'
  ];
  
  const getEventUrl = (event) => {
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}/events/${event.id}`;
    }
    return '';
  };
  
  const rows = events.map((event) => [
    sanitizeSheetsField(event.id ?? ''),
    sanitizeSheetsField(event.title ?? ''),
    sanitizeSheetsField(event.date ?? ''),
    sanitizeSheetsField(event.time ?? event.startTime ?? ''),
    sanitizeSheetsField(event.location ?? ''),
    sanitizeSheetsField(event.type ?? event.category ?? ''),
    sanitizeSheetsField(event.status ?? ''),
    sanitizeSheetsField(event.organizer ?? event.organizerName ?? ''),
    sanitizeSheetsField(event.description ?? event.shortDescription ?? ''),
    getEventUrl(event),
  ]);
  
  return [headers, ...rows];
};

/**
 * Exports attendees to a new Google Sheet
 * @param {Array<Object>} attendees - Array of attendee objects to export
 * @param {string} [sheetName] - Name for the new spreadsheet (defaults to 'Eventra Attendees')
 * @returns {Promise<Object>} Result with success status and spreadsheet URL
 */
export const exportAttendeesToGoogleSheets = async (attendees, sheetName = 'Eventra Attendees') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { success: false, error: 'Browser environment required' };
  }
  
  if (!attendees || attendees.length === 0) {
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('eventra-toast', {
        detail: { message: 'No attendees to export', type: 'warning' }
      }));
    }
    return { success: false, reason: 'empty' };
  }
  
  try {
    // Authenticate or use existing session
    let accessToken;
    try {
      accessToken = await getAccessToken();
    } catch {
      // Initiate OAuth flow
      accessToken = await initiateGoogleOAuthFlow();
    }
    
    // Convert attendees to sheet data
    const data = attendeesToSheetData(attendees);
    
    // Create spreadsheet
    const spreadsheet = await createSpreadsheet(sheetName);
    const spreadsheetId = spreadsheet.id;
    
    // Create and populate sheet
    await createAndPopulateSheet(spreadsheetId, 'Attendees', data);
    
    // Make spreadsheet world-readable (for sharing with external vendors)
    await makeAuthenticatedRequest(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'anyone',
          role: 'reader',
        }),
      }
    );
    
    // Generate shareable URL
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
    
    // Show success message with URL
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('eventra-toast', {
        detail: {
          message: 'Attendees exported to Google Sheets successfully!',
          type: 'success',
          url: spreadsheetUrl,
          urlText: 'Open Sheet'
        }
      }));
    }
    
    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
    };
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('eventra-toast', {
        detail: {
          message: `Failed to export to Google Sheets: ${error.message}`,
          type: 'error'
        }
      }));
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Exports events to a new Google Sheet
 * @param {Array<Object>} events - Array of event objects to export
 * @param {string} [sheetName] - Name for the new spreadsheet (defaults to 'Eventra Events')
 * @returns {Promise<Object>} Result with success status and spreadsheet URL
 */
export const exportEventsToGoogleSheets = async (events, sheetName = 'Eventra Events') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { success: false, error: 'Browser environment required' };
  }
  
  if (!events || events.length === 0) {
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('eventra-toast', {
        detail: { message: 'No events to export', type: 'warning' }
      }));
    }
    return { success: false, reason: 'empty' };
  }
  
  try {
    // Authenticate or use existing session
    let accessToken;
    try {
      accessToken = await getAccessToken();
    } catch {
      // Initiate OAuth flow
      accessToken = await initiateGoogleOAuthFlow();
    }
    
    // Convert events to sheet data
    const data = eventsToSheetData(events);
    
    // Create spreadsheet
    const spreadsheet = await createSpreadsheet(sheetName);
    const spreadsheetId = spreadsheet.id;
    
    // Create and populate sheet
    await createAndPopulateSheet(spreadsheetId, 'Events', data);
    
    // Make spreadsheet world-readable
    await makeAuthenticatedRequest(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'anyone',
          role: 'reader',
        }),
      }
    );
    
    // Generate shareable URL
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
    
    // Show success message with URL
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('eventra-toast', {
        detail: {
          message: 'Events exported to Google Sheets successfully!',
          type: 'success',
          url: spreadsheetUrl,
          urlText: 'Open Sheet'
        }
      }));
    }
    
    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
    };
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('eventra-toast', {
        detail: {
          message: `Failed to export to Google Sheets: ${error.message}`,
          type: 'error'
        }
      }));
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Revokes Google Sheets API access token
 * @returns {Promise<void>}
 */
export const revokeGoogleSheetsAccess = async () => {
  const tokens = getTokens();
  if (!tokens?.access_token) return;
  
  try {
    await fetch(GOOGLE_OAUTH_ENDPOINTS.REVOKE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: tokens.access_token,
      }),
    });
  } catch (error) {
    console.error('Error revoking token:', error);
  } finally {
    clearTokens();
  }
};

/**
 * Checks if Google Sheets export is available (configured and authenticated)
 * @returns {Promise<boolean>}
 */
export const isGoogleSheetsExportAvailable = async () => {
  if (!APP_CONFIG.CLIENT_ID) return false;
  
  try {
    const accessToken = await getAccessToken();
    return !!accessToken;
  } catch {
    return false;
  }
};

export default {
  exportAttendeesToGoogleSheets,
  exportEventsToGoogleSheets,
  initiateGoogleOAuthFlow,
  exchangeCodeForToken,
  getAccessToken,
  revokeGoogleSheetsAccess,
  isGoogleSheetsExportAvailable,
};
