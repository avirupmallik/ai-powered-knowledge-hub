/**
 * Footer Component
 * Bottom footer with links
 */

import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4 className="footer-heading">KnowHub</h4>
          <p className="footer-description">
            AI-powered knowledge hub for hobby projects
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Product</h4>
          <ul className="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#docs">Docs</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="#about">About</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#terms">Terms</a></li>
            <li><a href="#license">License</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
