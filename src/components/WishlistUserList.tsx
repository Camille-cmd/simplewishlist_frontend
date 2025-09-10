import {UserData} from "../interfaces/UserToken";
import {Button, Container, Table} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {generateWishlistLink} from "../utils/generateLink";
import {Dispatch, SetStateAction, useState} from "react";
import UserLinkItem from "./UserLinkItem.tsx";
import {UserForm} from "./Parameters/UserForm.tsx";


class WishlistUserListProps {
    usersData: Array<UserData> | undefined
    wishlistName: string | undefined
    wishlistId: string | undefined
    userSettings: boolean | undefined
    setUsersData: Dispatch<SetStateAction<Array<UserData>>> | undefined
}

/**
 * Component that displays the list of users and their shared wishlist link.
 * @param usersData
 * @param wishlistName
 * @param wishlistId
 * @param userSettings
 * @param setUsersData
 * @constructor
 */
export default function WishlistUserList(
    {
        usersData,
        wishlistName,
        wishlistId,
        userSettings,
        setUsersData
    }: Readonly<WishlistUserListProps>) {
    const {t} = useTranslation();
    const [showUserForm, setShowUserForm] = useState<boolean>(false);

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
                    {t('WLCreated.helpLinkEnd')}
                </p>
                {!userSettings && <p> {t('WLCreated.individualLinks')}</p>}
            </div>

            <div className={"d-flex flex-column"}>

                {/* Link to access the wishlist for the first time */}
                {!userSettings && wishlistId && wishlistName && <p className={"mt-3 mb-4 m-auto"}>
                    <a href={generateWishlistLink(wishlistId)}
                       className={"link-success link-underline-danger"}>{t('WLCreated.accessButton')}</a>
                </p>
                }

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


                {/* Single wishlist link display */}
                {!userSettings && wishlistId && (
                    <div className={"mt-4 mb-4 p-3 border rounded"}>
                        <h5>{t('WLCreated.wishlistLink')}</h5>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={generateWishlistLink(wishlistId)}
                                readOnly
                            />
                        </div>
                        <small className="text-muted">{t('WLCreated.wishlistLinkDescription')}</small>
                    </div>
                )}

            </div>

            <Container className="list-group user-wishes">
                {userSettings ? (
                    <Table striped responsive className={"text-center"} translate={"no"}>
                        <thead>
                        <tr>
                            <th className={"text-wrap text-break fixed-width"}>{t('WLCreated.table.name')}</th>
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
                ) : (
                    <div className="mt-4">
                        <h5 className="mb-3">{t('WLCreated.participants')}</h5>
                        <div className="row g-2">
                            {usersData?.filter(user => user.isActive).map((userData: UserData) => (
                                <div key={userData.id} className="col-auto">
                                    <span className="badge bg-primary fs-6">
                                        {userData.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </Container>

        </>
    )
}
