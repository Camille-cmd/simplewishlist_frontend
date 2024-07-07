import {useEffect, useState} from "react";
import {api} from "../api/axiosConfig.tsx";
import {useParams} from "react-router-dom";
import {
    Card,
    Col,
    Container,
    ListGroup,
    ListGroupItem,
    Row,
} from "react-bootstrap";
import {UserWish, Wish, WishListData} from "../interfaces/WishListData";
import WishlistNavbar from "./WishlistNavbar.tsx";
import WishCardItem from "./WishCardItem.tsx";
import WishForm from "./WishForm.tsx";


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


    /**
     * Get the wishlist data from the api and set the surprise mode if needed
     * @param needToSetSurpriseMode
     */
    const getWishlistData = (needToSetSurpriseMode: boolean) => {
        api.get("/wishlist", {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            // Reorder userWishes to get the current user's ones first
            const current_user = response.data.currentUser;
            response.data.userWishes.sort((a: UserWish, _: UserWish) => a.user === current_user ? -1 : 1);

            setWishlistData(response.data);

            // Set the surprise mode = if allowSeeAssigned is false then surpriseMode is true
            if (needToSetSurpriseMode) {
                setSurpriseMode(!wishlistData?.allowSeeAssigned ? true : surpriseMode);
            }
        });
    }


    /**
     * Check if the user is the current user
     * @param user_name
     */
    const isCurrentUser = (user_name : string) => {
        const current_user = wishlistData?.currentUser as string;
        return user_name as string === current_user
    }

    /**
     * Get the wishlist data on the first render
     */
    useEffect(() => {
        getWishlistData(true);
    }, [])

    return (
        <>
            <h1>{wishlistData?.name}</h1>

            {/* WISHLIST BAR */}
            <WishlistNavbar wishlistData={wishlistData} setSurpriseMode={setSurpriseMode} surpriseMode={surpriseMode} setShowWishForm={setShowWishForm}></WishlistNavbar>

            {/* CONTENT */}
            {editWish != undefined || showWishForm

                ? <WishForm initialWish={editWish} setEditWish={setEditWish} setShowWishForm={setShowWishForm} getWishlistData={getWishlistData}></WishForm>

                : <Container className="list-group user-wishes">
                    <Row>
                        {
                            wishlistData?.userWishes.map((data: UserWish) => (
                                <Col key={data.user} xs={12} md={6} lg={4} className="mt-4">
                                    <Card key={data.user}>

                                        <Card.Header className={"header" + (isCurrentUser(data.user) ? " current-user-header" : "")}>
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
                                                        getWishlistData={getWishlistData}
                                                        surpriseMode={surpriseMode}
                                                        setEditWish={setEditWish}
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
