"""
LangChain-based vector store using Qdrant and OpenAI embeddings.
"""

from typing import List, Dict, Any
from loguru import logger
import os

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Qdrant  # langchain-qdrant integration
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, Filter, FieldCondition, MatchValue

from config.settings import settings


class LangChainVectorStore:
    """LangChain-based vector store with Qdrant."""

    def __init__(self):
        """Initialize LangChain vector store with Qdrant and OpenAI embeddings."""
        # Initialize Qdrant client
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key if settings.qdrant_api_key else None,
            timeout=30
        )

        # Set OpenAI API key in environment
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key

        # Create embeddings
        self.embeddings = OpenAIEmbeddings(
            model=settings.openai_embedding_model
        )

        self.collection_name = settings.qdrant_collection_name
        self.vector_size = settings.qdrant_vector_size

        # Initialize collection if it doesn't exist
        self._initialize_collection()

        # Create LangChain Qdrant vector store
        self.vector_store = Qdrant(
            client=self.client,
            collection_name=self.collection_name,
            embeddings=self.embeddings
        )

        logger.info("LangChain vector store initialized")

    def _initialize_collection(self):
        """Create collection if it doesn't exist."""
        try:
            collections = self.client.get_collections().collections
            collection_names = [col.name for col in collections]

            if self.collection_name not in collection_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE)
                )
                logger.info(f"Created collection: {self.collection_name}")
            else:
                logger.info(f"Collection already exists: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error initializing collection: {e}")
            raise

    def check_document_exists(self, doc_id: str) -> bool:
        """Check if a document already exists in the vector store."""
        try:
            results, _ = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="metadata.doc_id",
                            match=MatchValue(value=doc_id)
                        )
                    ]
                ),
                limit=1,
                with_payload=False,
                with_vectors=False
            )

            exists = len(results) > 0
            if exists:
                logger.info(f"Document {doc_id} already exists in vector store")
            return exists

        except Exception as e:
            logger.error(f"Error checking document existence: {e}")
            return False

    def add_documents(self, chunks: List[Dict[str, Any]]) -> bool:
        """Add document chunks to vector store using LangChain."""
        if not chunks:
            logger.warning("No chunks to add")
            return False

        doc_id = chunks[0]["metadata"]["doc_id"]

        if self.check_document_exists(doc_id):
            logger.warning(f"Skipping duplicate document: {doc_id}")
            return False

        try:
            texts = [chunk["text"] for chunk in chunks]
            metadatas = [chunk["metadata"] for chunk in chunks]

            self.vector_store.add_texts(
                texts=texts,
                metadatas=metadatas
            )

            logger.info(f"Added {len(chunks)} chunks for document {doc_id}")
            return True

        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            return False

    def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents using direct Qdrant client."""
        try:
            # Use search_with_scores and remove scores
            results = self.search_with_scores(query=query, k=k)
            return [{"text": r["text"], "metadata": r["metadata"]} for r in results]

        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []

    def search_with_scores(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search with similarity scores using direct Qdrant client."""
        try:
            # Generate query embedding
            query_vector = self.embeddings.embed_query(query)
            
            # Search using Qdrant client directly
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=k,
                with_payload=True
            )
            
            # Format results to match expected structure
            formatted_results = []
            for result in search_results:
                payload = result.payload
                # Handle old format (text, source, filename as top-level keys)
                if 'text' in payload:
                    formatted_results.append({
                        "text": payload.get('text', ''),
                        "metadata": {
                            "filename": payload.get('filename', 'Unknown'),
                            "source": payload.get('source', 'Unknown'),
                            "chunk_index": payload.get('chunk_index', 0),
                            "file_type": payload.get('file_type', ''),
                            "doc_id": payload.get('doc_id', '')
                        },
                        "score": result.score
                    })
                # Handle new LangChain format (page_content + metadata)
                elif 'page_content' in payload:
                    formatted_results.append({
                        "text": payload.get('page_content', ''),
                        "metadata": payload.get('metadata', {}),
                        "score": result.score
                    })
            
            return formatted_results

        except Exception as e:
            logger.error(f"Error searching with scores: {e}")
            return []
