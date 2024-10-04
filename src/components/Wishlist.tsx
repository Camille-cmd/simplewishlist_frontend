import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Card, Col, Container, ListGroup, ListGroupItem, Row,} from "react-bootstrap";
import {UserWish, Wish, WishListData} from "../interfaces/WishListData";
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
            if (!wish.deleted) {
                count++;
            }
        });
        return count;
    }

    // Run when a new WebSocket message is received (lastJsonMessage)
    useEffect(() => {
        if (lastJsonMessage == null) {
            return;
        }
        const response = lastJsonMessage as WebSocketReceiveMessage;

        const type = response.type;
        const userNameFromWebsocket = response.userToken;
        const actionPerformed = response.action;

        // Variables to store the new data
        let errorMessage: string;
        let newUserWishes: UserWish[];
        let newWishlistData: WishListData;

        switch (type) {
            case "update_wishes":
                newUserWishes = response.data as Array<UserWish>;
                newWishlistData = {...wishlistData} as WishListData;

                // Update the wishlist data with the new userWishes
                newWishlistData.userWishes = newUserWishes;
                setWishlistData(newWishlistData);

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
                setShowWishForm={setShowWishForm}>
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
