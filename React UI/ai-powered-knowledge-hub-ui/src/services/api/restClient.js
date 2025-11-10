/**
 * REST API Client
 * Handles REST API communication through Spring Boot Gateway
 */

import API_CONFIG from '../../config/apiConfig';

class RestClient {
  constructor() {
    this.baseURL = API_CONFIG.gateway.baseURL;  // All requests through gateway
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        ...options.headers,
      },
    };

    // Don't set Content-Type for FormData, browser will set it with boundary
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...defaultOptions,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', (e) => {
        console.error('XHR Error:', e);
        console.error('Backend URL:', `${this.baseURL}${API_CONFIG.services.upload.endpoint}`);
        reject(new Error(`Network error: Cannot connect to ${this.baseURL}. Please check if the backend is running and CORS is configured.`));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout: Request took too long to complete'));
      });

      // Send request
      const uploadUrl = `${this.baseURL}${API_CONFIG.services.upload.endpoint}`;
      console.log('Uploading to:', uploadUrl);
      
      xhr.open('POST', uploadUrl);
      
      // Set timeout
      xhr.timeout = this.timeout;
      
      // Add headers for CORS
      xhr.withCredentials = false; // Set to true if your backend requires credentials
      
      xhr.send(formData);
    });
  }
}

export default RestClient;
