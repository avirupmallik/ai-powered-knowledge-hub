/**
 * SearchBox Component
 * Reusable search component with GraphQL integration
 */

import { useState } from 'react';
import apiClient from '../services/api/apiClient';
import './SearchBox.css';

const SearchBox = ({ onSearch, showResults = true, placeholder = "Search knowledge base..." }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const graphqlQuery = `
        query Ask($input: AskQuestionInput!) {
          askQuestion(input: $input) {
            answer
          }
        }
      `;

      const variables = {
        input: {
          question: query,
          topK: 3,
          systemPrompt: "Be concise and factual."
        }
      };

      const response = await apiClient.graphqlQuery(graphqlQuery, variables);
      setResult(response.askQuestion);
      
      if (onSearch) {
        onSearch(response.askQuestion);
      }
    } catch (err) {
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="search-box-wrapper">
      <div className="search-box-container">
        <div className={`search-box ${isSearching ? 'searching' : ''}`}>
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2"/>
            <path d="M16 16l4 4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
          {query && (
            <button 
              className="search-button" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="spinner"></div>
              ) : (
                'Search'
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="search-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="2"/>
            <path d="M10 6v4M10 14h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {showResults && result && (
        <div className="search-result">
          <div className="result-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2"/>
            </svg>
            <h3>Answer from Knowledge Base</h3>
          </div>
          <div className="result-content">
            {formatAnswer(result.answer)}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to render text with bold formatting
const renderFormattedText = (text) => {
  if (!text.includes('**')) {
    return text;
  }
  
  const parts = [];
  let lastIndex = 0;
  const regex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the bold part
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
};

// Helper function to format the answer with proper styling
const formatAnswer = (answer) => {
  if (!answer) return null;

  // Split by sections (identified by ###)
  const sections = answer.split(/###\s+/);
  
  return (
    <div className="formatted-answer">
      {sections.map((section, index) => {
        if (!section.trim()) return null;

        // Check if section has a title
        const lines = section.split('\n');
        const hasTitle = lines[0] && !lines[0].startsWith('1.') && !lines[0].startsWith('-');
        
        if (index === 0 && !answer.startsWith('###')) {
          // First section is often an introduction
          return (
            <div key={index} className="answer-intro">
              {lines.map((line, i) => {
                if (!line.trim()) return null;
                return <p key={i}>{renderFormattedText(line.trim())}</p>;
              })}
            </div>
          );
        }

        return (
          <div key={index} className="answer-section">
            {hasTitle && <h4 className="section-title">{renderFormattedText(lines[0])}</h4>}
            <div className="section-content">
              {lines.slice(hasTitle ? 1 : 0).map((line, i) => {
                if (!line.trim()) return null;
                
                // Check if it's a numbered or bulleted list
                if (/^\d+\./.test(line.trim()) || line.trim().startsWith('-')) {
                  const cleanedLine = line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '');
                  return (
                    <div key={i} className="list-item">
                      <span className="bullet">•</span>
                      <span>{renderFormattedText(cleanedLine)}</span>
                    </div>
                  );
                }
                
                // Regular paragraph with potential bold text
                return <p key={i}>{renderFormattedText(line)}</p>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchBox;
