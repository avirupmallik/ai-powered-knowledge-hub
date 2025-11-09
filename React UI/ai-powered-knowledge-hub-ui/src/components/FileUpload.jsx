/**
 * FileUpload Component
 * Drag-and-drop file upload with progress tracking
 */

import { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileSelect, isUploading, uploadProgress }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="12" width="32" height="28" rx="2" stroke="#8B5CF6" strokeWidth="2" fill="#F3E8FF"/>
            <path d="M24 20V32M24 20L20 24M24 20L28 24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {isUploading ? (
          <div className="upload-progress">
            <p className="upload-text">Uploading and analyzing...</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="progress-text">{Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <>
            <h3 className="upload-title">Drop your PDF here</h3>
            <p className="upload-subtitle">
              or{' '}
              <button 
                className="browse-button" 
                onClick={handleBrowseClick}
                type="button"
              >
                browse your computer
              </button>
            </p>
            <p className="upload-info">Supports PDF files up to 50MB</p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default FileUpload;
