/**
 * Authentication Service - Handles all authentication-related operations
 * Provides a secure API for user authentication, registration, and password management
 */

class AuthService {
  constructor() {
    this.apiUrl = '/api/auth'; // Base URL for all auth-related endpoints
    this.tokenName = 'spoframe_auth_token';
    this.refreshTokenName = 'spoframe_refresh_token';
    this.userInfoName = 'spoframe_user_info';
  }

  /**
   * Logs in a user with email and password
   * @param {string} email User's email
   * @param {string} password User's password
   * @returns {Promise} Promise with user data or error
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Necessary for cookies
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setAuthTokens(data.token, data.refreshToken);
      this.setUserInfo(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   * @param {Object} userData User registration data
   * @returns {Promise} Promise with user data or error
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after registration if tokens are provided
      if (data.token && data.refreshToken) {
        this.setAuthTokens(data.token, data.refreshToken);
        this.setUserInfo(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   * @returns {Promise} Promise indicating success or failure
   */
  async logout() {
    try {
      // Only call the server if we have a token
      if (this.getAuthToken()) {
        await fetch(`${this.apiUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }
      
      // Clear local tokens regardless of server response
      this.clearAuthTokens();
      this.clearUserInfo();
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens even if server request fails
      this.clearAuthTokens();
      this.clearUserInfo();
      throw error;
    }
  }

  /**
   * Initiates password reset for a user
   * @param {string} email User's email to send reset link
   * @returns {Promise} Promise indicating success or failure
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${this.apiUrl}/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Completes password reset with new password and reset token
   * @param {string} token Reset token from email
   * @param {string} newPassword New password
   * @returns {Promise} Promise indicating success or failure
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.apiUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
      
      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Gets the current user's profile information
   * @returns {Promise} Promise with user data or error
   */
  async getCurrentUser() {
    try {
      // If we don't have a token, don't make the request
      if (!this.getAuthToken()) {
        return null;
      }

      const response = await fetch(`${this.apiUrl}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // If unauthorized, clear tokens and return null
      if (response.status === 401) {
        this.clearAuthTokens();
        this.clearUserInfo();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user info');
      }

      // Update stored user info with latest data
      this.setUserInfo(data.user);
      
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Refreshes the authentication token using refresh token
   * @returns {Promise} Promise with new token or error
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.apiUrl}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Clear tokens if refresh fails
        this.clearAuthTokens();
        this.clearUserInfo();
        throw new Error(data.message || 'Token refresh failed');
      }

      this.setAuthTokens(data.token, data.refreshToken);
      
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      this.clearAuthTokens();
      this.clearUserInfo();
      throw error;
    }
  }

  /**
   * Updates user profile information
   * @param {Object} userData Updated user data
   * @returns {Promise} Promise with updated user data or error
   */
  async updateProfile(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update local user info
      this.setUserInfo(data.user);
      
      return data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Checks if the user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Gets the current authentication token
   * @returns {string|null} The auth token or null
   */
  getAuthToken() {
    return localStorage.getItem(this.tokenName);
  }

  /**
   * Gets the current refresh token
   * @returns {string|null} The refresh token or null
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenName);
  }

  /**
   * Gets the stored user information
   * @returns {Object|null} User information or null
   */
  getUserInfo() {
    const userInfo = localStorage.getItem(this.userInfoName);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Sets authentication tokens in storage
   * @param {string} token Auth token
   * @param {string} refreshToken Refresh token
   */
  setAuthTokens(token, refreshToken) {
    localStorage.setItem(this.tokenName, token);
    localStorage.setItem(this.refreshTokenName, refreshToken);
  }

  /**
   * Sets user information in storage
   * @param {Object} userInfo User information to store
   */
  setUserInfo(userInfo) {
    localStorage.setItem(this.userInfoName, JSON.stringify(userInfo));
  }

  /**
   * Clears all authentication tokens
   */
  clearAuthTokens() {
    localStorage.removeItem(this.tokenName);
    localStorage.removeItem(this.refreshTokenName);
  }

  /**
   * Clears stored user information
   */
  clearUserInfo() {
    localStorage.removeItem(this.userInfoName);
  }
}

// Create a singleton instance
const authService = new AuthService();

// Export as a simple object for vanilla JS
window.authService = authService;
