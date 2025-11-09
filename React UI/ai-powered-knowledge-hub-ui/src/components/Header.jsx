/**
 * Header Component
 * Top navigation bar
 */

import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#8B5CF6"/>
            <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">KnowHub</span>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/upload" className={`nav-link ${isActive('/upload') ? 'active' : ''}`}>
            Upload
          </Link>
          <a href="#knowledge-hub" className="nav-link">Knowledge Hub</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
        </nav>

        <Link to="/upload">
          <button className="btn-get-started">Get Started</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
