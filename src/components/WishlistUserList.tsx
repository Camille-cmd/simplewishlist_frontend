import {UserToken} from "../interfaces/UserToken";
import {Alert, Button, Table} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {BoxArrowUpRight} from "react-bootstrap-icons";
import {generateLink} from "../utils/generateLink";
/**
 * Component that displays the list of users and their unique links.
 * @param usersTokens
 * @param wishlistName
 * @constructor
 */
export default function WishlistUserList({usersTokens, wishlistName}: Readonly<{ usersTokens: Array<UserToken>, wishlistName:string | undefined}>) {
    const {t} = useTranslation();

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
