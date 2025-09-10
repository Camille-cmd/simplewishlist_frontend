/**
 * Generates a wishlist link using the wishlist ID (NEW FORMAT).
 *
 * Constructs a URL using the current page's origin, appending a path that includes
 * only the wishlist ID. Users will then select who they are from the participant list.
 *
 * @param {string} wishlistId - The unique ID of the wishlist.
 * @param {string} wishlistName - The name of the wishlist (for URL fragment).
 * @returns {string} The complete URL for accessing the wishlist.
 */
export const generateWishlistLink = (wishlistId: string): string => {
    return `${window.location.origin}/wishlist/${wishlistId}`
}
