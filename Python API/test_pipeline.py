"""
Simple test script to verify the RAG pipeline setup with LangChain.
"""

import asyncio
from pathlib import Path
from loguru import logger

from config.settings import settings
from src.ingestion.langchain_processor import LangChainDocumentProcessor
from src.ingestion.langchain_vector_store import LangChainVectorStore
from src.retrieval.retriever import Retriever
from src.generation.openai_generator import OpenAIGenerator
from src.rag_pipeline import RAGPipeline


async def test_pipeline():
    """Test the RAG pipeline with sample data."""
    
    logger.info("Starting RAG pipeline test with LangChain")
    
    # Initialize components
    logger.info("Initializing LangChain components...")
    vector_store = LangChainVectorStore()
    retriever = Retriever(vector_store)
    generator = OpenAIGenerator()
    pipeline = RAGPipeline(retriever, generator)
    
    # Test 1: Check vector store stats
    logger.info("\n=== Test 1: Vector Store Stats ===")
    stats = vector_store.client.get_collection(settings.qdrant_collection_name)
    logger.info(f"Collection: {settings.qdrant_collection_name}")
    logger.info(f"Total documents: {stats.points_count if stats else 0}")
    
    # Test 2: Process a sample document (if exists)
    sample_docs = list(Path("./data/sample_documents").glob("*.md"))
    
    if sample_docs:
        logger.info("\n=== Test 2: Document Processing ===")
        processor = LangChainDocumentProcessor(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        for doc_path in sample_docs[:1]:  # Test with first document
            logger.info(f"Processing: {doc_path.name}")
            with open(doc_path, 'rb') as f:
                file_content = f.read()
            
            chunks = processor.process_upload(doc_path.name, file_content)
            logger.info(f"Created {len(chunks)} chunks")
            
            # Add to vector store
            vector_store.add_documents(chunks)
            logger.info("Added to vector store")
    
    # Test 3: Query the pipeline
    stats = vector_store.client.get_collection(settings.qdrant_collection_name)
    if stats and stats.points_count > 0:
        logger.info("\n=== Test 3: RAG Query ===")
        test_question = "What is the main topic discussed in the documents?"
        
        logger.info(f"Question: {test_question}")
        result = pipeline.query(test_question, top_k=3)
        
        logger.info(f"\nAnswer: {result['answer']}")
        logger.info(f"\nSources used: {result['num_sources']}")
        logger.info(f"Model: {result['model']}")
        logger.info(f"Tokens used: {result['usage']}")
    else:
        logger.warning("No documents in vector store. Add documents to test queries.")
    
    logger.info("\n=== Test Complete ===")


if __name__ == "__main__":
    asyncio.run(test_pipeline())
