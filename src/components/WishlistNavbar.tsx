import {WishListData} from "../interfaces/WishListData";
import {useTranslation} from "react-i18next";
import {Button, Dropdown, DropdownButton, OverlayTrigger, Stack, Tooltip} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {Gear, Gift, PersonCheck, PlusCircle} from "react-bootstrap-icons";
import {Dispatch, SetStateAction} from "react";
import {getUserFirstTwoLetters} from "../utils/getUserFirstTwoLetters.tsx";
import {usernameToColor} from "../utils/getUserHashColor.tsx";


interface WishlistNavbarProps {
    wishlistData: WishListData | undefined,
    setSurpriseMode: Dispatch<SetStateAction<boolean>>,
    surpriseMode: boolean,
    setShowWishForm: Dispatch<SetStateAction<boolean>>,
    setIsSuggestionMode: Dispatch<SetStateAction<boolean>>,
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
        setIsSuggestionMode,
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
     * Handle opening the wish form in suggestion mode
     */
    const handleSuggestWish = () => {
        setIsSuggestionMode(true);
        setShowWishForm(true);
    }

    /**
     * Handle opening the wish form in creation mode
     */
    const handleAddWishWish = () => {
        setIsSuggestionMode(false);
        setShowWishForm(true);
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
        <>
            {/* Desktop navbar */}
            <div className="utils-row utils-row-main d-none d-md-flex">
                <Stack direction="horizontal" gap={3}>

                    {/* Username and greetings */}
                    <div translate={"no"}>
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

                    {/* Surprise mode - only show if surprise mode is enabled */}
                    {wishlistData?.surpriseModeEnabled && (
                        <>
                            <div>
                                <span className="form-check form-switch">
                                    <input className="form-check-input"
                                           type="checkbox"
                                           role="switch"
                                           id="surpriseMode"
                                           onChange={HandleSurpriseModeChange}
                                           checked={surpriseMode}/>
                                    <label className="role-click form-check-label d-flex flex-row gap-1"
                                           htmlFor="surpriseMode">
                                        <span className={"d-none d-md-block"}> {t('showWL.surpriseMode')}</span>
                                        <span> {surpriseMode ? '🙈' : '🐵'}</span>
                                    </label>
                                </span>
                            </div>

                            <div className="vr"/>
                        </>
                    )}

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
                    <Stack direction="horizontal" gap={2} className="ms-auto">

                        <Button variant="primary"
                                type="submit"
                                className="btn-custom btn-sm"
                                onClick={handleAddWishWish}>
                            <span className={"d-none d-md-block"}><PlusCircle className={"mb-1"}></PlusCircle> {t('showWL.addNewWish')} 💫</span>
                            <span className={"d-md-none"}><PlusCircle></PlusCircle> {t('showWL.addNewWishMobile')} 💫</span>
                        </Button>

                        <Button variant="info"
                                type="button"
                                className="btn-custom btn-sm"
                                onClick={handleSuggestWish}>
                            <span className={"d-none d-md-block"}><Gift className={"mb-1"}></Gift> {t('showWL.suggestWish')}</span>
                            <span className={"d-md-none"}><Gift></Gift></span>
                        </Button>

                        {/*Parameters*/}
                        <DropdownButton
                            title={<Gear></Gear>}
                            role="parameters"
                            variant="custom"
                            size="sm"
                        >
                            <Dropdown.Item eventKey="1"
                                           href={(`/wishlist/${wishlistData?.wishlistId}/users`)}>{t('settings.handleUser')} </Dropdown.Item>
                            <Dropdown.Item eventKey="2"
                                           href={(`/wishlist/${wishlistData?.wishlistId}/settings`)}>{t('settings.manageWishlist')}</Dropdown.Item>
                            <Dropdown.Item eventKey="3"
                                           onClick={handleSwitchUser}>{t('userSelection.switchUser')}</Dropdown.Item>
                        </DropdownButton>

                    </Stack>
                </Stack>
            </div>

            {/* Mobile bottom navigation */}
            <div className="mobile-bottom-nav d-md-none">
                <Stack direction="horizontal" gap={0} className="mobile-nav-items">
                    <Button variant="link" className="mobile-nav-item" onClick={handleAddWishWish}>
                        <div className="mobile-nav-icon">
                            <PlusCircle size={24}/>
                        </div>
                        <span className="mobile-nav-label">{t('showWL.addNewWish')}</span>
                    </Button>

                    <Button variant="link" className="mobile-nav-item" onClick={handleSuggestWish}>
                        <div className="mobile-nav-icon">
                            <Gift size={24}/>
                        </div>
                        <span className="mobile-nav-label">{t('showWL.suggestWish')}</span>
                    </Button>

                    <DropdownButton
                        title={
                            <>
                                <div className="mobile-nav-icon">
                                    <Gear size={24}/>
                                </div>
                                <span className="mobile-nav-label">{t('settings.manageWishlist')}</span>
                            </>
                        }
                        drop="up"
                        variant="link"
                        className="mobile-nav-item mobile-nav-dropdown"
                    >
                        <Dropdown.Item eventKey="1"
                                       href={(`/wishlist/${wishlistData?.wishlistId}/users`)}>{t('settings.handleUser')} </Dropdown.Item>
                        <Dropdown.Item eventKey="2"
                                       href={(`/wishlist/${wishlistData?.wishlistId}/settings`)}>{t('settings.manageWishlist')}</Dropdown.Item>
                        <Dropdown.Item eventKey="3"
                                       onClick={handleSwitchUser}>{t('userSelection.switchUser')}</Dropdown.Item>
                    </DropdownButton>
                </Stack>
            </div>

            {/* Mobile top bar */}
            <div className="mobile-top-bar d-md-none">
                <Stack direction="horizontal" gap={2} className="align-items-center">
                    <div className="mobile-greeting" translate="no">
                        {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                    </div>

                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip>{t('userSelection.switchUser')}</Tooltip>}
                    >
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none mobile-switch-user-btn"
                            onClick={handleSwitchUser}
                        >
                            <PersonCheck size={16}/>
                        </Button>
                    </OverlayTrigger>

                    {/* Surprise mode - only show if surprise mode is enabled */}
                    {wishlistData?.surpriseModeEnabled && (
                        <div className="mobile-surprise-toggle">
                            <span className="form-check form-switch">
                                <input className="form-check-input"
                                       type="checkbox"
                                       role="switch"
                                       id="surpriseModeTopBar"
                                       onChange={HandleSurpriseModeChange}
                                       checked={surpriseMode}/>
                                <label className="role-click form-check-label"
                                       htmlFor="surpriseModeTopBar">
                                    <span>{surpriseMode ? '🙈' : '🐵'}</span>
                                </label>
                            </span>
                        </div>
                    )}

                    <div className="connected-users-container ms-auto">
                        {currentlyConnectedUsersNames.length > 0
                            && (currentlyConnectedUsersNames.map((username: string, index: number) => {
                                return (
                                    index < maxUserBubbleDisplay() && <OverlayTrigger
                                        key={username}
                                        placement="bottom"
                                        trigger={["hover", "click"]}
                                        delay={{show: 150, hide: 400}}
                                        overlay={<Tooltip id={`tooltip-mobile-${index}`}>{username}</Tooltip>}
                                        rootClose
                                    >
                                        <div
                                            key={username}
                                            className="user-circle-badge"
                                            style={{backgroundColor: usernameToColor(username)}}
                                        >
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
                                <Tooltip id={"tooltip-mobile-others"}>{currentlyConnectedUsersNames.slice(maxUserBubbleDisplay()).join('\n')}</Tooltip>}
                            rootClose
                        >
                            <div className="user-circle-badge">
                                <span>{currentlyConnectedUsersNames.length - maxUserBubbleDisplay()}+</span>
                            </div>
                        </OverlayTrigger>
                        }
                    </div>
                </Stack>
            </div>
        </>
    )
}
