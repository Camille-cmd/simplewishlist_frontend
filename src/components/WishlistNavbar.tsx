import {WishListData} from "../interfaces/WishListData";
import {useTranslation} from "react-i18next";
import {Button, Stack} from "react-bootstrap";
import {useParams} from "react-router-dom";

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
        <div className="utils-row utils-row-main d-flex justify-content-between">

                <Stack direction="horizontal" gap={3} className="col-md-12">

                    {/* User name and grettings */}
                    <div>
                        <span>
                            {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                        </span>
                    </div>

                    {/* Surprise mode */}
                    <div>
                        <span className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="surpriseMode" onChange={HandleSurpriseModeChange} defaultChecked={!surpriseMode}/>
                            <label className="role-click form-check-label" htmlFor="surpriseMode">
                                {t('showWL.surpriseMode')}
                                <span> {!surpriseMode ? '🐵' : '🙈'}</span>
                            </label>
                        </span>
                    </div>

                    <div className="vr"/>

                    {/* Add new wish button */}
                    <div className="ms-auto">
                        <Button variant="primary" type="submit" className="btn-custom btn-sm" href={(`/${userToken}/wish/add`)}>
                            {t('showWL.addNewWish')}
                        </Button>
                    </div>

                </Stack>

        </div>
    )
}
