import {WishListData} from "../interfaces/WishListData";
import {Gear, People} from "react-bootstrap-icons";
import {useTranslation} from "react-i18next";
import {ChangeEvent} from "react";

export default function WishlistNavbar({wishlistData}: Readonly<{ wishlistData:WishListData | undefined}>) {
    const {t} = useTranslation();

    const HandleSurpriseModeChange = (e: ChangeEvent) => {
        console.log(e, "TODO")
    }

    return (
        <div className="utils-row utils-row-main d-flex justify-content-between">

            <div className="util-row-item">
                    <span>
                        {t('showWL.hello')} <b className="current-user-hello">{wishlistData?.currentUser}</b>
                    </span>
            </div>

            <div className="util-row-item d-none d-md-block">
                    <span className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="surpriseMode"
                               onChange={HandleSurpriseModeChange}/>
                        <label className="role-click form-check-label" htmlFor="surpriseMode">
                            {t('showWL.surpriseMode')}
                            <span> {wishlistData?.allowSeeAssigned ? '🐵' : '🙈'}</span>
                        </label>
                    </span>
            </div>

            <span className="row-separator"></span>

            <div className="util-row-item">
                <a href="#" className="link-dark">
                    <span className="d-none d-md-block">{t('showWL.handleWishlist')}</span>
                    <span className="d-md-none"><Gear/></span>
                </a>
            </div>

            <span className="row-separator"></span>

            <div className="util-row-item">
                <a href="#" className="link-dark">
                    <span className="d-none d-md-block">{t('showWL.handleWishlistUsers')}</span>
                    <span className="d-md-none"><People/></span>
                </a>
            </div>

        </div>
    )
}
