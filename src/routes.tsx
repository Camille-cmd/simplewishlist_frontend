import {createBrowserRouter} from "react-router-dom";
import WishlistCreate from "./components/WishlistCreate.tsx";
import ErrorPage from "./components/ErrorPage.tsx";
import WelcomePage from "./components/WelcomePage.tsx";
import {HandleUsers} from "./components/Parameters/HandleUsers.tsx";
import {WishlistSettings} from "./components/Parameters/WishlistParameters.tsx";
import WishlistEntry from "./components/WishlistEntry.tsx";
import UserSelection from "./components/UserSelection.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <WelcomePage/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/wishlist/create",
        element: <WishlistCreate/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/wishlist/:wishlistId",
        element: <UserSelection/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/wishlist/:wishlistId/view",
        element: <WishlistEntry/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/wishlist/:wishlistId/users",
        element: <HandleUsers/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/wishlist/:wishlistId/settings",
        element: <WishlistSettings/>,
        errorElement: <ErrorPage/>,
    },
]);
