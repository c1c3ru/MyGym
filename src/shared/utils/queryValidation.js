// Utility functions for validating Firestore queries to prevent null value errors

/**
 * Validates query parameters to prevent Firestore null value errors
 * @param {Object} params - Query parameters
 * @param {string} params.collection - Collection path
 * @param {Array} params.filters - Array of filter objects
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateQuery = ({ collection, filters = [] }) => {
  // Validate collection path
  if (!collection || typeof collection !== 'string') {
    console.warn('Invalid collection path:', collection);
    return false;
  }

  // Validate filters
  for (const filter of filters) {
    if (!filter || typeof filter !== 'object') {
      console.warn('Invalid filter object:', filter);
      return false;
    }

    const { field, operator, value } = filter;

    // Check required properties
    if (!field || !operator) {
      console.warn('Missing field or operator in filter:', filter);
      return false;
    }

    // Check for null/undefined values that cause Firestore errors
    if (value === null || value === undefined) {
      console.warn('Null/undefined value in filter:', filter);
      return false;
    }

    // Check for empty strings that might cause issues
    if (typeof value === 'string' && value.trim() === '') {
      console.warn('Empty string value in filter:', filter);
      return false;
    }
  }

  return true;
};

/**
 * Safe wrapper for firestoreService.getDocuments with validation
 * @param {Object} firestoreService - Firestore service instance
 * @param {string} collection - Collection path
 * @param {Array} filters - Array of filter objects
 * @param {Object} orderBy - Order by configuration
 * @param {number} limit - Query limit
 * @returns {Promise<Array>} - Query results or empty array
 */
export const safeGetDocuments = async (firestoreService, collection, filters = [], orderBy = null, limit = null) => {
  try {
    // Validate query parameters
    if (!validateQuery({ collection, filters })) {
      console.warn('Query validation failed, returning empty array');
      return [];
    }

    // Execute query
    return await firestoreService.getDocuments(collection, filters, orderBy, limit);
  } catch (error) {
    console.error('Error in safeGetDocuments:', error);
    return [];
  }
};

/**
 * Validates user and academia IDs before making queries
 * @param {Object} user - User object
 * @param {Object} academia - Academia object
 * @returns {Object|null} - Validated IDs or null if invalid
 */
export const validateUserAcademiaIds = (user, academia) => {
  const userId = user?.uid;
  const academiaId = academia?.id;

  if (!userId || !academiaId) {
    console.warn('Invalid user or academia IDs:', { userId, academiaId });
    return null;
  }

  return { userId, academiaId };
};
