export interface UserData {
    "name": string;
    "id": string;
    "isActive": boolean;
    "isAdmin": boolean;
}

export interface UsersDataSettings {
    "wishlistName": string;
    "users": Array<UserData>;
}
