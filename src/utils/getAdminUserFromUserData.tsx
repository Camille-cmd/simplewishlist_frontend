import {UserData} from "../interfaces/UserToken";

export const getAdminUserFromUserData = (userDataArray: Array<UserData> | undefined) => {
    const admin = userDataArray?.find(userData => userData.isAdmin);
    return admin ? {adminId: admin.id, adminName: admin.name} : {adminId: '', adminName: ''};
}
