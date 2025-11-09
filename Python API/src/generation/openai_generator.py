"""
Generation module using OpenAI GPT models for RAG responses.
"""

from typing import Dict, Any, Optional
from openai import OpenAI
from loguru import logger
from config.settings import settings


class OpenAIGenerator:
    """Generates responses using OpenAI GPT models with RAG context."""
    
    def __init__(self):
        """Initialize OpenAI API client."""
        logger.info("Initializing OpenAI generator")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        logger.info(f"Using model: {self.model}")
    
    def generate(
        self,
        query: str,
        context: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate a response using OpenAI with RAG context.
        
        Args:
            query: User question
            context: Retrieved context from vector store
            system_prompt: Optional system prompt override
            max_tokens: Optional max tokens override
            temperature: Optional temperature override
            
        Returns:
            Dict with generated text and metadata
        """
        # Use faster defaults for query API
        if max_tokens is None:
            max_tokens = 1000  # Reduced from 4096 for faster responses
        
        if temperature is None:
            temperature = 0.5  # Lower for more focused, faster responses
        
        # Default system prompt for RAG
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        
        # Check if no relevant context found
        if "No relevant documents found" in context:
            logger.warning("No relevant context found, providing general response")
            # Use even shorter response for no-context scenarios
            max_tokens = min(max_tokens, 300)
        
        # Construct user message with context
        user_message = self._construct_user_message(query, context)
        
        logger.info(f"Generating response for query: '{query[:100]}...'")
        
        try:
            # Use gpt-4o-mini for faster responses (10x faster than gpt-4-turbo)
            model = "gpt-4o-mini"
            
            # Call OpenAI API with timeout
            response = self.client.chat.completions.create(
                model=model,  # Fast model
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                timeout=20.0  # 20 second timeout
            )
            
            # Extract response text
            response_text = response.choices[0].message.content
            
            logger.info("Response generated successfully")
            
            return {
                "answer": response_text,
                "model": model,  # Return actual model used
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise
    
    def _get_default_system_prompt(self) -> str:
        """Get default system prompt for RAG."""
        return """You are an AI research assistant with access to a knowledge base of research documents.

Your role is to:
1. Answer questions accurately based on the provided context
2. Cite sources when referencing specific information
3. Acknowledge when information is not in the provided context
4. Provide clear, well-structured responses
5. Highlight key insights from the research documents

If the context doesn't contain relevant information to answer the question, say so clearly and provide what general knowledge you can while noting it's not from the knowledge base."""
    
    def _construct_user_message(self, query: str, context: str) -> str:
        """Construct the user message with query and context."""
        return f"""Based on the following context from the knowledge base, please answer the question.

Context:
{context}

Question: {query}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information, acknowledge this limitation."""
    
    def generate_streaming(
        self,
        query: str,
        context: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ):
        """
        Generate a streaming response using OpenAI.
        
        Args:
            query: User question
            context: Retrieved context from vector store
            system_prompt: Optional system prompt override
            max_tokens: Optional max tokens override
            temperature: Optional temperature override
            
        Yields:
            Text chunks from the streaming response
        """
        if max_tokens is None:
            max_tokens = settings.openai_max_tokens
        
        if temperature is None:
            temperature = settings.openai_temperature
        
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        
        user_message = self._construct_user_message(query, context)
        
        logger.info(f"Generating streaming response for query: '{query[:100]}...'")
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        
        except Exception as e:
            logger.error(f"Error in streaming response: {str(e)}")
            raise
    
    def analyze_document(self, text: str, max_text_length: int = 15000) -> Dict[str, Any]:
        """
        Analyze a document to extract summary, key terms, and generate Q&A.
        
        Args:
            text: Document text to analyze
            max_text_length: Maximum text length to send to API (to avoid token limits)
            
        Returns:
            Dict with summary, key_terms, and qa_pairs
        """
        # Truncate text if too long (use even less for faster response)
        truncated_text = text[:5000] if len(text) > 5000 else text
        
        system_prompt = """You are an expert research analyst. Quickly analyze the document and extract:
1. A concise summary (2 sentences max)
2. Top 5 key terms with brief definitions
3. Generate 3 important Q&A pairs

Return ONLY valid JSON:
{
    "summary": "Brief summary...",
    "key_terms": [
        {"term": "Term", "definition": "Brief definition"}
    ],
    "qa_pairs": [
        {"question": "Q?", "answer": "A"}
    ]
}"""
        
        user_message = f"Analyze:\n\n{truncated_text}"
        
        logger.info("Analyzing document for summary, key terms, and Q&A")
        
        try:
            # Use fastest GPT-4o-mini model with aggressive limits
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=800,  # Reduced from 1500 for speed
                temperature=0.2,  # Even lower for faster, more deterministic output
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            
            import json
            analysis = json.loads(response.choices[0].message.content)
            
            logger.info("Document analysis completed successfully")
            
            return {
                "summary": analysis.get("summary", ""),
                "key_terms": analysis.get("key_terms", [])[:5],  # Max 5 terms
                "qa_pairs": analysis.get("qa_pairs", [])[:3]  # Max 3 Q&A
            }
        
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            # Return default structure on error
            return {
                "summary": "Unable to generate summary",
                "key_terms": [],
                "qa_pairs": []
            }
