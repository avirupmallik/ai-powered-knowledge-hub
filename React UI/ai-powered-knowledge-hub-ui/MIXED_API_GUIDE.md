# Mixed API Architecture Guide

## Overview

This application uses **both REST and GraphQL APIs** routed through a **single Spring Boot Gateway**:
- **REST API**: Used for file uploads (multipart/form-data)
- **GraphQL API**: Used for all other operations (queries, mutations)
- **Spring Boot Gateway**: Single entry point at `http://localhost:8080`

```
React UI → Spring Boot Gateway → { Upload Service (REST)
                                  { GraphQL Service
```

## Configuration

### Environment Variables (.env.local)

```env
# Single Gateway URL - all requests go through here
VITE_GATEWAY_URL=http://localhost:8080
```

**That's it!** No need for separate REST or GraphQL URLs. The gateway handles routing.

### Service Configuration (src/config/apiConfig.js)

Each service is configured with its API type. The gateway routes to the appropriate backend:

```javascript
const API_CONFIG = {
  gateway: {
    baseURL: 'http://localhost:8080',  // Spring Boot Gateway
  },
  services: {
    upload: {
      type: 'rest',
      endpoint: '/api/upload',    // Gateway → Upload Service (REST)
    },
    documents: {
      type: 'graphql',
      endpoint: '/graphql',       // Gateway → GraphQL Service
    },
  },
};
```

## How It Works

### Request Flow

```
1. React UI makes request
2. All requests go to http://localhost:8080 (Gateway)
3. Gateway routes based on path:
   - /api/upload → Upload Service (REST)
   - /graphql → GraphQL Service
4. Backend service processes request
5. Response returns through gateway to React UI
```

### 1. Upload Service (REST through Gateway)

**File**: `src/services/uploadService.js`

```javascript
// Uses REST API through gateway
const result = await uploadService.uploadAndAnalyze(file, onProgress);
```

**Request Flow:**
```
React UI → http://localhost:8080/api/upload
Gateway  → http://localhost:8082/upload (Upload Service)
```

**HTTP Request to Gateway:**
```
POST http://localhost:8080/api/upload
Content-Type: multipart/form-data
Body: file=<binary>
```

### 2. Documents Service (GraphQL through Gateway)

**File**: `src/services/documentsService.js`

```javascript
// Uses GraphQL API through gateway
const documents = await documentsService.getAllDocuments();
const document = await documentsService.getDocumentById(id);
const results = await documentsService.searchDocuments(term);
```

**Request Flow:**
```
React UI → http://localhost:8080/graphql
Gateway  → http://localhost:8081/graphql (GraphQL Service)
```

**HTTP Request to Gateway:**
```
POST http://localhost:8080/graphql
Content-Type: application/json
Body: {
  query: "query GetDocuments { ... }",
  variables: {}
}
```

## API Client Architecture

### Multi-Client Setup

The `apiClient` initializes **all** clients at once:

```javascript
class ApiClient {
  constructor() {
    this.restClient = new RestClient();       // REST client
    this.graphqlClient = new GraphQLClient(); // GraphQL client
    this.gatewayClient = new GatewayClient(); // Gateway client
  }
}
```

### Automatic Routing

The client automatically routes requests based on service configuration:

```javascript
async uploadFile(file, onProgress) {
  // Automatically uses REST for upload
  const client = this.getClientForService('upload');
  return client.uploadFile(file, onProgress);
}

async graphqlQuery(query, variables) {
  // Directly uses GraphQL client
  return this.graphqlClient.query(query, variables);
}
```

## Usage Examples

### Example 1: Upload a Document (REST)

```javascript
import uploadService from './services/uploadService';

const handleUpload = async (file) => {
  try {
    const result = await uploadService.uploadAndAnalyze(file, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    
    console.log('Analysis:', result);
    // {
    //   filename: "doc.pdf",
    //   summary: "...",
    //   key_terms: [...],
    //   qa_pairs: [...]
    // }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Example 2: Fetch Documents (GraphQL)

```javascript
import documentsService from './services/documentsService';

const loadDocuments = async () => {
  try {
    const documents = await documentsService.getAllDocuments();
    console.log('Documents:', documents);
    // [
    //   { id: "1", filename: "doc1.pdf", summary: "..." },
    //   { id: "2", filename: "doc2.pdf", summary: "..." }
    // ]
  } catch (error) {
    console.error('Failed to load documents:', error);
  }
};
```

### Example 3: Search Documents (GraphQL)

```javascript
import documentsService from './services/documentsService';

