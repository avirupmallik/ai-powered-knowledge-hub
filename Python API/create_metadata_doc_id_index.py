"""
Create payload index on metadata.doc_id field for LangChain-stored documents.
This enables fast duplicate checking for documents stored via LangChain.
"""

from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType
from config.settings import settings
from loguru import logger

def create_metadata_doc_id_index():
    """Create index on metadata.doc_id field."""
    try:
        # Initialize Qdrant client
        client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key if settings.qdrant_api_key else None,
            timeout=60
        )
        
        collection_name = settings.qdrant_collection_name
        
        logger.info(f"Creating index on metadata.doc_id for collection: {collection_name}")
        
        # Create keyword index on metadata.doc_id
        client.create_payload_index(
            collection_name=collection_name,
            field_name="metadata.doc_id",
            field_schema=PayloadSchemaType.KEYWORD
        )
        
        logger.info("✅ Successfully created index on metadata.doc_id")
        
    except Exception as e:
        logger.error(f"❌ Error creating index: {e}")
        raise

if __name__ == "__main__":
    create_metadata_doc_id_index()
