interface WishlistUser {
    id: string;
    name: string;
}

export interface WishlistUsersResponse {
    wishlistId: string;
    wishlistName: string;
    users: WishlistUser[];
}
