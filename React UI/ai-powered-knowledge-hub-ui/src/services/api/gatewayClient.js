/**
 * API Gateway Client
 * Note: This is deprecated - all requests now go through Spring Boot Gateway
 * REST and GraphQL clients handle gateway routing automatically
 * Keeping this for potential future advanced gateway features
 */

import API_CONFIG from '../../config/apiConfig';

class GatewayClient {
  constructor() {
    this.gatewayURL = API_CONFIG.gateway.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.authToken = null;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Generic request with gateway routing
   */
  async request(service, endpoint, options = {}) {
    const url = `${this.gatewayURL}/${service}${endpoint}`;
    
    const headers = {
      ...options.headers,
    };

    // Add authentication if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add gateway-specific headers
    headers['X-Gateway-Service'] = service;

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  }

  /**
   * Upload file through gateway
   */
  async uploadFile(file, onProgress) {
    // Gateway implementation would route to the appropriate service
    // e.g., /document-service/api/upload
    
    const formData = new FormData();
    formData.append('file', file);

    return this.request('document-service', '/api/upload', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * GET request through gateway
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Determine service from endpoint or use default
    const service = this.extractService(endpoint);
    
    return this.request(service, url, {
      method: 'GET',
    });
  }

  /**
   * POST request through gateway
   */
  async post(endpoint, data) {
    const service = this.extractService(endpoint);
    
    return this.request(service, endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Extract service name from endpoint
   * This is a simple implementation - customize based on your gateway routing
   */
  extractService(endpoint) {
    if (endpoint.startsWith('/api/upload')) {
      return 'document-service';
    }
    // Add more service mappings as needed
    return 'default-service';
  }
}

export default GatewayClient;
