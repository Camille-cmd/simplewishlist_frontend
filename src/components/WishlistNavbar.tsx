import {WishListData} from "../interfaces/WishListData";
import {useTranslation} from "react-i18next";
import {Button, Stack} from "react-bootstrap";
import {useParams} from "react-router-dom";

export default function WishlistNavbar({wishlistData, setSurpriseMode, surpriseMode}: Readonly<{ wishlistData: WishListData | undefined, setSurpriseMode, surpriseMode: boolean | undefined}>) {
    const {t} = useTranslation();
    // Get the userToken from the url params used in routes.tsx
    const {userToken} = useParams();

    const HandleSurpriseModeChange = () => {
        setSurpriseMode(!surpriseMode)
    }

    return (
        <div className="utils-row utils-row-main d-flex justify-content-between">

                <Stack direction="horizontal" gap={3} className="col-md-12">

                        <div>
                            <span>
                                {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                            </span>
                        </div>

                        <div>
                            <span className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="surpriseMode" onChange={HandleSurpriseModeChange} defaultChecked={surpriseMode}/>
                                <label className="role-click form-check-label" htmlFor="surpriseMode">
                                    {t('showWL.surpriseMode')}
                                    <span> {!surpriseMode ? '🐵' : '🙈'}</span>
                                </label>
                            </span>
                        </div>

                        <div className="vr"/>

                        <div className="ms-auto">
                            {/* ADD NEW WISH BUTTON */}
                            <Button variant="primary" type="submit" className="btn-custom btn-sm" href={(`/${userToken}/wish/add`)}>
                                {t('showWL.addNewWish')}
                            </Button>
                        </div>

                </Stack>

        </div>
    )
}
