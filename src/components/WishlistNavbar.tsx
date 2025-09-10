import {WishListData} from "../interfaces/WishListData";
import {useTranslation} from "react-i18next";
import {Button, Dropdown, DropdownButton, OverlayTrigger, Stack, Tooltip} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {Gear, PersonCheck} from "react-bootstrap-icons";
import {Dispatch, SetStateAction} from "react";
import {getUserFirstTwoLetters} from "../utils/getUserFirstTwoLetters.tsx";
import {usernameToColor} from "../utils/getUserHashColor.tsx";


interface WishlistNavbarProps {
    wishlistData: WishListData | undefined,
    setSurpriseMode: Dispatch<SetStateAction<boolean>>,
    surpriseMode: boolean,
    setShowWishForm: Dispatch<SetStateAction<boolean>>,
    currentlyConnectedUsersNames: Array<string>
}


/**
 * Component that displays the navbar of the wishlist page.
 * @param wishlistData
 * @param setSurpriseMode
 * @param surpriseMode
 * @param setShowWishForm
 * @param currentlyConnectedUsers
 * @constructor
 */
export default function WishlistNavbar(
    {
        wishlistData,
        setSurpriseMode,
        surpriseMode,
        setShowWishForm,
        currentlyConnectedUsersNames
    }: Readonly<WishlistNavbarProps>) {
    const {t} = useTranslation();
    const navigate = useNavigate();

    /**
     * Handle the surprise mode change via the setter function
     */
    const HandleSurpriseModeChange = () => {
        setSurpriseMode(!surpriseMode)
    }

    /**
     * Handle switching to a different user by redirecting to user selection
     */
    const handleSwitchUser = () => {
        if (wishlistData?.wishlistId) {
            navigate(`/wishlist/${wishlistData.wishlistId}?switch=true`);
        }
    }


    /**
     * Get the number of user bubble to display depending on the screen size.
     * @returns {number}
     */
    const maxUserBubbleDisplay = (): number => {
        if (window.matchMedia("(min-width: 992px)").matches) {
            return 6;
        }
        return 3;
    }

    return (
        <div className="utils-row utils-row-main">

            {/* Only on mobile display the name above */}
            <div className={"d-md-none col-md-3 col-lg-2 mb-2"} translate={"no"}>
                <Stack direction="horizontal" gap={2}>
                    <span>
                        {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                    </span>
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip>{t('userSelection.switchUser')}</Tooltip>}
                    >
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={handleSwitchUser}
                        >
                            <PersonCheck size={14}/>
                        </Button>
                    </OverlayTrigger>
                </Stack>
            </div>

            <Stack direction="horizontal" gap={3}>

                {/* Username (not on mobile) and greetings */}
                <div className={"d-none d-md-block"} translate={"no"}>
                    <Stack direction="horizontal" gap={2}>
                        <span>
                            {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                        </span>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={<Tooltip>{t('userSelection.switchUser')}</Tooltip>}
                        >
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-decoration-none"
                                onClick={handleSwitchUser}
                            >
                                <PersonCheck size={14}/>
                            </Button>
                        </OverlayTrigger>
                    </Stack>
                </div>

                {/* Surprise mode */}
                <div>
                    <span className="form-check form-switch">
                        <input className="form-check-input"
                               type="checkbox"
                               role="switch"
                               id="surpriseMode"
                               onChange={HandleSurpriseModeChange}
                               checked={surpriseMode}/>
                        <label className="role-click form-check-label d-flex flex-row gap-1" htmlFor="surpriseMode">
                            <span className={"d-none d-md-block"}> {t('showWL.surpriseMode')}</span>
                            <span> {surpriseMode ? '🙈' : '🐵'}</span>
                        </label>
                    </span>
                </div>

                <div className="vr"/>

                {/* Currently connected users */}
                <div className={"connected-users-container"}>

                    {currentlyConnectedUsersNames.length > 0
                        && (currentlyConnectedUsersNames.map((username: string, index: number) => {
                            return (
                                index < maxUserBubbleDisplay() && <OverlayTrigger
                                    key={username}
                                    placement="top"
                                    trigger={["hover", "click"]}
                                    delay={{show: 150, hide: 400}}
                                    overlay={<Tooltip id={`tooltip-${index}`}>{username}</Tooltip>}
                                    rootClose
                                >
                                    <div key={username}
                                         className="user-circle-badge"
                                         style={{backgroundColor: usernameToColor(username)}}>
                                        <span>{getUserFirstTwoLetters(username)}</span>
                                    </div>
                                </OverlayTrigger>
                            )
                        }))
                    }

                    {currentlyConnectedUsersNames.length > maxUserBubbleDisplay() && <OverlayTrigger
                        placement="bottom"
                        trigger={["hover", "click"]}
                        delay={{show: 150, hide: 400}}
                        overlay={
                            <Tooltip id={"tooltip-others"}>{currentlyConnectedUsersNames.slice(maxUserBubbleDisplay()).join('\n')}</Tooltip>}
                        rootClose
                    >
                        <div className="user-circle-badge">
                            <span>{currentlyConnectedUsersNames.length - maxUserBubbleDisplay()}+</span>
                        </div>
                    </OverlayTrigger>
                    }

                </div>

                {/* Add new wish button */}
                <Stack direction="horizontal" gap={3} className="ms-auto">

                    <Button variant="primary"
                            type="submit"
                            className="btn-custom btn-sm"
                            onClick={() => setShowWishForm(true)}>
                        <span className={"d-none d-md-block"}> {t('showWL.addNewWish')} 💫</span>
                        <span className={"d-md-none"}>New 💫</span>
                    </Button>

                    {/*Parameters*/}
                    {wishlistData?.isCurrentUserAdmin
                        ? <DropdownButton
                            title={<Gear></Gear>}
                            role="parameters"
                            variant="custom"
                        >
                            <Dropdown.Item eventKey="1"
                                           href={(`/wishlist/${wishlistData?.wishlistId}/users`)}>{t('settings.handleUser')} </Dropdown.Item>
                            <Dropdown.Item eventKey="2"
                                           href={(`/wishlist/${wishlistData?.wishlistId}/settings`)}>{t('settings.manageWishlist')}</Dropdown.Item>
                        </DropdownButton>
                        : null
                    }

                </Stack>
            </Stack>
        </div>
    )
}
