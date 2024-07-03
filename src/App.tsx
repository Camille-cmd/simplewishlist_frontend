// Bootstrap CSS
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import './assets/main.css'

// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

// Components
import SimpleWishlistHeader from "./components/WishlistHeader.tsx";

// i18n
import './i18n.tsx'

// Routing
import {router} from "./routes.tsx";
import {RouterProvider} from "react-router-dom";


function App() {
    return (
        <>
            <SimpleWishlistHeader></SimpleWishlistHeader>
            <main className='container text'>
                <RouterProvider router={router} />
            </main>
        </>
    )
}

export default App
