/**
 * Upload Service
 * Business logic for file upload and analysis
 */

import apiClient from './api/apiClient';

class UploadService {
  /**
   * Validate file before upload
   */
  validateFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['application/pdf'];

    if (!file) {
      throw new Error('No file selected');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF files are supported');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    return true;
  }

  /**
   * Upload and analyze document
   * @param {File} file - PDF file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Analysis result with structure:
   * {
   *   filename: string,
   *   summary: string,
   *   key_terms: Array<{term: string, definition: string}>,
   *   qa_pairs: Array<{question: string, answer: string}>
   * }
   */
  async uploadAndAnalyze(file, onProgress) {
    this.validateFile(file);
    
    try {
      const result = await apiClient.uploadFile(file, onProgress);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
}

export default new UploadService();
