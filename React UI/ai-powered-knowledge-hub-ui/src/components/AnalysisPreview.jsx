/**
 * AnalysisPreview Component
 * Displays the preliminary analysis results
 */

import './AnalysisPreview.css';

const AnalysisPreview = ({ analysis }) => {
  if (!analysis) return null;

  const { filename, summary, key_terms, qa_pairs } = analysis;

  return (
    <div className="analysis-preview">
      <div className="analysis-header">
        <h2>Analysis Preview</h2>
        <p className="filename">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9 1H3C2.44772 1 2 1.44772 2 2V14C2 14.5523 2.44772 15 3 15H13C13.5523 15 14 14.5523 14 14V6L9 1Z" stroke="#8B5CF6" strokeWidth="1.5"/>
            <path d="M9 1V6H14" stroke="#8B5CF6" strokeWidth="1.5"/>
          </svg>
          {filename}
        </p>
      </div>

      {/* Summary Section */}
      <div className="analysis-section">
        <h3 className="section-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 4h14M3 10h14M3 16h10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Summary
        </h3>
        <p className="summary-text">{summary}</p>
      </div>

      {/* Key Terms Section */}
      {key_terms && key_terms.length > 0 && (
        <div className="analysis-section">
          <h3 className="section-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="#8B5CF6" strokeWidth="2"/>
              <path d="M10 7v3M10 13v1" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Key Terms ({key_terms.length})
          </h3>
          <div className="key-terms-grid">
            {key_terms.map((term, index) => (
              <div key={index} className="key-term-card">
                <h4 className="term-name">{term.term}</h4>
                <p className="term-definition">{term.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Section */}
      {qa_pairs && qa_pairs.length > 0 && (
        <div className="analysis-section">
          <h3 className="section-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" stroke="#8B5CF6" strokeWidth="2"/>
              <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v2" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="15" r="0.5" fill="#8B5CF6"/>
            </svg>
            Sample Q&A ({qa_pairs.length})
          </h3>
          <div className="qa-list">
            {qa_pairs.map((qa, index) => (
              <div key={index} className="qa-item">
                <div className="question">
                  <span className="qa-label">Q:</span>
                  <span className="qa-text">{qa.question}</span>
                </div>
                <div className="answer">
                  <span className="qa-label">A:</span>
                  <span className="qa-text">{qa.answer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-actions">
        <button className="btn-secondary">Download Report</button>
        <button className="btn-primary">Save to Knowledge Hub</button>
      </div>
    </div>
  );
};

export default AnalysisPreview;
