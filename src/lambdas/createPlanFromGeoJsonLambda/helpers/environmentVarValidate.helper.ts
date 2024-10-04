export const validateEnvVar = (str: String | undefined) => {
    if (typeof str !== 'string') {
        throw new Error(`Environment variable "${str}" must be a string.`);
    }
    return str;
}