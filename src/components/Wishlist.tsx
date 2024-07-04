import {useEffect, useState} from "react";
import {api} from "../api/axiosConfig.tsx";
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Badge,
    Card,
    Col,
    Container,
    ListGroup,
    ListGroupItem,
    OverlayTrigger,
    Row, Tooltip
} from "react-bootstrap";
import {UserWish, Wish, WishListData} from "../interfaces/WishListData";
import WishlistNavbar from "./WishlistNavbar.tsx";
import {ArrowUpRight} from "react-bootstrap-icons";


/**
 * Component to display the wishlist page
 * @constructor
 */
export default function Wishlist() {
    const {t} = useTranslation();
    const [wishlistData, setWishlistData] = useState<WishListData>();
    const [surpriseMode, setSurpriseMode] = useState<boolean>(false);
    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();


    /**
     * Get the wishlist data from the api and set the surprise mode if needed
     * @param needToSetSurpriseMode
     */
    const getWishlistData = (needToSetSurpriseMode: boolean) => {
        api.get("/wishlist", {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            setWishlistData(response.data);
            // Set the surprise mode = if allowSeeAssigned is false then surpriseMode is true
            if (needToSetSurpriseMode) {
                setSurpriseMode(!wishlistData?.allowSeeAssigned ? true : surpriseMode);
            }
        });
    }


    /**
     * Handle the assigned user of a wish, send the data to the api and refresh the wishlist data
     * @param wish_id
     * @param unassigne
     * @constructor
     */
    const HandleAssignedUser = (wish_id: string, unassigne: Boolean = false) => {
        let post_values: { assigned_user: string | null } = {
            assigned_user: userToken as string
        }
        // Case when the user wants to unassign the wish
        if (unassigne) {
            post_values = {
                assigned_user: null
            }
        }

        api.post(`/wish/${wish_id}`, post_values, {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            // Refresh the wishlist data
            getWishlistData(false);
        });
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
            <WishlistNavbar wishlistData={wishlistData} setSurpriseMode={setSurpriseMode} surpriseMode={surpriseMode}></WishlistNavbar>

            {/* CARDS */}
            <Container className="list-group user-wishes">
                <Row>
                {
                    wishlistData?.userWishes.map((data: UserWish) => (
                        <Col key={data.user} xs={12} md={6} lg={4} className="mt-4">
                            <Card key={data.user}>

                                <Card.Header className="header">
                                    {data?.user}
                                </Card.Header>

                                <ListGroup>
                                    {/* Wishes still available*/}
                                    {data.wishes.length > 0
                                     ?
                                        data.wishes.map((wish: Wish) => (
                                            <ListGroupItem key={wish.id}>
                                                <OverlayTrigger overlay={<Tooltip id="tooltip-take-wish">Click to take the wish!</Tooltip>}>
                                                    <Card.Title onClick={() => HandleAssignedUser(wish.id)} className={"pointer-grab"}>
                                                        {wish.name}
                                                        <Badge className="p-2 mx-2">{wish.price}</Badge>
                                                        {wish.url
                                                            ? <Link to={wish.url} target="_blank">
                                                                <ArrowUpRight></ArrowUpRight>
                                                            </Link>
                                                            : null
                                                        }
                                                    </Card.Title>
                                                </OverlayTrigger>
                                            </ListGroupItem>
                                        ))
                                     : <ListGroupItem>
                                            <Card.Title>wow such empty</Card.Title>
                                        </ListGroupItem>
                                    }

                                    {/* Wishes already assigned */}
                                    {data.assignedWishes.length > 0
                                     ?
                                        data.assignedWishes.map((wish: Wish) => (
                                            <ListGroupItem key={wish.id}>
                                                <OverlayTrigger overlay={<Tooltip id="tooltip-take-wish">Click to take the wish!</Tooltip>}>
                                                    <Card.Title onClick={() => HandleAssignedUser(wish.id, true)} className={"crossed-text"}>
                                                        {wish.name}
                                                        <Badge className="p-2 mx-2">{wish.price}</Badge>
                                                        {wish.url
                                                            ? <Link to={wish.url} target="_blank">
                                                                <ArrowUpRight></ArrowUpRight>
                                                            </Link>
                                                            : null
                                                        }
                                                    </Card.Title>
                                                </OverlayTrigger>
                                                {/*Display taken by when surpriseMode is off*/}
                                                {!surpriseMode?
                                                    <Card.Text>
                                                         <small className="text-muted">Taken by {wish.assigned_user}</small>
                                                    </Card.Text>
                                                    : null
                                                }
                                            </ListGroupItem>
                                        ))
                                        : null
                                    }
                                </ListGroup>
                            </Card>
                        </Col>
                    ))
                }
                </Row>
            </Container>
        </>
    )
}
