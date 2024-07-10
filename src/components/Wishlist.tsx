import {useEffect, useState} from "react";
import {api} from "../api/axiosConfig.tsx";
import {useParams} from "react-router-dom";
import {Card, Col, Container, ListGroup, ListGroupItem, Row,} from "react-bootstrap";
import {UserWish, Wish, WishListData} from "../interfaces/WishListData";
import WishlistNavbar from "./WishlistNavbar.tsx";
import WishCardItem from "./WishCardItem.tsx";
import WishForm from "./WishForm.tsx";
import useWebSocket from "react-use-websocket";
import {WebSocketReceiveMessage} from "../interfaces/Websocket";


/**
 * Component to display the wishlist page
 * @constructor
 */
export default function Wishlist() {
    // const {t} = useTranslation();
    const [wishlistData, setWishlistData] = useState<WishListData>();
    const [surpriseMode, setSurpriseMode] = useState<boolean>(false);
    const [editWish, setEditWish] = useState<Wish>();
    const [showWishForm, setShowWishForm] = useState<boolean>(false);
    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();

    // Websocket
    const {sendJsonMessage, lastJsonMessage, readyState} = useWebSocket(
        `ws://localhost:8000/ws/wishlist/${userToken}/`,
        {
            share: false,
            //Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
            reconnectAttempts: 10,
        },
    )

    /**
     * Handle the setWishlistData function to reorder the userWishes first and set the wishlistData
     * @param data
     * @param currentUser - the current user if we need to force it
     */
    const handleSetWishlistData = (data: WishListData, currentUser: string | undefined = undefined) => {
        // Reorder userWishes to get the current user's ones first
        sortUserWishes(data.userWishes, currentUser);
        setWishlistData(data);
    }


    /**
     * Get the wishlist data from the api and set the surprise mode if needed
     * @param needToSetSurpriseMode
     */
    const getWishlistData = (needToSetSurpriseMode: boolean) => {
        api.get("/wishlist", {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            // Reorder userWishes to get the current user's ones first
            const currentUser = response.data.currentUser;
            handleSetWishlistData(response.data, currentUser);

            // Set the surprise mode = if allowSeeAssigned is false then surpriseMode is true
            if (needToSetSurpriseMode) {
                setSurpriseMode(!wishlistData?.allowSeeAssigned ? true : surpriseMode);
            }

        }).catch((error) => {
            console.log(error);
        })
    }


    /**
     * Check if the user is the current user
     * @param user_name
     */
    const isCurrentUser = (user_name: string) => {
        const current_user = wishlistData?.currentUser as string;
        return user_name as string === current_user
    }

    /**
     * Sort the userWishes to get the current user's ones first
     * @param userWishes
     * @param currentUser - the current user if we need to get it from the data
     */
    const sortUserWishes = (userWishes: UserWish[], currentUser: string | undefined = undefined) => {
        // Reorder userWishes to get the current user's ones first
        if (currentUser === undefined) {
            currentUser = wishlistData?.currentUser as string;
        }
        userWishes.sort((a: UserWish, _: UserWish) => a.user === currentUser ? -1 : 1);
    }

    /**
     * Get the wishlist data on the first render
     */
    useEffect(() => {
        getWishlistData(true);
    }, [])


    // Run when the connection state (readyState) changes
    useEffect(() => {
        console.log("Connection state changed")
    }, [readyState])


    // Run when a new WebSocket message is received (lastJsonMessage)
    useEffect(() => {
        console.log("New message received" + JSON.stringify(lastJsonMessage) + " " + typeof lastJsonMessage)
        if (lastJsonMessage == null) {
            return;
        }
        const response = JSON.parse(lastJsonMessage as string) as WebSocketReceiveMessage;

        const type = response.type;
        console.log("Type : " + type)
        const data = response.data;
        switch (type) {

            case "update_wishes":
                let newUserWishes = response.data as UserWish[];
                let newWishlistData = {...wishlistData} as WishListData;


                // Update the wishlist data with the new userWishes
                newWishlistData.userWishes = newUserWishes;
                handleSetWishlistData(newWishlistData);

                setShowWishForm(false);
                // If we were editing a wish, we stop editing as the wish has been updated
                if (editWish) {
                    setEditWish(undefined);
                }
                break;

            case "error_message":
                // TODO : handle error message
                console.error(data);
                break;
        }
    }, [lastJsonMessage])

    return (
        <>
            <h1>{wishlistData?.name}</h1>

            {/* WISHLIST BAR */}
            <WishlistNavbar
                wishlistData={wishlistData}
                setSurpriseMode={setSurpriseMode}
                surpriseMode={surpriseMode}
                setShowWishForm={setShowWishForm}>
            </WishlistNavbar>

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
                                            {data.wishes.length > 0
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
                                                    ></WishCardItem>
                                                ))
                                                : <ListGroupItem>
                                                    <Card.Title>wow such empty</Card.Title>
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
