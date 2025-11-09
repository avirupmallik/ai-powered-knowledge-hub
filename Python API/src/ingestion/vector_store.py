"""
Vector store manager for Qdrant integration.
Handles embedding storage and retrieval using OpenAI embeddings.
"""

from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from openai import OpenAI
from loguru import logger
from config.settings import settings
import uuid


class VectorStore:
    """Manages Qdrant vector store for document embeddings."""
    
    def __init__(self):
        """Initialize Qdrant client and OpenAI for embeddings."""
        logger.info("Initializing Qdrant vector store")
        
        # Initialize Qdrant client
        # Try to connect to Qdrant server, fallback to in-memory if unavailable
        try:
            if settings.qdrant_api_key:
                self.client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key,
                    timeout=5
                )
            else:
                self.client = QdrantClient(url=settings.qdrant_url, timeout=5)
            # Test connection
            self.client.get_collections()
            logger.info(f"Connected to Qdrant at {settings.qdrant_url}")
        except Exception as e:
            logger.warning(f"Could not connect to Qdrant server: {e}")
            logger.info("Using in-memory Qdrant (data will not persist)")
            self.client = QdrantClient(":memory:")
        
        # Initialize OpenAI client for embeddings
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        
        # Create collection if it doesn't exist
        self._create_collection_if_not_exists()
        
        logger.info("Vector store initialized successfully")
    
    def _create_collection_if_not_exists(self):
        """Create Qdrant collection if it doesn't exist."""
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if settings.qdrant_collection_name not in collection_names:
                logger.info(f"Creating collection: {settings.qdrant_collection_name}")
                self.client.create_collection(
                    collection_name=settings.qdrant_collection_name,
                    vectors_config=VectorParams(
                        size=settings.qdrant_vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info("Collection created successfully")
            else:
                logger.info(f"Collection '{settings.qdrant_collection_name}' already exists")
        except Exception as e:
            logger.error(f"Error creating collection: {str(e)}")
            raise
    
    def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using OpenAI.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        response = self.openai_client.embeddings.create(
            model=settings.openai_embedding_model,
            input=text
        )
        return response.data[0].embedding
    
    def _generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in a single API call.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        response = self.openai_client.embeddings.create(
            model=settings.openai_embedding_model,
            input=texts
        )
        return [item.embedding for item in response.data]
    
    def _check_document_exists(self, doc_id: str) -> bool:
        """
        Check if a document with the given doc_id already exists.
        
        Args:
            doc_id: Document ID to check
            
        Returns:
            True if document exists, False otherwise
        """
        try:
            logger.info(f"Checking if document exists with doc_id: {doc_id}")
            
            # Search for any point with this doc_id using scroll
            results, next_page = self.client.scroll(
                collection_name=settings.qdrant_collection_name,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="doc_id",
                            match=MatchValue(value=doc_id)
                        )
                    ]
                ),
                limit=1,
                with_payload=False,  # Don't need payload, just existence
                with_vectors=False   # Don't need vectors, just existence
            )
            
            exists = len(results) > 0
            
            if exists:
                logger.info(f"Document with doc_id {doc_id} already exists ({len(results)} chunks found)")
            else:
                logger.info(f"Document with doc_id {doc_id} does not exist")
            
            return exists
            
        except Exception as e:
            logger.error(f"Error checking document existence for doc_id {doc_id}: {e}")
            # On error, return False to allow upload (safer than blocking)
            return False
    
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        """
        Add documents to the vector store with deduplication.
        Skips documents that already exist based on doc_id hash.
        
        Args:
            documents: List of document chunks with text and metadata
        """
        if not documents:
            logger.warning("No documents to add")
            return
        
        # Check if document already exists using doc_id from first chunk
        if documents:
            doc_id = documents[0]["metadata"].get("doc_id")
            if doc_id and self._check_document_exists(doc_id):
                logger.info(f"Document with doc_id {doc_id} already exists. Skipping insertion.")
                return
        
        logger.info(f"Adding {len(documents)} documents to vector store")
        
        # Extract texts for batch embedding
        texts = [doc["text"] for doc in documents]
        
        # Generate embeddings in batches (OpenAI allows up to 2048 inputs per request)
        batch_size = 100  # Use smaller batches for better performance
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_embeddings = self._generate_embeddings_batch(batch_texts)
            all_embeddings.extend(batch_embeddings)
            logger.info(f"Generated embeddings for batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
        
        # Create points
        points = []
        for idx, doc in enumerate(documents):
            metadata = doc["metadata"]
            embedding = all_embeddings[idx]
            
            # Create point
            point_id = str(uuid.uuid4())
            point = PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "text": doc["text"],
                    **metadata
                }
            )
            points.append(point)
        
        # Upsert points to Qdrant
        self.client.upsert(
            collection_name=settings.qdrant_collection_name,
            points=points
        )
        
        logger.info(f"Successfully added {len(documents)} documents")
    
    def query(
        self,
        query_text: str,
        top_k: Optional[int] = None,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Query the vector store for similar documents.
        
        Args:
            query_text: Query string
            top_k: Number of results to return
            filter_metadata: Optional metadata filter
            
        Returns:
            List of relevant documents with scores
        """
        if top_k is None or top_k <= 0:
            top_k = settings.retrieval_top_k
        
        logger.info(f"Querying vector store: '{query_text[:100]}...' (top_k={top_k})")
        
        # Quick check: if collection is empty, return immediately
        try:
            collection_info = self.client.get_collection(settings.qdrant_collection_name)
            if collection_info.points_count == 0:
                logger.warning("Collection is empty, no documents to search")
                return []
        except Exception as e:
            logger.error(f"Error checking collection: {e}")
        
        # Generate query embedding
        query_embedding = self._generate_embedding(query_text)
        
        # Build filter if provided
        query_filter = None
        if filter_metadata:
            conditions = []
            for key, value in filter_metadata.items():
                conditions.append(
                    FieldCondition(key=key, match=MatchValue(value=value))
                )
            query_filter = Filter(must=conditions)
        
        # Search Qdrant
        results = self.client.search(
            collection_name=settings.qdrant_collection_name,
            query_vector=query_embedding,
            limit=top_k,
            query_filter=query_filter
        )
        
        # Format results
        documents = []
        for result in results:
            payload = result.payload
            text = payload.pop("text", "")
            documents.append({
                "text": text,
                "metadata": payload,
                "score": result.score
            })
        
        logger.info(f"Retrieved {len(documents)} documents")
        return documents
    
    def delete_documents(self, doc_id: str) -> None:
        """
        Delete all chunks of a document by doc_id.
        
        Args:
            doc_id: Document ID to delete
        """
        logger.info(f"Deleting document: {doc_id}")
        
        self.client.delete(
            collection_name=settings.qdrant_collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="doc_id",
                        match=MatchValue(value=doc_id)
                    )
                ]
            )
        )
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection."""
        collection_info = self.client.get_collection(settings.qdrant_collection_name)
        return {
            "total_documents": collection_info.points_count,
            "collection_name": settings.qdrant_collection_name
        }
