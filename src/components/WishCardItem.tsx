import {Wish} from "../interfaces/WishListData";
import {Badge, Button, ButtonGroup, Card, ListGroupItem, OverlayTrigger, Stack, Tooltip} from "react-bootstrap";
import {ArrowUpRightCircle} from "react-bootstrap-icons";
import React, {Dispatch, SetStateAction} from "react";
import {WebSocketSendMessage} from "../interfaces/Websocket";
import {useTranslation} from "react-i18next";
import {useAuth} from "../contexts/AuthContext.tsx";

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
    const {userToken} = useAuth();
    const isTaker = wish.assignedUsers.includes(currentUserName)
    // The taken state is visible to me, except on my own cards in surprise mode.
    const takenByOthers = wish.assignedUsers.length > 0 && !isTaker && (!isCurrentUser || !surpriseMode)
    const canShowAssignedUser = wish.assignedUsers.length > 0 && (!isCurrentUser || !surpriseMode)

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
     * Remove focus from button after click to prevent persistent focus state
     */
    const handleButtonClick = (callback: () => void, event?: React.MouseEvent<HTMLButtonElement>) => {
        callback();
        // Remove focus from the button after click
        if (event?.currentTarget) {
            event.currentTarget.blur();
        }
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
    const TooltipContent = () => {
        if (isCurrentUser) {
            return t('wishCard.tooltip.currentUserMessage')
        } else if (isTaker) {
            return t('wishCard.tooltip.untake')
        } else if (takenByOthers) {
            return t('wishCard.tooltip.alreadyTaken')
        } else {
            return t('wishCard.tooltip.otherUserMessage')
        }
    }

    return (
        // If the wish is deleted and the current user is not one of the takers, we don't display it
        // We continue to display it to the takers, to allow them to unassign it
        wish.deleted && !wish.assignedUsers.includes(currentUserName)
            ? null
            :
            <ListGroupItem key={wish.id}
                           className={`wish-group-item ${isTaker ? 'wish-taken-by-me' : takenByOthers ? 'wish-taken-by-others' : ''}`}>

                {/*Display "Suggested by" badge - only for non-owners*/}
                {wish.suggestedBy && !isCurrentUser ?
                    <Card.Subtitle className="mb-2">
                        <small className="text-muted">
                            {t("wishCard.suggestedBy")}
                            <Badge bg="info" className="suggested-by-badge ms-1">
                                {wish.suggestedBy}
                            </Badge>
                        </small>
                    </Card.Subtitle>
                    : null
                }

                <Card.Title>
                    <Stack direction={"horizontal"} gap={3}>
                        <span>{wish.suggestedBy ? "💡" + t("wishCard.suggestion") : ""} {wish.deleted ? t("wishCard.deleted") : wish.name}</span>

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
                    <Card.Subtitle className="mb-2">
                        <small className="text-muted">
                            {t("wishCard.taken")}
                            {wish.assignedUsers.map((userName) => (
                                <Badge bg="light" className="taken-by-username-badge ms-1" key={userName}>
                                    {userName}
                                </Badge>
                            ))}
                        </small>
                    </Card.Subtitle>
                    : null
                }

                {/*Display the description of the wish*/}
                {wish.description
                    ? <Card.Text className="mt-2">{wish.description}</Card.Text>
                    : null
                }
                <OverlayTrigger overlay={<Tooltip id="tooltip-take-wish">{TooltipContent()}</Tooltip>}>
                    <ButtonGroup aria-label="Actions on wish" className="my-2">
                        {/* Show edit button for:
                            - Regular wish: only the wish owner
                            - Suggested wish: only the suggester
                        */}
                        {(wish.suggestedBy ? wish.suggestedBy === currentUserName : isCurrentUser) && (
                            <Button
                                variant="warning"
                                size={"sm"}
                                onClick={(e) => handleButtonClick(() => HandleEditWish(wish), e)}
                            >
                                {t("wishCard.edit")}
                            </Button>
                        )}

                        {/* Show assignment buttons for:
                            - Regular wish: only other users (not the owner)
                            - Suggested wish: all users including the suggester
                        */}
                        {(wish.suggestedBy || !isCurrentUser) && (
                            isTaker ? (
                                <Button
                                    variant="info"
                                    size={"sm"}
                                    className={(wish.suggestedBy && wish.suggestedBy === currentUserName) ? "ms-2" : ""}
                                    onClick={(e) => handleButtonClick(() => handleAssignedUser(wish.id, isTaker), e)}
                                >
                                    {t("wishCard.iDontTake")}
                                </Button>
                            ) : takenByOthers ? (
                                <Button
                                    variant={"success"}
                                    className={(wish.suggestedBy && wish.suggestedBy === currentUserName) ? "btn-warning-take ms-2" : "btn-warning-take"}
                                    size={"sm"}
                                    onClick={(e) => handleButtonClick(() => handleAssignedUser(wish.id, isTaker), e)}
                                >
                                    {t("wishCard.iShareIt")}
                                </Button>
                            ) : (
                                <Button
                                    variant={"success"}
                                    className={(wish.suggestedBy && wish.suggestedBy === currentUserName) ? "btn-success-custom ms-2" : "btn-success-custom"}
                                    size={"sm"}
                                    onClick={(e) => handleButtonClick(() => handleAssignedUser(wish.id, isTaker), e)}
                                >
                                    {t("wishCard.iHandleIt")}
                                </Button>
                            )
                        )}
                    </ButtonGroup>
                </OverlayTrigger>
            </ListGroupItem>
    )
}
