/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 * All requests go through Spring Boot Gateway
 */

const API_CONFIG = {
  // Spring Boot Gateway URL - single entry point for all APIs
  gateway: {
    baseURL: import.meta.env.VITE_GATEWAY_URL || 'https://ai-powered-knowledge-hub-api.fly.dev',
  },
  
  // Timeout settings
  timeout: 30000, // 30 seconds for file uploads
  
  // Service-specific configurations
  // Gateway routes to appropriate backend service (REST or GraphQL)
  services: {
    // Upload service - Gateway routes to REST endpoint
    upload: {
      type: 'rest',
      endpoint: '/api/upload',  // Gateway will route to upload service
    },
    // Document operations - Gateway routes to GraphQL endpoint
    documents: {
      type: 'graphql',
      endpoint: '/graphql',     // Gateway will route to GraphQL service
      query: 'getDocuments',
    },
    search: {
      type: 'graphql',
      endpoint: '/graphql',
      query: 'searchDocuments',
    },
    user: {
      type: 'graphql',
      endpoint: '/graphql',
      query: 'getUser',
    },
    analytics: {
      type: 'graphql',
      endpoint: '/graphql',
      query: 'getAnalytics',
    },
  },
};

export default API_CONFIG;
