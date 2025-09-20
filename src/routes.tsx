import {createBrowserRouter, Outlet} from "react-router-dom";
import ErrorPage from "./components/ErrorPage.tsx";
import WelcomePage from "./components/WelcomePage.tsx";
import WishlistCreate from "./components/WishlistCreate.tsx";
import UserSelection from "./components/UserSelection.tsx";
import WishlistEntry from "./components/WishlistEntry.tsx";
import {HandleUsers} from "./components/Parameters/HandleUsers.tsx";
import {WishlistSettings} from "./components/Parameters/WishlistParameters.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";
import SimpleWishlistHeader from "./components/WishlistHeader.tsx";


export function Layout() {
    return (
        <AuthProvider>
            <SimpleWishlistHeader/>
            <main className='container text'>
                <Outlet/>
            </main>
        </AuthProvider>
    )
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                path: "",
                element: <WelcomePage/>,
            },
            {
                path: "wishlist/create",
                element: <WishlistCreate/>,
            },
            {
                path: "wishlist/:wishlistId",
                element: <UserSelection/>,
            },
            {
                path: "wishlist/:wishlistId/view",
                element: <WishlistEntry/>,
            },
            {
                path: "wishlist/:wishlistId/users",
                element: <HandleUsers/>,
            },
            {
                path: "wishlist/:wishlistId/settings",
                element: <WishlistSettings/>,
            },
        ]
    },
]);
