import {createBrowserRouter} from "react-router-dom";
import WishlistCreate from "./components/WishlistCreate.tsx";
import ErrorPage from "./components/ErrorPage.tsx";
import Wishlist from "./components/Wishlist.tsx";
import WelcomePage from "./components/WelcomePage.tsx";
import {HandleUsers} from "./components/Parameters/HandleUsers.tsx";
import {WishlistSettings} from "./components/Parameters/WishlistParameters.tsx";

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
        path: "/:userToken/wishlist/handle-users",
        element: <HandleUsers/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/:userToken/wishlist/settings",
        element: <WishlistSettings/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/link/:userToken",
        element: <Wishlist/>,
        errorElement: <ErrorPage/>,
    },

]);
