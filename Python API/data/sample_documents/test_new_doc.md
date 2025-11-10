# Test Document for Duplicate Detection

This is a test document to verify that new documents can still be uploaded successfully after implementing duplicate detection.

## Key Points

- This document should be uploaded successfully
- It should NOT be flagged as a duplicate
- The document count should increase by the number of chunks created

## Technical Details

The duplicate detection system uses MD5 hashing of filenames to generate document IDs. This ensures that:
1. Same filename = same doc_id = duplicate detected
2. Different filename = different doc_id = new document allowed
3. Fast indexed lookups on metadata.doc_id field in Qdrant
