import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Card, Col, Container, ListGroup, ListGroupItem, Row,} from "react-bootstrap";
import {UserDeletedWishData, UserWish, UserWishData, Wish, WishListData} from "../interfaces/WishListData";
import WishlistNavbar from "./WishlistNavbar.tsx";
import WishCardItem from "./WishCardItem.tsx";
import WishForm from "./WishForm.tsx";
import useWebSocket from "react-use-websocket";
import {WebSocketReceiveMessage} from "../interfaces/Websocket";
import WishlistAlert from "./WishlistAlert.tsx";
import {AlertData} from "../interfaces/AlertData";
import {useTranslation} from "react-i18next";

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

    const [surpriseMode, setSurpriseMode] = useState<boolean>(!wishlistData.allowSeeAssigned as boolean);

    const [editWish, setEditWish] = useState<Wish>();
    const [showWishForm, setShowWishForm] = useState<boolean>(false);

    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<AlertData>();

    const [currentlyConnectedUsersNames, setCurrentlyConnectedUsersNames] = useState<Array<string>>([]);

    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();

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
                if (action == "delete_wish"){
                    deletedWishData = response.data as UserDeletedWishData;
                    handleDeleteWish(deletedWishData)
                } else {
                    newUserWishData = response.data as UserWishData;
                    upsertWish(newUserWishData);
                }

                setShowWishForm(false);

                // Show the alert only if the current user is the one who updated the wish,
                // we don't want to show the alert to others in the group
                if (wishlistData.currentUser === userNameFromWebsocket) {
                    handleAlert("success", actionPerformed, "");
                }

                // If we were editing a wish, we stop editing as the wish has been updated
                if (editWish) {
                    setEditWish(undefined);
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
            <h1 className={"wishlist-title my-3 my-md-4 p-2"}>
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
                : <Container className="list-group user-wishes">
                    <Row>
                        {
                            wishlistData?.userWishes.map((data: UserWish) => (
                                <Col key={data.user} xs={12} md={6} lg={4} className="mt-4">
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
                                                : <ListGroupItem>
                                                    <Card.Title>{t('showWL.emptyWishlist')}</Card.Title>
                                                    {isCurrentUser(data.user) &&
                                                        <Card.Text>{t('showWL.emptyWishlistText')}</Card.Text>}
                                                </ListGroupItem>
                                            }
                                        </ListGroup>
                                    </Card>
                                </Col>
                            ))
                        }
                    </Row>
                </Container>
            }
        </>
    )
}
