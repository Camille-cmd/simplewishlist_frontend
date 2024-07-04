import '../assets/wishlistcreate.css'
import {FormValues} from "../interfaces/WlCreateFormValues";
import {useState} from "react";
import WishlistUserList from "./WishlistUserList.tsx";
import {UserToken} from "../interfaces/UserToken";
import WishlistCreateForm from "./WishlistCreateForm.tsx";
import {api} from "../api/axiosConfig.tsx";


/**
 * Component to display the wishlist creation form and the users list after the wishlist creation
 * @constructor
 */
export default function WishlistCreate() {
    const [usersTokens, setUsersTokens] = useState<Array<UserToken>>([])
    const [wishlistName, setWishlistName] = useState<string>()

    /**
     * Handle the users from the api response and convert them to UserToken objects
     * @param users
     */
    const handleUsers = (users: Array<string>) => {
        Object.entries(users).forEach(([key, value]) => {
            const newUserToken = {
                "name": key,
                "token": value
            } as UserToken
            setUsersTokens(prevState => [...prevState, newUserToken]);
        });
    }

    /**
     * Handle the form submission to create the wishlist
     * @param values
     */
    const handleSubmit = (values: FormValues) => {
        // Api call to create the wishlist
        api.put('/wishlist', values).then((response) => {
            if (response.status === 200) {
                setWishlistName(values.wishlist_name)
                const users = response.data
                // Set the users
                handleUsers(users)
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    return (
        <>
            {usersTokens.length > 0
                // If we have users, then we should display the users list
                ? <WishlistUserList usersTokens={usersTokens} wishlistName={wishlistName}></WishlistUserList>
                // Else, display the wishlist create form
                : <WishlistCreateForm handleSubmit={handleSubmit}></WishlistCreateForm>
            }
        </>
    )
}
