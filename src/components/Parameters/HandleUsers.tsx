import WishlistUserList from "../WishlistUserList.tsx";
import {useEffect, useState} from "react";
import {api} from "../../api/axiosConfig.tsx";
import {useParams} from "react-router-dom";
import {Table} from "react-bootstrap";
import {generateLink} from "../../utils/generateLink.tsx";


interface User {
    "name": string;
    "is_admin": boolean;
    "is_active": boolean;
    "id": string;
}

/**
 * Component to handle the users of the wishlist
 * @constructor
 */
export function HandleUsers() {
    const {userToken} = useParams();
    const [usersData, setUsersData] = useState<[User]>([]);

    /**
     * Set the user to inactive
     * @param userId
     */
    const deactivateUser = (userId) => {
        api.post(
            `/wishlist/users/${userId}/deactivate`,
            {},
            {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            getUsersData();
        });
    }

    /**
     * Get the users data from the api
     */
    const getUsersData = () => {
        api.get('/wishlist/users', {headers: {'Authorization': `Bearer ${userToken}`}}
        ).then((response) => {
            setUsersData(response.data);
        });

    }
    /**
     * Get the users data on the first render
     */
    useEffect(() => {
        getUsersData();
    }, [])

    return (
        <div>
            <h1>Users parameters</h1>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Link</th>
                    <th>Admin</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {usersData.map((user: User) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{generateLink(user.id, user.name)}</td>
                        <td>{user.is_admin ? "✔️" : "❌"}</td>
                        <td>{user.is_active ? "✔️" : "❌"}</td>
                        <td className={"d-flex gap-2"}>
                            <button className="btn btn-custom" onClick={() => deactivateUser(user.id)}>Set to inactive</button>
                            <button className="btn btn-warning-custom">Edit</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    )
}
