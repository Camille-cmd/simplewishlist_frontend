import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {WishListData} from "../interfaces/WishListData";
import {api} from "../api/axiosConfig.tsx";
import Wishlist from "./Wishlist.tsx";
import ErrorPage from "./ErrorPage.tsx";
import {useAuth} from "../contexts/AuthContext.tsx";

/**
 * Component to display the wishlist page or the error message
 * @constructor
 */
export default function WishlistEntry() {
    const [wishlistData, setWishlistData] = useState<WishListData>();
    const [showErrorPage, setShowErrorPage] = useState<boolean>(false);

    const {wishlistId} = useParams();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();

    /**
     * Get and set the wishlist data from the api
     */
    const getWishlistDataViaApi = (): void => {
        if (wishlistId && isAuthenticated) {
            api.get('/wishlist')
                .then((response) => {
                    const data = response.data as WishListData;
                    setWishlistData(data);
                })
                .catch(() => {
                    setShowErrorPage(true);
                });
        }
        // If no authentication, redirect to user selection
        else if (wishlistId && !isAuthenticated) {
            navigate(`/wishlist/${wishlistId}`, {replace: true});
        } else {
            setShowErrorPage(true);
        }
    }

    useEffect(() => {
        getWishlistDataViaApi();
    }, [])

    return (
        <>

            {wishlistData && !showErrorPage
                ? <Wishlist wishlistData={wishlistData} setWishlistData={setWishlistData}></Wishlist>
                : showErrorPage ? <ErrorPage></ErrorPage> : null
            }

        </>
    )
}
