import {Button, ListGroup, Stack} from "react-bootstrap";
import {generateLink} from "../utils/generateLink.tsx";
import {UserData} from "../interfaces/UserToken";
import {useTranslation} from "react-i18next";
import {Dispatch, SetStateAction, useState} from "react";
import {api} from "../api/axiosConfig.tsx";
import {useParams} from "react-router-dom";
import {UserForm} from "./Parameters/UserForm.tsx";

class UserLinkItemProps {
    userData: UserData | undefined;
    editUser: boolean | undefined;
    setUsersData: Dispatch<SetStateAction<Array<UserData>>> | undefined
    otherUsersNames: Array<string> | undefined;
}

/**
 * Component to display a single user link item with the user's name, the link and actions to edit or deactivate the user.
 * @param userData
 * @param editUser
 * @param setUsersData
 * @param otherUsersNames
 * @constructor
 */
export default function UserLinkItem({userData, editUser, setUsersData, otherUsersNames}: Readonly<UserLinkItemProps>) {
    const {t} = useTranslation();
    const {userToken} = useParams();

    const [linkCopied, setLinkCopied] = useState<boolean>(false);

    const [editMode, setEditMode] = useState<boolean>(false);


    /**
     * Set the user to inactive an update the state accordingly
     * @param userId
     */
    const deactivateUser = (userId: string) => {
        api.post(
            `/wishlist/users/${userId}/deactivate`,
            {},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 200 && setUsersData) {
                setUsersData((prevState) => {
                    // Map over the users and set the selected user to inactive
                    return prevState.map((user: UserData) => {
                        if (user.id === userId) {
                            // Toggle the isActive property
                            return {...user, isActive: response.data.isActive};
                        }
                        // Return the user as is if it's not the selected user
                        return user;
                    });
                });
            }
        });
    }


    /**
     * Set the user to active an update the state accordingly
     * @param userId
     */
    const reactivateUser = (userId: string | undefined) => {
        if (!userId) {
            return;
        }
        api.post(
            `/wishlist/users/${userId}/activate`,
            {},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            if (response.status === 200 && setUsersData) {
                setUsersData((prevState) => {
                    // Map over the users and set the selected user to active
                    return prevState.map((user: UserData) => {
                        if (user.id === userId) {
                            // Toggle the isActive property
                            return {...user, isActive: response.data.isActive};
                        }
                        // Return the user as is if it's not the selected user
                        return user;
                    });
                });
            }
        });
    }

    /**
     * Copy the user link to the clipboard
     * @param link
     */
    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link).then(function () {
            setLinkCopied(true);
            setTimeout(() => {
                setLinkCopied(false);
            }, 2000);
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }


    return (
        <ListGroup.Item key={userData?.name} className={"user-links wishlist-list-group h-100 " + (!userData?.isActive ? 'bg-secondary' : '')} >
            {/*Title of the card*/}
            <Stack direction={"horizontal"} gap={3} className={"mb-3 py-2"}>
                {editMode
                    ? <UserForm editMode={editMode} setShowUserForm={setEditMode} otherUsersNames={otherUsersNames} setUsersData={setUsersData} initialData={userData}/>
                    : <div className={"user-links" } onClick={()=> setEditMode(true)}>
                    <b>{userData?.name}</b>
                </div>
                }

                {userData?.isActive ?
                    <Button className="btn-sm btn-custom ms-auto" onClick={() => copyToClipboard(generateLink(userData?.id, userData?.name))}>
                        {linkCopied ? t('WLCreated.copied') : t('WLCreated.copy')}
                    </Button>
                    : <p className="ms-auto">{t('settings.inactiveUser')}</p>
                }
            </Stack>

            {/*Link to the wishlist*/}
            {userData?.isActive && <p>{generateLink(userData?.id, userData?.name)}</p>}

            {/*Actions to reactivate or deactivate the user*/}
            {editUser && userData?.isActive
                ? <Button
                    className="btn-sm btn-custom"
                    variant="danger"
                    onClick={() => deactivateUser(userData?.id)}
                >
                    {t('settings.deactivateUser')}
                </Button>
                : editUser && <Button className="btn-sm btn-danger" onClick={() => reactivateUser(userData?.id)}>
                    {t('settings.reactivateUser')}

                </Button>
            }
        </ListGroup.Item>
    )
}
