"""
Create a payload index on 'doc_id' field in Qdrant collection.

This script creates a keyword index on the top-level 'doc_id' payload field
to enable fast filtering and duplicate checks without scanning all points.

Run this script once to optimize duplicate detection performance.
"""

from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType
from config.settings import settings
from loguru import logger

def create_doc_id_index():
    """Create a keyword index on the doc_id payload field."""
    try:
        # Connect to Qdrant
        client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key if settings.qdrant_api_key else None,
            timeout=30
        )
        
        collection_name = settings.qdrant_collection_name
        
        logger.info(f"Creating payload index on 'doc_id' for collection '{collection_name}'...")
        
        # Create payload index on doc_id field (keyword type for exact matching)
        client.create_payload_index(
            collection_name=collection_name,
            field_name="doc_id",
            field_schema=PayloadSchemaType.KEYWORD
        )
        
        logger.info("✅ Successfully created payload index on 'doc_id'")
        logger.info("Duplicate checks will now be much faster!")
        
        # Verify index was created
        collection_info = client.get_collection(collection_name)
        logger.info(f"Collection info: {collection_info.config}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating index: {e}")
        logger.info("If the index already exists, this is expected and you can ignore this error.")
        return False


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Qdrant Payload Index Creation Script")
    logger.info("=" * 60)
    
    success = create_doc_id_index()
    
    if success:
        logger.info("\n✨ Index creation completed successfully!")
        logger.info("Your duplicate checks will now use the index for fast lookups.")
    else:
        logger.info("\n⚠️  Index creation encountered an issue.")
        logger.info("Check the logs above for details.")
