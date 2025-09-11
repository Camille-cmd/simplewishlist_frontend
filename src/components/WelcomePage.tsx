import {Button} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import VisitedWishlists from "./VisitedWishlists";

export default function WelcomePage() {
    const {t} = useTranslation();

    return (
        <>
            <h1 className={"wishlist-title my-4 my-md-5 p-2"}>
                {t('welcomePage.title')}
                <div>💫</div>
            </h1>

            <VisitedWishlists/>

            <div className="text-center welcome-container">

                <img src="/wishlist.svg" alt="wishlist" className="welcome-img"/>


                <div className="wishlist-container">

                    <p>{t('welcomePage.description')}</p>
                    <p>{t('welcomePage.description2')}</p>
                    <p>{t('welcomePage.description3')}</p>
                    <p>{t('welcomePage.description4')}</p>

                    <div className="text-center">
                        <Button className={"btn-custom"} href={(`/wishlist/create`)}>
                            {t('welcomePage.createWLButton')} 🪄
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
