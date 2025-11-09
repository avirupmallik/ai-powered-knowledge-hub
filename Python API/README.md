# AI Research Knowledge Hub

A production-ready RAG (Retrieval-Augmented Generation) pipeline with Qdrant vector database and OpenAI GPT for building an AI Research Knowledge Hub.

## Features

- 🤖 **OpenAI GPT Integration**: Powered by OpenAI's GPT-4 models
- 📚 **Qdrant Vector Database**: High-performance vector similarity search
- � **OpenAI Embeddings**: State-of-the-art text-embedding-3-large embeddings
- �📄 **Multi-Format Support**: Process PDF, TXT, MD, and DOCX files
-  **REST API**: FastAPI-based API with streaming support
- 🐳 **Docker Ready**: Containerized deployment with Qdrant
- 📊 **Modular Architecture**: Clean separation of concerns

## Architecture

```
├── config/              # Configuration and settings
├── src/
│   ├── ingestion/      # Document processing and vector storage
│   ├── retrieval/      # Context retrieval
│   ├── generation/     # LLM response generation (OpenAI)
│   └── rag_pipeline.py # RAG orchestration
├── data/
│   ├── qdrant_storage/ # Qdrant vector database storage
│   └── uploaded_documents/
├── main.py             # FastAPI application
└── test_pipeline.py    # Testing utilities
```

## Prerequisites

- Python 3.11+
- OpenAI API key
- Docker and Docker Compose (for containerized deployment)
- 4GB+ RAM recommended

## Quick Start

### 1. Clone and Setup

```bash
cd "/Users/avirupmallik/Developer/AI Project/AI Powerd Knowledge Hub"
python -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
```

### 2. Start Qdrant (Local Development)

Using Docker:
```bash
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/data/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

### 3. Configure Environment

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=your_actual_api_key_here
QDRANT_URL=http://localhost:6333
```

### 4. Run the API Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 5. API Documentation

Open `http://localhost:8000/docs` for interactive Swagger documentation.

## Usage

### Upload Documents

```bash
curl -X POST "http://localhost:8000/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_document.pdf"
```

### Query the Knowledge Base

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the main findings?",
    "top_k": 5
  }'
```

### Streaming Query

```bash
curl -X POST "http://localhost:8000/query/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the methodology",
    "top_k": 3
  }'
```

### Get Statistics

```bash
curl "http://localhost:8000/stats"
```

## Python API Usage

```python
from src.ingestion.vector_store import VectorStore
from src.retrieval.retriever import Retriever
from src.generation.openai_generator import OpenAIGenerator
from src.rag_pipeline import RAGPipeline

# Initialize components
vector_store = VectorStore()
retriever = Retriever(vector_store)
generator = OpenAIGenerator()
pipeline = RAGPipeline(retriever, generator)

# Query the knowledge base
result = pipeline.query(
    question="What is the main topic?",
    top_k=5
)

print(result["answer"])
print(f"Sources: {result['sources']}")
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will start both Qdrant and the RAG API service.

### Stop

```bash
docker-compose down
```

## Configuration

All settings are in `config/settings.py` and can be overridden via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model version | gpt-4-turbo-preview |
| `OPENAI_EMBEDDING_MODEL` | Embedding model | text-embedding-3-large |
| `OPENAI_MAX_TOKENS` | Max tokens for response | 4096 |
| `OPENAI_TEMPERATURE` | Response temperature | 0.7 |
| `QDRANT_URL` | Qdrant server URL | http://localhost:6333 |
| `QDRANT_COLLECTION_NAME` | Collection name | ai_research_knowledge |
| `QDRANT_VECTOR_SIZE` | Vector dimensions | 3072 |
| `RETRIEVAL_TOP_K` | Number of docs to retrieve | 5 |
| `CHUNK_SIZE` | Document chunk size | 1000 |
| `CHUNK_OVERLAP` | Chunk overlap | 200 |

## Testing

Run the test pipeline:

```bash
python test_pipeline.py
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /query` - Query with full response
- `POST /query/stream` - Query with streaming response
- `POST /upload` - Upload and process document
- `GET /stats` - Get knowledge base statistics
- `DELETE /documents/{doc_id}` - Delete document

## Project Structure

```
.
├── config/
│   ├── __init__.py
│   └── settings.py           # Configuration management
├── src/
│   ├── __init__.py
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── document_processor.py  # Document parsing
│   │   └── vector_store.py        # ChromaDB integration
│   ├── retrieval/
│   │   ├── __init__.py
│   │   └── retriever.py           # Context retrieval
│   ├── generation/
│   │   ├── __init__.py
│   │   └── claude_generator.py    # Claude integration
│   └── rag_pipeline.py            # RAG orchestration
├── data/
│   ├── chroma_db/                 # Vector DB storage
│   └── uploaded_documents/        # Uploaded files
├── logs/                          # Application logs
├── main.py                        # FastAPI app
├── test_pipeline.py              # Testing
├── requirements.txt              # Dependencies
├── Dockerfile                    # Docker image
├── docker-compose.yml            # Docker orchestration
├── .env.example                  # Environment template
└── README.md                     # This file
```

## Technologies

- **FastAPI**: Modern web framework
- **ChromaDB**: Vector database for embeddings
- **Anthropic Claude**: LLM for generation
- **sentence-transformers**: Text embeddings
- **PyPDF2/python-docx**: Document processing
- **Pydantic**: Data validation
- **Loguru**: Logging

## Development

### Adding New Document Types

Extend `DocumentProcessor` in `src/ingestion/document_processor.py`:

```python
def _extract_custom_format(self, file_path: Path) -> str:
    # Your extraction logic
    return text
```

### Customizing RAG Behavior

Modify the system prompt in `src/generation/claude_generator.py` or pass a custom prompt:

```python
result = pipeline.query(
    question="Your question",
    system_prompt="Your custom system prompt"
)
```

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.

---

**Note**: Ensure you have a valid OpenAI API key. The text-embedding-3-large model provides 3072-dimensional embeddings for high-quality semantic search.
