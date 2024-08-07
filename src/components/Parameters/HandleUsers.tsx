import WishlistUserList from "../WishlistUserList.tsx";
import {useEffect, useState} from "react";
import {api} from "../../api/axiosConfig.tsx";
import {useParams} from "react-router-dom";
import {UserData} from "../../interfaces/UserToken";
import {Button} from "react-bootstrap";
import {t} from "i18next";
import {handleReturnToWishlist} from "../../utils/returnToWishlist.tsx";


/**
 * Component to handle the users of the wishlist
 * @constructor
 */
export function HandleUsers() {
    const {userToken} = useParams();
    const [usersData, setUsersData] = useState<[UserData]>([]);


    /**
     * Get the users data from the api
     */
    const getUsersData = () => {
        api.get('/wishlist/users', {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            setUsersData(response.data as Array<UserData>);
        });

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
                onClick={() => handleReturnToWishlist(userToken as string)}
            />
            <WishlistUserList usersData={usersData} wishlistName={""} userSettings={true} setUsersData={setUsersData}/>
        </>
    )
}
