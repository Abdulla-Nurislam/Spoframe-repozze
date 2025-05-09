/**
 * API Routes - Connects authentication handler to Express routes
 */

const express = require('express');
const authHandler = require('./auth-handler');
const router = express.Router();

// Auth routes
router.post('/auth/register', authHandler.register);
router.post('/auth/login', authHandler.login);
router.post('/auth/logout', authHandler.logout);
router.get('/auth/me', authHandler.protect, authHandler.getMe);
router.put('/auth/update-profile', authHandler.protect, authHandler.updateProfile);
router.post('/auth/refresh-token', authHandler.refreshToken);
router.post('/auth/request-reset', authHandler.requestPasswordReset);
router.post('/auth/reset-password', authHandler.resetPassword);

module.exports = router;
