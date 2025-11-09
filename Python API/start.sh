#!/bin/bash

# Quick start script for AI Research Knowledge Hub

echo "🚀 Starting AI Research Knowledge Hub Setup"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
    exit 1
fi

# Start Qdrant in Docker
echo "🔧 Starting Qdrant vector database..."
docker run -d -p 6333:6333 -p 6334:6334 \
  -v "$(pwd)/data/qdrant_storage:/qdrant/storage" \
  --name qdrant \
  qdrant/qdrant

echo "⏳ Waiting for Qdrant to be ready..."
sleep 3

# Check if Qdrant is running
if curl -s http://localhost:6333/health > /dev/null; then
    echo "✅ Qdrant is running!"
else
    echo "❌ Qdrant failed to start"
    exit 1
fi

# Start the API
echo "🚀 Starting RAG API server..."
python main.py
