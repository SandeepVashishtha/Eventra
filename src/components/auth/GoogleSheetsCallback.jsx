import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../../utils/exportGoogleSheets';
import { toast } from 'react-toastify';
import './Auth.css';

/**
 * GoogleSheetsCallback Component
 * 
 * This component handles the OAuth 2.0 callback from Google after the user
 * authorizes the application to access their Google Sheets and Drive.
 * 
 * The component:
 * 1. Extracts the authorization code from the URL query parameters
 * 2. Exchanges the code for access tokens using the PKCE code verifier
 * 3. Stores the tokens in sessionStorage for use by the export functions
 * 4. Redirects the user back to their original page or dashboard
 * 
 * Security considerations:
 * - Validates the state parameter to prevent CSRF attacks
 * - Only processes the callback if the required parameters are present
 * - Displays appropriate error messages for failed authorization
 * - Clears URL parameters after processing to prevent replay attacks
 */
const GoogleSheetsCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract query parameters from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorParam = params.get('error');
        const state = params.get('state');
        const storedState = sessionStorage.getItem('eventra_google_oauth_state');

        // Check for errors from Google
        if (errorParam) {
          const errorDescription = params.get('error_description') || 'Authorization was denied';
          throw new Error(`${errorParam}: ${errorDescription}`);
        }

        // Validate required parameters
        if (!code) {
          throw new Error('Authorization code not received from Google');
        }

        // Validate state parameter to prevent CSRF
        if (!state || state !== storedState) {
          throw new Error('Invalid state parameter. Please try again.');
        }

        setStatus('Exchanging authorization code for tokens...');

        // Exchange the authorization code for tokens
        const tokens = await exchangeCodeForToken(code);

        if (!tokens.access_token) {
          throw new Error('No access token received from Google');
        }

        setStatus('Authentication successful! Redirecting...');

        // Get the original path from sessionStorage or redirect to dashboard
        const returnPath = sessionStorage.getItem('eventra_return_path') || '/dashboard';
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect back to the original page
        setTimeout(() => {
          navigate(returnPath, { replace: true });
        }, 1500);

      } catch (err) {
        console.error('Google Sheets OAuth callback error:', err);
        setError(err.message);
        setStatus('Authentication failed');
        
        // Show error toast
        toast.error(`Google Sheets authorization failed: ${err.message}`);
        
        // Clean up and redirect to dashboard after error
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      }
    };

    handleCallback();

    // Cleanup on unmount
    return () => {
      // Clear any pending state
      sessionStorage.removeItem('eventra_google_oauth_state');
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-linear-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Google Sheets Authorization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {status}
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please wait while we complete the authorization...
            </p>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            <p>This page will automatically close when authorization is complete.</p>
            <p>If not redirected automatically, you can safely close this window.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsCallback;
