import {Button, Dropdown, DropdownButton} from "react-bootstrap";
import i18n from "../i18n.tsx";
import {Languages} from "../interfaces/Languages";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {PlusCircle} from "react-bootstrap-icons";


/**
 * List of languages supported by the application
 */
const languages: Languages = {
    en: {nativeName: 'English', flag: '🇬🇧'},
    fr: {nativeName: 'Français', flag: '🇫🇷'}
};

/**
 * Get the flag emoji flag for a given language
 * @param language
 */
const getLanguageFlag = (language: string | undefined) => {
    if (language && language.length >= 2) {
        language = language.toLowerCase().slice(0, 2)
    }
    return languages[language ? language : "en"].flag
}

/**
 * Component that displays the header of the application
 * @constructor
 */
export default function SimpleWishlistHeader() {
    const [currentLanguage, setCurrentLanguage] = useState<string>(getLanguageFlag(i18n.language))
    const navigate = useNavigate();
    const {t} = useTranslation();

    return (
        <header className="simple-wishlist-header d-flex flex-row justify-content-between mx-3">

            {/* Logo */}
            <img
                src="/logo.svg"
                alt="SimpleWishlist logo"
                style={{cursor: 'pointer'}}
                className={"align-self-center mt-2"}
                onClick={() => navigate('/')}
            />

            <div className="d-flex gap-2">
                {/* Create new wishlist button */}
                <Button
                    variant="warning"
                    className="btn-sm"
                    onClick={() => navigate('/wishlist/create')}
                >
                    <span className={"d-none d-md-block"}>
                        <PlusCircle className={"mb-1 me-1"}></PlusCircle>
                        {t('welcomePage.createWLButton')}
                    </span>
                    <span className={"d-md-none"}>
                        <PlusCircle></PlusCircle>
                        {t('welcomePage.createWLButtonMobile')}
                    </span>

                </Button>

                {/* Language switch */}
                <DropdownButton
                    title={currentLanguage}
                    role="languageswitch"
                    variant="custom"
                    onSelect={(event_key) => {
                        if (event_key) {
                            // Change the language with i18n and then change the flag displayed within the title of the
                            // dropdown
                            i18n
                                .changeLanguage(event_key)
                                .then(() => {
                                    // Change the flag that is displayed
                                    setCurrentLanguage(getLanguageFlag(event_key));
                                });
                        }
                    }}
                >
                    {Object.entries(languages).map(([language_name, language_values]) => (
                        <Dropdown.Item key={language_name} eventKey={language_name}>
                            {language_values.nativeName} {language_values.flag}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </div>

        </header>
    );
}
