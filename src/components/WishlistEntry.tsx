import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {WishListData} from "../interfaces/WishListData";
import {api} from "../api/axiosConfig.tsx";
import Wishlist from "./Wishlist.tsx";
import ErrorPage from "./ErrorPage.tsx";

/**
 * Component to display the wishlist page or the error message
 * @constructor
 */
export default function WishlistEntry() {
    const [wishlistData, setWishlistData] = useState<WishListData>();

    const [showErrorPage, setShowErrorPage] = useState<boolean>(false);

    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();

    /**
     * Get and set the wishlist data from the api
     */
    const getWishlistDataViaApi = (): void => {
        api.get(
            '/wishlist',
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
                const data = response.data as WishListData;
                // const currentUser = data.currentUser;
                setWishlistData(data);
            }
        ).catch(
            () => {
                setShowErrorPage(true);
            }
        );
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
