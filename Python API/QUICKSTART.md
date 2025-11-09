# AI Research Knowledge Hub - Quick Reference

## 🎯 Project Summary

A production-ready RAG pipeline using:
- **OpenAI GPT-4** for generation
- **OpenAI text-embedding-3-large** for embeddings (3072 dimensions)
- **Qdrant** vector database for semantic search
- **FastAPI** for REST API
- **Docker** for containerization

## 📁 Project Structure

```
AI Powerd Knowledge Hub/
├── config/
│   ├── __init__.py
│   └── settings.py              # Configuration management
├── src/
│   ├── __init__.py
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── document_processor.py   # PDF/DOCX/MD/TXT processing
│   │   └── vector_store.py         # Qdrant + OpenAI embeddings
│   ├── retrieval/
│   │   ├── __init__.py
│   │   └── retriever.py            # Context retrieval
│   ├── generation/
│   │   ├── __init__.py
│   │   └── openai_generator.py     # OpenAI GPT integration
│   └── rag_pipeline.py             # RAG orchestration
├── data/
│   ├── qdrant_storage/             # Qdrant DB files
│   ├── uploaded_documents/         # Document uploads
│   └── sample_documents/           # Test documents
├── main.py                         # FastAPI application
├── test_pipeline.py               # Testing script
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment template
├── Dockerfile                     # Container image
├── docker-compose.yml             # Multi-container setup
├── start.sh                       # Quick start script
└── README.md                      # Full documentation

## 🚀 Quick Start Commands

### Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env and add your OpenAI API key
nano .env  # or use your favorite editor
```

### Run with Docker
```bash
# Start Qdrant + API
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Run Locally
```bash
# Terminal 1: Start Qdrant
docker run -p 6333:6333 -v $(pwd)/data/qdrant_storage:/qdrant/storage qdrant/qdrant

# Terminal 2: Start API
python main.py

# Or use the quick start script
./start.sh
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) | `sk-proj-...` |
| `OPENAI_MODEL` | GPT model to use | `gpt-4-turbo-preview` |
| `OPENAI_EMBEDDING_MODEL` | Embedding model | `text-embedding-3-large` |
| `QDRANT_URL` | Qdrant server URL | `http://localhost:6333` |
| `RETRIEVAL_TOP_K` | Number of docs to retrieve | `5` |

## 📡 API Endpoints

### Upload Document
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@document.pdf"
```

### Query Knowledge Base
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the main findings?", "top_k": 5}'
```

### Stream Response
```bash
curl -X POST "http://localhost:8000/query/stream" \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain the methodology"}'
```

### Health Check
```bash
curl "http://localhost:8000/health"
```

### Get Statistics
```bash
curl "http://localhost:8000/stats"
```

## 🧪 Testing

```bash
# Run test pipeline
python test_pipeline.py

# Run unit tests
pytest
```

## 🐛 Troubleshooting

### Qdrant Connection Error
```bash
# Check if Qdrant is running
curl http://localhost:6333/health

# Restart Qdrant
docker restart qdrant
```

### Import Errors
```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### OpenAI API Errors
- Verify API key is correct in `.env`
- Check API quota/billing at platform.openai.com
- Ensure model name is correct

## 📚 Usage Examples

### Python Integration
```python
from src.rag_pipeline import RAGPipeline
from src.ingestion.vector_store import VectorStore
from src.retrieval.retriever import Retriever
from src.generation.openai_generator import OpenAIGenerator

# Initialize
vector_store = VectorStore()
retriever = Retriever(vector_store)
generator = OpenAIGenerator()
pipeline = RAGPipeline(retriever, generator)

# Query
result = pipeline.query("What is machine learning?", top_k=3)
print(result["answer"])
```

### Document Processing
```python
from pathlib import Path
from src.ingestion.document_processor import DocumentProcessor
from src.ingestion.vector_store import VectorStore

processor = DocumentProcessor(chunk_size=1000, chunk_overlap=200)
vector_store = VectorStore()

# Process and store
chunks = processor.process_file(Path("document.pdf"))
vector_store.add_documents(chunks)
```

## 🔧 Configuration Tips

### Adjust Chunk Size
Edit `.env`:
```
CHUNK_SIZE=1500
CHUNK_OVERLAP=300
```

### Use Different GPT Model
```
OPENAI_MODEL=gpt-4
```

### Adjust Retrieval
```
RETRIEVAL_TOP_K=10
```

## 📖 Documentation

- Full docs: `README.md`
- API docs: `http://localhost:8000/docs` (when running)
- Qdrant docs: https://qdrant.tech/documentation/
- OpenAI docs: https://platform.openai.com/docs

## 🎓 Next Steps

1. Add your own documents via `/upload` endpoint
2. Customize system prompts in `src/generation/openai_generator.py`
3. Implement authentication for production use
4. Add monitoring and logging
5. Scale with Qdrant Cloud for production

---

**Created**: November 2025
**Stack**: Python 3.13, FastAPI, OpenAI, Qdrant, Docker
