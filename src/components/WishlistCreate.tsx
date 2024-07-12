import '../assets/wishlistcreate.css'
import {FormValues} from "../interfaces/WlCreateFormValues";
import {useState} from "react";
import WishlistUserList from "./WishlistUserList.tsx";
import {UserToken} from "../interfaces/UserToken";
import WishlistCreateForm from "./WishlistCreateForm.tsx";
import {api} from "../api/axiosConfig.tsx";
import WishlistAlert from "./WishlistAlert.tsx";
import {AlertData} from "../interfaces/AlertData";
import {useTranslation} from "react-i18next";


/**
 * Component to display the wishlist creation form and the users list after the wishlist creation
 * @constructor
 */
export default function WishlistCreate() {
    const {t} = useTranslation();
    const [usersTokens, setUsersTokens] = useState<Array<UserToken>>([])
    const [wishlistName, setWishlistName] = useState<string>()

    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<AlertData>();

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
            } else {
                setShowAlert(true);
                setAlertData({
                    "variant": "danger",
                    "message": t("errors.generic")
                } as AlertData);
            }
        }).catch((error) => {
            console.error(error.response);
            const errorMessage = error.response.data.detail[0].msg;
            setShowAlert(true);
            setAlertData({
                "variant": "danger",
                "message": errorMessage
            } as AlertData);
        });
    }

    return (
        <>
            {showAlert ? <WishlistAlert alertData={alertData as AlertData}></WishlistAlert> : null}

            {usersTokens.length > 0
                // If we have users, then we should display the users list
                ? <WishlistUserList usersTokens={usersTokens} wishlistName={wishlistName}></WishlistUserList>
                // Else, display the wishlist create form
                : <WishlistCreateForm handleSubmit={handleSubmit}></WishlistCreateForm>
            }
        </>
    )
}
