import {Dropdown, DropdownButton} from "react-bootstrap";
import i18n from "../i18n.tsx";
import {Languages} from "../interfaces/Languages";
import {useState} from "react";


const languages: Languages = {
    en: {nativeName: 'English', flag: '🇬🇧'},
    fr: {nativeName: 'Français', flag: '🇫🇷'}
};

const getLanguageFlag = (language: string) => {
    return languages[language].flag
}
export default function SimpleWishlistHeader() {
    const [currentLanguage, setCurrentLanguage] = useState<string>(getLanguageFlag(i18n.language))

    return (
        <header className="simple-wishlist-header d-flex flex-row justify-content-between mx-3">
            <img src="/logo.svg" alt="SimpleWishlist logo"/>

            <DropdownButton
                title={currentLanguage}
                role="languageswitch"
                variant="custom"
                onSelect={(event_key) => {
                    if (event_key) {
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

        </header>
    );
}