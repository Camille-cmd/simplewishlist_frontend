import {Wish, WishListData} from "../interfaces/WishListData";
import {Badge, Card, ListGroupItem, OverlayTrigger, Stack, Tooltip} from "react-bootstrap";
import {Link, useParams} from "react-router-dom";
import {ArrowUpRightCircle} from "react-bootstrap-icons";
import {Dispatch, SetStateAction} from "react";
import {api} from "../api/axiosConfig.tsx";
import {WebSocketSendMessage} from "../interfaces/Websocket";
import {useTranslation} from "react-i18next";

interface WishCardItemProps {
    wish: Wish,
    isCurrentUser: boolean,
    surpriseMode: boolean
    setEditWish: Dispatch<SetStateAction<Wish | undefined>>
    sendJsonMessage: (message: any) => void
    setShowWishForm: Dispatch<SetStateAction<boolean>>
    currentUserName: string
}

export default function WishCardItem(
    {
        wish,
        isCurrentUser,
        surpriseMode,
        setEditWish,
        sendJsonMessage,
        setShowWishForm,
        currentUserName,
    }
        : Readonly<WishCardItemProps>) {
    const {t} = useTranslation();
    const {userToken} = useParams();

    /**
     * Handle the assigned user of a wish, send the data to the api and refresh the wishlist data
     * @param wishId
     * @param alreadyAssigned
     */
    const handleAssignedUser = (wishId: string, alreadyAssigned: Boolean) => {
        let post_values: { assigned_user: string | null } = {
            assigned_user: userToken as string
        }
        // Case when the user wants to unassign the wish
        if (alreadyAssigned) {
            post_values = {
                assigned_user: null
            }
        }
        // Update via Websocket
        sendJsonMessage({
            type: 'update_wish',
            currentUser: userToken,
            post_values: post_values,
            objectId: wishId
        } as WebSocketSendMessage)
    }

    /**
     * Handle the click on the wish, if the user is the current one then set the editWish state
     * else assign the wish to the user
     * @param wish
     */
    const HandleOnClick = (wish: Wish) => {
        // If the user is the current one,
        // then set the editWish state instead of assigning the wish
        console.log("wish.assigned_user", wish.assigned_user)
        console.log("currentUserName", currentUserName)
        if (isCurrentUser) {
            setEditWish(wish)
            setShowWishForm(true)
        // Only the currently assigned user can modify the wish assigned_user
        } else if (wish.assigned_user == null || wish.assigned_user === currentUserName) {
            handleAssignedUser(wish.id, wish.assigned_user !== null)
        }
    }

    /**
     * Get the tooltip content depending on the user
     */
    const TooltipContent = (wish: Wish) => {
        if (isCurrentUser) {
            return t('wishCard.tooltip.currentUserMessage')
        } else if (wish.assigned_user !== null && wish.assigned_user !== currentUserName) {
            return t('wishCard.tooltip.alreadyTaken')
        } else if (wish.assigned_user !== null && wish.assigned_user === currentUserName) {
            return t('wishCard.tooltip.untake')
        } else {
            return t('wishCard.tooltip.otherUserMessage')
        }
    }

    const canShowAssignedUser = (wish.assigned_user !== null) && (!isCurrentUser || !surpriseMode)

    return (
        <ListGroupItem key={wish.id}>

            <Card.Title className={canShowAssignedUser ? "crossed-text" : ""}>
                <Stack direction={"horizontal"} gap={3} >
                    {/* double HandleOnClick to avoid triggering it on Link*/}
                    <OverlayTrigger overlay={<Tooltip id="tooltip-take-wish">{TooltipContent(wish)}</Tooltip>}>
                        <span onClick={() => HandleOnClick(wish)}>{wish.name}</span>
                    </OverlayTrigger>
                    <Badge className="ms-auto" onClick={() => HandleOnClick(wish)}>{wish.price}</Badge>
                     {wish.url
                        ? <OverlayTrigger overlay={<Tooltip id="tooltip-take-wish">{t("wishCard.tooltip.goToWebsite")}</Tooltip>}>
                            <Link to={wish.url} target="_blank">
                                <ArrowUpRightCircle className={"icon-link"}></ArrowUpRightCircle>
                            </Link>
                        </OverlayTrigger>
                        : null
                    }
                </Stack>
            </Card.Title>

            {/*Display taken by when surpriseMode is off*/}
            {canShowAssignedUser?
                <Card.Text>
                    <small className="text-muted">{t("wishCard.taken")}{wish.assigned_user}</small>
                </Card.Text>
                : null
            }
        </ListGroupItem>
    )
}
