export const handleReturnToWishlist = (userToken: string) => {
    window.location.href = `/link/${userToken}`;
}
