/**
 * Base Use Case class for common functionality
 * @template TInput - Input type
 * @template TOutput - Output type
 */
export class BaseUseCase {
  /**
   * Validates input data against a schema
   * @param {TInput} input - Input data to validate
   * @param {any} schema - Validation schema
   * @returns {TInput} Validated input
   */
  validateInput(input, schema) {
    try {
      return schema.parse(input);
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Handles errors in a consistent way
   * @param {Error} error - Error to handle
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    throw error;
  }

  /**
   * Execute the use case
   * @param {TInput} input - Input data
   * @returns {Promise<TOutput>} Output data
   */
  async execute(input) {
    throw new Error('execute method must be implemented');
  }
}
