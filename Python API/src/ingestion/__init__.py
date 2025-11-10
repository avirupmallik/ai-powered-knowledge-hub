"""Document ingestion module with LangChain."""

from .langchain_processor import LangChainDocumentProcessor
from .langchain_vector_store import LangChainVectorStore

__all__ = ["LangChainDocumentProcessor", "LangChainVectorStore"]
