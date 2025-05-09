/**
 * Authentication API Handler
 * Secure backend implementation for authentication operations
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const JWT_REFRESH_EXPIRES_IN = '7d';

// In-memory user store (replace with database in production)
let users = [];
let refreshTokens = [];
let passwordResetTokens = [];

const authHandler = {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false, 
          message: 'Please provide name, email and password'
        });
      }
      
      // Check password length
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }
      
      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Hash password
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: `${salt}:${hash}`,
        createdAt: new Date().toISOString()
      };
      
      // Save user
      users.push(newUser);
      
      // Create tokens
      const { token, refreshToken } = createTokens(newUser);
      
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword,
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during registration'
      });
    }
  },

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }
      
      // Find user
      const user = users.find(user => user.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Verify password
      const [salt, storedHash] = user.password.split(':');
      const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');
      
      if (hash !== storedHash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      // Create tokens
      const { token, refreshToken } = createTokens(user);
      
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user: userWithoutPassword,
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during login'
      });
    }
  },

  /**
   * Logout a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      // Remove refresh token from valid tokens
      if (refreshToken) {
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
      }
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout'
      });
    }
  },

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMe(req, res) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      // Find full user data (for latest info)
      const currentUser = users.find(u => u.id === user.id);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = currentUser;
      
      res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while getting user information'
      });
    }
  },

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const { name } = req.body;
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }
      
      // Find user index
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update user data
      if (name) {
        users[userIndex].name = name;
      }
      
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = users[userIndex];
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while updating profile'
      });
    }
  },

  /**
   * Refresh authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      
      // Check if refresh token is valid
      const isValidRefreshToken = refreshTokens.includes(refreshToken);
      if (!isValidRefreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      
      // Verify refresh token
      const decoded = await promisify(jwt.verify)(
        refreshToken,
        JWT_SECRET + '.refresh'
      );
      
      // Find user
      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Create new tokens
      const tokens = createTokens(user);
      
      // Remove old refresh token
      refreshTokens = refreshTokens.filter(token => token !== refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        token: tokens.token,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  },

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      // Find user
      const user = users.find(u => u.email === email);
      if (!user) {
        // Don't reveal that email doesn't exist for security
        return res.status(200).json({
          success: true,
          message: 'If your email exists in our database, you will receive a password reset link'
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // 1 hour
      
      // Store reset token
      passwordResetTokens.push({
        userId: user.id,
        token: resetToken,
        expires: resetTokenExpires
      });
      
      // In a real app, send email with reset link
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
      
      console.log(`Reset URL for ${email}: ${resetUrl}`);
      
      res.status(200).json({
        success: true,
        message: 'If your email exists in our database, you will receive a password reset link',
        // Only include the reset URL in development
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      });
    } catch (error) {
      console.error('Request password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while requesting password reset'
      });
    }
  },

  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
      }
      
      // Check password length
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }
      
      // Find reset token
      const resetTokenObj = passwordResetTokens.find(
        t => t.token === token && t.expires > Date.now()
      );
      
      if (!resetTokenObj) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      
      // Find user
      const userIndex = users.findIndex(u => u.id === resetTokenObj.userId);
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Hash new password
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512')
        .toString('hex');
      
      // Update user password
      users[userIndex].password = `${salt}:${hash}`;
      
      // Remove used reset token
      passwordResetTokens = passwordResetTokens.filter(
        t => t.token !== token
      );
      
      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while resetting password'
      });
    }
  },

  /**
   * Middleware to verify JWT token and set user in request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  protect(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      let token;
      
      if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'You are not logged in'
        });
      }
      
      // Verify token
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }
        
        // Find user
        const user = users.find(u => u.id === decoded.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User no longer exists'
          });
        }
        
        // Set user in request
        req.user = { id: user.id, email: user.email, name: user.name };
        next();
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
  }
};

/**
 * Create JWT tokens for user
 * @param {Object} user - User object
 * @returns {Object} Object with token and refresh token
 */
function createTokens(user) {
  // Create JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Create refresh token
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_SECRET + '.refresh',
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
  
  // Store refresh token
  refreshTokens.push(refreshToken);
  
  return { token, refreshToken };
}

module.exports = authHandler;
