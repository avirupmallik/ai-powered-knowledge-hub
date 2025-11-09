/**
 * Home Page
 * Landing page with hero section, features, and CTA
 */

import { useNavigate } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/upload');
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your Documents into
              <span className="gradient-text"> Actionable Knowledge</span>
            </h1>
            <p className="hero-description">
              Upload research papers and PDFs to instantly extract summaries, key terms, 
              and generate Q&A with the power of AI. Perfect for students, researchers, 
              and knowledge enthusiasts.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-large" onClick={handleGetStarted}>
                Upload & Extract
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn-secondary-large">
                Browse Knowledge Hub
              </button>
            </div>
            
            {/* Search Box */}
            <div className="search-container">
              <SearchBox placeholder="Search knowledge base..." />
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Documents Analyzed</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Accuracy Rate</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">5min</span>
                <span className="stat-label">Average Processing</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">📄</div>
              <div className="card-content">
                <h4>Upload PDF</h4>
                <p>Drag and drop your document</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🤖</div>
              <div className="card-content">
                <h4>AI Analysis</h4>
                <p>Extract key insights automatically</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">💡</div>
              <div className="card-content">
                <h4>Get Results</h4>
                <p>Summary, terms, and Q&A ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Everything you need to transform documents into structured knowledge
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon purple">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4v24M8 12l8-8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Easy Upload</h3>
              <p className="feature-description">
                Drag and drop PDFs or browse your files. Supports documents up to 50MB.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 8v8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Instant Analysis</h3>
              <p className="feature-description">
                Get comprehensive summaries and key insights in seconds with AI processing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M4 16h24M16 4v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="16" cy="16" r="3" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Key Terms Extraction</h3>
              <p className="feature-description">
                Automatically identify and define important terms and concepts from your document.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 12v4M16 20h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Q&A Generation</h3>
              <p className="feature-description">
                Generate relevant questions and answers to test understanding and retention.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon pink">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M8 4h16a4 4 0 014 4v16a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 14h12M10 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Smart Summaries</h3>
              <p className="feature-description">
                Concise, accurate summaries that capture the essence of your documents.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon teal">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M4 28V12l12-8 12 8v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 28v-8h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Knowledge Hub</h3>
              <p className="feature-description">
                Store and organize all your analyzed documents in one central location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Three simple steps to unlock knowledge from your documents
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="12" y="8" width="24" height="32" rx="2" stroke="#8B5CF6" strokeWidth="2"/>
                  <path d="M24 20v8M24 20l-4 4M24 20l4 4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="step-title">Upload Document</h3>
              <p className="step-description">
                Simply drag and drop your PDF or research paper. We support files up to 50MB.
              </p>
            </div>

            <div className="step-connector">
              <svg width="100%" height="2" viewBox="0 0 200 2">
                <line x1="0" y1="1" x2="200" y2="1" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="5,5"/>
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" stroke="#8B5CF6" strokeWidth="2"/>
                  <path d="M24 16l4 8-4 8-4-8 4-8z" fill="#F3E8FF"/>
                  <circle cx="24" cy="24" r="4" fill="#8B5CF6"/>
                </svg>
              </div>
              <h3 className="step-title">AI Processing</h3>
              <p className="step-description">
                Our AI analyzes the content, extracting summaries, key terms, and generating Q&A.
              </p>
            </div>

            <div className="step-connector">
              <svg width="100%" height="2" viewBox="0 0 200 2">
                <line x1="0" y1="1" x2="200" y2="1" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="5,5"/>
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 24l8 8 16-16" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="24" cy="24" r="20" stroke="#8B5CF6" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="step-title">Get Insights</h3>
              <p className="step-description">
                Review your analysis, save to knowledge hub, or export for later use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Documents?</h2>
            <p className="cta-description">
              Join thousands of students and researchers using KnowHub to accelerate their learning.
            </p>
            <button className="btn-cta" onClick={handleGetStarted}>
              Start Analyzing Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="cta-note">No credit card required • Free to start</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
