# Architecture Overview

## Complete System Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              React UI (Port 5173)                   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Components:                                  │  │
│  │  - UploadPage                                 │  │
│  │  - FileUpload (drag & drop)                   │  │
│  │  - AnalysisPreview                            │  │
│  │  - Header, Footer                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Services:                                    │  │
│  │  - uploadService.js                           │  │
│  │  - documentsService.js (GraphQL)              │  │
│  │  - apiClient.js (routes to REST/GraphQL)      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ All requests to
                   │ http://localhost:8080
                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│      Spring Boot Gateway (Port 8080)                │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Routing Configuration:                       │  │
│  │                                               │  │
│  │  /api/upload/** → http://localhost:8082      │  │
│  │  /graphql/**    → http://localhost:8081      │  │
│  │                                               │  │
│  │  Features:                                    │  │
│  │  - CORS handling                              │  │
│  │  - Load balancing (future)                    │  │
│  │  - Authentication (future)                    │  │
│  │  - Rate limiting (future)                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└───────────┬─────────────────────────┬───────────────┘
            │                         │
            │                         │
            ▼                         ▼
┌───────────────────────┐   ┌────────────────────────┐
│                       │   │                        │
│  Upload Service       │   │  GraphQL Service       │
│  (REST - Port 8082)   │   │  (Port 8081)           │
│                       │   │                        │
│  POST /upload         │   │  POST /graphql         │
│                       │   │                        │
│  Accepts:             │   │  Schema:               │
│  - multipart/form-data│   │  - Query: documents    │
│  - PDF files          │   │  - Query: search       │
│                       │   │  - Mutation: delete    │
│  Returns:             │   │  - Mutation: update    │
│  - filename           │   │                        │
│  - summary            │   │  Types:                │
│  - key_terms[]        │   │  - Document            │
│  - qa_pairs[]         │   │  - KeyTerm             │
│                       │   │  - QAPair              │
└───────────────────────┘   └────────────────────────┘
```

## Request Flow Examples

### File Upload Flow

```
User drops PDF file
       ↓
FileUpload component (React)
       ↓
uploadService.uploadAndAnalyze(file)
       ↓
apiClient.uploadFile(file)
       ↓
restClient.uploadFile(file)
       ↓
POST http://localhost:8080/api/upload
       ↓
Spring Boot Gateway routes to
       ↓
POST http://localhost:8082/upload
       ↓
Upload Service processes PDF
       ↓
AI Analysis (summary, key terms, Q&A)
       ↓
Response returns through gateway
       ↓
AnalysisPreview component displays results
```

### Document Query Flow

```
User wants to see all documents
       ↓
documentsService.getAllDocuments()
       ↓
apiClient.graphqlQuery(query)
       ↓
graphqlClient.query(query)
       ↓
POST http://localhost:8080/graphql
       ↓
Spring Boot Gateway routes to
       ↓
POST http://localhost:8081/graphql
       ↓
GraphQL Service executes query
       ↓
Returns document list
       ↓
Response returns through gateway
       ↓
UI displays documents
```

## Technology Stack

### Frontend (React UI)
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **HTTP Client**: Fetch API / XMLHttpRequest
- **Styling**: CSS3 with custom properties

### Backend Gateway
- **Framework**: Spring Boot 3.x
- **Component**: Spring Cloud Gateway
- **Port**: 8080
- **Features**: Routing, CORS, Load Balancing

### Backend Services
- **Upload Service**: Spring Boot REST API (Port 8082)
- **GraphQL Service**: Spring Boot GraphQL (Port 8081)

## Configuration Summary

### Frontend (.env.local)
```env
VITE_GATEWAY_URL=http://localhost:8080
```

### Gateway (application.yml)
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

### Upload Service
- Port: 8082
- Endpoint: POST /upload
- Type: REST API

### GraphQL Service
- Port: 8081
- Endpoint: POST /graphql
- Type: GraphQL API

## Key Features

✅ **Single Gateway**: All requests through `http://localhost:8080`
✅ **Mixed Protocols**: REST for uploads, GraphQL for queries
✅ **Drag & Drop Upload**: User-friendly file upload
✅ **Progress Tracking**: Real-time upload progress
✅ **AI Analysis**: Automatic summary, key terms, Q&A generation
✅ **Responsive Design**: Works on mobile, tablet, desktop
✅ **Flexible Architecture**: Easy to extend and scale
✅ **Future-Proof**: Ready for authentication, analytics, etc.

## Development Workflow

1. **Start Backend Services**
   ```bash
   # Terminal 1: Upload Service
   cd upload-service && ./mvnw spring-boot:run
   
   # Terminal 2: GraphQL Service
   cd graphql-service && ./mvnw spring-boot:run
   
   # Terminal 3: Gateway
   cd gateway && ./mvnw spring-boot:run
   ```

2. **Start Frontend**
   ```bash
   # Terminal 4: React UI
   cd react-ui && npm run dev
   ```

3. **Access Application**
   - React UI: http://localhost:5173
   - Gateway: http://localhost:8080
   - Upload Service: http://localhost:8082
   - GraphQL Service: http://localhost:8081

## Next Steps

1. ✅ Frontend complete with gateway configuration
2. 📝 Implement Spring Boot Gateway routing
3. 📝 Implement Upload Service (REST)
4. 📝 Implement GraphQL Service
5. 📝 Test end-to-end flow
6. 📝 Add authentication
7. 📝 Deploy to production
