import '../assets/wishlistcreate.css'
import {FormValues} from "../interfaces/WlCreateFormValues";
import {useState} from "react";
import WishlistUserList from "./WishlistUserList.tsx";
import {UserData} from "../interfaces/UserToken";
import {api} from "../api/axiosConfig.tsx";
import WishlistAlert from "./WishlistAlert.tsx";
import {AlertData} from "../interfaces/AlertData";
import {useTranslation} from "react-i18next";
import WishlistCreateForm from "./WishlistCreateForm.tsx";


/**
 * Component to display the wishlist creation form and the users list after the wishlist creation
 * @constructor
 */
export default function WishlistCreate() {
    const {t} = useTranslation();
    const [usersData, setUsersData] = useState<Array<UserData>>([])
    const [wishlistName, setWishlistName] = useState<string>()

    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<AlertData>();


    /**
     * Handle the form submission to create the wishlist
     * @param values
     */
    const handleSubmit = (values: FormValues) => {
        // Api call to create the wishlist
        api.put('/wishlist', values).then((response) => {
            // If the response is successful, then we should display the users list
            if (response.status === 200) {
                setWishlistName(values.wishlistName)

                // Set the users data
                setUsersData(response.data as Array<UserData>)

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

            {usersData.length > 0
                // If we have users, then we should display the users list
                ? <WishlistUserList usersData={usersData} wishlistName={wishlistName} userSettings={false} setUsersData={setUsersData}></WishlistUserList>
                // Else, display the wishlist create form
                : <WishlistCreateForm handleSubmit={handleSubmit}></WishlistCreateForm>
            }
        </>
    )
}
