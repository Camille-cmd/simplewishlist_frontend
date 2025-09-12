export interface Wish {
    name: string;
    price: string | null;
    url: string | null;
    description: string | null;
    id: string;
    assignedUser: string | null;
    deleted: boolean;
}

export interface UserWish {
    user: string;
    wishes: Array<Wish>;
}

export interface UserWishData {
    user: string;
    wish: Wish;
}

export interface UserDeletedWishData {
    user: string;
    wishId: string;
    assignedUser: string | null;
}


export interface WishListData {
    wishlistId: string;
    name: string;
    surpriseModeEnabled: boolean;
    allowSeeAssigned: boolean;
    currentUser: string;
    userWishes: Array<UserWish>;
}