const searchDocs = async (term) => {
  try {
    const results = await documentsService.searchDocuments(term);
    console.log('Search results:', results);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### Example 4: Custom GraphQL Query

```javascript
import apiClient from './services/api/apiClient';

const customQuery = async () => {
  const query = `
    query GetUserDocuments($userId: ID!) {
      user(id: $userId) {
        documents {
          id
          filename
          uploadedAt
        }
      }
    }
  `;
  
  try {
    const result = await apiClient.graphqlQuery(query, { userId: "123" });
    console.log('User documents:', result.user.documents);
  } catch (error) {
    console.error('Query failed:', error);
  }
};
```

## Backend Requirements

### Spring Boot Gateway (Port 8080)

Your gateway needs to route:
- `/api/upload` → Upload Service
- `/graphql` → GraphQL Service

**application.yml:**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: upload-service
          uri: http://localhost:8082
          predicates:
            - Path=/api/upload/**
        - id: graphql-service
          uri: http://localhost:8081
          predicates:
            - Path=/graphql/**
```

See `SPRING_BOOT_GATEWAY_GUIDE.md` for complete gateway configuration.

### Upload Service (Port 8082)

REST endpoint for file upload:

```
POST /upload
Accept: multipart/form-data
Parameter: file (binary)

Response: {
  filename: string,
  summary: string,
  key_terms: Array<{term, definition}>,
  qa_pairs: Array<{question, answer}>
}
```

### GraphQL Service (Port 8081)

GraphQL endpoint:

```
POST /graphql
Accept: application/json

Schema should include:
- Query: documents, document(id), searchDocuments(term)
- Mutation: deleteDocument(id), updateDocument(id, input)
- Types: Document, KeyTerm, QAPair
```

**Example GraphQL Schema**:

```graphql
type Document {
  id: ID!
  filename: String!
  summary: String!
  keyTerms: [KeyTerm!]!
  qaPairs: [QAPair!]!
  uploadedAt: DateTime!
  status: String!
}

type KeyTerm {
  term: String!
  definition: String!
}

type QAPair {
  question: String!
  answer: String!
}

type Query {
  documents: [Document!]!
  document(id: ID!): Document
  searchDocuments(term: String!): [Document!]!
}

type Mutation {
  deleteDocument(id: ID!): DeleteResult!
  updateDocument(id: ID!, input: DocumentUpdateInput!): Document!
}

input DocumentUpdateInput {
  filename: String
  summary: String
}

type DeleteResult {
  success: Boolean!
  message: String
}
```

## Adding New Services

### Step 1: Add to apiConfig.js

```javascript
services: {
  // ... existing services
  analytics: {
    type: 'graphql',
    query: 'getAnalytics',
  },
}
```

### Step 2: Create Service File

```javascript
// src/services/analyticsService.js
import apiClient from './api/apiClient';

class AnalyticsService {
  async getAnalytics() {
    const query = `
      query GetAnalytics {
        analytics {
          totalDocuments
          totalQueries
          popularTopics
        }
      }
    `;
    
    const result = await apiClient.graphqlQuery(query);
    return result.analytics;
  }
}

export default new AnalyticsService();
```

### Step 3: Use in Components

```javascript
import analyticsService from '../services/analyticsService';

const analytics = await analyticsService.getAnalytics();
```

## Benefits of This Architecture

1. **Best of Both Worlds**
   - Use REST for file uploads (standard multipart/form-data)
   - Use GraphQL for data queries (efficient, flexible)

2. **Type Safety**
   - Each service clearly defines its API type
   - No confusion about which protocol to use

3. **Easy to Extend**
   - Add new services by updating config
   - Mix REST, GraphQL, and Gateway as needed

4. **Maintainable**
   - Clear separation of concerns
   - Each client handles one protocol
   - Services abstract the complexity

5. **Future-Proof**
   - Easy to migrate services between protocols
   - Support for API Gateway ready
   - No breaking changes needed

## Testing

```bash
# Start dev server
npm run dev

# Test REST upload
# Upload a PDF through the UI at http://localhost:5173

# Test GraphQL queries (when backend is ready)
# Use documentsService methods
```

## Troubleshooting

### Issue: "Upload uses wrong API"
**Solution**: Check `apiConfig.js` - upload service should have `type: 'rest'`

### Issue: "GraphQL queries fail"
**Solution**: Verify `VITE_GRAPHQL_URL` in `.env.local` points to your GraphQL endpoint

### Issue: "CORS errors"
**Solution**: Ensure backend allows requests from `http://localhost:5173` for both REST and GraphQL endpoints

### Issue: "File upload progress not working"
**Solution**: REST client uses XMLHttpRequest for progress tracking - ensure it's not blocked

## Next Steps

1. ✅ REST upload is configured and working
2. ✅ GraphQL client is ready to use
3. 📝 Implement backend GraphQL schema
4. 📝 Test documentsService methods
5. 📝 Add more GraphQL queries/mutations
6. 📝 Build UI components for document management
