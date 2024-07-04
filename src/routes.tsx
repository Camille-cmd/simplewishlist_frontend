import {createBrowserRouter} from "react-router-dom";
import WishlistCreate from "./components/WishlistCreate.tsx";
import ErrorPage from "./components/ErrorPage.tsx";
import Wishlist from "./components/Wishlist.tsx";
import WishAddForm from "./components/WishAddForm.tsx";
import WelcomePage from "./components/WelcomePage.tsx";

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
        path: "/link/:userToken",
        element: <Wishlist/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/:userToken/wish/add",
        element: <WishAddForm/>,
        errorElement: <ErrorPage/>,
    },

]);
