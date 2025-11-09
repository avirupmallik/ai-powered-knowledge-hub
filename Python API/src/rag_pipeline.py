"""
RAG Pipeline orchestrator that combines retrieval and generation.
"""

from typing import Dict, Any, Optional
from loguru import logger
from src.retrieval.retriever import Retriever
from src.generation.openai_generator import OpenAIGenerator


class RAGPipeline:
    """Orchestrates the RAG pipeline: retrieval + generation."""
    
    def __init__(self, retriever: Retriever, generator: OpenAIGenerator):
        """
        Initialize RAG pipeline.
        
        Args:
            retriever: Retriever instance
            generator: OpenAIGenerator instance
        """
        self.retriever = retriever
        self.generator = generator
        logger.info("RAG Pipeline initialized")
    
    def query(
        self,
        question: str,
        top_k: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute RAG pipeline: retrieve context and generate answer.
        
        Args:
            question: User question
            top_k: Number of documents to retrieve
            system_prompt: Optional system prompt override
            
        Returns:
            Dict with answer, sources, and metadata
        """
        logger.info(f"Processing RAG query: '{question[:100]}...'")
        
        # Step 1: Retrieve relevant context
        context = self.retriever.get_context_for_generation(
            query=question,
            top_k=top_k
        )
        
        # Step 2: Retrieve raw documents for source information
        documents = self.retriever.retrieve(question, top_k)
        
        # Step 3: Generate answer using OpenAI
        response = self.generator.generate(
            query=question,
            context=context,
            system_prompt=system_prompt
        )
        
        # Step 4: Compile sources
        sources = [
            {
                "filename": doc['metadata'].get('filename', 'Unknown'),
                "source": doc['metadata'].get('source', 'Unknown'),
                "chunk_index": doc['metadata'].get('chunk_index', 0),
                "relevance_score": doc.get('score', 0)
            }
            for doc in documents
        ]
        
        return {
            "question": question,
            "answer": response["answer"],
            "sources": sources,
            "model": response["model"],
            "usage": response["usage"],
            "num_sources": len(sources)
        }
    
    def query_streaming(
        self,
        question: str,
        top_k: Optional[int] = None,
        system_prompt: Optional[str] = None
    ):
        """
        Execute RAG pipeline with streaming response.
        
        Args:
            question: User question
            top_k: Number of documents to retrieve
            system_prompt: Optional system prompt override
            
        Yields:
            Text chunks from streaming response
        """
        logger.info(f"Processing streaming RAG query: '{question[:100]}...'")
        
        # Retrieve context
        context = self.retriever.get_context_for_generation(
            query=question,
            top_k=top_k
        )
        
        # Stream generation
        yield from self.generator.generate_streaming(
            query=question,
            context=context,
            system_prompt=system_prompt
        )
