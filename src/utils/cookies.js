// Cookie utility functions for secure token storage

/**
 * Set a cookie with secure defaults
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 7)
 */
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

/**
 * Delete a cookie by setting it to expire in the past
 * @param {string} name - Cookie name
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean} - True if cookie exists
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

/**
 * Clear all authentication cookies
 */
export const clearAuthCookies = () => {
  deleteCookie('pgmate_token');
  deleteCookie('pgmate_owner_id');
};

/**
 * Set authentication cookies
 * @param {string} token - Authentication token
 * @param {string} ownerId - Owner ID
 */
export const setAuthCookies = (token, ownerId) => {
  setCookie('pgmate_token', token, 7); // 7 days
  setCookie('pgmate_owner_id', ownerId, 7);
};

/**
 * Get authentication data from cookies
 * @returns {object} - Object with token and ownerId
 */
export const getAuthCookies = () => {
  return {
    token: getCookie('pgmate_token'),
    ownerId: getCookie('pgmate_owner_id')
  };
};
