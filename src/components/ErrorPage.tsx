import {useTranslation} from "react-i18next";
import '../assets/errorpage.css';

/**
 * Component to display the error page
 * @constructor
 */
export default function ErrorPage() {
    const {t} = useTranslation();

    return (
        <div id="error-page">
            <h1>404</h1>
            <img src="/404.svg" alt="404 illustration"/>
            <h2>{t('errors.404')}</h2>
            <h5>{t('errors.404explanation')}</h5>
        </div>
    );
}
