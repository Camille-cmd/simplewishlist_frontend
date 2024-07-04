import {UserToken} from "../interfaces/UserToken";
import {Alert, Button, Table} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {BoxArrowUpRight} from "react-bootstrap-icons";

/**
 * Component that displays the list of users and their unique links.
 * @param usersTokens
 * @param wishlistName
 * @constructor
 */
export default function WishlistUserList({usersTokens, wishlistName}: Readonly<{ usersTokens: Array<UserToken>, wishlistName:string | undefined}>) {
    const {t} = useTranslation();

    /**
     * Sanitizes the text to be used in the URL.
     * @param text
     */
    const urlizeText = (text: string) => {
        // Remove special characters and spaces and limit to 15 characters
        return text.toLowerCase().replace(/[^A-Za-z0-9]/g, '').substring(0, 15);
    };

    /**
     * Copies all user links to the clipboard.
     *
     * This function iterates over the `usersTokens` array to generate a unique link for each user.
     * It then constructs a message that includes an introduction with the `wishlistName`, the generated links for each user,
     * and a reminder. This message is copied to the clipboard for easy sharing.
     */
    const copyAllLinks = () => {
        const links: Array<string> = [];

        usersTokens.map((userToken: UserToken) => (
            links.push(`${userToken.name} ➡️ ${generateLink(userToken.token, userToken.name)}`)
        ));

        // Generate the data with Intro(+ wishlistName) + links + reminder
        const data = `${t('WLCreated.copyAllIntro')} "${wishlistName}:"\n\n${links.join("\n\n")}\n\n${t('WLCreated.copyAllReminder')}`;
        navigator.clipboard.writeText(data);
    }

    /**
     * Generates a unique link for a user.
     *
     * Constructs a URL using the current page's origin, appending a path that includes
     * the user's token and a hash fragment with a sanitized version of the username.
     * The username is sanitized by removing special characters and spaces, and is limited to 15 characters.
     *
     * @param {string} token - The unique token associated with the user.
     * @param {string} username - The name of the user.
     * @returns {string} The complete URL for accessing the user-specific page.
     */
    const generateLink = (token: string, username: string) => {
        return `${window.location.origin}/link/${token}#${urlizeText(username)}`
    }

    return (
        <>
            <h1>{t('WLCreated.wlWasCreated')}</h1>
            <p>
                {t('WLCreated.helpLink')}
                <b>{t('WLCreated.helpLinkBoldPart')} </b>
                {t('WLCreated.helpLinkEnd')}<span className="emoji-bg">🫣</span>
            </p>
            <p> {t('WLCreated.individualLinks')}</p>
            <Button type="button" className="btn" variant="primary" onClick={copyAllLinks}>
                {t('WLCreated.copyAll')}
            </Button>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>{t('WLCreated.name')}</th>
                    <th>{t('WLCreated.link')}</th>
                </tr>
                </thead>
                <tbody>
                {usersTokens.map((userToken: UserToken) => (
                    <tr key={userToken.name}>
                        <td>{userToken.name}</td>
                        <td>
                            <Button type="button" className="btn" variant="primary" onClick={copyAllLinks}>
                                {t('WLCreated.copy')}
                            </Button>
                            <Alert.Link href={generateLink(userToken.token, userToken.name)}>{generateLink(userToken.token, userToken.name)} <BoxArrowUpRight></BoxArrowUpRight></Alert.Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <p> {t('WLCreated.access')}</p>
        </>
    )
}
