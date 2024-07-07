export interface Wish {
    name: string;
    price: string | null;
    url: string | null;
    id: string;
    assigned_user: string | null;
}

export interface UserWish {
    user: string;
    wishes: Array<Wish>;
}

export interface WishListData {
    name: string;
    allowSeeAssigned: boolean;
    currentUser: string;
    isCurrentUserAdmin: boolean;
    userWishes: Array<UserWish>;
}
