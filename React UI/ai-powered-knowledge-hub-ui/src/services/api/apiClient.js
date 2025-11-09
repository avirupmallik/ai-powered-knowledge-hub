/**
 * API Client - Multi-Protocol Support
 * Supports both REST and GraphQL APIs simultaneously
 * Routes requests to appropriate client based on service configuration
 */

import API_CONFIG from '../../config/apiConfig';
import RestClient from './restClient';
import GraphQLClient from './graphqlClient';
import GatewayClient from './gatewayClient';

class ApiClient {
  constructor() {
    // Initialize all clients
    this.restClient = new RestClient();
    this.graphqlClient = new GraphQLClient();
    this.gatewayClient = new GatewayClient();
  }

  /**
   * Get the appropriate client for a service
   * @param {string} serviceName - Name of the service from API_CONFIG.services
   * @returns {Object} The appropriate API client
   */
  getClientForService(serviceName) {
    const serviceConfig = API_CONFIG.services[serviceName];
    
    if (!serviceConfig) {
      console.warn(`Service ${serviceName} not found in config, defaulting to REST`);
      return this.restClient;
    }

    switch (serviceConfig.type) {
      case 'rest':
        return this.restClient;
      case 'graphql':
        return this.graphqlClient;
      case 'gateway':
        return this.gatewayClient;
      default:
        console.warn(`Unknown API type: ${serviceConfig.type}, defaulting to REST`);
        return this.restClient;
    }
  }

  /**
   * Upload file to the server (uses REST API)
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Callback for upload progress
   * @returns {Promise<Object>} - Analysis result
   */
  async uploadFile(file, onProgress) {
    // Upload service always uses REST as per configuration
    const client = this.getClientForService('upload');
    const serviceConfig = API_CONFIG.services.upload;
    
    if (serviceConfig.type === 'rest') {
      return client.uploadFile(file, onProgress);
    } else {
      // Fallback for other types if needed
      return client.uploadFile(file, onProgress);
    }
  }

  /**
   * Generic request to a service
   * @param {string} serviceName - Service name from config
   * @param {Object} params - Request parameters/variables
   * @returns {Promise<Object>}
   */
  async request(serviceName, params = {}) {
    const client = this.getClientForService(serviceName);
    const serviceConfig = API_CONFIG.services[serviceName];

    if (serviceConfig.type === 'rest') {
      return client.get(serviceConfig.endpoint, params);
    } else if (serviceConfig.type === 'graphql') {
      // GraphQL uses query/mutation
      return client.query(serviceConfig.query, params);
    } else if (serviceConfig.type === 'gateway') {
      return client.get(serviceConfig.endpoint, params);
    }
  }

  /**
   * Generic GET request (REST-style, will be converted for GraphQL)
   * @param {string} serviceName - Service name from config
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>}
   */
  async get(serviceName, params) {
    return this.request(serviceName, params);
  }

  /**
   * Generic POST request (REST-style, will be converted for GraphQL)
   * @param {string} serviceName - Service name from config
   * @param {Object} data - Request body
   * @returns {Promise<Object>}
   */
  async post(serviceName, data) {
    const client = this.getClientForService(serviceName);
    const serviceConfig = API_CONFIG.services[serviceName];

    if (serviceConfig.type === 'rest') {
      return client.post(serviceConfig.endpoint, data);
    } else if (serviceConfig.type === 'graphql') {
      // GraphQL uses mutation
      return client.mutation(serviceConfig.mutation || serviceConfig.query, data);
    } else if (serviceConfig.type === 'gateway') {
      return client.post(serviceConfig.endpoint, data);
    }
  }

  /**
   * Direct GraphQL query (for advanced use)
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>}
   */
  async graphqlQuery(query, variables) {
    return this.graphqlClient.query(query, variables);
  }

  /**
   * Direct GraphQL mutation (for advanced use)
   * @param {string} mutation - GraphQL mutation string
   * @param {Object} variables - Mutation variables
   * @returns {Promise<Object>}
   */
  async graphqlMutation(mutation, variables) {
    return this.graphqlClient.mutation(mutation, variables);
  }
}

// Export singleton instance
export default new ApiClient();
