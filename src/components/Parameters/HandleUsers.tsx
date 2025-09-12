import WishlistUserList from "../WishlistUserList.tsx";
import {useEffect, useState} from "react";
import {api} from "../../api/axiosConfig.tsx";
import {useParams, useNavigate} from "react-router-dom";
import {UserData, UsersDataSettings} from "../../interfaces/UserToken";
import {Button} from "react-bootstrap";
import {t} from "i18next";
import {useAuth} from "../../contexts/AuthContext.tsx";


/**
 * Component to handle the users of the wishlist
 * @constructor
 */
export function HandleUsers() {
    const {wishlistId: paramWishlistId} = useParams();
    const navigate = useNavigate();
    const {wishlistId: authWishlistId, isAuthenticatedForWishlist} = useAuth();

    const [usersData, setUsersData] = useState<Array<UserData>>([]);
    const [wishlistName, setWishlistName] = useState<string>();
    const [wishlistId, setWishlistId] = useState<string>();

    // Use wishlistId from auth context or URL params
    const currentWishlistId = authWishlistId || paramWishlistId;


    /**
     * Get the users data from the api
     */
    const getUsersData = () => {
        // Check if user is authenticated
        const isAuthenticated = isAuthenticatedForWishlist(currentWishlistId as string);
        if (!isAuthenticated) {
            navigate(`/wishlist/${currentWishlistId}`, {replace: true});
            return;
        }

        // For new authenticated users, use header authentication
        if (isAuthenticated) {
            api.get('/wishlist/users')
                .then((response) => {
                    const data = response.data as UsersDataSettings;
                    setUsersData(data.users);
                    setWishlistName(data.wishlistName as string);
                    setWishlistId(data.wishlistId as string);
                });
        }
    }

    /**
     * Get the users data on the first render
     */
    useEffect(() => {
        getUsersData();
    }, [])

    return (
        <>
            <Button
                as="input"
                type="button"
                value={t("createWish.buttons.returnToWishlist")}
                variant="outline-dark"
                onClick={() => navigate(`/wishlist/${currentWishlistId}/view`)}
            />
            <WishlistUserList
                usersData={usersData}
                wishlistName={wishlistName}
                wishlistId={wishlistId}
                userSettings={true}
                setUsersData={setUsersData}
            />
        </>
    )
}
