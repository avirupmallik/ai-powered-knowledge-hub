# KnowHub UI - AI Powered Knowledge Hub

A React-based UI for uploading and analyzing documents with AI-powered knowledge extraction.

## Features

- **Drag-and-Drop File Upload**: Upload PDF files with ease
- **Real-time Analysis**: Get instant summaries, key terms, and Q&A pairs
- **Flexible API Architecture**: Supports REST, GraphQL, and API Gateway
- **Responsive Design**: Works on all devices
- **Progress Tracking**: Visual feedback during upload and processing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your API configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## API Configuration

The application supports multiple API types through a flexible architecture:

### REST API (Default)

```env
VITE_API_TYPE=rest
VITE_API_BASE_URL=http://localhost:8080
```

### GraphQL (Future)

```env
VITE_API_TYPE=graphql
VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

### API Gateway (Future)

```env
VITE_API_TYPE=gateway
VITE_GATEWAY_URL=http://localhost:8080
```

## API Response Structure

The upload endpoint returns the following structure:

```json
{
  "filename": "document.pdf",
  "summary": "Summary of the document...",
  "key_terms": [
    {
      "term": "Term Name",
      "definition": "Definition of the term..."
    }
  ],
  "qa_pairs": [
    {
      "question": "Sample question?",
      "answer": "Sample answer."
    }
  ]
}
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── FileUpload.jsx
│   └── AnalysisPreview.jsx
├── pages/              # Page components
│   └── UploadPage.jsx
├── services/           # Business logic
│   ├── api/           # API clients
│   │   ├── apiClient.js      # Factory pattern for API selection
│   │   └── restClient.js     # REST API implementation
│   └── uploadService.js
├── config/            # Configuration files
│   └── apiConfig.js
├── App.jsx
└── main.jsx
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] GraphQL API client implementation
- [ ] API Gateway integration
- [ ] User authentication
- [ ] Document history
- [ ] Advanced search and filtering
- [ ] Export functionality

## Technologies

- React 19
- Vite
- CSS3 with custom properties
- Fetch API / XMLHttpRequest

## License

MIT
