/**
 * GraphQL Client
 * Handles GraphQL API communication through Spring Boot Gateway
 */

import API_CONFIG from '../../config/apiConfig';

class GraphQLClient {
  constructor() {
    // GraphQL endpoint through gateway
    this.baseURL = API_CONFIG.gateway.baseURL;
    this.graphqlEndpoint = '/graphql';  // Gateway routes this to GraphQL service
    this.timeout = API_CONFIG.timeout;
  }

  get graphqlURL() {
    return `${this.baseURL}${this.graphqlEndpoint}`;
  }

  /**
   * Execute a GraphQL query
   */
  async query(query, variables = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.graphqlURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation
   */
  async mutation(mutation, variables = {}) {
    return this.query(mutation, variables);
  }

  /**
   * Upload file using GraphQL mutation
   * Note: File uploads in GraphQL require multipart/form-data
   */
  async uploadFile(file, onProgress) {
    // GraphQL file upload uses multipart/form-data with operations
    // See: https://github.com/jaydenseric/graphql-multipart-request-spec
    
    const operations = {
      query: `
        mutation UploadDocument($file: Upload!) {
          uploadDocument(file: $file) {
            filename
            summary
            keyTerms {
              term
              definition
            }
            qaPairs {
              question
              answer
            }
          }
        }
      `,
      variables: {
        file: null,
      },
    };

    const map = {
      '0': ['variables.file'],
    };

    const formData = new FormData();
    formData.append('operations', JSON.stringify(operations));
    formData.append('map', JSON.stringify(map));
    formData.append('0', file);

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
            if (response.errors) {
              reject(new Error(response.errors[0].message));
            } else {
              resolve(response.data.uploadDocument);
            }
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', this.graphqlURL);
      xhr.send(formData);
    });
  }

  /**
   * Generic GET-like operation (query)
   */
  async get(queryName, params) {
    // This is a helper to convert REST-style calls to GraphQL
    // You would need to map queryName to actual GraphQL queries
    console.warn('Using generic get() with GraphQL. Consider using query() directly.');
    return this.query(queryName, params);
  }

  /**
   * Generic POST-like operation (mutation)
   */
  async post(mutationName, data) {
    // This is a helper to convert REST-style calls to GraphQL
    // You would need to map mutationName to actual GraphQL mutations
    console.warn('Using generic post() with GraphQL. Consider using mutation() directly.');
    return this.mutation(mutationName, data);
  }
}

export default GraphQLClient;
