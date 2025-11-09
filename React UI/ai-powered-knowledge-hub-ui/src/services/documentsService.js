/**
 * Documents Service
 * Example service using GraphQL for document operations
 * Upload uses REST, but other operations use GraphQL
 */

import apiClient from './api/apiClient';

class DocumentsService {
  /**
   * Get all documents (uses GraphQL)
   * @returns {Promise<Array>} List of documents
   */
  async getAllDocuments() {
    const query = `
      query GetDocuments {
        documents {
          id
          filename
          summary
          uploadedAt
          status
        }
      }
    `;

    try {
      const result = await apiClient.graphqlQuery(query);
      return result.documents;
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      throw error;
    }
  }

  /**
   * Get a specific document by ID (uses GraphQL)
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document details
   */
  async getDocumentById(documentId) {
    const query = `
      query GetDocument($id: ID!) {
        document(id: $id) {
          id
          filename
          summary
          keyTerms {
            term
            definition
          }
          qaPairs {
            question
            answer
          }
          uploadedAt
          status
        }
      }
    `;

    try {
      const result = await apiClient.graphqlQuery(query, { id: documentId });
      return result.document;
    } catch (error) {
      console.error('Failed to fetch document:', error);
      throw error;
    }
  }

  /**
   * Search documents (uses GraphQL)
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching documents
   */
  async searchDocuments(searchTerm) {
    const query = `
      query SearchDocuments($term: String!) {
        searchDocuments(term: $term) {
          id
          filename
          summary
          relevanceScore
        }
      }
    `;

    try {
      const result = await apiClient.graphqlQuery(query, { term: searchTerm });
      return result.searchDocuments;
    } catch (error) {
      console.error('Failed to search documents:', error);
      throw error;
    }
  }

  /**
   * Delete a document (uses GraphQL mutation)
   * @param {string} documentId - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId) {
    const mutation = `
      mutation DeleteDocument($id: ID!) {
        deleteDocument(id: $id) {
          success
          message
        }
      }
    `;

    try {
      const result = await apiClient.graphqlMutation(mutation, { id: documentId });
      return result.deleteDocument.success;
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  /**
   * Update document metadata (uses GraphQL mutation)
   * @param {string} documentId - Document ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated document
   */
  async updateDocument(documentId, updates) {
    const mutation = `
      mutation UpdateDocument($id: ID!, $input: DocumentUpdateInput!) {
        updateDocument(id: $id, input: $input) {
          id
          filename
          summary
          updatedAt
        }
      }
    `;

    try {
      const result = await apiClient.graphqlMutation(mutation, {
        id: documentId,
        input: updates,
      });
      return result.updateDocument;
    } catch (error) {
      console.error('Failed to update document:', error);
      throw error;
    }
  }
}

export default new DocumentsService();
