"""
Retrieval module for finding relevant documents.
"""

from typing import List, Dict, Any, Optional
from loguru import logger
from src.ingestion.vector_store import VectorStore


class Retriever:
    """Handles document retrieval from vector store."""
    
    def __init__(self, vector_store: VectorStore):
        """
        Initialize retriever with vector store.
        
        Args:
            vector_store: VectorStore instance
        """
        self.vector_store = vector_store
        logger.info("Retriever initialized")
    
    def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query.
        
        Args:
            query: Search query
            top_k: Number of documents to retrieve
            filter_metadata: Optional metadata filters
            
        Returns:
            List of relevant documents with metadata and scores
        """
        logger.info(f"Retrieving documents for query: '{query[:100]}...'")
        
        results = self.vector_store.query(
            query_text=query,
            top_k=top_k,
            filter_metadata=filter_metadata
        )
        
        return results
    
    def get_context_for_generation(
        self,
        query: str,
        top_k: Optional[int] = None
    ) -> str:
        """
        Retrieve and format context for LLM generation.
        
        Args:
            query: User query
            top_k: Number of documents to retrieve
            
        Returns:
            Formatted context string
        """
        documents = self.retrieve(query, top_k)
        
        if not documents:
            return "No relevant documents found in the knowledge base."
        
        # Format context
        context_parts = []
        for idx, doc in enumerate(documents, 1):
            source = doc['metadata'].get('filename', 'Unknown')
            text = doc['text']
            score = doc.get('score', 0)
            context_parts.append(
                f"[Document {idx} - {source} (Relevance: {score:.2f})]\n{text}\n"
            )
        
        return "\n---\n".join(context_parts)
