export interface UserData {
    "name": string;
    "id": string;
    "isActive": boolean;
    "wishlistId"?: string;
}

export interface UsersDataSettings {
    "wishlistName": string;
    "wishlistId": string;
    "users": Array<UserData>;
}
