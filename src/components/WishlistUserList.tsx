import {UserData} from "../interfaces/UserToken";
import {Button, Col, Container, Row, ListGroup} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {generateLink} from "../utils/generateLink";
import {Dispatch, SetStateAction, useState} from "react";
import UserLinkItem from "./UserLinkItem.tsx";
import {PlusCircleDotted} from "react-bootstrap-icons";
import {UserForm} from "./Parameters/UserForm.tsx";


class WishlistUserListProps {
    usersData: Array<UserData> | undefined
    wishlistName: string | undefined
    userSettings: boolean | undefined
    setUsersData: Dispatch<SetStateAction<Array<UserData>>> | undefined
}

/**
 * Component that displays the list of users and their unique links.
 * @param usersData
 * @param wishlistName
 * @param userSettings
 * @param setUsersData
 * @constructor
 */
export default function WishlistUserList({usersData, wishlistName, userSettings, setUsersData}: Readonly<WishlistUserListProps>) {
    const {t} = useTranslation();
    const [allLinksCopied, setAllLinksCopied] = useState<boolean>(false);
    const [showUserForm, setShowUserForm] = useState<boolean>(false);


    /**
     * Copies all user links to the clipboard.
     *
     * This function iterates over the `usersTokens` array to generate a unique link for each user.
     * It then constructs a message that includes an introduction with the `wishlistName`, the generated links for each user,
     * and a reminder. This message is copied to the clipboard for easy sharing.
     */
    const copyAllLinks = () => {
        const links: Array<string> = [];

        if (!usersData) {
            return;
        }
        usersData.map((userData: UserData) => (
            userData.isActive ? links.push(generateLink(userData.id, userData.name)) : null

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
            {userSettings
            ?<h1 className={"wishlist-title my-4 my-md-5 p-2"}>{t('settings.users')}</h1>
            :<h1 className={"wishlist-title my-4 my-md-5 p-2"}>{t('WLCreated.wlWasCreated')} 🎉</h1>
            }
            <div className={"wishlist-container pb-1"}>
                <p>
                    {t('WLCreated.helpLink')}
                    <b>{t('WLCreated.helpLinkBoldPart')} </b>
                    {t('WLCreated.helpLinkEnd')}<span className="emoji-bg">🫣</span>
                </p>
                {!userSettings && <p> {t('WLCreated.individualLinks')}</p>}
            </div>

            <Button type="button" className="btn-custom mt-3 mb-2" variant="primary" onClick={copyAllLinks}>
                {allLinksCopied ? t('WLCreated.copied') : t('WLCreated.copyAll')}
            </Button>

            {!userSettings &&<p> {t('WLCreated.access')}</p>}

            <Container className="list-group user-wishes">
                <Row>
                    {usersData?.map((userData: UserData) => (
                        <Col xs={12} md={6} lg={4} className="mt-4" key={userData.id}>
                            <UserLinkItem userData={userData} editUser={userSettings} setUsersData={setUsersData} otherUsersNames={usersData.map(userToken => userToken.name)}></UserLinkItem>
                        </Col>
                    ))}
                    {userSettings && <Col xs={12} md={6} lg={4} className="mt-4">
                        <ListGroup.Item key={"add"} className={"user-links wishlist-list-group h-100"}>
                            <div className={"user-links"}>
                                <b>{t('settings.addUser')}</b>
                            </div>
                            {showUserForm
                                ? <UserForm editMode={false} setShowUserForm={setShowUserForm} otherUsersNames={usersData?.map(userToken => userToken.name)} setUsersData={setUsersData} initialData={undefined}></UserForm>
                                : <Button className="ms-auto" variant={"success"} onClick={() => setShowUserForm(true)}>
                                    <PlusCircleDotted/>
                                </Button>
                            }
                         </ListGroup.Item>
                    </Col>}
                </Row>
            </Container>

        </>
    )
}
