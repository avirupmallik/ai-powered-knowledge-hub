"""
Simple test script to verify the RAG pipeline setup.
"""

import asyncio
from pathlib import Path
from loguru import logger

from config.settings import settings
from src.ingestion.document_processor import DocumentProcessor
from src.ingestion.vector_store import VectorStore
from src.retrieval.retriever import Retriever
from src.generation.openai_generator import OpenAIGenerator
from src.rag_pipeline import RAGPipeline


async def test_pipeline():
    """Test the RAG pipeline with sample data."""
    
    logger.info("Starting RAG pipeline test")
    
    # Initialize components
    logger.info("Initializing components...")
    vector_store = VectorStore()
    retriever = Retriever(vector_store)
    generator = OpenAIGenerator()
    pipeline = RAGPipeline(retriever, generator)
    
    # Test 1: Check vector store stats
    logger.info("\n=== Test 1: Vector Store Stats ===")
    stats = vector_store.get_collection_stats()
    logger.info(f"Collection: {stats['collection_name']}")
    logger.info(f"Total documents: {stats['total_documents']}")
    
    # Test 2: Process a sample document (if exists)
    sample_docs = list(Path("./data/sample_documents").glob("*"))
    
    if sample_docs:
        logger.info("\n=== Test 2: Document Processing ===")
        processor = DocumentProcessor(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        for doc_path in sample_docs[:1]:  # Test with first document
            logger.info(f"Processing: {doc_path.name}")
            chunks = processor.process_file(doc_path)
            logger.info(f"Created {len(chunks)} chunks")
            
            # Add to vector store
            vector_store.add_documents(chunks)
            logger.info("Added to vector store")
    
    # Test 3: Query the pipeline
    if stats['total_documents'] > 0:
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
