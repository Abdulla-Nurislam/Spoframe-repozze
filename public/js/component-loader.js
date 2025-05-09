/**
 * Component Loader
 * Dynamically loads web components like the authentication modal
 */

class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => this.init());
  }
  
  /**
   * Initialize the component loader
   */
  init() {
    console.log('Component loader initialized');
    
    // Load the auth modal on every page
    this.loadAuthModal();
    
    // Load other components as needed
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for component load requests
    document.addEventListener('loadComponent', (event) => {
      if (event.detail && event.detail.name) {
        this.loadComponent(event.detail.name, event.detail.targetSelector);
      }
    });
  }
  
  /**
   * Load the authentication modal
   */
  loadAuthModal() {
    if (this.loadedComponents.has('auth-modal')) return;
    
    // Create container if it doesn't exist
    let container = document.getElementById('authModalContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'authModalContainer';
      document.body.appendChild(container);
    }
    
    // Load the component
    fetch('/components/auth-modal.html')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load auth modal: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        container.innerHTML = html;
        this.loadedComponents.add('auth-modal');
        console.log('Auth modal loaded');
        
        // Initialize auth UI if available
        if (window.authUI) {
          window.authUI.init();
        } else {
          console.warn('Auth UI not loaded yet');
          
          // Wait for auth-ui to load
          const checkAuthUI = setInterval(() => {
            if (window.authUI) {
              window.authUI.init();
              clearInterval(checkAuthUI);
            }
          }, 100);
        }
      })
      .catch(error => {
        console.error('Error loading auth modal:', error);
      });
  }
  
  /**
   * Load any component by name
   * @param {string} name - Component name
   * @param {string} targetSelector - Target element selector
   */
  loadComponent(name, targetSelector = null) {
    // Skip if already loaded
    const componentKey = `${name}-${targetSelector || 'default'}`;
    if (this.loadedComponents.has(componentKey)) return;
    
    // Find target element
    const target = targetSelector 
      ? document.querySelector(targetSelector)
      : document.body;
    
    if (!target) {
      console.error(`Target element not found: ${targetSelector}`);
      return;
    }
    
    // Load the component
    fetch(`/components/${name}.html`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load component ${name}: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Create a container for the component
        const container = document.createElement('div');
        container.classList.add(`component-${name}`);
        container.innerHTML = html;
        
        // Append to target
        target.appendChild(container);
        
        this.loadedComponents.add(componentKey);
        console.log(`Component ${name} loaded`);
        
        // Dispatch event for component loaded
        document.dispatchEvent(new CustomEvent('componentLoaded', {
          detail: { name, targetSelector }
        }));
      })
      .catch(error => {
        console.error(`Error loading component ${name}:`, error);
      });
  }
}

// Create and expose instance
window.componentLoader = new ComponentLoader();
