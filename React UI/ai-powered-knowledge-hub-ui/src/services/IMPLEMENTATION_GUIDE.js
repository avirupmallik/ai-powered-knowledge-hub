// Example: Mixed REST and GraphQL API Configuration

/*
 * CONFIGURATION: The app uses BOTH REST and GraphQL simultaneously
 * 
 * .env.local file:
 * 
 * VITE_REST_BASE_URL=http://localhost:8080
 * VITE_GRAPHQL_URL=http://localhost:8080/graphql
 * VITE_GATEWAY_URL=http://localhost:8080
 * 
 * No need to choose! Upload uses REST, other services use GraphQL.
 */

/*
 * SERVICE CONFIGURATION: Each service defines its API type
 * 
 * Located in: src/config/apiConfig.js
 * 
 * services: {
 *   upload: {
 *     type: 'rest',           // File upload uses REST
 *     endpoint: '/api/upload',
 *   },
 *   documents: {
 *     type: 'graphql',        // Document queries use GraphQL
 *     query: 'getDocuments',
 *   },
 *   search: {
 *     type: 'graphql',        // Search uses GraphQL
 *     query: 'searchDocuments',
 *   },
 * }
 */

/*
 * HOW IT WORKS: Automatic client selection
 * 
 * The apiClient initializes ALL clients (REST, GraphQL, Gateway)
 * and automatically routes requests based on service configuration.
 * 
 * Example 1 - Upload (REST):
 *   uploadService.uploadAndAnalyze(file)
 *   → apiClient.uploadFile(file)
 *   → routes to restClient.uploadFile(file)
 *   → POST http://localhost:8080/api/upload
 * 
 * Example 2 - Get Documents (GraphQL):
 *   documentsService.getAllDocuments()
 *   → apiClient.graphqlQuery(query)
 *   → routes to graphqlClient.query(query)
 *   → POST http://localhost:8080/graphql
 */

// Example: Using REST for Upload

/*
 * Upload Service (REST)
 * File: src/services/uploadService.js
 * 
 * import uploadService from './services/uploadService';
 * 
 * const result = await uploadService.uploadAndAnalyze(file, (progress) => {
 *   console.log(`Upload: ${progress}%`);
 * });
 * 
 * Backend Endpoint:
 * POST http://localhost:8080/api/upload
 * Content-Type: multipart/form-data
 * Body: file=<binary>
 * 
 * Response: {
 *   filename: "doc.pdf",
 *   summary: "...",
 *   key_terms: [...],
 *   qa_pairs: [...]
 * }
 */

// Example: Using GraphQL for Other Services

/*
 * Documents Service (GraphQL)
 * File: src/services/documentsService.js
 * 
 * import documentsService from './services/documentsService';
 * 
 * // Get all documents
 * const documents = await documentsService.getAllDocuments();
 * 
 * // Get specific document
 * const doc = await documentsService.getDocumentById("123");
 * 
 * // Search documents
 * const results = await documentsService.searchDocuments("covid");
 * 
 * // Delete document
 * await documentsService.deleteDocument("123");
 * 
 * Backend Endpoint:
 * POST http://localhost:8080/graphql
 * Content-Type: application/json
 * Body: {
 *   query: "query GetDocuments { documents { id filename } }",
 *   variables: {}
 * }
 * 
 * Response: {
 *   data: {
 *     documents: [
 *       { id: "1", filename: "doc1.pdf", ... },
 *       { id: "2", filename: "doc2.pdf", ... }
 *     ]
 *   }
 * }
 */

// Example: Custom GraphQL Queries

/*
 * Using apiClient directly for custom queries
 * 
 * import apiClient from './services/api/apiClient';
 * 
 * // Custom query
 * const query = `
 *   query GetUserDocs($userId: ID!) {
 *     user(id: $userId) {
 *       documents { id filename }
 *     }
 *   }
 * `;
 * 
 * const result = await apiClient.graphqlQuery(query, { userId: "123" });
 * 
 * // Custom mutation
 * const mutation = `
 *   mutation UpdateDoc($id: ID!, $title: String!) {
 *     updateDocument(id: $id, input: { title: $title }) {
 *       id title
 *     }
 *   }
 * `;
 * 
 * const updated = await apiClient.graphqlMutation(mutation, {
 *   id: "123",
 *   title: "New Title"
 * });
 */

/*
 * Error Handling
 * 
 * All clients throw errors that are caught by service layers
 * and displayed in the UI
 * 
 * Error types:
 * - Validation errors (file type, size)
 * - Network errors (timeout, connection)
 * - Server errors (4xx, 5xx)
 * - Parse errors (invalid response)
 * - GraphQL errors (from errors array in response)
 */

/*
 * Progress Tracking
 * 
 * REST: Uses XMLHttpRequest for upload progress ✅
 * GraphQL: Uses XMLHttpRequest for file upload mutations ✅
 * 
 * Progress callback: (percentage) => void
 * Updates FileUpload component progress bar
 */

/*
 * Adding New Services
 * 
 * STEP 1: Add to apiConfig.js
 * 
 * services: {
 *   myNewService: {
 *     type: 'graphql',  // or 'rest' or 'gateway'
 *     query: 'myQuery', // GraphQL query/mutation name
 *   }
 * }
 * 
 * STEP 2: Create service file
 * 
 * // src/services/myNewService.js
 * import apiClient from './api/apiClient';
 * 
 * class MyNewService {
 *   async getData() {
 *     const query = `query MyQuery { data { id name } }`;
 *     const result = await apiClient.graphqlQuery(query);
 *     return result.data;
 *   }
 * }
 * 
 * export default new MyNewService();
 * 
 * STEP 3: Use in components
 * 
 * import myNewService from '../services/myNewService';
 * const data = await myNewService.getData();
 */

/*
 * Backend Requirements
 * 
 * REST Endpoint (for upload):
 * POST /api/upload
 * Accept: multipart/form-data
 * Response: { filename, summary, key_terms, qa_pairs }
 * 
 * GraphQL Endpoint (for other operations):
 * POST /graphql
 * Accept: application/json
 * Schema: Documents, Search, User queries/mutations
 * 
 * See MIXED_API_GUIDE.md for complete backend schema example
 */

export {};
