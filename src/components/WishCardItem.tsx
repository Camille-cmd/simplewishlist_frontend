import {Wish} from "../interfaces/WishListData";
import {Badge, Button, ButtonGroup, Card, ListGroupItem, OverlayTrigger, Stack, Tooltip} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {ArrowUpRightCircle} from "react-bootstrap-icons";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {WebSocketSendMessage} from "../interfaces/Websocket";
import {useTranslation} from "react-i18next";

interface WishCardItemProps {
    wish: Wish,
    isCurrentUser: boolean,
    surpriseMode: boolean
    setEditWish: Dispatch<SetStateAction<Wish | undefined>>
    sendJsonMessage: (message: WebSocketSendMessage) => void
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
    const [canShowAssignedUser, setCanShowAssignedUser] = useState<boolean>(!!wish.assignedUser && (!isCurrentUser || !surpriseMode))

    /**
     * Handle the assigned user of a wish, send the data to the api and refresh the wishlist data
     * @param wishId
     * @param alreadyAssigned
     */
    const handleAssignedUser = (wishId: string, alreadyAssigned: boolean) => {
        let post_values: { assignedUser: string | null } = {
            assignedUser: userToken as string
        }
        // Case when the user wants to unassign the wish
        if (alreadyAssigned) {
            post_values = {
                assignedUser: null
            }
        }
        // Update via Websocket
        sendJsonMessage({
            type: 'update_wish',
            currentUser: userToken,
            postValues: post_values,
            objectId: wishId
        } as WebSocketSendMessage)
    }

    /**
     * Handle the click on the wish, if the user is the current one then set the editWish state
     * else assign the wish to the user
     * @param wish
     */
    const HandleEditWish = (wish: Wish) => {
        setEditWish(wish)
        setShowWishForm(true)
    }

    /**
     * Handle click on url which is inside the element containing HandleClickOnWish
     * We need to prevent it from being triggered and only open the link in another tab
     * @param e
     * @param wish
     */
    const HandleClickOnUrl = (e: React.MouseEvent<HTMLButtonElement>, wish: Wish) => {
        e.stopPropagation();  // avoid triggering HandleClickOnWish on parent element
        wish.url ? window.open(wish.url, "_blank") : null
    }

    /**
     * Get the tooltip content depending on the user
     */
    const TooltipContent = (wish: Wish) => {
        if (isCurrentUser) {
            return t('wishCard.tooltip.currentUserMessage')
        } else if (!!wish.assignedUser && wish.assignedUser !== currentUserName) {
            // In theory, this message should never be displayed, we keep it in case it is needed in the future.
            return t('wishCard.tooltip.alreadyTaken')
        } else if (!!wish.assignedUser && wish.assignedUser === currentUserName) {
            return t('wishCard.tooltip.untake')
        } else {
            return t('wishCard.tooltip.otherUserMessage')
        }
    }

    useEffect(() => {
        const canShowAssignedUser = (!!wish.assignedUser) && (!isCurrentUser || !surpriseMode)
        setCanShowAssignedUser(canShowAssignedUser)
    }, [wish, isCurrentUser, surpriseMode])

    return (
        // If the wish is deleted and the current user is not the one who took it, we don't display it
        // We continue to display it to the user who took it, to allow him to unassign it
        wish.deleted && wish.assignedUser !== currentUserName
            ? null
            :
            <ListGroupItem key={wish.id} className={"wish-group-item"}>

                <Card.Title className={canShowAssignedUser ? "crossed-text" : ""}>
                    <Stack direction={"horizontal"} gap={3}>
                        <span>{wish.deleted ? t("wishCard.deleted") : wish.name}</span>

                        <Badge className="ms-auto">{wish.price}</Badge>

                        {wish.url
                            ? <OverlayTrigger overlay={
                                <Tooltip id="tooltip-navigate-to-wish-url">{t("wishCard.tooltip.goToWebsite")}</Tooltip>
                            }>
                                <Button variant="link" className={"p-0"} onClick={(e) => HandleClickOnUrl(e, wish)}>
                                    <ArrowUpRightCircle className={"icon-link"}></ArrowUpRightCircle>
                                </Button>
                            </OverlayTrigger>
                            : null
                        }
                    </Stack>
                </Card.Title>

                {/*Display taken by when surpriseMode is off*/}
                {canShowAssignedUser ?
                    <Card.Subtitle>
                        <small className="text-muted">{t("wishCard.taken")}{wish.assignedUser}</small>
                    </Card.Subtitle>
                    : null
                }

                {/*Display the description of the wish*/}
                {wish.description
                    ? <Card.Text className="mt-2">{wish.description}</Card.Text>
                    : null
                }
                <OverlayTrigger overlay={<Tooltip id="tooltip-take-wish">{TooltipContent(wish)}</Tooltip>}>
                    <ButtonGroup aria-label="Actions on wish" className="my-2">
                        {isCurrentUser ? (
                            <Button
                                variant="warning"
                                size={"sm"}
                                onClick={() => HandleEditWish(wish)}
                            >
                                {t("wishCard.edit")}
                            </Button>
                        ) : wish.assignedUser ? (
                                wish.assignedUser === currentUserName ? (
                                        <Button
                                            variant="danger"
                                            size={"sm"}
                                            onClick={() => handleAssignedUser(wish.id, !!wish.assignedUser)}
                                        >
                                             {t("wishCard.iDontTake")}
                                        </Button>
                                ) : null
                        ) : (
                            <Button
                                variant={"success"}
                                className={"btn-success-custom"}
                                size={"sm"}
                                onClick={() => handleAssignedUser(wish.id, !!wish.assignedUser)}
                            >
                                {t("wishCard.iHandleIt")}
                            </Button>
                        )}
                    </ButtonGroup>
                </OverlayTrigger>
            </ListGroupItem>
    )
}
