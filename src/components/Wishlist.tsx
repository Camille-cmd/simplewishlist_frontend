import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Card, Container, ListGroup, ListGroupItem} from "react-bootstrap";
import {UserDeletedWishData, UserWish, UserWishData, Wish, WishListData} from "../interfaces/WishListData";
import WishlistNavbar from "./WishlistNavbar.tsx";
import WishCardItem from "./WishCardItem.tsx";
import WishForm from "./WishForm.tsx";
import useWebSocket from "react-use-websocket";
import {WebSocketReceiveMessage} from "../interfaces/Websocket";
import WishlistAlert from "./WishlistAlert.tsx";
import {AlertData} from "../interfaces/AlertData";
import {useTranslation} from "react-i18next";
import WishlistFilters from "./WishlistFilters.tsx";
import {Filters} from "../interfaces/Filters";
import Masonry from 'react-masonry-css'
import {useAuth} from "../contexts/AuthContext.tsx";


interface WishlistProps {
    wishlistData: WishListData
    setWishlistData: Dispatch<SetStateAction<WishListData | undefined>>
}

/**
 * Component to display the wishlist
 * @constructor
 */
export default function Wishlist({wishlistData, setWishlistData}: Readonly<WishlistProps>) {
    const {t} = useTranslation();
    const {userToken} = useAuth();

    const [filteredWishlistData, setFilteredWishlistData] = useState<WishListData>(wishlistData);
    const [filters, setFilters] = useState<Filters>({onlyTakenWishes: false, selectedUser: ''})

    const [surpriseMode, setSurpriseMode] = useState<boolean>(!wishlistData.allowSeeAssigned as boolean);

    const [editWish, setEditWish] = useState<Wish>();
    const [showWishForm, setShowWishForm] = useState<boolean>(false);

    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<AlertData>();

    const [currentlyConnectedUsersNames, setCurrentlyConnectedUsersNames] = useState<Array<string>>([]);

    const allUsersNames = wishlistData.userWishes.map((userWish) => userWish.user !== wishlistData.currentUser ? userWish.user : "").filter(Boolean);

    // Responsive grid for the wishes - optimized for compactness
    const breakpointColumnsObj = {
        default: 4,  // 4 columns on extra large screens (1400px+)
        1400: 4,     // 4 columns on large screens
        1200: 3,     // 3 columns on medium-large screens  
        900: 2,      // 2 columns on tablets
        600: 1       // 1 column on mobile
    };

    // Websocket
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(
        `${import.meta.env.VITE_WS_URL}/${userToken}/`,
        {
            protocols: ['authorization', `${userToken}`],
            share: false,
            //Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
            reconnectAttempts: 10,
        },
    )

    /**
     * Check if the user is the current user
     * @param user_name
     */
    const isCurrentUser = (user_name: string) => {
        const current_user = wishlistData.currentUser as string;
        return user_name as string === current_user
    }

    /**
     * Set the correct alert message and show the alert
     * @param variant
     * @param actionPerformed
     * @param alertMessage
     */
    const handleAlert = (variant: string, actionPerformed: string | null, alertMessage: string) => {
        // If an actionPerformed is given, set the alert message depending on the action performed
        if (actionPerformed !== null) {
            switch (actionPerformed) {
                case "create_wish":
                    alertMessage = t("alert.wishCreated");
                    break;
                case "update_wish":
                    alertMessage = t("alert.wishUpdated");
                    break;
                case "change_wish_assigned_user":
                    alertMessage = t("alert.wishTaken");
                    break;
                case "delete_wish":
                    alertMessage = t("alert.wishDeleted");
                    break;
            }
        }

        setAlertData({
            message: alertMessage,
            variant: variant
        } as AlertData)
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 5000);
    }

    /**
     * Count the number of active wishes (not deleted)
     * @param userWishes
     */
    const countActiveWishes = (userWishes: Array<Wish>) => {
        let count = 0;
        userWishes.forEach((wish) => {
            // We still count the wish if it was deleted but the assignedUser is the current user
            if (!wish.deleted || (wish.deleted && isCurrentUser(wish.assignedUser as string))) {
                count++;
            }
        });
        return count;
    }

    /**
     * Update or insert a wish within WishlistData
     * @param newUserWishData
     */
    const upsertWish = (newUserWishData: UserWishData) => {
        setWishlistData((prevWishlistData) => {
            if (!prevWishlistData) return prevWishlistData; // Ensure wishlistData exists

            // Map over the userWishes array to find the correct user
            const updatedUserWishes = prevWishlistData.userWishes.map(userWish => {
                if (userWish.user === newUserWishData.user) {
                    // Check if the wish already exists in the user's wish list
                    const wishExists = userWish.wishes.some(wish => wish.id === newUserWishData.wish.id);

                    // If wish exists, update it; otherwise, add the new wish
                    const updatedWishes = wishExists
                        ? userWish.wishes.map(wish =>
                            wish.id === newUserWishData.wish.id
                                ? {...wish, ...newUserWishData.wish} // Update the existing wish
                                : wish // Keep other wishes unchanged
                        )
                        : [...userWish.wishes, newUserWishData.wish]; // Add new wish

                    // Return the updated userWish with the updated wishes array
                    return {...userWish, wishes: updatedWishes};
                }
                return userWish; // Keep other users unchanged
            });

            // Return the updated WishListData
            return {
                ...prevWishlistData,
                userWishes: updatedUserWishes,
            };
        });
    };

    /**
     * Handle the deletion of a wish.
     * Remove the wish from WishlistData or setting delete = true in case the wish is assigned to someone.
     * In any case, removes it for the user who initiated the deletion
     * @param deletedWishData
     */
    const handleDeleteWish = (deletedWishData: UserDeletedWishData) => {
        setWishlistData((prevWishlistData) => {
            if (!prevWishlistData) return prevWishlistData; // Ensure wishlistData exists

            // Map over userWishes to handle deletion for current and other users
            const updatedUserWishes = prevWishlistData.userWishes.map(userWish => {
                if (deletedWishData.assignedUser !== wishlistData.currentUser || wishlistData.currentUser === deletedWishData.user) {
                    // Remove the wish by filtering it out
                    const updatedWishes = userWish.wishes.filter(wish => wish.id !== deletedWishData.wishId);
                    return {...userWish, wishes: updatedWishes};
                } else {
                    // Update the wish for other users by marking it as deleted
                    const updatedWishes = userWish.wishes.map(wish =>
                        wish.id === deletedWishData.wishId ? {...wish, deleted: true} : wish
                    );
                    return {...userWish, wishes: updatedWishes};
                }
            });

            // Return the updated WishListData with modified userWishes
            return {
                ...prevWishlistData,
                userWishes: updatedUserWishes,
            };
        });
    };

    /**
     * Filter the wishlist data and set the new filters
     * @param newFilters
     */
    const handleFilterChange = (newFilters: Filters) => {
        // Set the new filters and filter the wishlist data
        setFilters(newFilters)
        filterWishlist(newFilters)
    }

    /**
     * Filter the wishlist data based on the filters
     * @param filters
     */
    const filterWishlist = (filters: Filters) => {
        const {onlyTakenWishes, selectedUser} = filters;

        let updatedWishlistData = wishlistData; // Start from the original data

        // Apply filter for only taken wishes
        // = remove userWish objects that don't contain any wishes assigned to currentUser
        if (onlyTakenWishes) {
            updatedWishlistData = {
                ...updatedWishlistData,
                userWishes: updatedWishlistData.userWishes
                    .map((userWish: UserWish) => ({
                        ...userWish,
                        wishes: userWish.wishes.filter(
                            (wish: Wish) => wish.assignedUser === wishlistData.currentUser
                        )
                    }))
                    .filter((userWish: UserWish) => userWish.wishes.length > 0) // Keep only non-empty userWishes
            };
        }

        // Apply filter for selected user
        if (selectedUser) {
            updatedWishlistData = {
                ...updatedWishlistData,
                userWishes: updatedWishlistData.userWishes.filter(
                    (userWish: UserWish) => userWish.user === selectedUser
                )
            };
        }

        // Set the filtered data only once at the end to apply all filters
        setFilteredWishlistData(updatedWishlistData);
    };


    useEffect(() => {
        // Apply filters when the wishlistData changes
        filterWishlist(filters);
    }, [wishlistData]);

    // Run when a new WebSocket message is received (lastJsonMessage)
    useEffect(() => {
        if (lastJsonMessage == null) {
            return;
        }
        const response = lastJsonMessage as WebSocketReceiveMessage;

        const type = response.type;
        const action = response.action
        const userNameFromWebsocket = response.userToken;
        const actionPerformed = response.action;

        // Variables to store the new data
        let errorMessage: string;
        let newUserWishData: UserWishData;
        let deletedWishData: UserDeletedWishData;
        let connectedUser: Array<string>;

        switch (type) {
            case "updated_wish":
                if (action == "delete_wish") {
                    deletedWishData = response.data as UserDeletedWishData;
                    handleDeleteWish(deletedWishData)
                } else {
                    newUserWishData = response.data as UserWishData;
                    upsertWish(newUserWishData);
                }

                // Actions for the current user workflow (close the wish form and show alert)
                if (wishlistData.currentUser === userNameFromWebsocket) {
                    setShowWishForm(false);
                    handleAlert("success", actionPerformed, "");

                    // If we were editing a wish, we stop editing as the wish has been updated
                    if (editWish) {
                        setEditWish(undefined);
                    }
                }

                break;

            case "new_group_member_connection":
            case "group_member_disconnected":
                connectedUser = response.data as Array<string>;
                setCurrentlyConnectedUsersNames(connectedUser.filter((user) => user !== wishlistData.currentUser));
                break;

            case "error_message":
                errorMessage = response.data as string;
                console.error("Error received from websocket: " + errorMessage);
                handleAlert("danger", null, errorMessage);
                break;
        }
    }, [lastJsonMessage])

    return (
        <>
            {/* WISHLIST TITLE */}
            <h1 className={"wishlist-title my-3 my-md-4 p-2"} translate={"no"}>
                {wishlistData.name}
                <div>💫</div>
            </h1>

            {/* WISHLIST BAR */}
            <WishlistNavbar
                wishlistData={wishlistData}
                setSurpriseMode={setSurpriseMode}
                surpriseMode={surpriseMode}
                setShowWishForm={setShowWishForm}
                currentlyConnectedUsersNames={currentlyConnectedUsersNames}>
            </WishlistNavbar>

            {/* ALERT */}
            {showAlert
                ? <WishlistAlert alertData={alertData as AlertData}></WishlistAlert>
                : null
            }

            <WishlistFilters handleFilterChange={handleFilterChange} users={allUsersNames}></WishlistFilters>

            {/* CONTENT */}
            {showWishForm
                // Display the wish form => edit or create a wish
                ? <WishForm
                    initialWish={editWish}
                    setEditWish={setEditWish}
                    setShowWishForm={setShowWishForm}
                    sendJsonMessage={sendJsonMessage}>
                </WishForm>

                // Display the list of wishes
                : <Container className="list-group user-wishes" translate={"no"}>
                    <Masonry breakpointCols={breakpointColumnsObj}
                             className="masonry-grid"
                             columnClassName="masonry-grid_column">
                        {
                            filteredWishlistData.userWishes.map((data: UserWish) => (
                                <Card key={data.user}>

                                    <Card.Header
                                        className={"header" + (isCurrentUser(data.user) ? " current-user-header" : "")}>
                                        {data?.user}
                                    </Card.Header>

                                    <ListGroup>
                                        {/* Wishes*/}
                                        {countActiveWishes(data.wishes) > 0
                                            ?
                                            data.wishes.map((wish: Wish) => (
                                                <WishCardItem
                                                    key={wish.id}
                                                    wish={wish}
                                                    isCurrentUser={isCurrentUser(data.user)}
                                                    surpriseMode={surpriseMode}
                                                    setEditWish={setEditWish}
                                                    sendJsonMessage={sendJsonMessage}
                                                    setShowWishForm={setShowWishForm}
                                                    currentUserName={wishlistData?.currentUser as string}
                                                ></WishCardItem>
                                            ))
                                            :
                                            <ListGroupItem
                                                className={`empty-wishlist-item text-center ${isCurrentUser(data.user) ? 'current-user-empty clickable-empty' : ''}`}
                                                onClick={isCurrentUser(data.user) ? () => setShowWishForm(true) : undefined}
                                                role={isCurrentUser(data.user) ? "button" : undefined}
                                                tabIndex={isCurrentUser(data.user) ? 0 : undefined}
                                            >
                                                <div className="empty-wishlist-content">
                                                    <Card.Title className="empty-wishlist-title">{t('showWL.emptyWishlist')}</Card.Title>
                                                    {isCurrentUser(data.user) &&
                                                        <Card.Text className="empty-wishlist-text">{t('showWL.emptyWishlistText')}</Card.Text>}
                                                    {isCurrentUser(data.user) &&
                                                        <div className="empty-wishlist-cta">
                                                            <span>{t('showWL.clickToAddFirstWish')}</span>
                                                        </div>}
                                                </div>
                                            </ListGroupItem>
                                        }
                                    </ListGroup>
                                </Card>
                            ))
                        }
                    </Masonry>
                </Container>
            }
        </>
    )
}
