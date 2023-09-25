exports.handler = async (event: any, context: any) => {
    // Your code here
    try {
        // Process the event data and perform your logic
        const result = "hi"

        // Return a response
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        // Handle errors and return an error response
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred' }),
        };
    }
};