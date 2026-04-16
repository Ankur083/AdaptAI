// Wrapper function to handle async route errors
// Prevents server crash caused by unhandled promise rejections

const asyncHandler = (requestHandler) => {
    return  (req, res, next) => {
        // Convert async function into a promise
        // If it fails, forward error to Express error middleware
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

export { asyncHandler };

