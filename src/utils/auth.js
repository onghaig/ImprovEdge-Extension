// Store the access token
export const setAccessToken = (token) => {
  localStorage.setItem('google_access_token', token);
};

// Get the stored access token
export const getAccessToken = () => {
  return localStorage.getItem('google_access_token');
};

// Remove the access token
export const removeAccessToken = () => {
  localStorage.removeItem('google_access_token');
};

// Check if we have a valid token
export const hasValidToken = () => {
  const token = getAccessToken();
  return !!token;
};

// Handle the OAuth2 redirect
export const handleOAuthRedirect = () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get('access_token');
  const state = params.get('state');
  const error = params.get('error');
  
  // Verify state to prevent CSRF
  const storedState = localStorage.getItem('oauth_state');
  if (state !== storedState) {
    window.opener.postMessage({ error: 'Invalid state parameter' }, '*');
    return;
  }
  
  if (error) {
    window.opener.postMessage({ error }, '*');
  } else if (accessToken) {
    window.opener.postMessage({ access_token: accessToken }, '*');
  }
  
  // Close the popup
  window.close();
}; 