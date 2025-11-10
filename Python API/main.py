"""
FastAPI application for RAG-enabled AI Research Knowledge Hub.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import asyncio
from pathlib import Path
import shutil
from loguru import logger

from config.settings import settings
from src.ingestion.langchain_processor import LangChainDocumentProcessor
from src.ingestion.langchain_vector_store import LangChainVectorStore
from src.retrieval.retriever import Retriever
from src.generation.openai_generator import OpenAIGenerator
from src.rag_pipeline import RAGPipeline


# Initialize FastAPI app
app = FastAPI(
    title="AI Research Knowledge Hub",
    description="RAG-enabled AI pipeline with OpenAI GPT, LangChain, and Qdrant",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LangChain components
vector_store = LangChainVectorStore()
retriever = Retriever(vector_store)
generator = OpenAIGenerator()
rag_pipeline = RAGPipeline(retriever, generator)
document_processor = LangChainDocumentProcessor(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap
)


# Request/Response Models
class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = None
    system_prompt: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "What is machine learning?",
                "top_k": 5,
                "system_prompt": None
            }
        }


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[dict]
    model: str
    usage: dict
    num_sources: int


class UploadResponse(BaseModel):
    filename: str
    chunks_created: int
    status: str
    summary: str
    key_terms: List[dict]
    qa_pairs: List[dict]
    duplicate: Optional[bool] = False


class StatsResponse(BaseModel):
    total_documents: int
    collection_name: str


# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI Research Knowledge Hub - RAG API",
        "version": "1.0.0",
        "endpoints": {
            "query": "/query",
            "query_stream": "/query/stream",
            "upload": "/upload",
            "stats": "/stats",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Get collection info from Qdrant client
        collection_info = vector_store.client.get_collection(vector_store.collection_name)
        return {
            "status": "healthy",
            "vector_store": "connected",
            "collection": vector_store.collection_name,
            "documents": collection_info.points_count if collection_info else 0
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Query the knowledge base and get an AI-generated answer.
    
    Args:
        request: Query request with question and optional parameters
        
    Returns:
        AI-generated answer with sources
    """
    try:
        logger.info(f"Received query: {request.question}")
        
        # Validate top_k
        top_k = request.top_k
        if top_k is not None and top_k <= 0:
            raise HTTPException(status_code=400, detail="top_k must be greater than 0")
        
        result = rag_pipeline.query(
            question=request.question,
            top_k=top_k,
            system_prompt=request.system_prompt
        )
        
        return QueryResponse(**result)
    
    except Exception as e:
        logger.error(f"Query error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query/stream")
async def query_stream(request: QueryRequest):
    """
    Query the knowledge base with streaming response.
    
    Args:
        request: Query request with question and optional parameters
        
    Returns:
        Streaming response
    """
    try:
        logger.info(f"Received streaming query: {request.question}")
        
        async def generate():
            for chunk in rag_pipeline.query_streaming(
                question=request.question,
                top_k=request.top_k,
                system_prompt=request.system_prompt
            ):
                yield chunk
                await asyncio.sleep(0.01)  # Small delay for streaming
        
        return StreamingResponse(generate(), media_type="text/plain")
    
    except Exception as e:
        logger.error(f"Streaming query error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload and process a document with instant analysis.
    Extracts summaries, key terms, and generates Q&A.
    Vector embeddings are generated in the background.
    Files are processed in memory without saving to disk.
    
    Args:
        file: Document file (PDF, TXT, MD, DOCX)
        
    Returns:
        Upload status with summary, key terms, and Q&A pairs
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.txt', '.md', '.docx']
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {allowed_extensions}"
            )
        
        logger.info(f"Processing uploaded file: {file.filename}")
        
        # Read file content into memory
        file_content = await file.read()
        
        # Process document from bytes (no disk I/O)
        chunks = document_processor.process_upload(file.filename, file_content)
        
        # Check if document already exists
        doc_id = chunks[0]["metadata"]["doc_id"] if chunks else None
        is_duplicate = False
        
        if doc_id and vector_store.check_document_exists(doc_id):
            is_duplicate = True
            logger.info(f"Duplicate document detected: {file.filename} (doc_id: {doc_id})")
        
        # Extract sample text for quick analysis (first 5000 chars for speed)
        sample_text = " ".join([chunk["text"] for chunk in chunks[:5]])[:5000]
        
        # Analyze document for summary, key terms, and Q&A (fast, uses sample)
        logger.info(f"Analyzing document: {file.filename}")
        analysis = generator.analyze_document(sample_text, max_text_length=5000)
        
        # Add to vector store in background (will skip if duplicate)
        background_tasks.add_task(vector_store.add_documents, chunks)
        
        if is_duplicate:
            logger.info(f"Document {file.filename} already exists, skipping vector insertion")
        else:
            logger.info(f"Queued {len(chunks)} chunks for background processing from {file.filename}")
        
        return UploadResponse(
            filename=file.filename,
            chunks_created=len(chunks),
            status="duplicate" if is_duplicate else "processing",
            summary=analysis["summary"],
            key_terms=analysis["key_terms"],
            qa_pairs=analysis["qa_pairs"],
            duplicate=is_duplicate
        )
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get statistics about the knowledge base."""
    try:
        collection_info = vector_store.client.get_collection(vector_store.collection_name)
        stats = {
            "total_documents": collection_info.points_count,
            "total_chunks": collection_info.points_count,
            "collection_name": vector_store.collection_name
        }
        return StatsResponse(**stats)
    
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """
    Delete a document from the knowledge base.
    
    Args:
        doc_id: Document ID to delete
        
    Returns:
        Deletion status
    """
    try:
        vector_store.delete_documents(doc_id)
        return {"status": "success", "doc_id": doc_id}
    
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting API server on {settings.api_host}:{settings.api_port}")
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
