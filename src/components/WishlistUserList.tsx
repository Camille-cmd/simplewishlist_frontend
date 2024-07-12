import {UserToken} from "../interfaces/UserToken";
import {Button, Col, Container, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {generateLink} from "../utils/generateLink";
import {useState} from "react";
import UserLinkItem from "./UserLinkItem.tsx";

/**
 * Component that displays the list of users and their unique links.
 * @param usersTokens
 * @param wishlistName
 * @constructor
 */
export default function WishlistUserList({usersTokens, wishlistName}: Readonly<{
    usersTokens: Array<UserToken>,
    wishlistName: string | undefined
}>) {
    const {t} = useTranslation();
    const [allLinksCopied, setAllLinksCopied] = useState<boolean>(false);
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
        navigator.clipboard.writeText(data).then(function () {
            setAllLinksCopied(true);
            setTimeout(() => {
                setAllLinksCopied(false);
            }, 2000);
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    return (
        <>
            <h1 className={"wishlist-title my-4 my-md-5 p-2"}>{t('WLCreated.wlWasCreated')} 🎉</h1>
            <div className={"wishlist-container pb-1"}>
                <p>
                    {t('WLCreated.helpLink')}
                    <b>{t('WLCreated.helpLinkBoldPart')} </b>
                    {t('WLCreated.helpLinkEnd')}<span className="emoji-bg">🫣</span>
                </p>
                <p> {t('WLCreated.individualLinks')}</p>
            </div>

            <Button type="button" className="btn-custom mt-3 mb-2" variant="primary" onClick={copyAllLinks}>
                {allLinksCopied ? t('WLCreated.copied') : t('WLCreated.copyAll')}
            </Button>

            <p> {t('WLCreated.access')}</p>

            <Container className="list-group user-wishes">
                <Row>
                    {usersTokens.map((userToken: UserToken) => (
                        <Col xs={12} md={6} lg={4} className="mt-4">
                            <UserLinkItem userToken={userToken} key={userToken.name}></UserLinkItem>
                        </Col>
                    ))}
                </Row>
            </Container>

        </>
    )
}
