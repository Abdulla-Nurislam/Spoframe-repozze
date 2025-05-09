/**
 * Authentication UI - Handles all authentication UI components and interactions
 * Creating a modern and secure authentication experience without React
 */

class AuthUI {
  constructor() {
    this.modalId = 'authModal';
    this.loginFormClass = 'login-form';
    this.signupFormClass = 'signup-form';
    this.formErrorClass = 'form-error';
    this.overlayClass = 'auth-overlay';
    this.activeClass = 'active';
    this.hiddenClass = 'hidden';
    
    // Event handlers
    this.onLoginSuccess = null;
    this.onSignupSuccess = null;
    this.onLogout = null;
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  /**
   * Initialize the authentication UI components
   */
  init() {
    console.log('Initializing Auth UI');
    this.setupEventListeners();
    this.checkAuthState();
    this.setupProtectedRoutes();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Open modal buttons
    const authTriggers = document.querySelectorAll('[data-auth="open"]');
    authTriggers.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });

    // Form switches
    document.querySelectorAll('.switch-to-signup').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSignupForm();
      });
    });

    document.querySelectorAll('.switch-to-login').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    });

    // Logout buttons
    document.querySelectorAll('[data-auth="logout"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });

    // Close modal triggers
    document.querySelectorAll('.auth-modal .close').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => this.closeModal());
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
      const modal = document.getElementById(this.modalId);
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Form submissions
    this.setupFormListeners();
  }

  /**
   * Set up form submission listeners
   */
  setupFormListeners() {
    // Login form
    const loginForm = document.querySelector(`.${this.loginFormClass} form`);
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(loginForm);
      });
    }

    // Signup form
    const signupForm = document.querySelector(`.${this.signupFormClass} form`);
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup(signupForm);
      });
    }

    // Reset password form
    const resetForm = document.querySelector('.reset-form form');
    if (resetForm) {
      resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleResetRequest(resetForm);
      });
    }

    // New password form (on reset password page)
    const newPasswordForm = document.querySelector('.new-password-form form');
    if (newPasswordForm) {
      newPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePasswordReset(newPasswordForm);
      });
    }

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const input = e.currentTarget.closest('.password-input').querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Update toggle icon
        if (type === 'text') {
          e.currentTarget.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
          e.currentTarget.innerHTML = '<i class="fas fa-eye"></i>';
        }
      });
    });
  }

  /**
   * Checks and updates UI based on authentication state
   */
  checkAuthState() {
    const isAuthenticated = window.authService.isAuthenticated();
    this.updateAuthUI(isAuthenticated);
    
    if (isAuthenticated) {
      // Verify token validity with server
      window.authService.getCurrentUser()
        .then(user => {
          if (user) {
            this.updateUserInfo(user);
          } else {
            this.updateAuthUI(false);
          }
        })
        .catch(() => {
          this.updateAuthUI(false);
        });
    }
  }

  /**
   * Set up protection for routes that require authentication
   */
  setupProtectedRoutes() {
    // Check if current page is protected
    const protectedRoutes = [
      '/profile.html',
      '/account.html',
      '/orders.html',
      '/dashboard.html'
    ];
    
    const currentPath = window.location.pathname;
    const isProtectedRoute = protectedRoutes.some(route => 
      currentPath.includes(route) || currentPath.endsWith(route)
    );
    
    if (isProtectedRoute && !window.authService.isAuthenticated()) {
      // Store the intended destination
      sessionStorage.setItem('auth_redirect', window.location.href);
      
      // Redirect to login page with a message
      window.location.href = '/?authRequired=true';
    }
  }

  /**
   * Handle login form submission
   * @param {HTMLFormElement} form The login form
   */
  async handleLogin(form) {
    try {
      this.clearFormErrors(form);
      this.setFormLoading(form, true);
      
      const email = form.querySelector('input[type="email"]').value;
      const password = form.querySelector('input[type="password"]').value;
      
      // Validate inputs
      if (!email || !password) {
        this.showFormError(form, 'Пожалуйста, заполните все поля');
        this.setFormLoading(form, false);
        return;
      }
      
      // Call auth service
      const response = await window.authService.login(email, password);
      
      this.setFormLoading(form, false);
      
      if (response.success) {
        this.handleLoginSuccess(response.user);
      } else {
        this.showFormError(form, response.message || 'Произошла ошибка при входе');
      }
    } catch (error) {
      this.setFormLoading(form, false);
      this.showFormError(form, error.message || 'Произошла ошибка при входе');
    }
  }

  /**
   * Handle signup form submission
   * @param {HTMLFormElement} form The signup form
   */
  async handleSignup(form) {
    try {
      this.clearFormErrors(form);
      this.setFormLoading(form, true);
      
      const name = form.querySelector('input[type="text"]').value;
      const email = form.querySelector('input[type="email"]').value;
      const password = form.querySelector('input[type="password"]').value;
      
      // Validate inputs
      if (!name || !email || !password) {
        this.showFormError(form, 'Пожалуйста, заполните все поля');
        this.setFormLoading(form, false);
        return;
      }
      
      if (password.length < 8) {
        this.showFormError(form, 'Пароль должен содержать минимум 8 символов');
        this.setFormLoading(form, false);
        return;
      }
      
      // Call auth service
      const response = await window.authService.register({ name, email, password });
      
      this.setFormLoading(form, false);
      
      if (response.success) {
        this.handleSignupSuccess(response.user);
      } else {
        this.showFormError(form, response.message || 'Произошла ошибка при регистрации');
      }
    } catch (error) {
      this.setFormLoading(form, false);
      this.showFormError(form, error.message || 'Произошла ошибка при регистрации');
    }
  }

  /**
   * Handle password reset request form submission
   * @param {HTMLFormElement} form The password reset request form
   */
  async handleResetRequest(form) {
    try {
      this.clearFormErrors(form);
      this.setFormLoading(form, true);
      
      const email = form.querySelector('input[type="email"]').value;
      
      if (!email) {
        this.showFormError(form, 'Пожалуйста, введите ваш email');
        this.setFormLoading(form, false);
        return;
      }
      
      // Call auth service
      const response = await window.authService.requestPasswordReset(email);
      
      this.setFormLoading(form, false);
      
      // Show success message
      form.style.display = 'none';
      const successMsg = document.querySelector('.reset-success-message');
      if (successMsg) {
        successMsg.style.display = 'block';
      }
      
      // Redirect back to login after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
      
    } catch (error) {
      this.setFormLoading(form, false);
      this.showFormError(form, error.message || 'Не удалось отправить запрос на сброс пароля');
    }
  }

  /**
   * Handle password reset form submission (set new password)
   * @param {HTMLFormElement} form The new password form
   */
  async handlePasswordReset(form) {
    try {
      this.clearFormErrors(form);
      this.setFormLoading(form, true);
      
      const password = form.querySelector('input[type="password"]').value;
      const confirmPassword = form.querySelector('input[name="confirm-password"]').value;
      
      if (!password || !confirmPassword) {
        this.showFormError(form, 'Пожалуйста, заполните все поля');
        this.setFormLoading(form, false);
        return;
      }
      
      if (password.length < 8) {
        this.showFormError(form, 'Пароль должен содержать минимум 8 символов');
        this.setFormLoading(form, false);
        return;
      }
      
      if (password !== confirmPassword) {
        this.showFormError(form, 'Пароли не совпадают');
        this.setFormLoading(form, false);
        return;
      }
      
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        this.showFormError(form, 'Недействительный токен сброса пароля');
        this.setFormLoading(form, false);
        return;
      }
      
      // Call auth service
      const response = await window.authService.resetPassword(token, password);
      
      this.setFormLoading(form, false);
      
      // Show success message
      form.style.display = 'none';
      const successMsg = document.querySelector('.reset-success-message');
      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.textContent = 'Пароль успешно изменен! Перенаправление на страницу входа...';
      }
      
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      
    } catch (error) {
      this.setFormLoading(form, false);
      this.showFormError(form, error.message || 'Не удалось сбросить пароль');
    }
  }

  /**
   * Handle logout button click
   */
  async handleLogout() {
    try {
      await window.authService.logout();
      this.updateAuthUI(false);
      
      // Call optional callback
      if (typeof this.onLogout === 'function') {
        this.onLogout();
      }
      
      // Redirect to home page if on a protected route
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/profile.html', '/account.html', '/orders.html'];
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.includes(route) || currentPath.endsWith(route)
      );
      
      if (isProtectedRoute) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still update UI even if server request fails
      this.updateAuthUI(false);
    }
  }

  /**
   * Handle successful login
   * @param {Object} user User information
   */
  handleLoginSuccess(user) {
    this.closeModal();
    this.updateAuthUI(true);
    this.updateUserInfo(user);
    
    // Check if there's a redirect URL in session storage
    const redirectUrl = sessionStorage.getItem('auth_redirect');
    if (redirectUrl) {
      sessionStorage.removeItem('auth_redirect');
      window.location.href = redirectUrl;
      return;
    }
    
    // Call optional callback
    if (typeof this.onLoginSuccess === 'function') {
      this.onLoginSuccess(user);
    }
  }

  /**
   * Handle successful signup
   * @param {Object} user User information
   */
  handleSignupSuccess(user) {
    this.closeModal();
    this.updateAuthUI(true);
    this.updateUserInfo(user);
    
    // Check if there's a redirect URL
    const redirectUrl = sessionStorage.getItem('auth_redirect');
    if (redirectUrl) {
      sessionStorage.removeItem('auth_redirect');
      window.location.href = redirectUrl;
      return;
    }
    
    // Call optional callback
    if (typeof this.onSignupSuccess === 'function') {
      this.onSignupSuccess(user);
    }
  }

  /**
   * Update the UI based on authentication state
   * @param {boolean} isAuthenticated Whether the user is authenticated
   */
  updateAuthUI(isAuthenticated) {
    // Toggle visibility of auth-dependent elements
    document.querySelectorAll('[data-auth-show="authenticated"]').forEach(el => {
      el.style.display = isAuthenticated ? '' : 'none';
    });
    
    document.querySelectorAll('[data-auth-show="unauthenticated"]').forEach(el => {
      el.style.display = isAuthenticated ? 'none' : '';
    });
    
    // Update welcome message if it exists
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
      welcomeMessage.style.display = isAuthenticated ? 'flex' : 'none';
    }
    
    // Update signup/login buttons
    const authButtons = document.querySelectorAll('[data-auth="open"]');
    authButtons.forEach(button => {
      button.style.display = isAuthenticated ? 'none' : '';
    });
  }

  /**
   * Update user information in the UI
   * @param {Object} user User information
   */
  updateUserInfo(user) {
    if (!user) return;
    
    // Update username in welcome message
    const usernameElements = document.querySelectorAll('.username');
    usernameElements.forEach(el => {
      el.textContent = user.name || 'Пользователь';
    });
    
    // Update user-specific elements
    document.querySelectorAll('[data-user-email]').forEach(el => {
      el.textContent = user.email || '';
    });
    
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = user.name || '';
    });
  }

  /**
   * Open the authentication modal
   * @param {string} formType Optional, which form to show ('login' or 'signup')
   */
  openModal(formType = 'login') {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Show the appropriate form
    if (formType === 'signup') {
      this.showSignupForm();
    } else {
      this.showLoginForm();
    }
    
    // Check if modal was triggered from auth required redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authRequired') === 'true') {
      const errorMsg = modal.querySelector(`.${this.loginFormClass} .${this.formErrorClass}`);
      if (!errorMsg) {
        const loginForm = modal.querySelector(`.${this.loginFormClass} form`);
        this.showFormError(loginForm, 'Пожалуйста, войдите, чтобы получить доступ к этой странице');
      }
    }
  }

  /**
   * Close the authentication modal
   */
  closeModal() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // Clear any form errors
    this.clearAllFormErrors();
    
    // Reset form inputs
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => {
      form.reset();
    });
  }

  /**
   * Show the login form
   */
  showLoginForm() {
    const loginForm = document.querySelector(`.${this.loginFormClass}`);
    const signupForm = document.querySelector(`.${this.signupFormClass}`);
    
    if (!loginForm || !signupForm) return;
    
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    
    // Clear any existing errors
    this.clearAllFormErrors();
  }

  /**
   * Show the signup form
   */
  showSignupForm() {
    const loginForm = document.querySelector(`.${this.loginFormClass}`);
    const signupForm = document.querySelector(`.${this.signupFormClass}`);
    
    if (!loginForm || !signupForm) return;
    
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    
    // Clear any existing errors
    this.clearAllFormErrors();
  }

  /**
   * Show an error message in a form
   * @param {HTMLFormElement} form The form to show the error in
   * @param {string} message Error message to display
   */
  showFormError(form, message) {
    // Check if we already have an error element
    let errorElement = form.querySelector(`.${this.formErrorClass}`);
    
    if (!errorElement) {
      // Create error element
      errorElement = document.createElement('div');
      errorElement.className = this.formErrorClass;
      
      // Add styles
      errorElement.style.color = 'var(--error, #ff3b30)';
      errorElement.style.fontSize = '0.85rem';
      errorElement.style.marginTop = '0.5rem';
      errorElement.style.padding = '0.5rem';
      errorElement.style.borderRadius = '4px';
      errorElement.style.backgroundColor = 'rgba(255, 59, 48, 0.1)';
      
      // Find submit button and insert before it
      const submitButton = form.querySelector('button[type="submit"]');
      form.insertBefore(errorElement, submitButton);
    }
    
    // Set error message
    errorElement.textContent = message;
    
    // Animate to attract attention
    errorElement.animate(
      [
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
      ],
      { duration: 300, easing: 'ease-in-out' }
    );
  }

  /**
   * Clear all form errors
   */
  clearAllFormErrors() {
    const errorElements = document.querySelectorAll(`.${this.formErrorClass}`);
    errorElements.forEach(el => {
      el.remove();
    });
  }

  /**
   * Clear errors from a specific form
   * @param {HTMLFormElement} form The form to clear errors from
   */
  clearFormErrors(form) {
    const errorElements = form.querySelectorAll(`.${this.formErrorClass}`);
    errorElements.forEach(el => {
      el.remove();
    });
  }

  /**
   * Set form loading state
   * @param {HTMLFormElement} form The form to set loading state for
   * @param {boolean} isLoading Whether the form is loading
   */
  setFormLoading(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    if (isLoading) {
      // Store original text
      submitButton.dataset.originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
      submitButton.disabled = true;
      
      // Disable all inputs
      form.querySelectorAll('input, button').forEach(input => {
        input.disabled = true;
      });
    } else {
      // Restore original text
      if (submitButton.dataset.originalText) {
        submitButton.innerHTML = submitButton.dataset.originalText;
      }
      submitButton.disabled = false;
      
      // Enable all inputs
      form.querySelectorAll('input, button').forEach(input => {
        input.disabled = false;
      });
    }
  }
}

// Create and expose the instance
window.authUI = new AuthUI();
