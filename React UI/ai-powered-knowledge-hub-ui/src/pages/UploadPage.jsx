/**
 * Upload Page
 * Main page for uploading and analyzing documents
 */

import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import AnalysisPreview from '../components/AnalysisPreview';
import SearchBox from '../components/SearchBox';
import uploadService from '../services/uploadService';
import './UploadPage.css';

const UploadPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setError(null);
    setAnalysis(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadAndAnalyze(
        file,
        (progress) => setUploadProgress(progress)
      );
      
      setAnalysis(result);
      setIsUploading(false);
    } catch (err) {
      setError(err.message || 'Failed to upload and analyze the document');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-hero">
        <h1 className="upload-title">Upload & Extract Knowledge</h1>
        <p className="upload-description">
          Upload a research paper or PDF to instantly extract summaries, key terms, and generate Q&A
        </p>
      </div>

      <div className="upload-content">
        <FileUpload
          onFileSelect={handleFileSelect}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="2"/>
              <path d="M10 6v4M10 14h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {analysis && (
          <>
            <div className="search-section">
              <h3 className="search-title">Continue exploring your knowledge base</h3>
              <SearchBox placeholder="Ask questions about your documents..." />
            </div>
            <AnalysisPreview analysis={analysis} />
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
