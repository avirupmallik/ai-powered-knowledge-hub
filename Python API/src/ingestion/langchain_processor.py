"""
LangChain-based document processor for handling various file formats.
"""

from typing import List, Dict, Any
import hashlib
import io
from pathlib import Path
from loguru import logger

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
    Docx2txtLoader
)
from langchain.docstore.document import Document as LangChainDocument


class LangChainDocumentProcessor:
    """Process documents using LangChain's loaders and text splitters."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize LangChain document processor.
        
        Args:
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        logger.info(f"LangChain processor initialized (chunk_size={chunk_size}, overlap={chunk_overlap})")
    
    def process_upload(self, filename: str, file_content: bytes) -> List[Dict[str, Any]]:
        """
        Process uploaded file using LangChain loaders.
        
        Args:
            filename: Original filename
            file_content: File content as bytes
            
        Returns:
            List of document chunks with metadata
        """
        file_extension = Path(filename).suffix.lower()
        
        # Generate doc_id from file content hash
        doc_id = hashlib.md5(file_content).hexdigest()
        
        logger.info(f"Processing {filename} with LangChain (doc_id: {doc_id})")
        
        # Load document based on file type
        if file_extension == '.pdf':
            documents = self._load_pdf_from_bytes(filename, file_content)
        elif file_extension == '.txt':
            documents = self._load_text_from_bytes(filename, file_content)
        elif file_extension == '.md':
            documents = self._load_markdown_from_bytes(filename, file_content)
        elif file_extension == '.docx':
            documents = self._load_docx_from_bytes(filename, file_content)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        # Split documents into chunks
        chunks = self.text_splitter.split_documents(documents)
        
        logger.info(f"Split {filename} into {len(chunks)} chunks using LangChain")
        
        # Convert to our format with metadata
        result = []
        for idx, chunk in enumerate(chunks):
            result.append({
                "text": chunk.page_content,
                "metadata": {
                    "source": filename,
                    "filename": filename,
                    "chunk_index": idx,
                    "file_type": file_extension,
                    "doc_id": doc_id,
                    **chunk.metadata  # Include any metadata from loader
                }
            })
        
        return result
    
    def _load_pdf_from_bytes(self, filename: str, file_content: bytes) -> List[LangChainDocument]:
        """Load PDF from bytes using LangChain."""
        # Save temporarily to process with PyPDFLoader
        temp_path = f"/tmp/{filename}"
        with open(temp_path, "wb") as f:
            f.write(file_content)
        
        loader = PyPDFLoader(temp_path)
        documents = loader.load()
        
        # Clean up temp file
        Path(temp_path).unlink(missing_ok=True)
        
        return documents
    
    def _load_text_from_bytes(self, filename: str, file_content: bytes) -> List[LangChainDocument]:
        """Load text file from bytes."""
        text = file_content.decode('utf-8')
        return [LangChainDocument(page_content=text, metadata={"source": filename})]
    
    def _load_markdown_from_bytes(self, filename: str, file_content: bytes) -> List[LangChainDocument]:
        """Load markdown from bytes."""
        # Save temporarily
        temp_path = f"/tmp/{filename}"
        with open(temp_path, "wb") as f:
            f.write(file_content)
        
        loader = UnstructuredMarkdownLoader(temp_path)
        documents = loader.load()
        
        # Clean up
        Path(temp_path).unlink(missing_ok=True)
        
        return documents
    
    def _load_docx_from_bytes(self, filename: str, file_content: bytes) -> List[LangChainDocument]:
        """Load DOCX from bytes."""
        # Save temporarily
        temp_path = f"/tmp/{filename}"
        with open(temp_path, "wb") as f:
            f.write(file_content)
        
        loader = Docx2txtLoader(temp_path)
        documents = loader.load()
        
        # Clean up
        Path(temp_path).unlink(missing_ok=True)
        
        return documents
