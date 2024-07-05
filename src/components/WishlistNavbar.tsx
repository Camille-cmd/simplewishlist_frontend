import {WishListData} from "../interfaces/WishListData";
import {useTranslation} from "react-i18next";
import {Button, Col, Container, Dropdown, DropdownButton, Row, Stack} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {Gear, Plus} from "react-bootstrap-icons";
import {j} from "vite/dist/node/types.d-aGj9QkWt";

/**
 * Component that displays the navbar of the wishlist page.
 * @param wishlistData
 * @param setSurpriseMode
 * @param surpriseMode
 * @constructor
 */
export default function WishlistNavbar({wishlistData, setSurpriseMode, surpriseMode}: Readonly<{ wishlistData: WishListData | undefined, setSurpriseMode, surpriseMode: boolean | undefined}>) {
    const {t} = useTranslation();
    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();

    /**
     * Handle the surprise mode change via the setter function
     */
    const HandleSurpriseModeChange = () => {
        setSurpriseMode(!surpriseMode)
    }

    return (
        <div className="utils-row utils-row-main">

            {/* Only on mobile display the name above */}
            <div className={"d-md-none col-md-3 col-lg-2 mb-2"}>
                <span>
                    {/*TODO  limiter à 23 charactères*/}
                    {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                </span>
            </div>

            <Stack direction="horizontal" gap={3}>

                {/* User name and grettings */}
                <div className={"d-none d-md-block"}>
                    <span>
                        {/*TODO  limiter à 23 charactères*/}
                        {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                    </span>
                </div>

                {/* Surprise mode */}
                <div>
                    <span className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="surpriseMode" onChange={HandleSurpriseModeChange} defaultChecked={!surpriseMode}/>
                        <label className="role-click form-check-label d-flex flex-row gap-1" htmlFor="surpriseMode">
                            <span className={"d-none d-md-block"}> {t('showWL.surpriseMode')}</span>
                            <span> {!surpriseMode ? '🐵' : '🙈'}</span>
                        </label>
                    </span>
                </div>

                <div className="vr"/>

                {/* Add new wish button */}
                <Stack direction="horizontal" gap={3} className="ms-auto">

                    <Button variant="primary" type="submit" className="btn-custom btn-sm" href={(`/${userToken}/wish/add`)}>
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
                            <Dropdown.Item eventKey="1" href={(`/${userToken}/wishlist/handle-users`)}>Handle users</Dropdown.Item>
                            <Dropdown.Item eventKey="2">Wishlist parameters</Dropdown.Item>
                        </DropdownButton>
                        : null
                    }

                </Stack>
            </Stack>
        </div>
    )
}
