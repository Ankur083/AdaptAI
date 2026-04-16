// Standard API success response class
// Ensures all success responses follow the same structure
class ApiResponse {
    constructor(
        statusCode,     // HTTP success status (200, 201, etc.)
        data,           // Actual response data
        message = "Success" // Optional success message
    ) {
        this.statusCode = statusCode; // HTTP status code
        this.data = data;             // Response payload
        this.message = message;       // Success message

        // Automatically determine success based on status code
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
