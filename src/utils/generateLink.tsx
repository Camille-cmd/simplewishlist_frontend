/**
 * Sanitizes the text to be used in the URL.
 * @param text
 */
const urlizeText = (text: string) => {
    // Remove special characters and spaces and limit to 15 characters
    return text.toLowerCase().replace(/[^A-Za-z0-9]/g, '').substring(0, 15);
};


/**
 * Generates a unique link for a user.
 *
 * Constructs a URL using the current page's origin, appending a path that includes
 * the user's token and a hash fragment with a sanitized version of the username.
 * The username is sanitized by removing special characters and spaces, and is limited to 15 characters.
 *
 * @param {string} token - The unique token associated with the user.
 * @param {string} username - The name of the user.
 * @returns {string} The complete URL for accessing the user-specific page.
 */
export const generateLink = (token: string, username: string): string => {
    return `${window.location.origin}/link/${token}#${urlizeText(username)}`
}
