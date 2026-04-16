// Custom Error class for API errors
// Used to send consistent, meaningful error responses to the client
class ApiError extends Error {
    constructor(
        statusCode,                 // HTTP status code (400, 401, 404, 500, etc.)
        message = "Something went wrong", // Error message for client
        errors = [],                // Extra error details (validation errors, etc.)
        stack = ""                  // Optional custom stack trace
    ) {
        // Call parent Error class constructor
        super(message);

        // HTTP status code for the error response
        this.statusCode = statusCode;

        // API response structure consistency
        this.data = null;           // No data on error
        this.message = message;     // Error message
        this.success = false;       // Always false for errors
        this.errors = errors;       // Detailed error info (if any)

        // Use custom stack trace if provided
        if (stack) {
            this.stack = stack;
        } else {
            // Capture clean stack trace excluding constructor
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
