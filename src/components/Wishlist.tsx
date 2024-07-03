import {useEffect, useState} from "react";
import {api} from "../api/axiosConfig.tsx";
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Badge, Card, CardFooter, ListGroup, ListGroupItem} from "react-bootstrap";
import {UserWish, Wish, WishListData} from "../interfaces/WishListData";
import WishlistNavbar from "./WishlistNavbar.tsx";
import {ArrowUpRight} from "react-bootstrap-icons";


export default function Wishlist() {
    const {t} = useTranslation();

    const [wishlistData, setWishlistData] = useState<WishListData>();
    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();

    const getWishlistData = () => {

        api.get(
            "/wishlist",
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                }
            }
        ).then((response) => {
            setWishlistData(response.data)
        });
    }

    const HandleAssignedUser = (wish_id: string) => {
        console.log(wish_id)
    }
    useEffect(() => {
        getWishlistData();
    }, [])

    return (
        <>
            <h1>{wishlistData?.name}</h1>

            {/* WISHLIST BAR */}
            <WishlistNavbar wishlistData={wishlistData}></WishlistNavbar>

            {/* CARDS */}
            <div className="list-group user-wishes d-flex flex-column flex-md-row justify-content-start mt-3 gap-3">
                {
                    wishlistData?.userWishes.map((data: UserWish) => (
                        <Card key={data.user} className="mb-3 col-4">

                            <Card.Header className="header">{data?.user}</Card.Header>
                            <ListGroup>
                                {data.wishes.length > 0
                                 ?
                                    data.wishes.map((wish: Wish) => (
                                        <ListGroupItem key={wish.id}>
                                            <Card.Title onClick={() => HandleAssignedUser(wish.id)}>
                                                {wish.name}
                                                <Badge className="p-2 mx-2">{wish.price}</Badge>
                                                {wish.url
                                                    ? <Link to={wish.url} target="_blank">
                                                        <ArrowUpRight></ArrowUpRight>
                                                    </Link>
                                                    : null
                                                }
                                            </Card.Title>
                                        </ListGroupItem>
                                    ))
                                 : <ListGroupItem>
                                        <Card.Title>wow such empty</Card.Title>
                                    </ListGroupItem>
                                }



                                {
                                    data?.user === wishlistData?.currentUser
                                    && <CardFooter>
                                        <Link to={`/${userToken}/wish/add`} className="nav-link">
                                            {t('showWL.addNewWish')}
                                        </Link>
                                    </CardFooter>
                                }
                            </ListGroup>
                        </Card>
                    ))
                }
            </div>
        </>
    )
}
