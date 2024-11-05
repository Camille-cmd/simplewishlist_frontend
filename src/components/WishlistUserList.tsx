import {UserData} from "../interfaces/UserToken";
import {Button, Container, Table} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {generateLink} from "../utils/generateLink";
import {Dispatch, SetStateAction, useState} from "react";
import UserLinkItem from "./UserLinkItem.tsx";
import {UserForm} from "./Parameters/UserForm.tsx";
import {getAdminUserFromUserData} from "../utils/getAdminUserFromUserData.tsx";


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
export default function WishlistUserList(
    {
        usersData,
        wishlistName,
        userSettings,
        setUsersData
    }: Readonly<WishlistUserListProps>) {
    const {t} = useTranslation();
    const [allLinksCopied, setAllLinksCopied] = useState<boolean>(false);
    const [showUserForm, setShowUserForm] = useState<boolean>(false);

    const {adminId, adminName} = getAdminUserFromUserData(usersData);


    /**
     * Copies all user links to the clipboard.
     *
     * This function iterates over the `usersTokens` array to generate a unique link for each user.
     * It then constructs a message that includes an introduction with the `wishlistName`, the generated links for each
     * user, and a reminder. This message is copied to the clipboard for easy sharing.
     */
    const copyAllLinks = () => {
        const links: Array<string> = [];

        if (!usersData) {
            return;
        }
        usersData.map((userData: UserData) => (
            userData.isActive ? links.push(userData.name + " = " + generateLink(userData.id, userData.name)) : null

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
                ? <h1 className={"wishlist-title my-4 my-md-5 p-2"}>{t('settings.users')}</h1>
                : <h1 className={"wishlist-title my-4 my-md-5 p-2"}>{t('WLCreated.wlWasCreated')} 🎉</h1>
            }
            <div className={"wishlist-container pb-1 pt-3"}>
                <p>
                    {t('WLCreated.helpLink')}
                    <b>{t('WLCreated.helpLinkBoldPart')} </b>
                    {t('WLCreated.helpLinkEnd')}<span className="emoji-bg">🫣</span>
                </p>
                {!userSettings && <p> {t('WLCreated.individualLinks')}</p>}
            </div>

            <div className={"d-flex flex-column"}>

                {/*Form to create a new user (only in user settings) */}
                {userSettings &&
                    <Button type="button"
                            className={"btn-custom mt-3 mb-2 m-auto"}
                            onClick={() => setShowUserForm(true)}>
                        <b>{t('settings.addUser')}</b>
                    </Button>
                }

                {showUserForm
                    ? <UserForm
                        editMode={false}
                        setShowUserForm={setShowUserForm}
                        otherUsersNames={usersData?.map(userToken => userToken.name)}
                        setUsersData={setUsersData}
                        initialData={undefined}>
                    </UserForm>
                    : <div className={"m-3"}></div>
                }

                <Button
                    type="button"
                    className={"btn-custom mt-3 mb-2 m-auto"}
                    variant="primary"
                    onClick={copyAllLinks}
                >
                    {allLinksCopied ? t('WLCreated.copied') : t('WLCreated.copyAll')}
                </Button>

                {/* Link to access the wishlist for the first time */}
                {!userSettings && <p className={"mt-3 mb-4 m-auto"}>
                    {t('WLCreated.access')}
                    <a href={generateLink(adminId, adminName)}
                       className={"link-success link-underline-danger"}>{t('WLCreated.accessButton')}</a>
                </p>
                }

            </div>

            <Container className="list-group user-wishes">

                <Table striped responsive className={"text-center"}>
                    <thead>
                    <tr>
                        <th className={"text-wrap text-break fixed-width"}>{t('WLCreated.table.name')}</th>
                        <th className={"text-wrap text-break d-none d-lg-table-cell"}>{t('WLCreated.table.link')}</th>
                        <th>{t('WLCreated.table.status')}</th>
                        <th>{t('WLCreated.table.actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {usersData?.map((userData: UserData) => (
                        <UserLinkItem
                            key={userData.id}
                            userData={userData}
                            editUser={userSettings}
                            setUsersData={setUsersData}
                            otherUsersNames={usersData.map(userToken => userToken.name)}>
                        </UserLinkItem>
                    ))}
                    </tbody>
                </Table>

                {showUserForm
                    ? <UserForm
                        editMode={false}
                        setShowUserForm={setShowUserForm}
                        otherUsersNames={usersData?.map(userToken => userToken.name)}
                        setUsersData={setUsersData}
                        initialData={undefined}>
                    </UserForm>
                    : <div className={"m-3"}></div>
                }

            </Container>

        </>
    )
}
